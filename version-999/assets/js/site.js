(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var input = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var emptyState = document.querySelector("[data-empty-state]");
    if (!cards.length || (!input && !yearFilter && !typeFilter)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = normalize(yearFilter ? yearFilter.value : "");
      var type = normalize(typeFilter ? typeFilter.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || cardYear === year;
        var matchType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
        var visible = matchKeyword && matchYear && matchType;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    [input, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-play-button]");
      if (!video || !cover) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream-url");
      var bound = false;
      var hls = null;

      function bindStream() {
        if (bound || !streamUrl) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        bound = true;
      }

      function play() {
        bindStream();
        cover.hidden = true;
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            cover.hidden = false;
          });
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!bound || video.paused) {
          play();
        }
      });
      video.addEventListener("ended", function () {
        cover.hidden = false;
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
