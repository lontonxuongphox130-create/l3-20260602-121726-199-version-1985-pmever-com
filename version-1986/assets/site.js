(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initListing() {
        var tools = document.querySelector("[data-listing-tools]");
        var list = document.querySelector("[data-card-list]");
        if (!tools || !list) {
            return;
        }
        var input = tools.querySelector("[data-search-input]");
        var typeFilter = tools.querySelector("[data-type-filter]");
        var yearFilter = tools.querySelector("[data-year-filter]");
        var count = document.querySelector("[data-result-count]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get("q") || "";
        if (input && initialKeyword) {
            input.value = initialKeyword;
        }
        function normalize(text) {
            return String(text || "").toLowerCase().trim();
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = typeFilter ? typeFilter.value : "";
            var yearValue = yearFilter ? yearFilter.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize((card.dataset.title || "") + " " + (card.dataset.meta || ""));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchType = !typeValue || card.dataset.type === typeValue;
                var matchYear = !yearValue || card.dataset.year === yearValue;
                var matched = matchKeyword && matchType && matchYear;
                card.classList.toggle("hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = "当前显示 " + visible + " 部影片";
            }
        }
        [input, typeFilter, yearFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initListing();
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var button = document.querySelector("[data-play-button]");
    if (!video || !button || !streamUrl) {
        return;
    }
    var prepared = false;
    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }
    function play() {
        prepare();
        button.classList.add("is-hidden");
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
}
