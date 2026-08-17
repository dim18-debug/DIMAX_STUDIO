/* ==========================================================================
   DIMAX STUDIO — scripturi principale
   Header sticky · meniu mobil · carusel · animații · filtre · lightbox · formular
   ========================================================================== */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     1. Bara sticky compactă — apare după derularea headerului
     ------------------------------------------------------------------ */
  function initStickyBar() {
    var bar = qs('.sticky-bar');
    var header = qs('.site-header');
    if (!bar || !header) return;

    var threshold = 0;
    function measure() {
      threshold = header.offsetHeight + 80;
    }
    measure();
    window.addEventListener('resize', measure);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        bar.classList.toggle('is-visible', window.scrollY > threshold);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     2. Meniul mobil — deschidere, închidere (X, click în afară, Escape)
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = qs('.nav-toggle');
    var menu = qs('.mobile-menu');
    if (!toggle || !menu) return;

    var closeBtn = qs('.mobile-menu-close', menu);
    var lastFocused = null;

    function focusables() {
      return qsa('a[href], button:not([disabled])', menu).filter(function (el) {
        return el.offsetParent !== null || menu.classList.contains('is-open');
      });
    }

    function open() {
      lastFocused = document.activeElement;
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    /* click în afara listei de linkuri închide meniul */
    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.classList.contains('mobile-menu-foot')) close();
    });

    qsa('a', menu).forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'Tab') {
        var items = focusables();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Caruselul principal — fade lent, autoplay, săgeți, swipe, pauză
     ------------------------------------------------------------------ */
  function initCarousel() {
    var root = qs('[data-carousel]');
    if (!root) return;

    var slides = qsa('.hc-slide', root);
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;
    var INTERVAL = 5500;
    var hovered = false;
    var focused = false;
    var counter = qs('.hc-counter [data-current]', root);
    var liveRegion = qs('.hc-live', root);

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function preload(i) {
      qsa('img', slides[i]).forEach(function (img) {
        if (img.dataset.srcset) { img.srcset = img.dataset.srcset; delete img.dataset.srcset; }
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        if (img.loading === 'lazy') img.loading = 'eager';
      });
    }

    var hydrateTimer = null;

    function show(i) {
      slides[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      preload(current);
      /* slide-ul următor se încarcă după ce imaginea principală a avut prioritate */
      if (hydrateTimer) window.clearTimeout(hydrateTimer);
      hydrateTimer = window.setTimeout(function () {
        preload((current + 1) % slides.length);
      }, 4000);
      slides[current].classList.add('is-active');
      if (counter) counter.textContent = pad(current + 1);
      if (liveRegion) {
        liveRegion.textContent = 'Fotografia ' + (current + 1) + ' din ' + slides.length;
      }
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function play() {
      if (reducedMotion || timer || hovered || focused || document.hidden) return;
      timer = window.setInterval(next, INTERVAL);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      play();
    }

    var btnPrev = qs('.hc-arrow.prev', root);
    var btnNext = qs('.hc-arrow.next', root);
    if (btnPrev) btnPrev.addEventListener('click', function () { prev(); restart(); });
    if (btnNext) btnNext.addEventListener('click', function () { next(); restart(); });

    /* pauză când cursorul sau focusul se află pe carusel */
    root.addEventListener('mouseenter', function () { hovered = true; stop(); });
    root.addEventListener('mouseleave', function () { hovered = false; play(); });
    root.addEventListener('focusin', function (e) {
      /* pauză doar pentru focus de la tastatură — clickul pe săgeți nu oprește autoplay-ul */
      var keyboardFocus = true;
      try { keyboardFocus = e.target.matches(':focus-visible'); } catch (err) { /* browsere vechi */ }
      if (keyboardFocus) { focused = true; stop(); }
    });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) { focused = false; play(); }
    });

    /* pauză când fila nu este vizibilă */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { play(); }
    });

    /* swipe pe ecrane tactile */
    var startX = null;
    root.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
      stop();
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) {
        if (dx < 0) { next(); } else { prev(); }
      }
      startX = null;
      play();
    }, { passive: true });

    show(0);
    play();
  }

  /* ------------------------------------------------------------------
     4. Animații de apariție la derulare
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = qsa('.reveal, .reveal-stagger');
    if (!items.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     5. Filtrarea portofoliului
     ------------------------------------------------------------------ */
  function initFilters() {
    var bar = qs('[data-filter-bar]');
    if (!bar) return;

    var buttons = qsa('.filter-btn', bar);
    var cards = qsa('[data-cat]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          var match = filter === 'toate' || card.getAttribute('data-cat') === filter;
          card.classList.toggle('is-filtered-out', !match);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     6. Lightbox — galerii de proiect
     ------------------------------------------------------------------ */
  function initLightbox() {
    var triggers = qsa('.lb-trigger');
    if (!triggers.length) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Vizualizare fotografie');
    lightbox.innerHTML =
      '<p class="lb-counter"><span data-current>01</span>&nbsp;/&nbsp;<span data-total>01</span></p>' +
      '<figure class="lb-figure"><img alt=""></figure>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Închide (Escape)">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20"/></svg>' +
      '</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Fotografia anterioară">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M15 4l-8 8 8 8"/></svg>' +
      '</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Fotografia următoare">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>' +
      '</button>';
    document.body.appendChild(lightbox);

    var lbImg = qs('img', lightbox);
    var lbCurrent = qs('[data-current]', lightbox);
    var lbTotal = qs('[data-total]', lightbox);
    var index = 0;
    var lastFocused = null;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function render() {
      var trigger = triggers[index];
      var img = qs('img', trigger);
      lbImg.src = trigger.getAttribute('href');
      lbImg.alt = img ? img.alt : '';
      lbCurrent.textContent = pad(index + 1);
      lbTotal.textContent = pad(triggers.length);
    }

    function openAt(i) {
      lastFocused = document.activeElement;
      index = i;
      render();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      qs('.lb-close', lightbox).focus();
    }

    function close() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function step(dir) {
      index = (index + dir + triggers.length) % triggers.length;
      render();
    }

    triggers.forEach(function (trigger, i) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openAt(i);
      });
    });

    qs('.lb-close', lightbox).addEventListener('click', close);
    qs('.lb-prev', lightbox).addEventListener('click', function () { step(-1); });
    qs('.lb-next', lightbox).addEventListener('click', function () { step(1); });

    /* click pe fundal închide */
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lb-figure')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowLeft') { step(-1); }
      else if (e.key === 'ArrowRight') { step(1); }
      else if (e.key === 'Tab') {
        var items = qsa('button', lightbox);
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    /* swipe pe ecrane tactile */
    var startX = null;
    lightbox.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) {
        step(dx < 0 ? 1 : -1);
      }
      startX = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     7. Completarea automată a datelor de contact din site-config.js
     ------------------------------------------------------------------ */
  function initContactData() {
    var cfg = window.DIMAX_CONFIG || {};

    var friendly = { whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook' };

    qsa('[data-contact]').forEach(function (el) {
      var key = el.getAttribute('data-contact');
      var value = (cfg[key] || '').trim();
      if (!value) {
        /* datele necompletate nu se afișează — rândul reapare când sunt completate */
        var row = el.closest('li');
        if (row) row.hidden = true;
        return;
      }

      el.classList.remove('placeholder-value');
      el.textContent = friendly[key] || value;

      if (el.tagName === 'A') {
        if (key === 'phone') { el.href = 'tel:' + value.replace(/[^+\d]/g, ''); }
        else if (key === 'email') { el.href = 'mailto:' + value; }
        else if (key === 'whatsapp') {
          el.href = 'https://wa.me/' + value.replace(/\D/g, '');
        } else if (key === 'instagram' || key === 'facebook') {
          el.href = value;
          el.rel = 'noopener';
          el.target = '_blank';
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     8. Formularul de contact — validare, anti-spam, trimitere
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = qs('[data-contact-form]');
    if (!form) return;

    var cfg = window.DIMAX_CONFIG || {};
    var status = qs('.form-status', form);
    var submitBtn = qs('button[type="submit"]', form);
    var firstInteraction = null;

    form.addEventListener('focusin', function () {
      if (!firstInteraction) firstInteraction = Date.now();
    });

    function setStatus(type, message) {
      status.className = 'form-status is-' + type;
      status.textContent = message;
      status.focus();
    }

    function fieldWrap(input) {
      var el = input.closest('.form-field') || input.closest('.consent-field');
      return el;
    }

    function setError(input, message) {
      var wrap = fieldWrap(input);
      if (!wrap) return;
      var err = qs('.field-error', wrap);
      if (message) {
        wrap.classList.add('has-error');
        if (err) err.textContent = message;
        input.setAttribute('aria-invalid', 'true');
      } else {
        wrap.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      }
    }

    function validate() {
      var ok = true;
      var firstInvalid = null;

      function fail(input, message) {
        setError(input, message);
        if (!firstInvalid) firstInvalid = input;
        ok = false;
      }

      var name = form.elements.nume;
      var phone = form.elements.telefon;
      var email = form.elements.email;
      var type = form.elements.tip;
      var message = form.elements.mesaj;
      var consent = form.elements.acord;

      setError(name); setError(phone); setError(email);
      setError(type); setError(message); setError(consent);

      if (!name.value.trim() || name.value.trim().length < 3) {
        fail(name, 'Te rugăm să scrii numele complet.');
      }
      var phoneDigits = phone.value.replace(/\D/g, '');
      if (!/^[+\d][\d\s().-]{5,19}$/.test(phone.value.trim()) || phoneDigits.length < 6 || phoneDigits.length > 15) {
        fail(phone, 'Te rugăm să scrii un număr de telefon valid.');
      }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        fail(email, 'Te rugăm să scrii o adresă de e-mail validă.');
      }
      if (!type.value) {
        fail(type, 'Te rugăm să alegi tipul evenimentului.');
      }
      if (!message.value.trim() || message.value.trim().length < 10) {
        fail(message, 'Te rugăm să ne spui câteva detalii despre eveniment.');
      }
      if (!consent.checked) {
        fail(consent, 'Pentru a trimite mesajul este necesar acordul pentru prelucrarea datelor.');
      }

      if (firstInvalid) firstInvalid.focus();
      return ok;
    }

    /* elimină eroarea în timp ce utilizatorul corectează câmpul */
    qsa('input, select, textarea', form).forEach(function (input) {
      input.addEventListener('input', function () { setError(input); });
      input.addEventListener('change', function () { setError(input); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validate()) return;

      /* anti-spam: honeypot + timp minim de la prima interacțiune cu formularul
         (după validare, pentru ca un utilizator real să vadă întotdeauna erorile corecte) */
      var honeypot = form.elements.website;
      var tooFast = !firstInteraction || Date.now() - firstInteraction < 2500;
      if ((honeypot && honeypot.value) || tooFast) {
        setStatus('success', 'Mulțumim! Mesajul tău a fost trimis. Revenim cu un răspuns cât mai curând.');
        return;
      }

      if (!cfg.formEndpoint) {
        setStatus('info', 'Formularul va fi activat imediat ce adresa de e-mail a studioului va fi configurată. Până atunci, ne poți contacta direct prin datele afișate pe această pagină. Îți mulțumim pentru înțelegere!');
        return;
      }

      var data = new FormData(form);
      data.delete('website');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Se trimite…';

      fetch(cfg.formEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
        .then(function (res) {
          if (!res.ok) throw new Error('send-failed');
          form.reset();
          setStatus('success', 'Mulțumim! Mesajul tău a fost trimis. Revenim cu un răspuns cât mai curând.');
        })
        .catch(function () {
          setStatus('error', 'Mesajul nu a putut fi trimis în acest moment. Te rugăm să încerci din nou sau să ne contactezi direct prin telefon ori e-mail.');
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Trimite mesajul';
        });
    });
  }

  /* ------------------------------------------------------------------
     8b. Precompletarea formularului pentru comenzile din Shop
     ------------------------------------------------------------------ */
  function initShopPrefill() {
    var form = qs('[data-contact-form]');
    if (!form) return;

    var produs = new URLSearchParams(window.location.search).get('produs');
    if (!produs) return;
    produs = produs.slice(0, 80);

    var tip = form.elements.tip;
    if (tip) {
      for (var i = 0; i < tip.options.length; i++) {
        if (tip.options[i].text === 'Comandă Shop') {
          tip.selectedIndex = i;
          break;
        }
      }
    }

    var mesaj = form.elements.mesaj;
    if (mesaj && !mesaj.value) {
      mesaj.value = 'Bună! Aș dori să comand: ' + produs + '. ';
    }
  }

  /* ------------------------------------------------------------------
     9. Anul curent în footer
     ------------------------------------------------------------------ */
  function initYear() {
    var el = qs('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     Inițializare
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initStickyBar();
    initMobileMenu();
    initCarousel();
    initReveal();
    initFilters();
    initLightbox();
    initContactData();
    initContactForm();
    initShopPrefill();
    initYear();
  });
})();
