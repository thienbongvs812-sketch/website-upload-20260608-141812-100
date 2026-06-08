(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-card-filter]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var note = scope.querySelector("[data-filter-note]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      if (!cards.length) {
        return;
      }

      function apply() {
        var query = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var matched = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            ok = false;
          }
          if (selectedType && cardType.indexOf(selectedType) === -1 && text.indexOf(selectedType) === -1) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            matched += 1;
          }
        });
        if (note) {
          note.textContent = matched > 0 ? "筛选已更新" : "没有找到匹配影片";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
        apply();
      }
    });
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    if (!video || !button || !config.source) {
      return;
    }

    var hls = null;
    var ready = false;
    var pendingPlay = false;

    function showMessage(message) {
      if (!overlay) {
        return;
      }
      overlay.textContent = message;
      overlay.classList.add("is-visible");
      window.setTimeout(function () {
        overlay.classList.remove("is-visible");
      }, 2600);
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (config.poster) {
        video.poster = config.poster;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(config.source);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            video.play().catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频暂时无法播放");
          }
        });
      } else {
        video.src = config.source;
      }
    }

    function start() {
      pendingPlay = true;
      prepare();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
