"""Arma SOLARIS-visuales.html: un solo archivo con las visuales, los scripts y las fuentes adentro.
Uso: python3 visuales/empaquetar.py   (desde la raíz del repo o desde visuales/)"""
import base64, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FAMILIAS = ('Major Mono Display', 'Space Mono')

def leer(*p):
    with open(os.path.join(*p), encoding='utf-8') as f:
        return f.read()

css = leer(RAIZ, 'fuentes', 'fuentes.css')
bloques = []
for b in re.findall(r'(?:/\*[^*]*\*/\s*)?@font-face\s*\{[^}]+\}', css):
    if any("font-family: '%s'" % fam in b for fam in FAMILIAS):
        def embed(m):
            with open(os.path.join(RAIZ, 'fuentes', m.group(1)), 'rb') as f:
                return 'url(data:font/woff2;base64,%s)' % base64.b64encode(f.read()).decode()
        bloques.append(re.sub(r'url\((archivos/[^)]+)\)', embed, b))

html = leer(AQUI, 'index.html')
html = html.replace('<link href="../fuentes/fuentes.css" rel="stylesheet">', '<style>\n%s\n</style>' % '\n'.join(bloques))
html = html.replace('<script src="../contenido/motor.js"></script>', '<script>\n%s\n</script>' % leer(RAIZ, 'contenido', 'motor.js'))
html = html.replace('<script src="visuales.js"></script>', '<script>\n%s\n</script>' % leer(AQUI, 'visuales.js'))
assert 'src="' not in html and 'fuentes.css' not in html, 'quedó algún archivo sin incluir'

salida = os.path.join(AQUI, 'SOLARIS-visuales.html')
with open(salida, 'w', encoding='utf-8') as f:
    f.write(html)
print('listo:', salida, '(%d KB)' % (os.path.getsize(salida) // 1024))
