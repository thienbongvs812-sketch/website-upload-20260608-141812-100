(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('.mobile-toggle');
        var menu = document.querySelector('.mobile-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                var open = menu.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var slider = document.querySelector('.hero-slider');
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
            var prev = slider.querySelector('.hero-prev');
            var next = slider.querySelector('.hero-next');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
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
                    timer = null;
                }
            }

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

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });

            slider.addEventListener('mouseenter', stop);
            slider.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('.filter-input');
            var year = panel.querySelector('.filter-year');
            var type = panel.querySelector('.filter-type');
            var scope = panel.closest('section');
            var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

            if (scope && scope.querySelector('.movie-grid')) {
                cards = Array.prototype.slice.call(scope.parentElement ? scope.parentElement.querySelectorAll('.movie-card') : scope.querySelectorAll('.movie-card'));
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var selectedYear = year ? year.value : '';
                var selectedType = type ? type.value : '';

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var visible = true;

                    if (query && haystack.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        visible = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        visible = false;
                    }

                    card.classList.toggle('is-hidden', !visible);
                });
            }

            [input, year, type].forEach(function (field) {
                if (field) {
                    field.addEventListener('input', apply);
                    field.addEventListener('change', apply);
                }
            });
        });
    });
})();
