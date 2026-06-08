import { H as Hls } from './video-vendor-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const playButton = player.querySelector('[data-play-button]');
    const source = player.dataset.videoUrl;
    let initialized = false;
    let hlsInstance = null;

    function initializePlayer() {
        if (!video || initialized || !source) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function startPlayback() {
        initializePlayer();

        if (playButton) {
            playButton.classList.add('is-hidden');
        }

        if (video) {
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (playButton) {
                        playButton.classList.remove('is-hidden');
                    }
                });
            }
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('pointerdown', initializePlayer, { once: true });
        video.addEventListener('play', initializePlayer, { once: true });
        video.addEventListener('loadeddata', function () {
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
