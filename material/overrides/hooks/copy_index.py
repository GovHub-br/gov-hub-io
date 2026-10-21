"""
Hook para copiar o index.html da landing page para a raiz do site gerado
"""
import posixpath
import re
from pathlib import Path
from mkdocs.config.defaults import MkDocsConfig


def _ajusta(path):
    """Caminho relativo da home vira caminho a partir da raiz do site."""
    if path.startswith('../'):
        # A home é escrita para morar em /home/: resolve a partir de lá
        return posixpath.normpath(posixpath.join('/home/', path)) + ('/' if path.endswith('/') else '')
    if not path.startswith('./'):
        return None
    if path.endswith(('.js', '.css')) and not path.startswith('./land/'):
        return path.replace('./', '/home/', 1)
    return path.replace('./', '/land/dist/', 1)


def on_post_build(config: MkDocsConfig, **kwargs):
    """
    Copia o arquivo docs/home/index.html para a raiz do site gerado
    e ajusta os caminhos relativos para apontar corretamente.
    O prefixo de quando o site não está na raiz do domínio fica com caminho_base.py.
    """
    source_file = Path(config.docs_dir) / "home" / "index.html"
    dest_file = Path(config.site_dir) / "index.html"

    if not source_file.exists():
        print(f"⚠️ Arquivo não encontrado: {source_file}")
        return

    content = source_file.read_text(encoding='utf-8')

    def adjust_attr(match):
        novo = _ajusta(match.group(2))
        return f'{match.group(1)}="{novo}"' if novo else match.group(0)

    def adjust_url(match):
        novo = _ajusta(match.group(1))
        return f'url({novo})' if novo else match.group(0)

    content = re.sub(r'(href|src)=["\']([^"\']+)["\']', adjust_attr, content)
    content = re.sub(r'url\(["\']?([^"\'()]+)["\']?\)', adjust_url, content)

    dest_file.write_text(content, encoding='utf-8')
    print(f"✅ Copiado e ajustado {source_file} para {dest_file}")
