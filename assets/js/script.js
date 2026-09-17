(function () {
  document.body.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasAnime = typeof anime !== 'undefined';

  /* ---------------------------------------------
     SCROLL REVEALS — native IntersectionObserver decides
     visibility; the fade/rise itself is a plain CSS
     transition (see .reveal in styles.css). Same fix as
     the root build: a JS tween driven through anime's
     onScroll()/autoplay left content stuck at opacity:0
     even after its "enter" callback had already fired.
     IntersectionObserver + CSS transition can't get stuck
     like that, and it works even if anime.js never loads.
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
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.01 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

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
              y: [ 16, 0 ],
              duration: 600,
              delay: anime.stagger(50),
              ease: 'outQuad',
            });
          }
          gridObserver.unobserve(workGrid);
        });
      }, { rootMargin: '0px 0px -60px 0px', threshold: 0.01 });
      gridObserver.observe(workGrid);
    }
  }

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
     HERO ENTRANCE — direct animate() calls, run on
     load rather than through onScroll/autoplay, which
     is the pattern that tested reliably.
     --------------------------------------------- */
  var headline = document.getElementById('hero-headline');
  if (headline) {
    // textContent flattens the markup, so the highlight-mark span around
    // "brands" in the HTML gets lost here — re-applied by word match below,
    // after the split, instead of trying to preserve it through the rebuild.
    var words = headline.textContent.trim().split(' ');
    // Space sits between the word-clip spans (join(' ')), not inside one —
    // a trailing space inside an inline-block gets trimmed as edge whitespace.
    headline.innerHTML = words.map(function (w) {
      return '<span class="word-clip"><span class="word-inner">' + w + '</span></span>';
    }).join(' ');
    var wordInners = Array.prototype.slice.call(headline.querySelectorAll('.word-inner'));
    wordInners.forEach(function (w) {
      if (w.textContent === 'brands') { w.classList.add('highlight-mark'); }
    });

    animate(wordInners, {
      y: [ '110%', '0%' ],
      opacity: [ 0, 1 ],
      duration: 800,
      delay: stagger(55),
      ease: 'outExpo',
    });
  }

  animate('.hero-status', { opacity: [ 0, 1 ], y: [ -8, 0 ], duration: 600, delay: 100, ease: 'outQuad' });
  animate('.hero-sub', { opacity: [ 0, 1 ], y: [ 12, 0 ], duration: 700, delay: 450, ease: 'outQuad' });
  animate('.hero-actions', { opacity: [ 0, 1 ], y: [ 12, 0 ], duration: 700, delay: 600, ease: 'outQuad' });
  animate('.hero-stats .stat', { opacity: [ 0, 1 ], y: [ 14, 0 ], duration: 700, delay: stagger(90, { start: 720 }), ease: 'outQuad' });
  animate('.hero-figure', { opacity: [ 0, 1 ], y: [ 16, 0 ], duration: 800, delay: 300, ease: 'outQuad' });

  /* ---------------------------------------------
     NAV — background/blur fades in on scroll.
     --------------------------------------------- */
  var header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------------------------------------------
     WORK FILTER — All / Dev / Brand.
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

      animate(visible, { opacity: [ 0, 1 ], y: [ 10, 0 ], duration: 400, delay: stagger(30), ease: 'outQuad' });
    });
  });
})();
