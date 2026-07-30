/**
 * Front-end i18n bootstrap.
 * Detects the visitor's browser language, loads the matching language pack,
 * applies it to [data-i18n] elements, then reveals the page (see #i18n-fouc-guard in index.html).
 * A `?lang=` query param overrides browser detection. On localhost / the www-dev subdomain, a
 * manual dev switcher (#i18n-dev-switcher) is revealed that sets `?lang=` and reloads.
 */
(function () {
    var SUPPORTED_LOCALES = ['en', 'es', 'ja', 'ko', 'zh-hant', 'zh-hans'];
    var DEFAULT_LOCALE = 'en';
    var HTML_LANG = {
        en: 'en-GB',
        es: 'es-MX',
        ja: 'ja-JP',
        ko: 'ko-KR',
        'zh-hant': 'zh-Hant-TW',
        'zh-hans': 'zh-Hans-CN'
    };
    var LOCALE_LABELS = {
        en: 'English',
        es: 'Español',
        ja: '日本語',
        ko: '한국어',
        'zh-hant': '繁體中文',
        'zh-hans': '简体中文'
    };
    var REVEAL_TIMEOUT_MS = 2000;

    function isDevEnvironment() {
        var host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1' || host === '::1' || /^www-dev(\.|$)/.test(host);
    }

    function getLocaleFromQuery() {
        var lang = new URLSearchParams(window.location.search).get('lang');
        return SUPPORTED_LOCALES.indexOf(lang) !== -1 ? lang : null;
    }

    function setupDevSwitcher(currentLocale) {
        var select = document.getElementById('i18n-dev-switcher');
        var wrap = document.getElementById('i18n-dev-switcher-wrap');
        if (!select || !wrap) return;

        SUPPORTED_LOCALES.forEach(function (loc) {
            var opt = document.createElement('option');
            opt.value = loc;
            opt.textContent = LOCALE_LABELS[loc] || loc;
            if (loc === currentLocale) opt.selected = true;
            select.appendChild(opt);
        });
        wrap.classList.remove('hidden');
        select.addEventListener('change', function () {
            var url = new URL(window.location.href);
            url.searchParams.set('lang', select.value);
            window.location.href = url.toString();
        });
    }

    function detectLocale() {
        var browserLangs = (navigator.languages && navigator.languages.length)
            ? navigator.languages
            : [navigator.language || DEFAULT_LOCALE];

        for (var i = 0; i < browserLangs.length; i++) {
            var tag = (browserLangs[i] || '').toLowerCase();
            if (!tag) continue;

            if (tag === 'zh-tw' || tag === 'zh-hk' || tag === 'zh-mo' || tag.indexOf('zh-hant') === 0) {
                return 'zh-hant';
            }
            if (tag === 'zh-cn' || tag === 'zh-sg' || tag.indexOf('zh-hans') === 0) {
                return 'zh-hans';
            }
            if (tag === 'zh') {
                // Bare "zh" with no region: default to the locale used by the largest
                // population of speakers (Mainland China).
                return 'zh-hans';
            }

            var prefix = tag.split('-')[0];
            if (SUPPORTED_LOCALES.indexOf(prefix) !== -1) {
                return prefix;
            }
        }
        return DEFAULT_LOCALE;
    }

    function get(dict, path) {
        if (!dict) return undefined;
        var parts = path.split('.');
        var cur = dict;
        for (var i = 0; i < parts.length; i++) {
            if (cur == null) return undefined;
            cur = cur[parts[i]];
        }
        return cur;
    }

    function applyTranslations(dict) {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var value = get(dict, el.getAttribute('data-i18n'));
            if (typeof value === 'string') el.textContent = value;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var value = get(dict, el.getAttribute('data-i18n-html'));
            if (typeof value === 'string') el.innerHTML = value;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var value = get(dict, el.getAttribute('data-i18n-placeholder'));
            if (typeof value === 'string') el.setAttribute('placeholder', value);
        });
    }

    function reveal() {
        document.documentElement.classList.remove('i18n-loading');
    }

    var settled = false;
    var locale = detectLocale();

    if (isDevEnvironment()) {
        locale = getLocaleFromQuery() || locale;
        setupDevSwitcher(locale);
    }
    
    window.__i18n = {
        locale: locale,
        dict: null,
        ready: false,
        t: function (key, fallback) {
            var value = get(window.__i18n.dict, key);
            return typeof value === 'string' ? value : (fallback !== undefined ? fallback : key);
        }
    };

    window.__i18nOnReady = function (callback) {
        if (window.__i18n.ready) {
            callback(window.__i18n.dict);
        } else {
            document.addEventListener('i18n:ready', function () {
                callback(window.__i18n.dict);
            }, { once: true });
        }
    };

    function settle(dict) {
        if (settled) return;
        settled = true;
        window.__i18n.dict = dict || null;
        window.__i18n.ready = true;
        document.documentElement.setAttribute('lang', HTML_LANG[locale] || 'en');
        if (dict) applyTranslations(dict);
        document.dispatchEvent(new CustomEvent('i18n:ready', { detail: dict }));
        reveal();
    }

    // Safety net: never leave the page hidden indefinitely if the fetch hangs or fails silently.
    setTimeout(function () { settle(window.__i18n.dict); }, REVEAL_TIMEOUT_MS);

    fetch('i18n/' + locale + '.json')
        .then(function (res) {
            if (!res.ok) throw new Error('i18n fetch failed: ' + res.status);
            return res.json();
        })
        .then(function (dict) { settle(dict); })
        .catch(function (err) {
            console.warn('i18n: falling back to default page copy.', err);
            settle(null);
        });
})();
