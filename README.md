# Simulador ADC · PWA

Versió web en català de `ADC-Rodeta.py`, sense instal·lar paquets ni compilar. El Python original es conserva.

## Publicar a GitHub Pages

1. Puja `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll` i la carpeta `icons` a l’arrel del repositori.
2. A GitHub, entra a **Settings → Pages → Build and deployment**.
3. Tria **Deploy from a branch**, la branca **main** (o la que utilitzis), carpeta **/(root)** i **Save**.
4. Quan acabi la publicació, obre l’adreça que mostra GitHub Pages, habitualment `https://USUARI.github.io/REPOSITORI/`.

Tots els camins són relatius i permeten publicar dins la subcarpeta d’un repositori. No cal servidor Python a GitHub.

## Instal·lar al mòbil o a la tauleta

- **Android:** obre l’URL amb Chrome i prem **Instal·la**, o utilitza l’opció d’instal·lació del menú del navegador.
- **iPhone / iPad:** obre l’URL amb Safari → **Compartir → Afegir a la pantalla d’inici**. Si apareix «Obrir com a app web», activa-ho.
- Espera **Disponible sense connexió** abans de desconnectar. La primera visita necessita Internet. El navegador pot eliminar les dades desades; en aquest cas cal tornar a obrir amb connexió.

## Disseny i controls

La pàgina utilitza l’alçada visible dinàmica (`100dvh`), els marges de seguretat del dispositiu i una gràfica que es redimensiona automàticament. En mòbils en horitzontal, els controls es col·loquen al costat de la gràfica. No es bloqueja el zoom d’accessibilitat: en finestres excepcionalment petites o amb text ampliat, es permet scroll per no tallar informació.

Es mantenen amplituds d’1, 2, 4, 5, 8 i 10 V; resolucions de 2, 4, 8 i 16 bits; i els cinc rangs originals. Zoom amb rodeta, botons o pinça amb dos dits; arrossega per desplaçar i prem **Restableix** per recuperar la vista. Canviar un paràmetre també restableix la vista.

## Model matemàtic

Igual que el Python: 1.000 punts entre 0 i 1 s, sinusoide d’1 Hz, `LSB = (Vmax − Vmin) / 2^bits`, saturació al rang i arrodoniment al nivell més proper (empats al parell, com NumPy). Es mostra un avís quan l’amplitud supera el rang.

S’ha conservat expressament el model original: l’arrodoniment pot produir el límit superior `Vmax`, de manera que hi pot haver `2^bits + 1` valors de tensió possibles. L’indicador «Nivells · 2ⁿ» és el nombre nominal de codis. No és una simulació d’un ADC físic amb codis limitats entre 0 i `2^bits − 1` ni de la seva freqüència de mostreig.

## Provar localment

Des d’aquesta carpeta, executa `python -m http.server 8000` i obre `http://localhost:8000`. Obrir l’HTML amb doble clic permet veure el simulador, però no activa el servei sense connexió. Per provar la instal·lació en un dispositiu mòbil, utilitza GitHub Pages amb HTTPS.

## Actualitzacions

Després de modificar els fitxers, incrementa `v1` a `sw.js` i torna’ls a publicar. La versió nova es prepara amb connexió i s’activa quan es tanquen totes les finestres de l’aplicació anterior i es torna a obrir. No barregis fitxers de diferents versions.

Documentació: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [instal·lació de PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing).
