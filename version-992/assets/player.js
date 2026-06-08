(function () {
    function setup(block) {
        var video = block.querySelector('video');
        var cover = block.querySelector('.player-cover');
        var url = video ? video.getAttribute('data-video-url') : '';
        var hls = null;
        var loaded = false;
        var requested = false;

        function attach() {
            if (!video || !url || loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        var promise = video.play();
                        if (promise && promise.catch) {
                            promise.catch(function () {});
                        }
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = url;
            }
        }

        function start() {
            if (!video) {
                return;
            }
            requested = true;
            attach();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            Array.prototype.forEach.call(document.querySelectorAll('.video-player'), setup);
        });
    } else {
        Array.prototype.forEach.call(document.querySelectorAll('.video-player'), setup);
    }
})();
