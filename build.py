#!/usr/bin/env python3
"""Construit les deux versions d'Objectif 400.

- dist/artifact/  : la page publiée sur claude.ai (index.html sans squelette + app.js)
- racine du dépôt : la version hors-ligne (PWA) pour GitHub Pages
- dist/test-bundle.js : le moteur sans l'interface, pour les tests Node
"""
import hashlib
import json
import os
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Inter:wght@400..700&family=JetBrains+Mono:wght@500;700&display=swap">'
RESET = ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.5 system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}'


def js_files():
    return sorted((SRC / 'js').glob('*.js'))


def bundle(exclude=()):
    parts = []
    for f in js_files():
        if f.name in exclude:
            continue
        parts.append(f'/* ---- {f.name} ---- */\n' + f.read_text(encoding='utf-8'))
    return '\n'.join(parts)


def build():
    css = (SRC / 'styles.css').read_text(encoding='utf-8')
    code = bundle()
    app = "(function () {\n'use strict';\n" + code + "\n})();\n"
    version = hashlib.sha1((app + css).encode('utf-8')).hexdigest()[:10]

    # --- Artifact claude.ai ---
    art = DIST / 'artifact'
    art.mkdir(parents=True, exist_ok=True)
    (art / 'app.js').write_text(app, encoding='utf-8')
    page = (
        '<title>Objectif 400</title>\n'
        '<meta name="claude:viewport-fit-sides" content="cover">\n'
        f'{FONTS}\n<style>\n{css}\n</style>\n'
        '<div id="app" class="app"><p style="padding:24px 0">Chargement d\'Objectif 400…</p></div>\n'
        '<script src="app.js"></script>\n'
    )
    (art / 'index.html').write_text(page, encoding='utf-8')

    # --- PWA (racine du dépôt, servie par GitHub Pages) ---
    (ROOT / 'app.js').write_text(app, encoding='utf-8')
    pwa = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Objectif 400</title>
<meta name="description" content="Révisions Tage Mage : cours, exercices infinis, épreuves chronométrées.">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#EEF1F6">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0A1120">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Objectif 400">
{FONTS}
<style>{RESET}
{css}
.update-bar{{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:95;background:var(--btn);color:var(--btn-ink);border:0;border-radius:14px;padding:13px 16px;font:600 14px var(--f-body);box-shadow:var(--shadow)}}
</style>
</head>
<body>
<div id="app" class="app"><p style="padding:24px 0">Chargement d'Objectif 400…</p></div>
<script src="app.js?v={version}"></script>
<script>
if ('serviceWorker' in navigator && location.protocol === 'https:') {{
  navigator.serviceWorker.register('sw.js').then(function (reg) {{
    reg.addEventListener('updatefound', function () {{
      var nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', function () {{
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {{
          var b = document.createElement('button');
          b.className = 'update-bar';
          b.textContent = 'Nouvelle version disponible : toucher pour mettre à jour';
          b.onclick = function () {{ location.reload(); }};
          document.body.appendChild(b);
        }}
      }});
    }});
  }}).catch(function () {{}});
}}
</script>
</body>
</html>
'''
    (ROOT / 'index.html').write_text(pwa, encoding='utf-8')
    sw = f'''/* Service worker d'Objectif 400 : fonctionne hors connexion */
const CACHE = 'o400-{version}';
const ASSETS = ['./', './index.html', './app.js?v={version}', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => {{
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
}});
self.addEventListener('activate', (e) => {{
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('o400-') && k !== CACHE && k !== 'o400-fonts').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
}});
self.addEventListener('fetch', (e) => {{
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {{
    if (req.mode === 'navigate') {{
      e.respondWith(fetch(req).then((res) => {{ const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; }}).catch(() => caches.match('./index.html')));
      return;
    }}
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {{ if (res.ok) {{ const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }} return res; }})));
    return;
  }}
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {{
    e.respondWith(caches.open('o400-fonts').then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {{ c.put(req, res.clone()); return res; }}))));
  }}
}});
'''
    (ROOT / 'sw.js').write_text(sw, encoding='utf-8')
    manifest = {
        'name': 'Objectif 400',
        'short_name': 'Objectif 400',
        'description': 'Révisions Tage Mage : cours, exercices infinis, épreuves chronométrées.',
        'lang': 'fr',
        'start_url': './',
        'scope': './',
        'display': 'standalone',
        'orientation': 'portrait',
        'background_color': '#EEF1F6',
        'theme_color': '#0F1B33',
        'icons': [
            {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
            {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
            {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
        ],
    }
    (ROOT / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    make_icons()

    # --- Bundle de test (sans démarrage ni DOM) ---
    test = "'use strict';\nconst window = undefined;\n" + bundle(exclude=('99-boot.js',)) + "\nlinkGens();\nmodule.exports = { TM, sameAns, parseNum, cardQueue, buildQ, bankQ, rebuild, Store, normAns, recordAnswer, projectSub, projectTotal, examQuestions, dailyPlan, nextTrainingQ, genIdsFor, dueErrors, addError, reviewDone, makeRng, fmt, Fr, SUBS, CM_CHOICES, statsSummary, cdtTexts, chaptersOf };\n"
    (DIST / 'test-bundle.js').write_text(test, encoding='utf-8')
    print(f'Build {version} : app.js {len(app) // 1024} Ko')


def make_icons():
    icons = ROOT / 'icons'
    if (icons / 'icon-512.png').exists():
        return
    from PIL import Image, ImageDraw, ImageFont
    icons.mkdir(exist_ok=True)
    font_path = None
    for cand in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf']:
        if os.path.exists(cand):
            font_path = cand
            break

    def draw(size, maskable=False, rounded=True):
        img = Image.new('RGB', (size, size), '#0F1B33')
        d = ImageDraw.Draw(img)
        s = size / 512
        if not maskable and rounded:
            img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            d = ImageDraw.Draw(img)
            d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(110 * s), fill='#0F1B33')
        scale = 0.78 if maskable else 1.0
        cx = size / 2
        f = ImageFont.truetype(font_path, int(200 * s * scale)) if font_path else ImageFont.load_default()
        text = '400'
        bbox = d.textbbox((0, 0), text, font=f)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        ty = size / 2 - th / 2 - bbox[1] - 18 * s * scale
        # trait de surligneur
        d.rounded_rectangle([cx - tw / 2 - 16 * s * scale, ty + bbox[1] + th * 0.58, cx + tw / 2 + 16 * s * scale, ty + bbox[1] + th + 22 * s * scale], radius=int(14 * s), fill='#FFDD3C')
        d.text((cx - tw / 2 - bbox[0], ty), text, font=f, fill='#FFFFFF')
        f2 = ImageFont.truetype(font_path, int(46 * s * scale)) if font_path else ImageFont.load_default()
        sub = 'TAGE MAGE'
        b2 = d.textbbox((0, 0), sub, font=f2)
        d.text((cx - (b2[2] - b2[0]) / 2 - b2[0], ty + bbox[3] + 52 * s * scale), sub, font=f2, fill='#A7B2CB')
        return img

    draw(512).save(icons / 'icon-512.png')
    draw(192).save(icons / 'icon-192.png')
    draw(512, maskable=True).save(icons / 'icon-maskable-512.png')
    draw(180, rounded=False).convert('RGB').save(icons / 'apple-touch-icon.png')


if __name__ == '__main__':
    build()
