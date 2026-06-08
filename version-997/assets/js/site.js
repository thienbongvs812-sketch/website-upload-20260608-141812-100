(function() {
  var menuButton = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function() {
      var open = navLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  var list = document.querySelector('[data-filter-list]');
  if (filterRoot && list) {
    var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var categorySelect = filterRoot.querySelector('[data-filter-category]');
    var empty = document.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .movie-row'));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var keyword = valueOf(keywordInput);
      var year = valueOf(yearSelect);
      var region = valueOf(regionSelect);
      var type = valueOf(typeSelect);
      var category = valueOf(categorySelect);
      var visible = 0;

      cards.forEach(function(card) {
        var ok = true;
        var text = cardText(card);
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && String(card.getAttribute('data-year')).toLowerCase() !== year) {
          ok = false;
        }
        if (region && String(card.getAttribute('data-region')).toLowerCase() !== region) {
          ok = false;
        }
        if (type && String(card.getAttribute('data-type')).toLowerCase() !== type) {
          ok = false;
        }
        if (category && String(card.getAttribute('data-category')).toLowerCase() !== category) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach(function(element) {
      if (!element) {
        return;
      }
      element.addEventListener('input', applyFilter);
      element.addEventListener('change', applyFilter);
    });

    applyFilter();
  }
})();
