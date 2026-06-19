(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;
  function setHero(index) {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setHero(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  var filters = document.querySelectorAll('[data-filter-scope]');
  filters.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('.empty-state');
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.year, card.dataset.type, card.dataset.region, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        var ok = (!q || hay.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!t || card.dataset.type === t);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('is-visible', visible === 0);
    }
    [input, year, type].forEach(function (node) {
      if (node) node.addEventListener('input', apply);
      if (node) node.addEventListener('change', apply);
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) input.value = q;
    apply();
  });

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var url = player.getAttribute('data-url');
    var started = false;
    function startVideo() {
      if (!video || !url) return;
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        started = true;
      }
      player.classList.add('is-playing');
      var playResult = video.play();
      if (playResult && playResult.catch) {
        playResult.catch(function () {});
      }
    }
    player.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') return;
      startVideo();
    });
    if (button) button.addEventListener('click', startVideo);
  }
})();
