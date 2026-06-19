(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-play-overlay]");
      var source = video ? video.getAttribute("data-video-src") : "";
      var initialized = false;
      var hls = null;

      function attachSource() {
        if (!video || !source || initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function startPlayback() {
        if (!video) {
          return;
        }
        attachSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayback();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        window.addEventListener("pagehide", function () {
          if (hls && typeof hls.destroy === "function") {
            hls.destroy();
          }
        });
      }
    });
  });
})();
