document.addEventListener("DOMContentLoaded", function () {
  initMenu();
  initHero();
  initCardSearch();
  initFilters();
});

function initMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  const show = function (nextIndex) {
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
  };

  const play = function () {
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5000);
  };

  const reset = function () {
    if (timer) {
      window.clearInterval(timer);
    }

    play();
  };

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      reset();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      reset();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const target = Number(dot.getAttribute("data-hero-dot"));
      show(target);
      reset();
    });
  });

  show(0);
  play();
}

function initCardSearch() {
  const inputs = Array.from(document.querySelectorAll("[data-card-search]"));

  if (!inputs.length) {
    return;
  }

  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      applySearch(input.value || "");
    });
  });
}

function initFilters() {
  const resetButtons = Array.from(document.querySelectorAll("[data-filter-reset]"));
  const yearButtons = Array.from(document.querySelectorAll("[data-filter-year]"));
  const textButtons = Array.from(document.querySelectorAll("[data-filter-text]"));

  resetButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveFilter(button);
      applySearch("");
      clearSearchInputs();
    });
  });

  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveFilter(button);
      applySearch(button.getAttribute("data-filter-year") || "");
    });
  });

  textButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveFilter(button);
      applySearch(button.getAttribute("data-filter-text") || "");
    });
  });
}

function setActiveFilter(activeButton) {
  const group = activeButton.closest(".filter-group");

  if (!group) {
    return;
  }

  Array.from(group.querySelectorAll("button")).forEach(function (button) {
    button.classList.toggle("active", button === activeButton);
  });
}

function clearSearchInputs() {
  Array.from(document.querySelectorAll("[data-card-search]")).forEach(function (input) {
    input.value = "";
  });
}

function applySearch(value) {
  const query = String(value).trim().toLowerCase();
  const cards = Array.from(document.querySelectorAll(".movie-card, .ranking-line"));
  const empty = document.querySelector("[data-empty-state]");
  let visible = 0;

  cards.forEach(function (card) {
    const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
    const matched = !query || text.includes(query);
    card.classList.toggle("hidden-by-filter", !matched);

    if (matched) {
      visible += 1;
    }
  });

  if (empty) {
    empty.classList.toggle("active", visible === 0);
  }
}

function initMoviePlayer(streamUrl) {
  const video = document.getElementById("movie-player");
  const overlay = document.getElementById("player-overlay");
  let prepared = false;
  let hls = null;

  if (!video || !streamUrl) {
    return;
  }

  const start = function () {
    if (!prepared) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        prepared = true;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        prepared = true;
      } else {
        video.src = streamUrl;
        prepared = true;
      }
    }

    if (overlay) {
      overlay.classList.add("hidden");
    }

    const promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
