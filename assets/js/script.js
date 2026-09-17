(function () {
  document.body.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasAnime = typeof anime !== 'undefined';

  /* ---------------------------------------------
     SCROLL REVEALS — native IntersectionObserver decides
     visibility; the fade/rise itself is a plain CSS
     transition (see .reveal in styles.css).

     This used to go through anime's onScroll() + autoplay,
     but that left content stuck at opacity:0 in testing even
     after onEnter had already fired and added .in-view — the
     class was correct, the tween just never finished playing.
     IntersectionObserver + CSS transition can't get stuck like
     that: there's no separate JS tween whose playback can stall,
     just a class flip the browser's compositor animates on its
     own. It also means reveals keep working even if the anime.js
     CDN fails to load entirely, since nothing here depends on it.
     --------------------------------------------- */
  if (reduceMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.01 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Work cards get their own staggered reveal (via anime, if it loaded)
    // so the grid fills in row by row rather than all cards popping at
    // once — but the trigger is still the native observer above, not
    // anime's onScroll, and cards are visible by default in CSS so a
    // missing anime.js just means no stagger, not missing content.
    var workGrid = document.getElementById('work-grid');
    if (workGrid) {
      var gridObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var cards = Array.prototype.slice.call(workGrid.querySelectorAll('.work-card'));
          if (hasAnime) {
            cards.forEach(function (c) { c.style.opacity = 0; });
            anime.animate(cards, {
              opacity: [ 0, 1 ],
              y: [ 20, 0 ],
              duration: 600,
              delay: anime.stagger(60),
              ease: 'outQuad',
            });
          }
          gridObserver.unobserve(workGrid);
        });
      }, { rootMargin: '0px 0px -80px 0px', threshold: 0.01 });
      gridObserver.observe(workGrid);
    }
  }

  // Safety net: if anything above ever fails to fire for a reason we
  // haven't hit yet, don't leave section content permanently invisible.
  window.addEventListener('load', function () {
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in-view)').forEach(function (el) {
        el.classList.add('in-view');
      });
    }, 4000);
  });

  if (!hasAnime || reduceMotion) {
    return;
  }

  var animate = anime.animate;
  var stagger = anime.stagger;

  /* ---------------------------------------------
     HERO ENTRANCE — the one signature moment.
     Headline splits into words and rises into place;
     everything else in the hero follows in sequence.
     This is deliberately the boldest motion on the
     page, per the brief: one orchestrated load
     sequence beats scattered effects everywhere.

     Word-splitting is done by hand here rather than
     via anime's splitText(), which isn't included in
     the plain <script> CDN bundle (it lives in a
     separate ESM subpath) — this keeps the whole page
     working off one script tag, no module loader.

     These animate() calls run directly on load rather
     than through onScroll/autoplay, which is the pattern
     that tested reliably (unlike the scroll-gated reveals
     above), so it's left as-is.
     --------------------------------------------- */
  var headline = document.getElementById('hero-headline');
  var words = headline.textContent.trim().split(' ');
  // The space between words is a plain text node BETWEEN the word-clip
  // spans (via join(' ')), not inside one — a trailing space placed
  // inside an inline-block gets trimmed, because inline-block starts
  // its own line-box and edge whitespace on a line is always collapsed.
  headline.innerHTML = words.map(function (w) {
    return '<span class="word-clip"><span class="word-inner">' + w + '</span></span>';
  }).join(' ');
  var wordInners = Array.prototype.slice.call(headline.querySelectorAll('.word-inner'));

  animate(wordInners, {
    y: [ '110%', '0%' ],
    opacity: [ 0, 1 ],
    duration: 900,
    delay: stagger(60),
    ease: 'outExpo',
  });

  animate('.hero-status', {
    opacity: [ 0, 1 ],
    y: [ -8, 0 ],
    duration: 600,
    delay: 100,
    ease: 'outQuad',
  });

  animate('.hero-sub', {
    opacity: [ 0, 1 ],
    y: [ 12, 0 ],
    duration: 700,
    delay: 500,
    ease: 'outQuad',
  });

  animate('.hero-actions', {
    opacity: [ 0, 1 ],
    y: [ 12, 0 ],
    duration: 700,
    delay: 650,
    ease: 'outQuad',
  });

  animate('.hero-stats .stat', {
    opacity: [ 0, 1 ],
    y: [ 16, 0 ],
    duration: 700,
    delay: stagger(100, { start: 800 }),
    ease: 'outQuad',
  });

  /* ---------------------------------------------
     NAV — background/blur fades in on scroll.
     --------------------------------------------- */
  var header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------------------------------------------
     WORK FILTER — All / Dev / Brand. Hiding is
     instant (display: none) rather than animated out;
     animating the incoming set back in keeps the
     interaction feeling responsive rather than showy.
     --------------------------------------------- */
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.work-card');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      var filter = tab.dataset.filter;
      var visible = [];

      cards.forEach(function (card) {
        var cats = (card.dataset.cat || '').split(' ');
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        card.classList.toggle('hidden', !show);
        if (show) { card.style.opacity = 0; visible.push(card); }
      });

      animate(visible, {
        opacity: [ 0, 1 ],
        y: [ 10, 0 ],
        duration: 400,
        delay: stagger(30),
        ease: 'outQuad',
      });
    });
  });
})();
