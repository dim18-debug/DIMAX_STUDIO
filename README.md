# DIMAX STUDIO — site de prezentare

Site premium de fotografie, construit static (HTML + CSS + JavaScript, fără dependențe
externe): rapid, ușor de găzduit oriunde (GitHub Pages, Netlify, Vercel, orice hosting
clasic) și ușor de întreținut.

## Structura

```
index.html            Acasă (carusel, introducere, proiecte recente)
portofoliu.html       Portofoliu cu filtrare pe categorii
nunti.html            Categoria Nunți
sedinte-foto.html     Categoria Ședințe foto
evenimente.html       Categoria Evenimente
despre.html           Despre noi
contact.html          Contact + formular
404.html              Pagina de eroare
proiecte/…            Câte o pagină pentru fiecare proiect (6 proiecte demonstrative)
assets/css/           Stiluri (style.css) + fonturi self-hosted (fonts.css)
assets/js/            site-config.js (datele de contact) + main.js (interactivitate)
assets/img/           Imagini, organizate pe categorii
sitemap.xml           Harta site-ului (domeniu placeholder — vezi mai jos)
robots.txt            Reguli pentru motoarele de căutare
```

## ⚠️ Informații care trebuie completate

### 1. Date de contact — un singur fișier: `assets/js/site-config.js`

Completați valorile (telefon, e-mail, WhatsApp, Instagram, Facebook, adresă, oraș).
Ele apar automat în pagina Contact, în footer și pe pagina Despre noi.
Câmpurile necompletate afișează un marcaj clar „[de completat]”.

### 2. Formularul de contact

Formularul este complet funcțional (validare + anti-spam honeypot + verificare de timp),
dar are nevoie de un endpoint de trimitere:

1. Creați un cont gratuit la [Formspree](https://formspree.io) cu e-mailul studioului.
2. Copiați adresa formularului în `formEndpoint` din `assets/js/site-config.js`.

Până la configurare, formularul afișează un mesaj politicos că trimiterea va fi
activată în curând (fără erori tehnice).

### 3. Fotografiile

Site-ul folosește **fotografiile reale** ale celor 3 proiecte încărcate
(Alexandra & Dumitru, Alexandrina, Ilgutza), optimizate automat în WebP cu
dimensiuni responsive și blur placeholder:

```
originale/<proiect>/                 fotografiile originale (JPEG, neatinse)
assets/img/sedinte-foto/<proiect>/   variantele WebP folosite de site
```

Conform cerinței, categoriile fără conținut (Nunți, Evenimente) **nu apar în
meniu**. Când încărcați mape noi cu proiecte (o nuntă, un botez etc.), cereți
integrarea lor — categoriile corespunzătoare vor fi reactivate.

### 4. Detalii de completat la proiecte

- **Locația și anul** fiecărui proiect (ex. „Chișinău • 2026”) — acum cardurile
  afișează doar tipul ședinței, pentru a nu inventa date.
- **Fotografia echipei** pentru pagina „Despre noi” (momentan placeholder).

### 5. Domeniul site-ului

După alegerea domeniului, înlocuiți `https://www.dimaxstudio.example` în:
- `sitemap.xml`
- `robots.txt`

și adăugați în fiecare pagină `og:url` + transformați `og:image` în URL absolut
(comentariul din `<head>` marchează locul).

### 6. Alte informații opționale

- **Google Analytics** — nu este instalat (nu a fost furnizat un ID). Site-ul nu
  folosește cookie-uri, deci **nu este necesar banner de cookies**.
- **Prezentarea echipei** — pe pagina „Despre noi” există un loc marcat.

## Dezvoltare locală

Site-ul este static — deschideți `index.html` direct în browser sau rulați:

```bash
python3 -m http.server 8080
```

apoi accesați `http://localhost:8080`.
