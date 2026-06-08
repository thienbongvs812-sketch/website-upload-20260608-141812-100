(function () {
    const menuButton = document.querySelector('[data-mobile-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const previous = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let currentIndex = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                if (dotIndex === currentIndex) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });
        }

        function restartTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
                restartTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(currentIndex - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(currentIndex + 1);
                restartTimer();
            });
        }

        restartTimer();
    });

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

        input.addEventListener('input', function () {
            const keyword = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                const text = [
                    card.dataset.title || '',
                    card.dataset.tags || '',
                    card.dataset.year || '',
                    card.dataset.category || ''
                ].join(' ').toLowerCase();
                card.style.display = !keyword || text.includes(keyword) ? '' : 'none';
            });
        });
    });

    const searchTool = document.querySelector('[data-search-tool]');
    const results = document.querySelector('[data-search-results]');
    const status = document.querySelector('[data-search-status]');

    if (searchTool && results && window.MOVIE_DATA) {
        const keywordInput = searchTool.querySelector('input[name="q"]');
        const categorySelect = searchTool.querySelector('select[name="category"]');
        const yearSelect = searchTool.querySelector('select[name="year"]');
        const params = new URLSearchParams(window.location.search);

        if (keywordInput) {
            keywordInput.value = params.get('q') || '';
        }

        function createCard(movie) {
            return [
                '<article class="movie-card" data-movie-card>',
                '    <a href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <div class="movie-poster">',
                '            <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '            <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
                '            <span class="movie-type">' + escapeHtml(movie.type) + '</span>',
                '            <span class="movie-play" aria-hidden="true">▶</span>',
                '        </div>',
                '        <div class="movie-card-body">',
                '            <div class="card-tags">',
                '                <span>' + escapeHtml(movie.category) + '</span>',
                '                <span>' + escapeHtml(movie.region) + '</span>',
                '            </div>',
                '            <h3>' + escapeHtml(movie.title) + '</h3>',
                '            <p>' + escapeHtml(movie.oneLine) + '</p>',
                '            <div class="card-meta">',
                '                <span>热度 ' + escapeHtml(movie.heatText) + '</span>',
                '                <span>评分 ' + escapeHtml(movie.score) + '</span>',
                '            </div>',
                '        </div>',
                '    </a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderSearch() {
            const keyword = (keywordInput ? keywordInput.value : '').trim().toLowerCase();
            const category = categorySelect ? categorySelect.value : '';
            const year = yearSelect ? yearSelect.value : '';

            const filtered = window.MOVIE_DATA.filter(function (movie) {
                const searchable = [
                    movie.title,
                    movie.oneLine,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.tags.join(' ')
                ].join(' ').toLowerCase();

                const matchesKeyword = !keyword || searchable.includes(keyword);
                const matchesCategory = !category || movie.category === category;
                const matchesYear = !year || movie.year === year;

                return matchesKeyword && matchesCategory && matchesYear;
            }).slice(0, 96);

            results.innerHTML = filtered.map(createCard).join('');

            if (status) {
                status.textContent = filtered.length ? '已显示匹配结果，可点击影片卡片进入播放页。' : '暂无匹配结果，请更换关键词或筛选条件。';
            }
        }

        searchTool.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch();
        });

        [keywordInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', renderSearch);
                control.addEventListener('change', renderSearch);
            }
        });

        renderSearch();
    }
})();
