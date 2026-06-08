(function () {
  function initMoviePlayer(videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      video.setAttribute('data-ready', '1');
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
