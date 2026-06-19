(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            }, { once: true });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var dotsWrap = hero.querySelector('[data-hero-dots]');
        var index = 0;
        var timer = null;

        function renderDots() {
            if (!dotsWrap) {
                return;
            }
            dotsWrap.innerHTML = '';
            slides.forEach(function (_, dotIndex) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第 ' + (dotIndex + 1) + ' 张');
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
                dotsWrap.appendChild(dot);
            });
        }

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

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
        renderDots();
        show(0);
        restart();
    }

    function initFilters() {
        var input = document.querySelector('[data-search-input]');
        var yearFilter = document.querySelector('[data-filter-year]');
        var regionFilter = document.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        if (!cards.length) {
            return;
        }

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            var year = normalize(yearFilter ? yearFilter.value : '');
            var region = normalize(regionFilter ? regionFilter.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var matchesRegion = !region || normalize(card.dataset.region) === region;
                var isVisible = matchesQuery && matchesYear && matchesRegion;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, yearFilter, regionFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-player-button]');
            var source = player.dataset.videoSrc;
            var hlsInstance = null;

            function loadAndPlay() {
                if (!video || !source) {
                    return;
                }
                if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal && data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        }
                    });
                } else {
                    video.src = source;
                }
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
                player.classList.add('is-playing');
            }

            if (button) {
                button.addEventListener('click', loadAndPlay);
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    if (!video.ended) {
                        player.classList.remove('is-playing');
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initImages();
        initHero();
        initFilters();
        initPlayers();
    });
}());
