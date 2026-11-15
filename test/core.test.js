import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeLatex, unescapeLatex } from '../src/index.js';

test('escapes all LaTeX special characters', () => {
  const input = '\\ { } $ & # % _ ^ ~';
  const expected =
    '\\textbackslash{} \\{ \\} \\$ \\& \\# \\% \\_ \\textasciicircum{} \\textasciitilde{}';
  assert.equal(escapeLatex(input), expected);
});

test('escapes backslash before other specials to avoid double-escaping', () => {
  assert.equal(escapeLatex('\\%'), '\\textbackslash{}\\%');
});

test('maps Unicode characters to LaTeX commands', () => {
  assert.equal(escapeLatex('\u00A9'), '\\copyright{}');
  assert.equal(escapeLatex('\u2014'), '---');
  assert.equal(escapeLatex('\u201C'), '``');
  assert.equal(escapeLatex('\u2026'), '\\ldots{}');
});

test('leaves ordinary text unchanged', () => {
  assert.equal(escapeLatex('hello world'), 'hello world');
});

test('unescapes LaTeX special character escapes', () => {
  const escaped = '\\textbackslash{} \\{ \\} \\$ \\& \\# \\% \\_ \\textasciicircum{} \\textasciitilde{}';
  const expected = '\\ { } $ & # % _ ^ ~';
  assert.equal(unescapeLatex(escaped), expected);
});

test('unescapes Unicode command sequences', () => {
  assert.equal(unescapeLatex('\\copyright{}'), '\u00A9');
  assert.equal(unescapeLatex('---'), '\u2014');
  assert.equal(unescapeLatex('``'), '\u201C');
  assert.equal(unescapeLatex('\\ldots{}'), '\u2026');
});

test('round-trips special characters', () => {
  const original = 'a \\ b { c } d $ e & f # g % h _ i ^ j ~ k';
  const escaped = escapeLatex(original);
  assert.equal(unescapeLatex(escaped), original);
});

test('round-trips Unicode characters that have a LaTeX mapping', () => {
  const original = '\u00A9 \u2014 \u201C \u2026';
  const escaped = escapeLatex(original);
  assert.equal(unescapeLatex(escaped), original);
});

test('does not unescape unknown LaTeX commands', () => {
  assert.equal(unescapeLatex('\\unknown{}'), '\\unknown{}');
});

test('throws TypeError on non-string input', () => {
  assert.throws(() => escapeLatex(42), TypeError);
  assert.throws(() => unescapeLatex(null), TypeError);
});
