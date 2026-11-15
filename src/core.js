const LATEX_SPECIALS = new Map([
  ['\\', '\\textbackslash{}'],
  ['{', '\\{'],
  ['}', '\\}'],
  ['$', '\\$'],
  ['&', '\\&'],
  ['#', '\\#'],
  ['%', '\\%'],
  ['_', '\\_'],
  ['^', '\\textasciicircum{}'],
  ['~', '\\textasciitilde{}'],
]);

const UNICODE_MAP = new Map([
  ['\u00A0', '~'],       // non-breaking space
  ['\u00A9', '\\copyright{}'],
  ['\u00AE', '\\textregistered{}'],
  ['\u00B0', '\\textdegree{}'],
  ['\u00B1', '\\textpm{}'],
  ['\u00D7', '\\texttimes{}'],
  ['\u00F7', '\\textdiv{}'],
  ['\u2013', '--'],      // en dash
  ['\u2014', '---'],     // em dash
  ['\u2018', '`'],       // left single quote
  ['\u2019', "'"],       // right single quote
  ['\u201C', '``'],      // left double quote
  ['\u201D', "''"],      // right double quote
  ['\u2026', '\\ldots{}'],
  ['\u2190', '\\textleftarrow{}'],
  ['\u2192', '\\textrightarrow{}'],
  ['\u2260', '\\neq{}'],
  ['\u2264', '\\leq{}'],
  ['\u2265', '\\geq{}'],
]);

// Reverse map used by unescapeLatex. We intentionally do not reverse the
// LaTeX special characters (\{, \}, etc.) because they are ambiguous with
// literal braces in LaTeX source. Only Unicode command sequences are reversed.
const REVERSE_UNICODE = new Map();
for (const [unicode, latex] of UNICODE_MAP) {
  REVERSE_UNICODE.set(latex, unicode);
}

/**
 * Escapes LaTeX special characters and maps selected Unicode characters to
 * their LaTeX command sequences.
 *
 * The order matters: we must escape backslashes first, otherwise the
 * backslashes introduced by later replacements would be double-escaped.
 * We build the result with an array of string chunks for O(n) performance
 * and to avoid repeated string concatenation.
 *
 * @param {string} input - The text to escape.
 * @returns {string} The escaped LaTeX-safe text.
 */
export function escapeLatex(input) {
  if (typeof input !== 'string') {
    throw new TypeError('escapeLatex expects a string');
  }

  const out = [];
  for (const ch of input) {
    if (LATEX_SPECIALS.has(ch)) {
      out.push(LATEX_SPECIALS.get(ch));
    } else if (UNICODE_MAP.has(ch)) {
      out.push(UNICODE_MAP.get(ch));
    } else {
      out.push(ch);
    }
  }
  return out.join('');
}

/**
 * Reverses the escaping performed by escapeLatex.
 *
 * This is a best-effort inverse. Because LaTeX commands can be written in
 * several equivalent ways (e.g. \textbackslash vs \textbackslash{}), we
 * only reverse the exact sequences that escapeLatex produces. This keeps the
 * function deterministic and avoids surprising transformations.
 *
 * We scan the input and greedily match the longest known command sequence
 * first so that e.g. \textasciitilde{} is not partially matched as \textasciitilde.
 *
 * @param {string} input - The escaped text.
 * @returns {string} The unescaped text.
 */
export function unescapeLatex(input) {
  if (typeof input !== 'string') {
    throw new TypeError('unescapeLatex expects a string');
  }

  // Build a list of [sequence, replacement] sorted by descending length so
  // that longer sequences win when they share a prefix.
  const sequences = [];
  for (const [seq, replacement] of REVERSE_UNICODE) {
    sequences.push([seq, replacement]);
  }
  // Add the special-character escapes.
  for (const [ch, seq] of LATEX_SPECIALS) {
    // Skip the backslash itself: unescaping \textbackslash{} back to \ is
    // handled by the Unicode map entry for backslash below.
    if (ch === '\\') continue;
    sequences.push([seq, ch]);
  }
  // The backslash escape is special: \textbackslash{} -> \
  sequences.push(['\\textbackslash{}', '\\']);

  sequences.sort((a, b) => b[0].length - a[0].length);

  let result = '';
  let i = 0;
  while (i < input.length) {
    let matched = false;
    for (const [seq, replacement] of sequences) {
      if (input.startsWith(seq, i)) {
        result += replacement;
        i += seq.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += input[i];
      i += 1;
    }
  }
  return result;
}
