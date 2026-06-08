(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupMobileMenu() {
    var toggle = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = qsa('.hero-slide');
    if (!slides.length) {
      return;
    }
    var dots = qsa('.hero-dot');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(next, 5000);
    }

    qsa('[data-hero-next]').forEach(function (button) {
      button.addEventListener('click', function () {
        next();
        restart();
      });
    });

    qsa('[data-hero-prev]').forEach(function (button) {
      button.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupCategoryFilter() {
    var grid = qs('[data-category-grid]');
    if (!grid) {
      return;
    }
    var cards = qsa('.movie-card', grid);
    var keyword = qs('[data-filter-keyword]');
    var year = qs('[data-filter-year]');
    var type = qs('[data-filter-type]');
    var gridButton = qs('[data-view-grid]');
    var listButton = qs('[data-view-list]');

    function apply() {
      var word = (keyword && keyword.value || '').trim().toLowerCase();
      var yearValue = year && year.value || '';
      var typeValue = type && type.value || '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-keywords') || '').toLowerCase();
        var matchedWord = !word || haystack.indexOf(word) !== -1;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
        card.style.display = matchedWord && matchedYear && matchedType ? '' : 'none';
      });
    }

    [keyword, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });

    if (gridButton && listButton) {
      gridButton.addEventListener('click', function () {
        grid.classList.remove('list-view');
        gridButton.classList.add('is-active');
        listButton.classList.remove('is-active');
      });
      listButton.addEventListener('click', function () {
        grid.classList.add('list-view');
        listButton.classList.add('is-active');
        gridButton.classList.remove('is-active');
      });
    }
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + text(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
        '<a class="movie-cover" href="' + text(movie.url) + '" aria-label="' + text(movie.title) + '">' +
          '<img src="' + text(movie.cover) + '" alt="' + text(movie.title) + '">' +
          '<span class="cover-shade"></span>' +
          '<span class="play-mark">▶</span>' +
          '<span class="year-badge">' + text(movie.year) + '</span>' +
          '<span class="type-badge">' + text(movie.type) + '</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<h3><a href="' + text(movie.url) + '">' + text(movie.title) + '</a></h3>' +
          '<p class="movie-line">' + text(movie.one_line) + '</p>' +
          '<div class="meta-row"><span>' + text(movie.region) + '</span><span>' + text(movie.category) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function setupSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var input = qs('[data-search-input]');
    var form = qs('[data-search-form]');
    var title = qs('[data-search-title]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(value) {
      var word = String(value || '').trim().toLowerCase();
      var list = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.one_line, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return !word || haystack.indexOf(word) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = word ? '搜索：' + value : '影片搜索';
      }
      results.innerHTML = list.length ? list.map(movieCard).join('') : '<div class="empty-state">没有找到相关影片</div>';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value : '';
        var url = value.trim() ? 'search.html?q=' + encodeURIComponent(value.trim()) : 'search.html';
        history.replaceState(null, '', url);
        render(value);
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupCategoryFilter();
    setupSearchPage();
  });
})();
