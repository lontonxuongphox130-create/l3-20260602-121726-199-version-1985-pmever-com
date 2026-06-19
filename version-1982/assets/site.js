(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var heroIndex = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === heroIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === heroIndex);
      });
    }

    function runHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showHero(heroIndex + 1);
        }, 5200);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showHero(heroIndex - 1);
        runHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showHero(heroIndex + 1);
        runHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showHero(index);
        runHero();
      });
    });

    showHero(0);
    runHero();

    var searchInput = document.querySelector("[data-card-search]");
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var currentYear = "all";
    var currentCategory = "all";

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var year = normalize(card.getAttribute("data-year"));
        var category = normalize(card.getAttribute("data-category"));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = currentYear === "all" || year === currentYear;
        var matchCategory = currentCategory === "all" || category === currentCategory;
        var active = matchQuery && matchYear && matchCategory;

        card.style.display = active ? "" : "none";
        if (active) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentYear = normalize(button.getAttribute("data-year-filter"));
        yearButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilters();
      });
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentCategory = normalize(button.getAttribute("data-category-filter"));
        categoryButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  });
})();
