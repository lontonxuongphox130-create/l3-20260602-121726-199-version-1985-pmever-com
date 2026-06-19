(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = Math.max(0, slides.findIndex(function (slide) { return slide.classList.contains("is-active"); }));
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(index);
      restart();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var root = form.parentElement || document;
      var list = root.querySelector("[data-filter-list]") || document.querySelector("[data-filter-list]");
      var items = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-item")) : [];
      var empty = root.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
      var keywordInput = form.querySelector("[data-filter-keyword]");
      var regionSelect = form.querySelector("[data-filter-region]");
      var yearSelect = form.querySelector("[data-filter-year]");
      var categorySelect = form.querySelector("[data-filter-category]");
      var params = new URLSearchParams(window.location.search);

      if (keywordInput && params.get("q")) {
        keywordInput.value = params.get("q");
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || ""));
          var itemRegion = normalize(item.getAttribute("data-region"));
          var itemYear = normalize(item.getAttribute("data-year"));
          var itemCategory = normalize(item.getAttribute("data-category"));
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && itemRegion !== region) {
            ok = false;
          }
          if (year && itemYear !== year) {
            ok = false;
          }
          if (category && itemCategory !== category) {
            ok = false;
          }

          item.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });
  });
})();
