/**
 * Public entry point for tiny-latex-escape.
 *
 * We re-export the two functions from core.js so that consumers can import
 * from the package root without knowing about the internal module layout.
 * Keeping the surface minimal (only `escapeLatex` and `unescapeLatex`) makes
 * the API easy to reason about and document.
 */

export { escapeLatex, unescapeLatex } from './core.js';
