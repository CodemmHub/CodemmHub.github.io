(function () {
  document.body.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If anime.js failed to load (offline, CDN blocked) or the visitor
  // has reduced-motion on, skip straight to a fully visible, static
  // page instead of leaving things mid-animation or invisible.
  if (typeof anime === 'undefined' || reduceMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
    return;
  }

  var animate = anime.animate;
  var stagger = anime.stagger;
  var onScroll = anime.onScroll;

  /* ---------------------------------------------
     1. HERO ENTRANCE — the one signature moment.
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
     2. SCROLL REVEALS — every .reveal block animates
     in once when it enters the viewport. onScroll()
     handles the observer/threshold/sync wiring so we
     don't hand-roll IntersectionObserver plumbing.
     --------------------------------------------- */
  document.querySelectorAll('.reveal').forEach(function (el) {
    animate(el, {
      opacity: [ 0, 1 ],
      y: [ 24, 0 ],
      duration: 800,
      ease: 'outQuad',
      autoplay: onScroll({
        target: el,
        enter: 'bottom-=80 top',
        sync: false, // play once, don't scrub with scroll position
        onEnter: function () { el.classList.add('in-view'); },
      }),
    });
  });

  // Work cards get their own, slightly staggered reveal so the grid
  // fills in row by row rather than all cards popping at once.
  animate('.work-card', {
    opacity: [ 0, 1 ],
    y: [ 20, 0 ],
    duration: 600,
    delay: stagger(60),
    ease: 'outQuad',
    autoplay: onScroll({
      target: '#work-grid',
      enter: 'bottom-=80 top',
      sync: false,
      onEnter: function () {
        document.querySelectorAll('.work-card').forEach(function (c) { c.style.opacity = 1; });
      },
    }),
  });

  /* ---------------------------------------------
     3. NAV — background/blur fades in on scroll.
     --------------------------------------------- */
  var header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ---------------------------------------------
     4. WORK FILTER — All / Dev / Brand. Hiding is
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
