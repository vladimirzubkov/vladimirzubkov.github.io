/** EN / CS / RU for CV + project pages. Default: English. */
(function (global) {
  var STORAGE_KEY = "cv-lang";
  var STICKY_KEY = "cv-sticky-lang";
  var LANG_FADE_OUT_MS = 130;
  var LANG_FADE_IN_MS = 250;
  var BRAND_FX_MS = 500;
  // Language switch: fade out, commit the whole layout change (text + column
  // width + height) instantly while invisible and pin the viewport to the same
  // spot, then fade the new language in. Brand crossfades 500ms on RU boundary.
  var currentLang = null;
  var langSwitching = false;
  var pendingScrollY = null;
  var refitPrintLayout = null;
  var SUPPORTED = ["en", "cs", "ru"];

  var strings = {
    en: {
      meta_title: "Vladimir Zubkov, cv",
      brand_name: "Vladimir Zubkov",
      meta_desc:
        "Personal page of Vladimir Zubkov — software engineering, Python, Java, Prague.",
      tagline_lead:
        "Lifelong Learner, Software Developer located in Prague ",
      tagline_paren: "(Permanent Residence)",
      lede:
        "Learning to build useful tools. Background in finance, logistics and software engineering.",
      contacts_line:
        'Contact: <a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub: <a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      education: 'Education <em class="accent-running">(currently studying)</em>',
      edu_cvut_master_when_primary:
        '09/2026 – <em class="accent-running">present</em>',
      edu_cvut_master_school: "Faculty of Electrical Engineering, CTU in Prague (ČVUT)",
      edu_cvut_master_detail:
        '<span class="edu-program">Open Informatics</span>, specialization <span class="edu-program">Artificial Intelligence</span>. Master studies <em>(from 8 September 2026)</em>.',
      edu_cvut_when_primary:
        '09/2024 – <em class="accent-running">present</em>',
      edu_cvut_when_secondary: "09/2021 – 05/2023",
      edu_cvut_school: "Faculty of Electrical Engineering, CTU in Prague (ČVUT)",
      edu_cvut_detail:
        '<span class="edu-program">Software Engineering and Technology</span>, specialization <span class="edu-program">Enterprise Systems</span>. Bachelor studies <em>(studying, completing)</em>.',
      edu_upce_when: "09/2021 – 06/2024",
      edu_upce_school: "Jan Perner Transport Faculty, University of Pardubice (UPCE)",
      edu_upce_detail:
        "Transport Technology and Management, specialization Logistics.",
      edu_upce_thesis:
        'Bachelor thesis: &quot;Means of optimizing the system of city logistics by the example of the city of Prague&quot; (<a href="https://theses.cz/id/5otu4x/">thesis</a>, 58 pages) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">text on the topic</a>, 210 pages)',
      edu_bseu_when: "1999–2005",
      edu_bseu_school: "Belarus State Economic University",
      edu_bseu_detail: "Finance and banking — university degree.",
      skills: "Skills",
      languages: "Languages",
      lang_cs: "Czech — advanced (C1 CCE, ÚJOP, 2021)",
      lang_en: "English — upper intermediate (B2, IELTS Score 6.0)",
      lang_ru: "Russian — native; understand spoken and written Belarusian, Ukrainian, Slovak languages",
      lang_de: "German — elementary (A2)",
      work: "Selected work",
      work_bot:
        "Telegram bot for MOEX quotes, portfolios, alerts and research signals. Built on Cloudflare Workers.",
      work_bot_link: "Project page →",
      work_name: "<s>Econophysica</s> Astrologia",
      work_oss: "Open-source and other projects:",
      sports: "Sports",
      sports_body: "Tennis, swimming, basketball, jogging, amateur chess.",
      hosted: "Hosted on GitHub Pages ·",
      updated: "Updated",
      lang_label: "Language",
      sticky_label: "Pin language bar while scrolling",
      back_home: "← Back to CV",
      project_eyebrow: "<s>Econophysica</s> Astrologia",
      project_title: "<s>Econophysica</s> Astrologia — Telegram bot for MOEX",
      project_meta:
        "Astrologia (formerly Econophysica): Telegram trading bot for Moscow Exchange — architecture and features.",
      project_lead:
        "A production Telegram bot that helps users follow Moscow Exchange (MOEX) instruments: live quotes and charts, price alerts, portfolios, paper-style research signals, and daily digests.",
      project_arch: "Architecture",
      project_arch_body:
        "The bot runs as a Cloudflare Worker (JavaScript). Telegram talks to the worker over a webhook. Market data comes from the MOEX public ISS API. User settings, portfolios and model metadata live in Cloudflare KV. Optional documents (user manual PDF) are served from R2. A nightly/cron path refreshes research models and delivers alerts without a dedicated always-on server.",
      project_features: "What it does",
      project_f1: "Quotes, multi-day charts and session status for shares, FX, futures and bonds",
      project_f2: "Price alerts with thresholds and quiet hours",
      project_f3: "Portfolios and favorites with share sizing helpers (equal / manual / risk parity)",
      project_f4: "Research signals from offline labs (Python) published into KV for the worker to read",
      project_f5: "Optional notify / paper-trade modes and portfolio digests",
      project_stack: "Stack",
      project_stack_body:
        "Cloudflare Workers · KV · R2 · Telegram Bot API · MOEX ISS · Python research pipeline (offline fits → JSON in KV).",
      project_manual: "User manual (PDF)",
      project_manual_hint: "English PDF for this language.",
      project_note:
        "Source for the bot is private. This page describes the public product shape only — no secrets, tokens or user data.",
      project_try: "Live worker health:",
    },
    cs: {
      meta_title: "Vladimir Zubkov, životopis",
      brand_name: "Vladimir Zubkov",
      meta_desc:
        "Osobní stránka Vladimira Zubkova — softwarové inženýrství, Python, Java, Praha.",
      tagline_lead:
        "Celoživotní student, vývojář softwaru se sídlem v Praze ",
      tagline_paren: "(trvalý pobyt)",
      lede:
        "Učím se vytvářet užitečné nástroje. Zázemí ve financích, logistice a softwarovém inženýrství.",
      contacts_line:
        'Kontakt: <a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub: <a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      education: 'Vzdělání <em class="accent-running">(aktuálně studuji)</em>',
      edu_cvut_master_when_primary:
        '09/2026 – <em class="accent-running">dosud</em>',
      edu_cvut_master_school: "Fakulta elektrotechnická, ČVUT v Praze",
      edu_cvut_master_detail:
        '<span class="edu-program">Otevřená informatika</span>, specializace <span class="edu-program">Umělá inteligence</span>. Magisterské studium <em>(od 8. září 2026)</em>.',
      edu_cvut_when_primary:
        '09/2024 – <em class="accent-running">dosud</em>',
      edu_cvut_when_secondary: "09/2021 – 05/2023",
      edu_cvut_school: "Fakulta elektrotechnická, ČVUT v Praze",
      edu_cvut_detail:
        '<span class="edu-program">Softwarové inženýrství a technologie</span>, specializace <span class="edu-program">Enterprise systémy</span>. Bakalářské studium <em>(běží, dokončuji)</em>.',
      edu_upce_when: "09/2021 – 06/2024",
      edu_upce_school: "Dopravní fakulta Jana Pernera, Univerzita Pardubice (UPCE)",
      edu_upce_detail:
        "Technologie a management v dopravě, specializace Logistika.",
      edu_upce_thesis:
        'Bakalářská práce: &quot;Prostředky optimalizace systému městské logistiky na příkladu města Praha&quot; (<a href="https://theses.cz/id/5otu4x/">práce</a>, 58 stran) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">texty na téma</a>, 210 stran)',
      edu_bseu_when: "1999–2005",
      edu_bseu_school: "Běloruská státní ekonomická univerzita",
      edu_bseu_detail: "Finance a bankovnictví — vysokoškolské vzdělání.",
      skills: "Dovednosti",
      languages: "Jazyky",
      lang_cs: "Čeština — pokročilá (C1 CCE, ÚJOP, 2021)",
      lang_en: "Angličtina — vyšší středně pokročilá, (B2, IELTS Score 6.0)",
      lang_ru: "Ruština — mateřský jazyk; rozumím mluvené a psané běloruštině, ukrajinštině a slovenštině",
      lang_de: "Němčina — základní (A2)",
      work: "Vybraná práce",
      work_bot:
        "Telegram bot pro kotace MOEX, portfolia, alerty a výzkumné signály. Běží na Cloudflare Workers.",
      work_bot_link: "Stránka projektu →",
      work_name: "<s>Econophysica</s> Astrologia",
      work_oss: "Open-source a další projekty:",
      sports: "Sporty",
      sports_body: "Tenis, plavání, basketbal, běh klusem, amatérské šachy.",
      hosted: "Hostováno na GitHub Pages ·",
      updated: "Aktualizováno",
      lang_label: "Jazyk",
      sticky_label: "Připnout jazykový panel při rolování",
      back_home: "← Zpět na CV",
      project_eyebrow: "<s>Econophysica</s> Astrologia",
      project_title: "<s>Econophysica</s> Astrologia — Telegram bot pro MOEX",
      project_meta:
        "Astrologia (dříve Econophysica): Telegram bot pro Moskevskou burzu — architektura a funkce.",
      project_lead:
        "Produkční Telegram bot pro sledování nástrojů Moskevské burzy (MOEX): kotace a grafy, cenové alerty, portfolia, výzkumné signály a denní digest.",
      project_arch: "Architektura",
      project_arch_body:
        "Bot běží jako Cloudflare Worker (JavaScript). Telegram komunikuje s workerem přes webhook. Tržní data jdou z veřejného MOEX ISS API. Nastavení uživatelů, portfolia a metadata modelů jsou v Cloudflare KV. Volitelné dokumenty (PDF manuál) v R2. Cron obnovuje výzkumné modely a posílá alerty bez dedicovaného serveru 24/7.",
      project_features: "Co umí",
      project_f1: "Kotace, vícedenní grafy a stav seance pro akcie, FX, futures a dluhopisy",
      project_f2: "Cenové alerty s prahy a tichými hodinami",
      project_f3: "Portfolia a oblíbené s nastavením podílů (stejně / ručně / risk parity)",
      project_f4: "Výzkumné signály z offline labů (Python) publikované do KV pro worker",
      project_f5: "Režimy notify / paper-trade a digest portfolia",
      project_stack: "Stack",
      project_stack_body:
        "Cloudflare Workers · KV · R2 · Telegram Bot API · MOEX ISS · Python research pipeline (offline fity → JSON v KV).",
      project_manual: "Uživatelský manuál (PDF)",
      project_manual_hint: "Anglická verze PDF (pro češtinu).",
      project_note:
        "Zdrojový kód bota je soukromý. Tato stránka popisuje jen veřejnou podobu produktu — bez secretů, tokenů a uživatelských dat.",
      project_try: "Health live workeru:",
    },
    ru: {
      meta_title: "Владимир Зубков, резюме",
      brand_name: "Владимир Зубков",
      meta_desc:
        "Личная страница Владимира Зубкова — программная инженерия, Python, Java, Прага.",
      tagline_lead:
        "Вечный ученик, разработчик ПО, живу в Праге ",
      tagline_paren: "(ПМЖ)",
      lede:
        "Учусь делать полезные инструменты. Бэкграунд в финансах, логистике и разработке программного обеспечения.",
      contacts_line:
        'Контакт: <a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub: <a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      education: 'Образование <em class="accent-running">(сейчас учусь)</em>',
      edu_cvut_master_when_primary:
        '09/2026 — <em class="accent-running">н.в.</em>',
      edu_cvut_master_school:
        "Факультет электротехники, Чешский технический университет (ЧВУТ) в Праге",
      edu_cvut_master_detail:
        '<span class="edu-program">Открытая информатика</span>, специализация <span class="edu-program">«Искусственный интеллект»</span>. Магистратура <em>(с 8. 9. 2026)</em>.',
      edu_cvut_when_primary:
        '09/2024 — <em class="accent-running">н.в.</em>',
      edu_cvut_when_secondary: "09/2021 — 05/2023",
      edu_cvut_school:
        "Факультет электротехники, Чешский технический университет (ЧВУТ) в Праге",
      edu_cvut_detail:
        '<span class="edu-program">Программная инженерия и технологии</span>, специализация <span class="edu-program">«Корпоративные информационные системы»</span>. Бакалавриат <em>(в процессе обучения, оканчиваю)</em>.',
      edu_upce_when: "09/2021 — 06/2024",
      edu_upce_school: "Транспортный факультет Яна Пернера, Университет Пардубице (УПЦЕ)",
      edu_upce_detail:
        "Технологии и менеджмент на транспорте, специализация Логистика.",
      edu_upce_thesis:
        'Бакалаврская работа: &quot;Средства оптимизации системы городской логистики на примере города Прага&quot; (<a href="https://theses.cz/id/5otu4x/">работа</a>, 58 стр.) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">тексты по теме</a>, 210 стр.)',
      edu_bseu_when: "1999—2005",
      edu_bseu_school: "Белорусский государственный экономический университет",
      edu_bseu_detail: "Финансы и банковское дело — высшее образование.",
      skills: "Навыки",
      languages: "Языки",
      lang_cs: "Чешский — продвинутый (C1 CCE, ÚJOP, 2021)",
      lang_en: "Английский — выше среднего, (B2, IELTS Score 6.0)",
      lang_ru: "Русский — родной; понимаю устную и письменную белорусскую, украинскую и словацкую речь",
      lang_de: "Немецкий — начальный (A2)",
      work: "Избранные проекты",
      work_bot:
        "Telegram-бот для котировок MOEX, портфелей, алертов и исследовательских сигналов. На Cloudflare Workers.",
      work_bot_link: "Страница проекта →",
      work_name: "<s>Econophysica</s> Astrologia",
      work_oss: "Open-source и другие проекты:",
      sports: "Виды спорта",
      sports_body: "Теннис, плавание, баскетбол, бег трусцой, любительские шахматы.",
      hosted: "Хостинг GitHub Pages ·",
      updated: "Обновлено",
      lang_label: "Язык",
      sticky_label: "Закрепить панель языка при прокрутке",
      back_home: "← Назад к резюме",
      project_eyebrow: "<s>Econophysica</s> Astrologia",
      project_title: "<s>Econophysica</s> Astrologia — Telegram-бот для MOEX",
      project_meta:
        "Astrologia (бывш. Econophysica): Telegram-бот для Московской биржи — архитектура и возможности.",
      project_lead:
        "Продакшен Telegram-бот для инструментов Московской биржи (MOEX): котировки и графики, ценовые алерты, портфели, исследовательские сигналы и дайджесты.",
      project_arch: "Архитектура",
      project_arch_body:
        "Бот работает как Cloudflare Worker (JavaScript). Telegram ходит на worker по webhook. Рыночные данные — публичный MOEX ISS API. Настройки, портфели и метаданные моделей — в Cloudflare KV. Документы (PDF) — в R2. Cron обновляет модели и шлёт алерты без отдельного сервера 24/7.",
      project_features: "Возможности",
      project_f1: "Котировки, графики за несколько дней и статус сессии (акции, валюта, фьючерсы, облигации)",
      project_f2: "Ценовые алерты с порогами и тихими часами",
      project_f3: "Портфели и избранное с долями (поровну / вручную / risk parity)",
      project_f4: "Исследовательские сигналы из офлайн-лаб (Python), публикуемые в KV для worker",
      project_f5: "Режимы notify / paper-trade и дайджест портфеля",
      project_stack: "Стек",
      project_stack_body:
        "Cloudflare Workers · KV · R2 · Telegram Bot API · MOEX ISS · Python research pipeline (офлайн fit → JSON в KV).",
      project_manual: "Руководство пользователя (PDF)",
      project_manual_hint: "Русская версия PDF.",
      project_note:
        "Исходники бота закрыты. Здесь только публичное описание продукта — без секретов, токенов и данных пользователей.",
      project_try: "Health живого worker:",
    },
  };

  function detectLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = String(
      (navigator.languages && navigator.languages[0]) ||
        navigator.language ||
        "en"
    ).toLowerCase();
    if (nav.indexOf("cs") === 0 || nav.indexOf("sk") === 0) return "cs";
    if (nav.indexOf("ru") === 0 || nav.indexOf("be") === 0 || nav.indexOf("uk") === 0)
      return "ru";
    return "en";
  }

  function t(lang, key) {
    var pack = strings[lang] || strings.en;
    return pack[key] != null ? pack[key] : strings.en[key] || key;
  }

  function stripHtml(s) {
    return String(s).replace(/<[^>]+>/g, "");
  }

  function brandNameForLang(lang) {
    return lang === "ru" ? strings.ru.brand_name : strings.en.brand_name;
  }

  function brandNameChanges(fromLang, toLang) {
    return (fromLang === "ru") !== (toLang === "ru");
  }

  function getBrandEl() {
    return document.querySelector("[data-brand]");
  }

  function brandScriptForLang(lang) {
    return lang === "ru" ? "cyrillic" : "latin";
  }

  function syncBrandState(brandEl, lang, instant) {
    var script = brandScriptForLang(lang);
    var latin = brandEl.querySelector(".brand-text--latin");
    var cyrillic = brandEl.querySelector(".brand-text--cyrillic");
    if (instant) brandEl.classList.add("brand--no-transition");
    brandEl.setAttribute("data-brand-active", script);
    brandEl.setAttribute("aria-label", brandNameForLang(lang));
    if (latin) latin.setAttribute("aria-hidden", script === "cyrillic" ? "true" : "false");
    if (cyrillic) cyrillic.setAttribute("aria-hidden", script === "latin" ? "true" : "false");
    if (instant) {
      requestAnimationFrame(function () {
        brandEl.classList.remove("brand--no-transition");
      });
    }
  }

  function waitMs(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function getScrollY() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function rememberScrollY() {
    pendingScrollY = getScrollY();
  }

  function pinScroll(y) {
    if (typeof y !== "number") return;
    var root = document.documentElement;
    root.style.scrollBehavior = "auto";
    try {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
    } catch (e) {
      window.scrollTo(0, y);
    }
  }

  // Keep the viewport at y even if focus/layout tries to jump to top.
  function holdScroll(y) {
    pinScroll(y);
    function onScroll() {
      if (Math.abs(getScrollY() - y) > 0.5) pinScroll(y);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return function release() {
      window.removeEventListener("scroll", onScroll);
    };
  }

  function beginLangFadeIn(root) {
    root.classList.remove("is-lang-fading");
    return waitMs(LANG_FADE_IN_MS);
  }

  function animateBrandCrossfade(brandEl, toLang) {
    syncBrandState(brandEl, toLang, false);
    return waitMs(BRAND_FX_MS);
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function apply(lang, opts) {
    opts = opts || {};
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    document.documentElement.lang = lang === "cs" ? "cs" : lang === "ru" ? "ru" : "en";
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(lang, key);
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = val.replace(/\n/g, "<br>");
      } else if (el.tagName === "META") {
        el.setAttribute("content", stripHtml(val));
      } else if (el.tagName === "TITLE") {
        el.textContent = stripHtml(val);
      } else {
        el.textContent = val;
      }
    });

    if (!opts.skipBrand) {
      var brand = getBrandEl();
      if (brand) syncBrandState(brand, lang, true);
    }

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(lang, el.getAttribute("data-i18n-title")));
    });

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    // RU → Russian PDF; EN/CS → English PDF. Links only on product page.
    var manualHref =
      lang === "ru"
        ? "../manuals/Bot+Astrologya_ru.pdf"
        : "../manuals/Bot+Astrologya_en.pdf";
    document.querySelectorAll("[data-manual-pdf]").forEach(function (el) {
      el.setAttribute("href", manualHref);
      el.textContent = lang === "ru" ? "Bot+Astrologya_ru.pdf" : "Bot+Astrologya_en.pdf";
    });

    var stamp = document.getElementById("updated");
    if (stamp) {
      var d = new Date(document.lastModified);
      if (Number.isNaN(d.getTime())) d = new Date();
      stamp.setAttribute("datetime", d.toISOString());
      var locale = lang === "cs" ? "cs-CZ" : lang === "ru" ? "ru-RU" : "en-GB";
      stamp.textContent = d.toLocaleString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    currentLang = lang;
    if (refitPrintLayout && !opts.skipPrintFit) {
      window.requestAnimationFrame(refitPrintLayout);
    }
  }

  function switchLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    if (lang === currentLang || langSwitching) return;

    var fromLang = currentLang;
    var brandChanges = brandNameChanges(fromLang, lang);
    var scrollY =
      typeof pendingScrollY === "number" ? pendingScrollY : getScrollY();
    pendingScrollY = null;

    var root = document.documentElement;
    root.classList.add("is-lang-switching");
    var releaseHold = holdScroll(scrollY);

    function finish() {
      pinScroll(scrollY);
      releaseHold();
      root.classList.remove("is-lang-switching");
      root.style.scrollBehavior = "";
    }

    if (prefersReducedMotion()) {
      if (brandChanges) {
        var brandReduced = getBrandEl();
        if (brandReduced) syncBrandState(brandReduced, lang, true);
        apply(lang, { skipBrand: true, skipPrintFit: true });
      } else {
        apply(lang, { skipPrintFit: true });
      }
      finish();
      return;
    }

    langSwitching = true;
    var main = document.querySelector("main");
    if (main) main.setAttribute("aria-busy", "true");

    root.classList.add("is-lang-fading");

    window.setTimeout(function () {
      // Content is invisible. Swap text/layout instantly and keep the same
      // scroll offset — no visible jump to the top.
      root.classList.add("is-lang-instant");
      apply(lang, { skipBrand: brandChanges, skipPrintFit: true });
      void root.offsetHeight;
      pinScroll(scrollY);

      var brandPromise = Promise.resolve();
      if (brandChanges) {
        var brand = getBrandEl();
        if (brand) brandPromise = animateBrandCrossfade(brand, lang);
      }

      window.requestAnimationFrame(function () {
        pinScroll(scrollY);
        root.classList.remove("is-lang-instant");
        beginLangFadeIn(root)
          .then(function () {
            return brandPromise;
          })
          .then(function () {
            finish();
            if (main) main.removeAttribute("aria-busy");
            langSwitching = false;
          });
      });
    }, LANG_FADE_OUT_MS);
  }

  function loadVisitorCount() {
    var el = document.getElementById("visitor-count");
    if (!el) return;
    fetch("https://badge-visitor-count.vercel.app/api/hit/vladimirzubkov.github.io")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && typeof data.value === "number") {
          el.textContent = String(data.value);
        }
      })
      .catch(function () {
        el.textContent = "—";
      });
  }

  function initStickyTopbar() {
    var topbar = document.querySelector(".topbar");
    var toggle = document.getElementById("sticky-lang");
    if (!topbar || !toggle) return;

    var enabled = true;
    try {
      var saved = localStorage.getItem(STICKY_KEY);
      if (saved === "0") enabled = false;
    } catch (e) {}

    function updateStuck() {
      if (!topbar.classList.contains("is-sticky")) return;
      topbar.classList.toggle("is-stuck", window.scrollY > 0);
    }

    function setSticky(on) {
      topbar.classList.toggle("is-sticky", on);
      toggle.checked = on;
      if (!on) topbar.classList.remove("is-stuck");
      else updateStuck();
    }

    window.addEventListener("scroll", updateStuck, { passive: true });
    setSticky(enabled);

    toggle.addEventListener("change", function () {
      var on = toggle.checked;
      setSticky(on);
      try {
        localStorage.setItem(STICKY_KEY, on ? "1" : "0");
      } catch (e) {}
    });
  }

  function initHeroCollapse() {
    var topbar = document.querySelector(".topbar");
    var toggle = document.getElementById("sticky-lang");
    var hero = document.querySelector(".hero");
    var spacer = document.querySelector(".hero-top-spacer");
    var photo = document.querySelector(".photo");
    var brand = document.querySelector(".brand");
    var pageBody = document.querySelector(".page-body");
    if (!topbar || !toggle || !hero || !spacer || !photo || !brand || !pageBody) return;

    var PHOTO_FULL = 160;
    var COLLAPSE_RANGE = 150;
    var metrics = null;
    var raf = 0;

    function disabled() {
      return (
        window.matchMedia("(max-width: 640px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }

    function stickyOn() {
      return topbar.classList.contains("is-sticky");
    }

    function reset() {
      var root = document.documentElement;
      root.classList.remove("is-hero-collapse-active");
      root.style.removeProperty("--hero-collapse");
      root.style.removeProperty("--topbar-height");
      root.style.removeProperty("--hero-photo-mini");
      hero.classList.remove("is-hero-collapsed");
      photo.removeAttribute("style");
      brand.removeAttribute("style");
      spacer.style.height = "0";
    }

    function contentLeft() {
      var rect = pageBody.getBoundingClientRect();
      var pad = parseFloat(getComputedStyle(pageBody).paddingLeft);
      return rect.left + (Number.isNaN(pad) ? 0 : pad);
    }

    function captureMetrics() {
      var photoRect = photo.getBoundingClientRect();
      var brandRect = brand.getBoundingClientRect();
      metrics = {
        photoTop: photoRect.top + window.scrollY,
        photoLeft: photoRect.left,
        brandTop: brandRect.top + window.scrollY,
        brandLeft: brandRect.left,
        brandSize: parseFloat(getComputedStyle(brand).fontSize) || 32,
        headHeight: Math.max(photoRect.height, brandRect.height),
      };
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function apply() {
      if (!stickyOn() || disabled()) {
        metrics = null;
        reset();
        return;
      }

      var scrollY = window.scrollY;
      if (scrollY <= 0) {
        metrics = null;
        reset();
        return;
      }

      if (!metrics) captureMetrics();

      var topbarH = topbar.offsetHeight;
      var mini = Math.max(28, topbarH - 4);
      var progress = Math.min(1, scrollY / COLLAPSE_RANGE);
      var root = document.documentElement;
      root.style.setProperty("--hero-collapse", String(progress));
      root.style.setProperty("--topbar-height", topbarH + "px");
      root.style.setProperty("--hero-photo-mini", mini + "px");
      root.classList.add("is-hero-collapse-active");
      hero.classList.toggle("is-hero-collapsed", progress >= 1);

      var photoSize = lerp(PHOTO_FULL, mini, progress);
      var endPhotoTop = topbarH + 2;
      var endPhotoLeft = contentLeft();
      var endBrandSize = Math.max(13, mini * 0.44);
      var endBrandLeft = endPhotoLeft + photoSize + 12;
      var endBrandTop = endPhotoTop + (photoSize - endBrandSize * 1.1) / 2;

      var startPhotoTop = metrics.photoTop - scrollY;
      var startBrandTop = metrics.brandTop - scrollY;
      var photoTop = lerp(startPhotoTop, endPhotoTop, progress);
      var photoLeft = lerp(metrics.photoLeft, endPhotoLeft, progress);
      var brandTop = lerp(startBrandTop, endBrandTop, progress);
      var brandLeft = lerp(metrics.brandLeft, endBrandLeft, progress);
      var brandSize = lerp(metrics.brandSize, endBrandSize, progress);
      var borderW = lerp(3, 1.5, progress);
      var shadowBlur = lerp(28, 8, progress);
      var shadowY = lerp(8, 2, progress);
      var shadowAlpha = lerp(0.12, 0.06, progress);

      photo.style.cssText =
        "position:fixed;top:" +
        photoTop +
        "px;left:" +
        photoLeft +
        "px;width:" +
        photoSize +
        "px;height:" +
        photoSize +
        "px;border-radius:50%;border:" +
        borderW +
        "px solid var(--paper);box-shadow:0 " +
        shadowY +
        "px " +
        shadowBlur +
        "px rgba(26,35,50," +
        shadowAlpha +
        ");z-index:90;margin:0;";

      brand.style.cssText =
        "position:fixed;top:" +
        brandTop +
        "px;left:" +
        brandLeft +
        "px;font-size:" +
        brandSize +
        "px;line-height:1.1;margin:0;padding:0;z-index:90;";

      spacer.style.height = lerp(metrics.headHeight, mini + 4, progress) + "px";
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        apply();
      });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () {
      metrics = null;
      schedule();
    });
    toggle.addEventListener("change", function () {
      metrics = null;
      schedule();
    });
    schedule();
  }

  function initPrintFit() {
    var A4_HEIGHT_MM = 276.65; // A4 297mm − 14.4mm top − 6.35mm bottom (1.5rem)
    var MIN_SCALE = 0.75; // never shrink below 75%
    var SAFETY = 0.97; // leave a little slack so nothing spills over
    var root = document.documentElement;

    function mmToPx(mm) {
      var probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;left:-9999px;top:0;width:1px;visibility:hidden;" +
        "height:" + mm + "mm;";
      document.body.appendChild(probe);
      var px = probe.offsetHeight;
      document.body.removeChild(probe);
      return px;
    }

    function applyScale(scale) {
      var value = String(scale);
      root.style.setProperty("--print-scale", value);
      root.style.setProperty("--print-u", value);
    }

    // Real, unpinned content height at the current --print-u scale.
    function measureContentPx() {
      var inPrint = window.matchMedia && window.matchMedia("print").matches;
      if (!inPrint) root.classList.add("is-print-measure");
      void root.offsetHeight;
      var height = document.body.scrollHeight;
      if (!inPrint) root.classList.remove("is-print-measure");
      return height;
    }

    function fitPrintToA4() {
      root.classList.remove("print-multi-page");
      root.style.removeProperty("--print-page-total");

      var pagePx = mmToPx(A4_HEIGHT_MM);
      if (!pagePx) return;

      applyScale(1);
      var naturalPx = measureContentPx(); // height scales ~linearly with --print-u
      if (!naturalPx) return;

      var scale = Math.min(1, (pagePx * SAFETY) / naturalPx);
      if (scale < MIN_SCALE) scale = MIN_SCALE;
      applyScale(scale);

      var pages = Math.max(1, Math.ceil((naturalPx * scale) / pagePx));
      if (pages > 1) {
        root.classList.add("print-multi-page");
        root.style.setProperty("--print-page-total", String(pages));
      }
    }

    function cleanupMeasure() {
      root.classList.remove("is-print-measure");
    }

    function scheduleFit() {
      fitPrintToA4();
      window.requestAnimationFrame(fitPrintToA4);
    }

    refitPrintLayout = fitPrintToA4;

    var photo = document.querySelector(".photo");
    if (photo && !photo.complete) {
      photo.addEventListener("load", scheduleFit, { once: true });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFit);
    }
    scheduleFit();

    window.addEventListener("beforeprint", scheduleFit);
    window.addEventListener("afterprint", cleanupMeasure);

    if (window.matchMedia) {
      var printMql = window.matchMedia("print");
      var onChange = function (event) {
        if (event.matches) scheduleFit();
        else cleanupMeasure();
      };
      if (printMql.addEventListener) printMql.addEventListener("change", onChange);
      else if (printMql.addListener) printMql.addListener(onChange);
    }
  }

  function init() {
    var lang = detectLang();
    var brand = getBrandEl();
    if (brand) syncBrandState(brand, lang, true);
    apply(lang, { skipBrand: !!brand });
    loadVisitorCount();
    initStickyTopbar();
    initHeroCollapse();
    initPrintFit();
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("pointerdown", rememberScrollY);
      btn.addEventListener("mousedown", function (e) {
        rememberScrollY();
        // Sticky bar sits at the top of the document flow; focusing it would
        // scroll the page to the start. Click still fires after this.
        e.preventDefault();
      });
      btn.addEventListener("click", function () {
        try {
          btn.focus({ preventScroll: true });
        } catch (e) {}
        switchLang(btn.getAttribute("data-lang"));
      });
    });
  }

  global.CVI18n = {
    init: init,
    apply: apply,
    switchLang: switchLang,
    detectLang: detectLang,
    t: t,
    refitPrint: function () {
      if (refitPrintLayout) refitPrintLayout();
    },
  };
})(window);
