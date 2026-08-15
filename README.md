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

### 3. Fotografiile — cel mai important pas

Repository-ul nu conține încă fotografii reale, de aceea site-ul folosește
**placeholder-e SVG elegante** (marcate „Fotografie în pregătire”). Structura:

```
assets/img/hero/                 7 fotografii pentru caruselul de pe Acasă
assets/img/nunti/<proiect>/      cover + hero + galerie (10 fotografii) pe proiect
assets/img/sedinte-foto/<proiect>/
assets/img/evenimente/<proiect>/
assets/img/nunti/hero.svg        fotografia panoramică a fiecărei categorii
assets/img/despre/echipa.svg     fotografia echipei
assets/img/contact/fundal.svg    fundalul paginii de contact
```

Când fotografiile reale sunt disponibile: încărcați-le în repository (sau trimiteți-le
în conversație) și cereți integrarea lor — vor fi optimizate în WebP/AVIF, cu
dimensiuni responsive și alt-texte corecte, iar galeriile vor fi rearanjate după
orientarea reală a fiecărei fotografii.

### 4. Proiectele demonstrative

Cele 6 proiecte („Ana + Mihai”, „Botezul Sofiei” etc.) sunt **conținut demonstrativ**
care arată structura și designul. Înlocuiți-le cu proiecte reale (nume, locație, an,
descrieri) odată cu fotografiile.

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
