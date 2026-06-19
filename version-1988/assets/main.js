(function () {
    var mobileButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            mobileButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            startHero();
        });
    });

    startHero();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));

    searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.hidden = keyword.length > 0 && text.indexOf(keyword) === -1;
            });
        });
    });
})();

function initPlayer(videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    function bindSource() {
        if (video.getAttribute("data-ready") === "yes") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        video.setAttribute("data-ready", "yes");
    }

    function playVideo() {
        bindSource();
        overlay.classList.add("hidden");
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                overlay.classList.remove("hidden");
            });
        }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        overlay.classList.add("hidden");
    });

    video.addEventListener("ended", function () {
        overlay.classList.remove("hidden");
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
