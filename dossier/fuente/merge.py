#!/usr/bin/env python3
"""Superpone fondo (JPG) + texto/links (PDF vectorial) en ../EVO_Press_Kit_2026.pdf"""
import glob, os, pymupdf
H = os.path.dirname(os.path.abspath(__file__))
bgs = sorted(glob.glob(os.path.join(H, 'out', 'bg*.jpg')))
txt = pymupdf.open(os.path.join(H, 'out', 'text.pdf'))
assert len(bgs) == len(txt), (len(bgs), len(txt))
out = pymupdf.open()
for i, bg in enumerate(bgs):
    r = txt[i].rect
    p = out.new_page(width=r.width, height=r.height)
    p.insert_image(r, filename=bg)
    p.show_pdf_page(r, txt, i)
    for l in txt[i].get_links():
        l.pop('xref', None); l.pop('id', None)
        p.insert_link(l)
out.set_metadata({'title': 'EVO · Press Kit 2026', 'author': 'EVO', 'subject': 'Dossier de prensa'})
dst = os.path.join(H, '..', 'EVO_Press_Kit_2026.pdf')
out.save(dst, garbage=4, deflate=True)
print('ok', len(out), 'páginas,', round(os.path.getsize(dst) / 1e6, 2), 'MB')
