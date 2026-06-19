(function() {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startHero() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startHero();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
                startHero();
            });
        }
        startHero();
    }

    var searchInput = document.querySelector(".js-filter-input");
    var regionSelect = document.querySelector(".js-filter-region");
    var typeSelect = document.querySelector(".js-filter-type");
    var yearSelect = document.querySelector(".js-filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        cards.forEach(function(card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
            var passKeyword = !keyword || text.indexOf(keyword) !== -1;
            var passRegion = !region || normalize(card.getAttribute("data-region")) === region;
            var passType = !type || normalize(card.getAttribute("data-type")) === type;
            var passYear = !year || normalize(card.getAttribute("data-year")) === year;
            card.classList.toggle("is-hidden", !(passKeyword && passRegion && passType && passYear));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            searchInput.value = query;
        }
        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    }
})();

function setupMoviePlayer(streamUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !streamUrl) {
        return;
    }
    var attached = false;
    var instance = null;

    function attachStream() {
        if (!attached) {
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(streamUrl);
                instance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function() {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", attachStream);
    }
    video.addEventListener("click", function() {
        if (!attached) {
            attachStream();
        }
    });
    video.addEventListener("play", function() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function() {
        if (instance) {
            instance.destroy();
        }
    });
}
