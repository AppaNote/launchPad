#!/usr/bin/env python3
"""Inline styles.css and app.js into a single portable launchpad-standalone.html."""
from pathlib import Path

root = Path(__file__).parent
html = (root / 'index.html').read_text()
css = (root / 'styles.css').read_text()
js = (root / 'app.js').read_text()

html = html.replace('<link rel="stylesheet" href="styles.css" />',
                    '<style>\n' + css + '\n</style>')
html = html.replace('<script src="app.js"></script>',
                    '<script>\n' + js + '\n</script>')

out = root / 'launchpad-standalone.html'
out.write_text(html)
print(f'{out} ({out.stat().st_size / 1024:.1f} KB)')
