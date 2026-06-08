(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function bindFilters() {
        var searchInput = document.querySelector('[data-search-input]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        if (!cards.length) {
            return;
        }

        function apply() {
            var query = normalize(searchInput && searchInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' '));
                var ok = true;

                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
                    ok = false;
                }
                if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
                    ok = false;
                }

                card.classList.toggle('is-hidden', !ok);
            });
        }

        [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
    }

    function bindHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function bindPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('[data-player-button]');
            var url = box.getAttribute('data-m3u8');
            var loaded = false;
            var hlsInstance = null;

            if (!video || !url) {
                return;
            }

            function start() {
                if (!loaded) {
                    loaded = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(url);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = url;
                    }
                }

                if (button) {
                    button.classList.add('is-hidden');
                }

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (button && !video.ended) {
                    button.classList.remove('is-hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindFilters();
        bindHero();
        bindPlayers();
    });
})();
