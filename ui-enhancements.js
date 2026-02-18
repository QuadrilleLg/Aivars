/**
 * ui-enhancements.js
 * Kadriļu asistents — UI papildinājumi
 *
 * 1. Pārlūka noteikšana — Voice asistents tikai Chrome desktop
 * 2. Dziesmu meklēšanas lauks ar reāllaika filtru
 * 3. Skaļuma regulētājs — tikai audio (MP3)
 * 4. Klaviatūras fokuss uz textInput
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────
    // 1. PĀRLŪKA NOTEIKŠANA
    //    Voice asistents pieejams TIKAI Chrome desktop
    // ─────────────────────────────────────────────
    function initBrowserCheck() {
        var ua = navigator.userAgent;

        var isChrome = !!(window.chrome && (window.chrome.webstore || window.chrome.runtime))
            && ua.indexOf('Edg/') === -1
            && ua.indexOf('OPR/') === -1
            && ua.indexOf('YaBrowser') === -1;

        var isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

        window.kadriluBrowser = { isChrome: isChrome, isMobile: isMobile };

        if (!isChrome || isMobile) {
            // Bloķē Web Speech API pirms main.js to izmanto
            try {
                Object.defineProperty(window, 'SpeechRecognition', {
                    get: function () { return undefined; },
                    configurable: true
                });
                Object.defineProperty(window, 'webkitSpeechRecognition', {
                    get: function () { return undefined; },
                    configurable: true
                });
            } catch (e) {
                window.SpeechRecognition = undefined;
                window.webkitSpeechRecognition = undefined;
            }

            document.addEventListener('DOMContentLoaded', function () {
                disableVoiceUI(isMobile);
            });
        }
    }

    function disableVoiceUI(isMobile) {
        var micBtn         = document.querySelector('.mic-btn');
        var stopBtn        = document.querySelector('.stop-btn');
        var audioDeviceSel = document.getElementById('audioDeviceSelect');
        var statusText     = document.getElementById('statusText');

        [micBtn, stopBtn, audioDeviceSel].forEach(function (el) {
            if (el) el.style.display = 'none';
        });

        if (statusText) {
            statusText.textContent = isMobile
                ? 'Mobilā versija — balss asistents nav pieejams'
                : 'Balss asistents pieejams tikai Google Chrome';
            statusText.style.color     = 'rgba(230, 255, 0, 0.45)';
            statusText.style.fontStyle = 'italic';
            statusText.style.fontSize  = '14px';
        }
    }

    // ─────────────────────────────────────────────
    // 2. DZIESMU MEKLĒŠANAS LAUKS — vienkāršs filtrs
    // ─────────────────────────────────────────────
    function initSongSearch() {
        var songListContainer = document.querySelector('.song-list-container');
        var songList          = document.getElementById('songList');
        if (!songListContainer || !songList) return;

        var wrapper         = document.createElement('div');
        wrapper.className   = 'song-search-wrapper';

        var icon            = document.createElement('span');
        icon.className      = 'song-search-icon';
        icon.innerHTML      = '&#9835;';

        var input           = document.createElement('input');
        input.type          = 'search';
        input.id            = 'songSearchInput';
        input.className     = 'song-search-input';
        input.placeholder   = 'Meklēt dziesmu…';
        input.autocomplete  = 'off';

        var clearBtn        = document.createElement('span');
        clearBtn.className  = 'song-search-clear';
        clearBtn.innerHTML  = '&times;';
        clearBtn.style.display = 'none';

        wrapper.appendChild(icon);
        wrapper.appendChild(input);
        wrapper.appendChild(clearBtn);

        songList.parentNode.insertBefore(wrapper, songList);

        function filterSongs(query) {
            var q = query.trim().toLowerCase();

            songList.querySelectorAll('li').forEach(function (li) {
                // Filtrē pēc kadrilKey (dziesmas nosaukums bez pogām un ikonām)
                var key  = (li.dataset.kadrilKey || '').toLowerCase();
                var show = q === '' || key.includes(q);
                li.style.display = show ? '' : 'none';
            });

            clearBtn.style.display = q !== '' ? 'inline' : 'none';
        }

        input.addEventListener('input', function () {
            filterSongs(this.value);
        });

        clearBtn.addEventListener('click', function () {
            input.value = '';
            filterSongs('');
            input.focus();
        });

        // Piemēro filtru kad loadSongList() pievieno jaunas dziesmas
        new MutationObserver(function () {
            filterSongs(input.value);
        }).observe(songList, { childList: true });
    }

    // ─────────────────────────────────────────────
    // 3. SKAĻUMA REGULĒTĀJS — tikai audio (MP3)
    // ─────────────────────────────────────────────
    function initVolumeControl() {
        var audioEl         = document.getElementById('mainAudio');
        var activeSongPanel = document.querySelector('.active-song-panel');
        if (!activeSongPanel) return;

        var volDiv       = document.createElement('div');
        volDiv.className = 'volume-control audio-volume-control';
        volDiv.innerHTML =
            '<span class="vol-icon" title="Audio skaļums">&#9834;</span>' +
            '<input type="range" class="vol-slider" id="audioVolumeSlider"' +
            '       min="0" max="100" value="80" step="1" aria-label="Audio skaļums">' +
            '<span class="vol-value" id="audioVolumeValue">80%</span>';

        // Ievieto aiz taimera vai pašās beigās
        var timerEl = activeSongPanel.querySelector('.song-timer');
        if (timerEl) {
            timerEl.after(volDiv);
        } else {
            activeSongPanel.appendChild(volDiv);
        }

        var slider     = document.getElementById('audioVolumeSlider');
        var valDisplay = document.getElementById('audioVolumeValue');

        function setVolume(val) {
            var v = parseInt(val, 10);
            valDisplay.textContent = v + '%';
            slider.style.setProperty('--val', v + '%');
            if (audioEl) audioEl.volume = v / 100;
            try { localStorage.setItem('kadriluAudioVol', v); } catch(e) {}
        }

        slider.addEventListener('input', function () {
            setVolume(this.value);
        });

        // Atjaunot saglabāto vērtību
        try {
            var saved = localStorage.getItem('kadriluAudioVol');
            if (saved !== null) {
                slider.value = saved;
                setVolume(saved);
            } else {
                setVolume(slider.value);
            }
        } catch(e) {
            setVolume(slider.value);
        }

        // Sinhronizēt ja audio volume mainās ārēji
        if (audioEl) {
            audioEl.addEventListener('volumechange', function () {
                if (!slider.matches(':active')) {
                    var pct = Math.round(audioEl.volume * 100);
                    slider.value = pct;
                    slider.style.setProperty('--val', pct + '%');
                    valDisplay.textContent = pct + '%';
                }
            });
        }

        window.kadriluVolume = {
            get: function () { return parseInt(slider.value, 10); },
            set: function (v) { slider.value = v; setVolume(v); }
        };
    }

    // ─────────────────────────────────────────────
    // 4. KLAVIATŪRAS FOKUSS UZ textInput
    // ─────────────────────────────────────────────
    function initTextInputFocus() {
        var textInput = document.getElementById('textInput');
        if (!textInput) return;

        document.addEventListener('keydown', function (e) {
            var active  = document.activeElement;
            var inField = active && (
                active.tagName === 'INPUT'    ||
                active.tagName === 'TEXTAREA' ||
                active.tagName === 'SELECT'   ||
                active.isContentEditable
            );
            if (inField) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.key === 'Escape' || e.key === 'Tab') return;
            if (e.key.length === 1) {
                textInput.focus();
            }
        });

        textInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                textInput.blur();
                textInput.value = '';
            }
        });
    }

    // ─────────────────────────────────────────────
    // INICIALIZĀCIJA
    // ─────────────────────────────────────────────
    initBrowserCheck(); // Uzreiz — bloķē SpeechRecognition pirms main.js

    function init() {
        initSongSearch();
        initVolumeControl();
        initTextInputFocus();
        console.log('[KadriluUI] Papildinājumi ielādēti ✓');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();