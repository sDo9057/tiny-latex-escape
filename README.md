# tiny-latex-escape

Escapes and unescapes LaTeX special characters and maps selected Unicode characters to LaTeX command sequences.

```js
import { escapeLatex, unescapeLatex } from 'tiny-latex-escape';

escapeLatex('100% & more');
// => '100\\% \\& more'

unescapeLatex('100\\% \\& more');
// => '100% & more'
```

## Why this exists

Embedding arbitrary user text into LaTeX is a common source of broken documents: a stray `%` comments out the rest of a line, an unmatched `{` breaks the parser, and Unicode punctuation such as em dashes or curly quotes either fails to compile or renders as garbage. This library performs a single, predictable transformation: every LaTeX-special ASCII character is replaced with its escaped form, and a fixed set of common Unicode characters is replaced with portable LaTeX commands. The trade-off is that the Unicode mapping is intentionally small and conservative. It covers characters that are almost always safe to replace with plain ASCII or widely available commands, and it does not attempt to handle full Unicode coverage or math-mode constructs. If you need a character that is not in the map, it passes through unchanged; you can extend the mapping in your own code if you need more.

## The awkward edge

`unescapeLatex` is a best-effort inverse. It reverses exactly the sequences that `escapeLatex` produces, and nothing else. In particular, LaTeX commands that have multiple equivalent spellings (for example `\textbackslash` without braces) are not recognised, because guessing which form the author intended would make the function non-deterministic. The library also does not reverse `\{`, `\}`, and similar escapes back to the original special characters in a way that could confuse literal braces in LaTeX source; it only reverses the exact output of `escapeLatex`. If you need a full LaTeX parser, this is not it.

## API

### `escapeLatex(input: string): string`

Returns a new string with LaTeX special characters escaped and mapped Unicode characters replaced. Throws a `TypeError` if `input` is not a string.

### `unescapeLatex(input: string): string`

Returns a new string with the sequences produced by `escapeLatex` reversed. Throws a `TypeError` if `input` is not a string.
