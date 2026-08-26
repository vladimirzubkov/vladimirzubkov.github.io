/** EN / CS / RU for CV + project pages. Default: English. */
(function (global) {
  var STORAGE_KEY = "cv-lang";
  var SUPPORTED = ["en", "cs", "ru"];

  var strings = {
    en: {
      meta_title: "Vladimir Zubkov",
      meta_desc:
        "Personal page of Vladimir Zubkov — software engineering, Python, Java, Prague.",
      tagline: "Eternal student, software developer located in Prague",
      lede:
        "Learning to build useful tools. Background in finance, logistics and software engineering.",
      contacts_line:
        'Contact: <a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub: <a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      education: 'Education <em class="accent-running">(currently running)</em>',
      edu_cvut_when_primary:
        '09/2024 – <em class="accent-running">present</em>',
      edu_cvut_when_secondary: "09/2021 – 05/2023",
      edu_cvut_school: "Faculty of Electrical Engineering, CTU in Prague (ČVUT)",
      edu_cvut_detail:
        "Software Engineering and Technology, specialization Enterprise Systems. Bachelor studies (running).",
      edu_upa_when: "09/2021 – 06/2024",
      edu_upa_school: "Jan Perner Transport Faculty, University of Pardubice (UPa)",
      edu_upa_detail:
        "Transport Technology and Management, specialization Logistics.",
      edu_upa_thesis:
        'Bachelor thesis: &quot;Means of optimizing the system of city logistics by the example of the city of Prague&quot; (<a href="https://theses.cz/id/5otu4x/">thesis</a>, 58 pages) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">text on the topic</a>, 210 pages)',
      edu_bseu_when: "1999 – 2005",
      edu_bseu_school: "Belarus State Economic University",
      edu_bseu_detail: "Finance and banking — university degree.",
      skills: "Skills",
      languages: "Languages",
      lang_cs: "Czech — advanced (C1 CCE, ÚJOP, 2021)",
      lang_en: "English — advanced",
      lang_ru: "Russian — native",
      residence: "Permanent residence in the Czech Republic.",
      work: "Selected work",
      work_bot:
        "Telegram bot for MOEX quotes, portfolios, alerts and research signals. Built on Cloudflare Workers.",
      work_bot_link: "Project page →",
      work_name: "<s>Econophysica</s> Astrologia",
      work_oss: "Open-source and other projects:",
      interests: "Interests",
      interests_body: "Running, swimming, tennis.",
      other: "Other",
      hosted: "Hosted on GitHub Pages ·",
      updated: "Updated",
      lang_label: "Language",
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
      meta_title: "Vladimir Zubkov",
      meta_desc:
        "Osobní stránka Vladimira Zubkova — softwarové inženýrství, Python, Java, Praha.",
      tagline: "Věčný student, vývojář softwaru se sídlem v Praze",
      lede:
        "Učím se vytvářet užitečné nástroje. Zázemí ve financích, logistice a softwarovém inženýrství.",
      contacts_line:
        'Kontakt: <a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub: <a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      education: 'Vzdělání <em class="accent-running">(aktuálně probíhá)</em>',
      edu_cvut_when_primary:
        '09/2024 – <em class="accent-running">dosud</em>',
      edu_cvut_when_secondary: "09/2021 – 05/2023",
      edu_cvut_school: "Fakulta elektrotechnická, ČVUT v Praze",
      edu_cvut_detail:
        "Softwarové inženýrství a technologie, specializace Enterprise systémy. Bakalářské studium (probíhá).",
      edu_upa_when: "09/2021 – 06/2024",
      edu_upa_school: "Dopravní fakulta Jana Pernera, Univerzita Pardubice (UPa)",
      edu_upa_detail:
        "Technologie a management v dopravě, specializace Logistika.",
      edu_upa_thesis:
        'Bakalářská práce: &quot;Prostředky optimalizace systému městské logistiky na příkladu města Praha&quot; (<a href="https://theses.cz/id/5otu4x/">práce</a>, 58 stran) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">texty na téma</a>, 210 stran)',
      edu_bseu_when: "1999 – 2005",
      edu_bseu_school: "Běloruská státní ekonomická univerzita",
      edu_bseu_detail: "Finance a bankovnictví — vysokoškolské vzdělání.",
      skills: "Dovednosti",
      languages: "Jazyky",
      lang_cs: "Čeština — pokročilá (C1 CCE, ÚJOP, 2021)",
      lang_en: "Angličtina — pokročilá",
      lang_ru: "Ruština — mateřský jazyk",
      residence: "Trvalý pobyt v České republice.",
      work: "Vybraná práce",
      work_bot:
        "Telegram bot pro kotace MOEX, portfolia, alerty a výzkumné signály. Běží na Cloudflare Workers.",
      work_bot_link: "Stránka projektu →",
      work_name: "<s>Econophysica</s> Astrologia",
      work_oss: "Open-source a další projekty:",
      interests: "Zájmy",
      interests_body: "Běh, plavání, tenis.",
      other: "Ostatní",
      hosted: "Hostováno na GitHub Pages ·",
      updated: "Aktualizováno",
      lang_label: "Jazyk",
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
      meta_title: "Владимир Зубков",
      meta_desc:
        "Личная страница Владимира Зубкова — программная инженерия, Python, Java, Прага.",
      tagline: "Вечный студент, разработчик ПО, базирующийся в Праге",
      lede:
        "Учусь делать полезные инструменты. Бэкграунд в финансах, логистике и разработке программного обеспечения.",
      contacts_line:
        'Контакт: <a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub: <a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      education: 'Образование <em class="accent-running">(сейчас учусь)</em>',
      edu_cvut_when_primary:
        '09/2024 – <em class="accent-running">н.в.</em>',
      edu_cvut_when_secondary: "09/2021 – 05/2023",
      edu_cvut_school: "Факультет электротехники, ČVUT в Праге",
      edu_cvut_detail:
        "Программная инженерия и технологии, специализация Enterprise-системы. Бакалавриат (учится).",
      edu_upa_when: "09/2021 – 06/2024",
      edu_upa_school: "Транспортный факультет Яна Пернера, Университет Пардубице (UPa)",
      edu_upa_detail:
        "Технологии и менеджмент на транспорте, специализация Логистика.",
      edu_upa_thesis:
        'Бакалаврская работа: &quot;Средства оптимизации системы городской логистики на примере города Прага&quot; (<a href="https://theses.cz/id/5otu4x/">работа</a>, 58 стр.) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">тексты по теме</a>, 210 стр.)',
      edu_bseu_when: "1999 – 2005",
      edu_bseu_school: "Белорусский государственный экономический университет",
      edu_bseu_detail: "Финансы и банковское дело — высшее образование.",
      skills: "Навыки",
      languages: "Языки",
      lang_cs: "Чешский — продвинутый (C1 CCE, ÚJOP, 2021)",
      lang_en: "Английский — продвинутый",
      lang_ru: "Русский — родной",
      residence: "ПМЖ в Чехии.",
      work: "Избранные проекты",
      work_bot:
        "Telegram-бот для котировок MOEX, портфелей, алертов и исследовательских сигналов. На Cloudflare Workers.",
      work_bot_link: "Страница проекта →",
      work_name: "<s>Econophysica</s> Astrologia",
      work_oss: "Open-source и другие проекты:",
      interests: "Интересы",
      interests_body: "Бег, плавание, теннис.",
      other: "Прочее",
      hosted: "Хостинг GitHub Pages ·",
      updated: "Обновлено",
      lang_label: "Язык",
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

  function apply(lang) {
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

  function init() {
    var lang = detectLang();
    apply(lang);
    loadVisitorCount();
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.getAttribute("data-lang"));
      });
    });
  }

  global.CVI18n = { init: init, apply: apply, detectLang: detectLang, t: t };
})(window);
