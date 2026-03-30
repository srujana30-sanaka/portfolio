(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function appendSpacedLetters(container, line, startIndex) {
    var idx = startIndex;
    for (var i = 0; i < line.length; i++) {
      var span = document.createElement('span');
      span.className = 'text-animate _' + idx;
      idx += 1;
      span.textContent = ' ' + line[i] + ' ';
      container.appendChild(span);
    }
    container.appendChild(document.createElement('br'));
    return idx;
  }

  function buildHeroHeading() {
    var el = document.getElementById('hero-heading');
    if (!el) return;
    var idx = 10;
    idx = appendSpacedLetters(el, 'Hi,', idx);
    idx = appendSpacedLetters(el, "I'm", idx);
    idx = appendSpacedLetters(el, 'Lakshmi', idx);
    idx = appendSpacedLetters(el, 'Srujana', idx);
    appendSpacedLetters(el, 'Sanaka', idx);
  }

  function buildTitle(el, text, startIndex) {
    if (!el) return;
    var idx = startIndex;
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'text-animate _' + idx;
      idx += 1;
      if (text[i] === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = ' ' + text[i] + ' ';
      }
      el.appendChild(span);
    }
  }

  buildHeroHeading();
  buildTitle(document.getElementById('about-title'), 'About Me', 10);
  buildTitle(document.getElementById('contact-title'), 'Contact', 10);

  var prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    window.setTimeout(function () {
      document.querySelectorAll('.text-animate').forEach(function (node) {
        node.classList.remove('text-animate');
        node.classList.add('text-animate-hover');
      });
    }, 3000);
  } else {
    document.querySelectorAll('.text-animate').forEach(function (node) {
      node.classList.remove('text-animate');
      node.classList.add('text-animate-hover');
    });
  }

  var toggle = document.getElementById('nav-toggle');
  var drawer = document.getElementById('mobile-drawer');
  var closeBtn = document.getElementById('nav-close');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', openDrawer);
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) closeDrawer();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }
  document.querySelectorAll('[data-nav-mobile]').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
        closeDrawer();
      }
    });
  });

  if (prefersReduced || typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('[data-reveal]').forEach(function (node) {
      node.classList.add('is-visible');
    });
  } else {
    var rev = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach(function (node) {
      rev.observe(node);
    });
  }

  var videoBox = document.querySelector('.image-box--video');
  var videoEl = document.querySelector('.image-box--video .project-video-bg');
  if (videoBox && videoEl && !prefersReduced) {
    videoBox.addEventListener('mouseenter', function () {
      videoEl.play().catch(function () {});
    });
    videoBox.addEventListener('mouseleave', function () {
      videoEl.pause();
    });
  }

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var subject = form.querySelector('[name="subject"]');
      var body = form.querySelector('[name="body"]');
      if (!subject || !body) return;
      var mail =
        'mailto:sanakalakshmisrujana@gmail.com?subject=' +
        encodeURIComponent(subject.value) +
        '&body=' +
        encodeURIComponent(body.value);
      e.preventDefault();
      window.location.href = mail;
    });
  }
})();
