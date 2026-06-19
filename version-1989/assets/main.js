document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startHero();
    });
  });

  startHero();

  var searchInput = document.getElementById("search-input");
  var searchStatus = document.getElementById("search-status");
  var searchResults = document.getElementById("search-results");

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.file + '" class="card-link" title="' + escapeHtml(movie.title) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="play-hover">▶</span>',
      '      <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
      '      <span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.one_line) + '</p>',
      '      <div class="meta-row">',
      '        <span>' + Number(movie.views).toLocaleString() + ' 观看</span>',
      '        <span>★ ' + escapeHtml(movie.rating) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function runSearch() {
    if (!searchInput || !searchResults || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    searchInput.value = keyword;

    if (!keyword) {
      searchStatus.textContent = "请输入关键词开始搜索。";
      searchResults.innerHTML = "";
      return;
    }

    var lower = keyword.toLowerCase();
    var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.search.toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);

    searchStatus.textContent = "找到 " + results.length + " 个相关结果";
    searchResults.innerHTML = results.map(movieCard).join("");
  }

  runSearch();
});
