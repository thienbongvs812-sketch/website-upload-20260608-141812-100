function handleImageError(image) {
  var holder = image.closest('.poster, .hero-backdrop, .hero-poster, .detail-poster, .detail-backdrop');

  if (holder) {
    holder.setAttribute('data-missing', 'true');
  }

  image.style.opacity = '0';
  image.setAttribute('aria-hidden', 'true');
}

function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
  });
}

function setupBackTop() {
  document.querySelectorAll('[data-back-top]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

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

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      start();
    });
  }

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupMovieFilters() {
  document.querySelectorAll('[data-movie-filter]').forEach(function (form) {
    var targetId = form.getAttribute('data-movie-filter');
    var target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    var items = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
    var searchInput = form.querySelector('[data-search-input]');
    var yearFilter = form.querySelector('[data-year-filter]');
    var categoryFilter = form.querySelector('[data-category-filter]');
    var countOutput = form.querySelector('[data-filter-count]');

    function getText(item) {
      return [
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-category'),
        item.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var categoryValue = categoryFilter ? categoryFilter.value : '';
      var visibleCount = 0;

      items.forEach(function (item) {
        var year = Number(item.getAttribute('data-year')) || 0;
        var category = item.getAttribute('data-category') || '';
        var matchesQuery = !query || getText(item).indexOf(query) !== -1;
        var matchesYear = true;
        var matchesCategory = !categoryValue || category === categoryValue;

        if (yearValue === 'older') {
          matchesYear = year > 0 && year < 2020;
        } else if (yearValue) {
          matchesYear = String(year) === yearValue;
        }

        var isVisible = matchesQuery && matchesYear && matchesCategory;
        item.classList.toggle('is-hidden', !isVisible);

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countOutput) {
        countOutput.textContent = '显示 ' + visibleCount + ' 条';
      }
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    applyFilter();
  });
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video[data-src]');
    var startButton = shell.querySelector('[data-player-start]');
    var status = shell.querySelector('[data-player-status]');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !startButton) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initialize() {
      var source = video.getAttribute('data-src');

      if (!source) {
        setStatus('当前影片暂未配置播放线路。');
        return;
      }

      if (initialized) {
        video.play().catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放。');
        });
        return;
      }

      initialized = true;
      setStatus('正在初始化高清播放线路...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setStatus('播放已准备好，请点击播放器继续。');
          });
        }, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setStatus('播放已准备好，请点击播放器继续。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放线路连接失败，请刷新页面或稍后重试。');
          }
        });
      } else {
        video.src = source;
        setStatus('当前浏览器不支持 HLS.js，已尝试使用原生播放能力。');
      }
    }

    startButton.addEventListener('click', function () {
      shell.classList.add('is-playing');
      initialize();
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        setStatus('已暂停');
      }
    });

    video.addEventListener('ended', function () {
      setStatus('播放结束');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupBackTop();
  setupHeroCarousel();
  setupMovieFilters();
  setupPlayers();
});
