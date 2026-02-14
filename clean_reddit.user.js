// ==UserScript==
// @name         CleanReddit
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Clean Reddit: No feed, no ads, no sidebar. Centered search.
// @author       Lukas Hzb
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @match        *://www.reddit.com/*
// @match        *://sh.reddit.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    /* --- CONFIGURATION: CSS --- */
    const css = `
        /* === PART 1: GLOBAL RULES (All Pages) === */

        /* Hide promoted / ad posts in feeds */
        shreddit-ad-post,
        shreddit-comments-page-ad,
        shreddit-comment-tree-ad,
        [data-testid="promoted-post"],
        .promotedlink,
        faceplate-batch[source="ad_post"],
        [slot="ad-format-content"],
        button[id*="user-drawer-button"],
        #expand-user-drawer-button,
        #hamburger-button-tooltip,
        #navbar-menu-button,
        #advertise-button,
        #header-action-item-chat-button,
        #create-post,
        #notifications-inbox-button,
        faceplate-tracker[noun="hamburger_menu"],
        faceplate-tracker[noun="advertise"],
        faceplate-tracker[noun="chat"],
        faceplate-tracker[noun="create_post"],
        faceplate-tracker[noun="inbox"],
        div[data-feature="devvit-left-nav-badge"] {
            display: none !important;
        }

        /* Hide sidebar ads */
        shreddit-async-loader[bundlename="sidebar_ad"],
        shreddit-async-loader[bundlename="ad_sidebar"],
        [id^="ads-"],
        .ad-container {
            display: none !important;
        }

        /* Hide "Get the App" banner / prompts */
        shreddit-async-loader[bundlename="xpromo_nsfw_blocking_modal"],
        xpromo-nsfw-blocking-container,
        .XPromoPopup,
        .TopNav__promoButton,
        shreddit-experience-tree[reason="xpromo"],
        [data-testid="xpromo-app-selector"],
        [data-testid="xpromo-nsfw-modal"] {
            display: none !important;
        }

        /* Hide Reddit Premium upsell */
        [data-testid="premium-upsell"],
        .premium-banner,
        shreddit-async-loader[bundlename="reddit_premium_upsell"] {
            display: none !important;
        }

        /* Hide cookie consent / GDPR banner */
        .EUCookieNotice {
            display: none !important;
        }

        /* Hide trending / popular widgets in sidebar */
        [data-testid="popular-communities-widget"],
        [data-testid="trending-searches"],
        shreddit-async-loader[bundlename="trending_searches"] {
            display: none !important;
        }

        /* Hide "Create Post" floating action button */
        .create-post-fab {
            display: none !important;
        }

        /* === GLOBAL: Hide Left Sidebar / Nav on ALL Pages === */
        /* The flex-left-nav-container is the outer wrapper for Reddit's
           new left sidebar, including the hamburger toggle buttons. */
        #flex-left-nav-container,
        #flex-left-nav-contents,
        #flex-nav-buttons,
        #flex-nav-expand-button,
        #flex-nav-collapse-button,
        #left-sidebar-container,
        reddit-sidebar-nav,
        left-nav-container {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            max-width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* === GLOBAL: Fix page layout to reclaim sidebar space === */
        /* Reddit uses a CSS grid with a column for the left nav.
           With the nav hidden, we must also collapse that column. */
        shreddit-app,
        [class*="grid-container"],
        .grid-container,
        .main-container,
        #AppRouter-main-content,
        .subgrid-container,
        [class*="grid"],
        [class*="layout"] {
            grid-template-columns: 100% !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
        }

        /* Force the main content area to start from the left edge */
        [slot="main"],
        main,
        #main-content {
            grid-column: 1 / -1 !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
        }

        /* Reddit's shreddit-app often has a top-level layout container
           that uses margin-left to offset for the sidebar */
        shreddit-app > div {
            margin-left: 0 !important;
        }

        /* === GLOBAL: Hide Header User Actions on ALL Pages === */
        /* These are the icons on the right side of the header:
           Chat, Create, Notifications, Profile Avatar, Advertise */
        [data-testid="header-action-bar"],
        [data-testid="qr-action-bar"],
        #header-action-bar,
        #HeaderUserActions,
        #advertise-button,
        user-drawer-controller,
        [slot="actions"],
        [slot="credit-bar"],
        shreddit-header-action-items,
        header-action-items {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
        }


        /* === PART 2: HOMEPAGE (Clean Mode) === */

        /* Hide the entire feed and sidebar on the homepage */
        body[data-clean-mode="true"] main,
        body[data-clean-mode="true"] [slot="main"],
        body[data-clean-mode="true"] [slot="sidebar-right"],
        body[data-clean-mode="true"] shreddit-feed,
        body[data-clean-mode="true"] #main-content {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        /* Hide the left navigation and logo on homepage */
        body[data-clean-mode="true"] [slot="nav-left"],
        body[data-clean-mode="true"] #left-sidebar,
        body[data-clean-mode="true"] left-nav-container,
        body[data-clean-mode="true"] nav[aria-label="Navigation"],
        body[data-clean-mode="true"] nav[aria-label="Primary"],
        body[data-clean-mode="true"] #flex-left-nav-container,
        body[data-clean-mode="true"] #left-sidebar-container,
        body[data-clean-mode="true"] #reddit-logo,
        body[data-clean-mode="true"] faceplate-tracker[noun="reddit_logo"] {
            display: none !important;
        }

        /* HEADER: Force fullscreen container (background only) */
        body[data-clean-mode="true"] shreddit-header,
        body[data-clean-mode="true"] header,
        body[data-clean-mode="true"] [slot="header"] {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: var(--color-neutral-background, #fff) !important;
            z-index: 99999 !important;
            display: block !important;
            transform: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
        }

        /* HIDE EVERYTHING inside the header by default on homepage */
        body[data-clean-mode="true"] shreddit-header > *,
        body[data-clean-mode="true"] header > *,
        body[data-clean-mode="true"] [slot="header"] > * {
            visibility: hidden !important;
            pointer-events: none !important;
        }

        /* SEARCH: Force Visible + Fixed Position (Center) - Default Styling */
        body[data-clean-mode="true"] shreddit-search-header-bar,
        body[data-clean-mode="true"] search-dynamic-id-cache-controller,
        body[data-clean-mode="true"] [data-testid="search-bar"] {
            visibility: visible !important;
            display: flex !important;
            position: fixed !important;
            top: 45vh !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 640px !important;
            max-width: 90vw !important;
            z-index: 100000 !important;
            pointer-events: auto !important;
            /* Reset custom styling to default Reddit look */
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Ensure inner elements are visible and flow naturally */
        body[data-clean-mode="true"] reddit-search-large,
        body[data-clean-mode="true"] #search-input {
             visibility: visible !important;
             pointer-events: auto !important;
        }

        /* Inner search elements must conform to the new shape */
        body[data-clean-mode="true"] reddit-search-large form,
        body[data-clean-mode="true"] shreddit-search-header-bar form,
        /* Reset inner search input to default */
        body[data-clean-mode="true"] reddit-search-large input,
        body[data-clean-mode="true"] shreddit-search-header-bar input,
        body[data-clean-mode="true"] [data-testid="search-bar"] input,
        body[data-clean-mode="true"] #search-input input {
            /* No custom overrides */
        }


        /* Container Hover / Focus-Within Effects - Default Reddit */
        body[data-clean-mode="true"] reddit-search-large:hover,
        body[data-clean-mode="true"] reddit-search-large:focus-within,
        body[data-clean-mode="true"] shreddit-search-header-bar:hover,
        body[data-clean-mode="true"] shreddit-search-header-bar:focus-within {
            /* Default Reddit behavior */
        }

        /* Remove input-specific hover/focus styles (handled by container) */
        body[data-clean-mode="true"] reddit-search-large input:hover,
        body[data-clean-mode="true"] reddit-search-large input:focus,
        body[data-clean-mode="true"] shreddit-search-header-bar input:hover,
        body[data-clean-mode="true"] shreddit-search-header-bar input:focus {
             /* Default Reddit behavior */
        }

        /* CUSTOM INJECTED LOGO STYLING */
        #clean-reddit-logo {
            display: none !important;
        }
        body[data-clean-mode="true"] #clean-reddit-logo {
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            top: calc(45vh - 90px) !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 100002 !important;
            pointer-events: auto !important;
            cursor: pointer !important;
            width: 200px !important;
            height: auto !important;
            line-height: 0 !important;
        }
        body[data-clean-mode="true"] #clean-reddit-logo img {
            width: 100% !important;
            height: auto !important;
            display: block !important;
        }


        /* === PART 3: SEARCH RESULTS & ANSWERS (Search Mode) === */

        /* Hide the right sidebar on search results */
        body[data-search-mode="true"] [slot="sidebar-right"],
        body[data-search-mode="true"] #right-sidebar-container {
            display: none !important;
        }

        /* Make search results take full width */
        body[data-search-mode="true"] [slot="main"],
        body[data-search-mode="true"] main {
            max-width: 100% !important;
            margin: 0 auto !important;
        }

        /* Hide the left nav on search results */
        body[data-search-mode="true"] [slot="nav-left"],
        body[data-search-mode="true"] #left-sidebar,
        body[data-search-mode="true"] left-nav-container,
        body[data-search-mode="true"] nav[aria-label="Primary Navigation"],
        body[data-search-mode="true"] nav[aria-label="Navigation"],
        body[data-search-mode="true"] nav[aria-label="Primary"],
        body[data-search-mode="true"] #flex-left-nav-container,
        body[data-search-mode="true"] #left-sidebar-container {
            display: none !important;
        }


        /* === PART 4: SUBREDDIT PAGES (Subreddit Mode) === */

        /* Hide the right sidebar on subreddit pages */
        body[data-subreddit-mode="true"] [slot="sidebar-right"],
        body[data-subreddit-mode="true"] #right-sidebar-container {
            display: none !important;
        }

        /* Hide left navigation on subreddit pages */
        body[data-subreddit-mode="true"] [slot="nav-left"],
        body[data-subreddit-mode="true"] #left-sidebar,
        body[data-subreddit-mode="true"] left-nav-container,
        body[data-subreddit-mode="true"] nav[aria-label="Primary"],
        body[data-subreddit-mode="true"] #flex-left-nav-container,
        body[data-subreddit-mode="true"] #left-sidebar-container {
            display: none !important;
        }

        /* Make subreddit content take full width */
        body[data-subreddit-mode="true"] [slot="main"],
        body[data-subreddit-mode="true"] main {
            max-width: 100% !important;
            margin: 0 auto !important;
        }


        /* === PART 5: POST PAGES (Post Mode) === */

        /* Hide right sidebar on post pages */
        body[data-post-mode="true"] [slot="sidebar-right"],
        body[data-post-mode="true"] #right-sidebar-container {
            display: none !important;
        }

        /* Hide left navigation on post pages */
        body[data-post-mode="true"] [slot="nav-left"],
        body[data-post-mode="true"] #left-sidebar,
        body[data-post-mode="true"] left-nav-container,
        body[data-post-mode="true"] nav[aria-label="Primary"],
        body[data-post-mode="true"] #flex-left-nav-container,
        body[data-post-mode="true"] #left-sidebar-container {
            display: none !important;
        }

        /* Make post content take full width */
        body[data-post-mode="true"] [slot="main"],
        body[data-post-mode="true"] main {
            max-width: 100% !important;
            margin: 0 auto !important;
        }


        /* === PART 6: USER PROFILE PAGES (Profile Mode) === */

        /* Hide right sidebar on profile pages */
        body[data-profile-mode="true"] [slot="sidebar-right"],
        body[data-profile-mode="true"] #right-sidebar-container {
            display: none !important;
        }

        /* Hide left navigation on profile pages */
        body[data-profile-mode="true"] [slot="nav-left"],
        body[data-profile-mode="true"] #left-sidebar,
        body[data-profile-mode="true"] left-nav-container,
        body[data-profile-mode="true"] nav[aria-label="Primary"],
        body[data-profile-mode="true"] #flex-left-nav-container,
        body[data-profile-mode="true"] #left-sidebar-container {
            display: none !important;
        }
    `;

    // Inject CSS as early as possible to prevent flash of unstyled content
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);

    /* --- LOGO INJECTION --- */
    const REDDIT_SVG = `
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Reddit_wordmark.svg/1280px-Reddit_wordmark.svg.png"
         alt="Reddit Logo"
         style="width: 100%; height: auto;" />
    `;

    function ensureLogo() {
        if (!document.getElementById('clean-reddit-logo')) {
            const logoLink = document.createElement('a');
            logoLink.id = 'clean-reddit-logo';
            logoLink.innerHTML = REDDIT_SVG;
            logoLink.href = '/';
            logoLink.onclick = (e) => {
                if (window.history && window.history.pushState) {
                    e.preventDefault();
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new Event('popstate'));
                }
            };
            document.body.appendChild(logoLink);
        }
    }

    /* --- JS HELPER: Aggressive Hiding (pierces Shadow DOM) --- */
    function hideClutterAggressively() {
        // Selectors for elements to hide via JS on ALL pages
        const lightDomSelectors = [
            'user-drawer-controller',
            '#HeaderUserActions',
            '[data-testid="header-action-bar"]',
            '#header-action-bar',
            '#advertise-button',
            '#flex-left-nav-container',
            '#flex-left-nav-contents',
            '#flex-nav-buttons',
            '#flex-nav-expand-button',
            '#flex-nav-collapse-button',
            '#left-sidebar-container',
            'reddit-sidebar-nav',
            '[slot="actions"]',
            '[slot="credit-bar"]',
            '[slot="nav-left"]',
            'shreddit-header-action-items',
            'header-action-items',
        ];

        lightDomSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.id === 'clean-reddit-logo') return;
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
            });
        });

        // Pierce shadow DOM of shreddit-header to hide internal action items
        const headers = document.querySelectorAll('shreddit-header');
        headers.forEach(header => {
            const shadow = header.shadowRoot;
            if (!shadow) return;

            // Inject a style into the shadow DOM to hide action items
            if (!shadow.querySelector('#clean-reddit-shadow-style')) {
                const shadowStyle = document.createElement('style');
                shadowStyle.id = 'clean-reddit-shadow-style';
                shadowStyle.textContent = `
                    /* Hide right-side header actions inside shadow DOM */
                    header-action-items,
                    .header-action-items,
                    [slot="actions"],
                    nav[aria-label="User actions"],
                    .action-items,
                    div:has(> faceplate-tracker[noun="chat"]),
                    div:has(> faceplate-tracker[noun="create_post"]),
                    div:has(> faceplate-tracker[noun="notification"]),
                    div:has(> faceplate-tracker[noun="profile"]),
                    faceplate-tracker[noun="chat"],
                    faceplate-tracker[noun="create_post"],
                    faceplate-tracker[noun="notification"],
                    faceplate-tracker[noun="profile"],
                    #USER_DROPDOWN_ID,
                    button[aria-label="Open chat"],
                    a[aria-label="Create post"],
                    a[aria-label="Create a post"],
                    button[aria-label="Open inbox"],
                    a[href="/chat"],
                    a[href*="/submit"],
                    #advertise-button,
                    a[href*="ads.reddit.com"] {
                        display: none !important;
                        visibility: hidden !important;
                    }
                `;
                shadow.appendChild(shadowStyle);
            }

            // Also hide elements via direct JS manipulation within the shadow
            const actionSelectors = [
                'header-action-items',
                'nav[aria-label="User actions"]',
                '.action-items',
            ];
            actionSelectors.forEach(sel => {
                shadow.querySelectorAll(sel).forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
            });
        });

        // Also try to find and hide the last div in the header (often contains user actions)
        const headerEl = document.querySelector('shreddit-header');
        if (headerEl) {
            // Hide any direct child divs that are NOT the search or logo
            const children = headerEl.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const tag = child.tagName.toLowerCase();
                // Keep search-related elements and our logo
                if (tag.includes('search') || child.id === 'clean-reddit-logo') continue;
                // Keep the home link
                if (tag === 'a' && child.getAttribute('aria-label') === 'Home') continue;
                // Hide everything else (likely user actions container)
                if (tag === 'div' || tag === 'nav' || tag === 'section') {
                    child.style.setProperty('display', 'none', 'important');
                    child.style.setProperty('visibility', 'hidden', 'important');
                }
            }
        }

        // Fix page layout: remove left margin/padding that Reddit
        // sets for the (now hidden) sidebar
        fixContentOffset();
    }

    /* --- JS HELPER: Fix content offset caused by hidden sidebar --- */
    function fixContentOffset() {
        // 1. Reset margin/padding on shreddit-app children
        const app = document.querySelector('shreddit-app');
        if (app) {
            Array.from(app.children).forEach(child => {
                if (child.style.marginLeft) child.style.setProperty('margin-left', '0', 'important');
                if (child.style.paddingLeft) child.style.setProperty('padding-left', '0', 'important');
            });
        }

        // 2. Force common containers and any grid to drop sidebar columns
        const layoutSelectors = [
            '#main-content',
            '[slot="main"]',
            'main',
            '.main-container',
            '#AppRouter-main-content',
            '#left-sidebar-container',
            '[class*="grid"]',
            '[class*="layout"]'
        ];

        layoutSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty('margin-left', '0', 'important');
                el.style.setProperty('padding-left', '0', 'important');
                el.style.setProperty('grid-column', '1 / -1', 'important');
                el.style.setProperty('max-width', '100%', 'important');

                // If it's a grid, force single column
                const display = window.getComputedStyle(el).display;
                if (display === 'grid' || display === 'inline-grid') {
                    el.style.setProperty('grid-template-columns', '100%', 'important');
                }
            });
        });

        // 3. Scan ALL elements for inline margin-left > 20px (aggressive)
        // This is heavy but necessary if selectors fail
        const allElements = document.body.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            // Skip logo and search
            if (el.id === 'clean-reddit-logo' || el.tagName.includes('SEARCH')) continue;

            const style = el.style;
            if (style.marginLeft && parseInt(style.marginLeft) > 20) {
                // console.log('CleanReddit: Resetting margin-left on', el);
                style.setProperty('margin-left', '0', 'important');
            }
            if (style.paddingLeft && parseInt(style.paddingLeft) > 20) {
                 // console.log('CleanReddit: Resetting padding-left on', el);
                style.setProperty('padding-left', '0', 'important');
            }
        }
    }


    /* --- LOGIC (Detect Home vs. Search vs. Subreddit vs. Post vs. Profile) --- */

    const MODES = ['clean-mode', 'search-mode', 'subreddit-mode', 'post-mode', 'profile-mode'];

    function clearAllModes(body) {
        MODES.forEach(mode => {
            if (body.getAttribute(`data-${mode}`) === 'true') {
                body.removeAttribute(`data-${mode}`);
            }
        });
    }

    function setMode(body, mode) {
        if (body.getAttribute(`data-${mode}`) !== 'true') {
            clearAllModes(body);
            body.setAttribute(`data-${mode}`, 'true');
        }
    }

    function updateMode() {
        const body = document.body;
        if (!body) return;

        const path = window.location.pathname;

        const isSearch = path.startsWith('/search') || path.startsWith('/answers/');
        const isSubreddit = path.match(/^\/r\/[^/]+\/?$/) !== null
                         || path.match(/^\/r\/[^/]+\/(hot|new|top|rising|controversial)\/?$/) !== null;
        const isPost = path.includes('/comments/');
        const isProfile = path.startsWith('/user/') || path.startsWith('/u/');
        const isHome = path === '/' && !isSearch;

        if (isHome) {
            setMode(body, 'clean-mode');
            ensureLogo();
        } else {
            if (isSearch) {
                setMode(body, 'search-mode');
            } else if (isPost) {
                setMode(body, 'post-mode');
            } else if (isSubreddit) {
                setMode(body, 'subreddit-mode');
            } else if (isProfile) {
                setMode(body, 'profile-mode');
            } else {
                clearAllModes(body);
            }
            // Hide logo if not on home
            const logo = document.getElementById('clean-reddit-logo');
            if (logo) logo.style.display = 'none';
        }
    }

    // Initial trigger
    updateMode();

    // Listen for Reddit SPA navigation events
    window.addEventListener('popstate', updateMode);

    // Observe URL changes via History API (Reddit uses pushState/replaceState)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        updateMode();
    };

    history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        updateMode();
    };

    // MutationObserver for SPA transitions and dynamic content loading
    const observer = new MutationObserver(() => {
        updateMode();
    });

    const initObserver = setInterval(() => {
        if (document.body) {
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class', 'style'],
                childList: true,
                subtree: false
            });
            clearInterval(initObserver);
        }
    }, 100);

    // Safety loop: re-check mode and cleanup periodically
    setInterval(() => {
        updateMode();
        hideClutterAggressively();
    }, 500);

})();
