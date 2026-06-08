(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchAndFilter();
    setupPlayer();
    setupBackTop();
  });

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
      toggle.textContent = isOpen ? '☰' : '×';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchAndFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var empty = document.querySelector('.result-empty');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var currentFilter = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply(query) {
      var q = normalize(query);
      var visibleCount = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var category = card.getAttribute('data-category') || '';
        var matchQuery = !q || haystack.indexOf(q) !== -1;
        var matchCategory = currentFilter === 'all' || category === currentFilter;
        var show = matchQuery && matchCategory;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentFilter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply(getActiveSearchValue());
      });
    });

    function getActiveSearchValue() {
      var focused = document.activeElement;
      if (focused && focused.matches('input[type="search"]')) {
        return focused.value;
      }
      var local = document.querySelector('.local-search input[type="search"]');
      var header = document.querySelector('.header-search input[type="search"]');
      return (local && local.value) || (header && header.value) || '';
    }

    function bindSearchForm(form) {
      var input = form.querySelector('input[type="search"]');
      if (!input) {
        return;
      }
      input.addEventListener('input', function () {
        if (cards.length) {
          apply(input.value);
        }
      });
      form.addEventListener('submit', function (event) {
        var query = input.value.trim();
        if (cards.length) {
          event.preventDefault();
          apply(query);
          var list = document.getElementById('movie-list');
          if (list) {
            list.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (query) {
          event.preventDefault();
          window.location.href = 'index.html?search=' + encodeURIComponent(query) + '#movie-list';
        }
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('form[role="search"]')).forEach(bindSearchForm);

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('search');
    if (initial && cards.length) {
      Array.prototype.slice.call(document.querySelectorAll('input[type="search"]')).forEach(function (input) {
        input.value = initial;
      });
      apply(initial);
      var target = document.getElementById('movie-list');
      if (target) {
        window.setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }

  function setupPlayer() {
    var box = document.querySelector('[data-player]');
    if (!box) {
      return;
    }
    var video = box.querySelector('video');
    var button = box.querySelector('.player-overlay');
    var source = box.getAttribute('data-source');
    var hlsInstance = null;
    var hasLoaded = false;

    function loadSource() {
      if (hasLoaded || !video || !source) {
        return;
      }
      hasLoaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      loadSource();
      box.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!hasLoaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        box.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector('.back-top');
    if (!button) {
      return;
    }
    function sync() {
      button.classList.toggle('visible', window.scrollY > 420);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }
})();
