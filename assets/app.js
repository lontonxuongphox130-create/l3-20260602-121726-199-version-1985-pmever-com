(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5600);
    }

    var localSearch = document.querySelector('[data-card-search]');
    var localSort = document.querySelector('[data-card-sort]');
    var movieCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var grid = document.querySelector('[data-card-grid]');

    function filterCards() {
        if (!movieCards.length) {
            return;
        }

        var query = localSearch ? localSearch.value.trim().toLowerCase() : '';

        movieCards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-year') || ''
            ].join(' ').toLowerCase();

            card.style.display = text.indexOf(query) >= 0 ? '' : 'none';
        });
    }

    function sortCards() {
        if (!grid || !localSort) {
            return;
        }

        var mode = localSort.value;
        var visibleCards = movieCards.slice();

        visibleCards.sort(function (a, b) {
            var yearA = Number(a.getAttribute('data-year') || 0);
            var yearB = Number(b.getAttribute('data-year') || 0);
            var titleA = a.getAttribute('data-title') || '';
            var titleB = b.getAttribute('data-title') || '';

            if (mode === 'year-asc') {
                return yearA - yearB;
            }

            if (mode === 'title') {
                return titleA.localeCompare(titleB, 'zh-Hans-CN');
            }

            return yearB - yearA;
        });

        visibleCards.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    if (localSearch) {
        localSearch.addEventListener('input', filterCards);
    }

    if (localSort) {
        localSort.addEventListener('change', sortCards);
    }

    function initVideoPlayer(video, url) {
        if (!video || !url) {
            return;
        }

        if (video.dataset.ready === '1') {
            video.play();
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.dataset.ready = '1';
            video.play();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.dataset.ready = '1';
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
            return;
        }

        video.src = url;
        video.dataset.ready = '1';
        video.play();
    }

    var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-video]'));

    playButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var shell = button.closest('.player-shell');
            var video = shell ? shell.querySelector('video') : document.querySelector('video[data-video-src]');
            var overlay = shell ? shell.querySelector('.player-overlay') : null;
            var url = button.getAttribute('data-video-url') || (video ? video.getAttribute('data-video-src') : '');

            if (overlay) {
                overlay.classList.add('hidden');
            }

            initVideoPlayer(video, url);
        });
    });

    var searchInput = document.querySelector('[data-global-search]');
    var searchResults = document.querySelector('[data-search-results]');

    function renderSearchResults() {
        if (!searchInput || !searchResults || !window.MOVIE_INDEX) {
            return;
        }

        var query = searchInput.value.trim().toLowerCase();
        var results = window.MOVIE_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(' ').toLowerCase();
            return !query || text.indexOf(query) >= 0;
        }).slice(0, 120);

        searchResults.innerHTML = results.map(function (movie) {
            return [
                '<article class="search-result-card">',
                '    <h3><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3>',
                '    <p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</p>',
                '    <a class="text-link" href="' + movie.detail + '">进入详情</a>',
                '</article>'
            ].join('\n');
        }).join('\n');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[character];
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderSearchResults);
        renderSearchResults();
    }
})();
