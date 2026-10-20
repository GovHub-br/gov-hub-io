import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caminhoSeguro } from '../assets/caminho.js';

test('aceita caminhos relativos de Markdown do próprio site', () => {
  for (const p of ['docs/explicacao/a.md', 'README.md', 'docs/trilhas/index.md']) {
    assert.equal(caminhoSeguro(p), true, p);
  }
});

test('recusa outras origens, esquemas, subida de pasta e o que não é .md', () => {
  for (const p of [
    'https://x/a.md', '//x/a.md', '\\\\x\\a.md', 'javascript:alert(1)', 'data:text/html,<script>alert(1)</script>.md',
    '../secret.md', 'docs/../../x.md', 'docs/..', 'docs/a.html', '', null, undefined,
  ]) {
    assert.equal(caminhoSeguro(p), false, String(p));
  }
});
