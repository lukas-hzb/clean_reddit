// ==UserScript==
// @name         YouTube Clean Home (Google Style) v3.8
// @namespace    http://tampermonkey.net/
// @version      3.8
// @description  Startseite: Breite 640px, strikte Zentrierung. Suchergebnisse: Sauber.
// @author       Gemini
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    /* --- KONFIGURATION: CSS --- */
    const css = `
        /* === TEIL 1: GLOBALE REGELN (Home & Suche) === */

        /* Audio-Suche & Unnötiges IMMER verstecken */
        #voice-search-button,
        ytd-voice-search-renderer,
        ytd-notification-topbar-button-renderer,
        #buttons {
            display: none !important;
        }

        /* === TEIL 2: STARTSEITE (Clean Mode) === */

        /* Feed & Sidebar komplett ausblenden */
        body[data-clean-mode="true"] #page-manager,
        body[data-clean-mode="true"] #guide,
        body[data-clean-mode="true"] ytd-mini-guide-renderer,
        body[data-clean-mode="true"] #secondary,
        body[data-clean-mode="true"] #secondary-inner {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        /* MASTER-CONTAINER: Vollbild & Zentrierung erzwingen */
        body[data-clean-mode="true"] #masthead-container {
            position: fixed !important;
            inset: 0 !important; /* Top/Left/Right/Bottom = 0 */
            width: 100vw !important;
            height: 100vh !important;
            background: var(--yt-spec-base-background, #fff) !important;
            z-index: 99999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-bottom: none !important;
            box-shadow: none !important;
        }

        /* Flex-Container für Logo & Suche untereinander */
        body[data-clean-mode="true"] ytd-masthead,
        body[data-clean-mode="true"] ytd-masthead > #container {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* 1. LOGO */
        body[data-clean-mode="true"] ytd-masthead #start {
            width: auto !important;
            height: auto !important;
            margin: 0 0 25px 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            order: 1 !important;
            flex: 0 0 auto !important;
        }
        body[data-clean-mode="true"] #logo-icon {
            transform: scale(2.0) !important;
            width: 100% !important;
        }
        /* Menü-Button neben Logo weg */
        body[data-clean-mode="true"] #guide-button {
            display: none !important;
        }

        /* 2. SUCHE CONTAINER */
        body[data-clean-mode="true"] ytd-masthead #center {
            order: 2 !important;
            width: auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 0 !important;
            flex: 0 0 auto !important;
        }

        /* 3. DIE EIGENTLICHE SUCHLEISTE (Größe & Style) */
        body[data-clean-mode="true"] ytd-searchbox {
            width: 640px !important; /* Feste Breite: Nicht zu breit, nicht zu schmal */
            max-width: 90vw !important;
            margin: 0 !important;
            padding: 0 !important;
            flex: 0 0 auto !important;
        }

        /* Suchformular Design (Google Style) */
        body[data-clean-mode="true"] ytd-searchbox form {
            background-color: var(--yt-spec-base-background, #fff) !important;
            border: 1px solid var(--yt-spec-10-percent-layer, #dfe1e5) !important;
            box-shadow: 0 1px 6px rgba(32,33,36,0.1) !important;
            border-radius: 24px !important;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 10px 0 15px !important;
            margin: 0 !important;
            width: 100% !important;
        }

        /* Hover Effekte */
        body[data-clean-mode="true"] ytd-searchbox form:hover,
        body[data-clean-mode="true"] ytd-searchbox form:focus-within {
            background-color: var(--yt-spec-base-background, #fff) !important;
            box-shadow: 0 1px 6px rgba(32,33,36,0.28) !important;
            border-color: transparent !important;
        }

        /* Icons rechts oben (End) weg */
        body[data-clean-mode="true"] ytd-masthead #end {
            display: none !important;
        }


        /* === TEIL 3: SUCHERGEBNISSE (Search Mode) === */

        /* ALLES weg außer Header & Ergebnissen */
        body[data-search-mode="true"] #chips-wrapper,
        body[data-search-mode="true"] ytd-feed-filter-chip-bar-renderer,
        body[data-search-mode="true"] #header, /* Filterleiste */
        body[data-search-mode="true"] #guide,
        body[data-search-mode="true"] #guide-button,
        body[data-search-mode="true"] ytd-mini-guide-renderer,
        body[data-search-mode="true"] ytd-masthead #end {
            display: none !important;
        }

        /* Suchleiste auf Ergebnisseite zentrieren */
        body[data-search-mode="true"] ytd-masthead #container {
            justify-content: center !important;
            position: relative !important;
        }

        /* Logo links fixieren (absolute), damit es die Mitte nicht verschiebt */
        body[data-search-mode="true"] ytd-masthead #start {
            position: absolute !important;
            left: 16px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            margin: 0 !important;
        }

        /* Suche mittig */
        body[data-search-mode="true"] ytd-masthead #center {
            margin: 0 auto !important;
            flex: 0 1 640px !important;
            width: auto !important;
        }
    `;

    // CSS injecten
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);


    /* --- LOGIK (Erkennung Home vs. Search) --- */

    function updateMode() {
        const body = document.body;
        if (!body) return;

        const path = window.location.pathname;
        const href = window.location.href;

        // Definitionen
        const isResults = href.includes('/results');
        const isWatch = href.includes('/watch');
        const isHome = path === '/' && !isResults && !isWatch;

        // 1. Home Mode
        if (isHome) {
            if (body.getAttribute('data-clean-mode') !== 'true') {
                body.setAttribute('data-clean-mode', 'true');
            }
        } else {
            if (body.getAttribute('data-clean-mode') === 'true') {
                body.removeAttribute('data-clean-mode');
            }
        }

        // 2. Search Mode
        if (isResults) {
             if (body.getAttribute('data-search-mode') !== 'true') {
                body.setAttribute('data-search-mode', 'true');
            }
        } else {
            if (body.getAttribute('data-search-mode') === 'true') {
                body.removeAttribute('data-search-mode');
            }
        }
    }

    // Trigger
    updateMode();
    window.addEventListener('yt-navigate-start', updateMode);
    window.addEventListener('yt-navigate-finish', updateMode);
    window.addEventListener('popstate', updateMode);

    // Observer
    const observer = new MutationObserver((mutations) => {
        updateMode();
    });

    const initObserver = setInterval(() => {
        if (document.body) {
            observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
            clearInterval(initObserver);
        }
    }, 100);

    // Safety Loop
    setInterval(updateMode, 50);

})();
