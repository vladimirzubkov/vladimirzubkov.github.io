/** EN / CS / RU for CV + project pages. Default: English. */
(function (global) {
  var STORAGE_KEY = "cv-lang";
  var STICKY_KEY = "cv-sticky-lang";
  var LANG_FADE_OUT_MS = 130;
  var LANG_FADE_IN_MS = 250;
  var LANG_WIDTH_MS = 250;
  var BRAND_FX_MS = 500;
  // Language switch: fade out, commit the whole layout change (text + column
  // width + height) instantly while invisible and pin the viewport to the same
  // spot, then fade the new language in. Brand crossfades 500ms on RU boundary.
  var currentLang = null;
  var langSwitching = false;
  var pendingScrollY = null;
  var refitPrintLayout = null;
  var refreshPrintPageBoxes = null;
  var refitHeroCollapse = null;
  var syncHeroTextColumnForWidth = null;
  var syncTopbarLineFn = null;
  var resetHeroCollapseMetrics = null;
  var clearProjectSkillFocus = null;
  var SUPPORTED = ["en", "cs", "ru"];
  var WORK_KEYS = [
    "work_arimaa",
    "work_seafood",
    "work_alladin",
    "work_aletheia",
    "work_auctionhouse",
  ];

  /* Stable ids — labels per language; chips sorted A→Z per locale at render time. */
  var SKILL_CATALOG = [
    { id: "ai-integration", en: "AI integration", cs: "Integrace AI", ru: "ИИ интеграция" },
    { id: "arch-patterns", en: "Architectural patterns", cs: "Architektonické vzory", ru: "Архитектурные паттерны" },
    { id: "ci-cd", en: "CI/CD", cs: "CI/CD", ru: "CI/CD" },
    { id: "gof-patterns", en: "Classic GoF design patterns", cs: "Klasické návrhové vzory GoF", ru: "Классические паттерны проектирования GoF" },
    { id: "cloudflare", en: "Cloudflare", cs: "Cloudflare", ru: "Cloudflare" },
    { id: "cpp", en: "C++", cs: "C++", ru: "C++" },
    { id: "csharp", en: "C#", cs: "C#", ru: "C#" },
    { id: "css", en: "CSS", cs: "CSS", ru: "CSS" },
    { id: "cybernetics", en: "Cybernetics", cs: "Kybernetika", ru: "Кибернетика" },
    { id: "data-structures", en: "Data structures &amp; algorithms", cs: "Datové struktury a algoritmy", ru: "Структуры данных и алгоритмы" },
    { id: "distributed-systems", en: "Distributed systems", cs: "Distribuované systémy", ru: "Распределённые системы" },
    { id: "docker", en: "Docker", cs: "Docker", ru: "Docker" },
    { id: "elasticsearch", en: "Elasticsearch", cs: "Elasticsearch", ru: "Elasticsearch" },
    { id: "evolutionary-algorithms", en: "Evolutionary algorithms", cs: "Evoluční algoritmy", ru: "Эволюционные алгоритмы" },
    { id: "git", en: "Git", cs: "Git", ru: "Git" },
    { id: "gradle", en: "Gradle", cs: "Gradle", ru: "Gradle" },
    { id: "grpc", en: "gRPC", cs: "gRPC", ru: "gRPC" },
    { id: "hazelcast", en: "Hazelcast", cs: "Hazelcast", ru: "Hazelcast" },
    { id: "html", en: "HTML", cs: "HTML", ru: "HTML" },
    { id: "java", en: "Java", cs: "Java", ru: "Java" },
    { id: "javafx", en: "JavaFX", cs: "JavaFX", ru: "JavaFX" },
    { id: "javascript", en: "JavaScript", cs: "JavaScript", ru: "JavaScript" },
    { id: "junit", en: "JUnit", cs: "JUnit", ru: "JUnit" },
    { id: "kanban", en: "Kanban", cs: "Kanban", ru: "Канбан" },
    { id: "linux", en: "Linux (Debian)", cs: "Linux (Debian)", ru: "Linux (Debian)" },
    { id: "markdown", en: "Markdown", cs: "Markdown", ru: "Markdown" },
    { id: "maven", en: "Maven", cs: "Maven", ru: "Maven" },
    { id: "oauth2-keycloak", en: "OAuth2 / Keycloak", cs: "OAuth2 / Keycloak", ru: "OAuth2 / Keycloak" },
    { id: "oop", en: "OOP", cs: "OOP", ru: "ООП" },
    { id: "python", en: "Python", cs: "Python", ru: "Python" },
    { id: "postgresql", en: "PostgreSQL", cs: "PostgreSQL", ru: "PostgreSQL" },
    { id: "queuing-theory", en: "Queuing theory", cs: "Teorie front", ru: "Теория массового обслуживания" },
    { id: "react", en: "React", cs: "React", ru: "React" },
    { id: "relational-databases", en: "Relational databases", cs: "Relační databáze", ru: "Реляционные базы данных" },
    { id: "requirements-modeling", en: "Requirements modeling", cs: "Modelování požadavků", ru: "Моделирование требований" },
    { id: "rest-apis", en: "REST APIs", cs: "REST API", ru: "REST API" },
    { id: "s3", en: "AWS S3", cs: "AWS S3", ru: "AWS S3" },
    { id: "spring-boot", en: "Spring Boot", cs: "Spring Boot", ru: "Spring Boot" },
    { id: "spring-data-jpa", en: "Spring Data JPA", cs: "Spring Data JPA", ru: "Spring Data JPA" },
    { id: "slf4j", en: "SLF4J", cs: "SLF4J", ru: "SLF4J" },
    { id: "sql", en: "SQL", cs: "SQL", ru: "SQL" },
    { id: "software-testing", en: "Software testing", cs: "Testování softwaru", ru: "Тестирование ПО" },
    { id: "team-management", en: "Team management", cs: "Vedení týmu", ru: "Управление командой" },
    { id: "teamwork", en: "Teamwork", cs: "Týmová práce", ru: "Работа в команде" },
    { id: "typescript", en: "TypeScript", cs: "TypeScript", ru: "TypeScript" },
    { id: "uml", en: "UML", cs: "UML", ru: "UML" },
  ];

  /* Common = tooling baseline (Git/Maven on every repo); primary = profile stack from README/code. */
  var PROJECT_TOOLING = ["git", "maven"];
  var PROJECT_JAVA_BASE = PROJECT_TOOLING.concat(["java", "oop"]);
  var PROJECT_JAVA_TESTED = PROJECT_JAVA_BASE.concat(["junit", "software-testing"]);

  var PROJECT_SKILLS = {
    arimaa: {
      primary: ["java", "javafx", "maven", "slf4j", "uml", "oop"],
      common: ["git"].concat([
        "arch-patterns",
        "gof-patterns",
        "data-structures",
        "junit",
        "software-testing",
      ]),
    },
    seafood: {
      primary: ["gof-patterns", "uml", "oop"],
      common: PROJECT_TOOLING.concat(["java"]),
    },
    alladin: {
      primary: [
        "docker",
        "uml",
        "requirements-modeling",
        "team-management",
        "teamwork",
        "kanban",
        "ai-integration",
      ],
      common: PROJECT_JAVA_TESTED.concat([
        "spring-boot",
        "spring-data-jpa",
        "react",
        "typescript",
        "rest-apis",
        "postgresql",
        "sql",
      ]),
    },
    aletheia: {
      primary: ["spring-boot", "spring-data-jpa", "relational-databases", "rest-apis", "arch-patterns"],
      common: PROJECT_JAVA_TESTED.concat(["docker", "postgresql", "sql", "uml"]),
    },
    auctionhouse: {
      primary: [
        "distributed-systems",
        "gof-patterns",
        "arch-patterns",
        "docker",
        "rest-apis",
        "hazelcast",
        "oauth2-keycloak",
        "s3",
        "elasticsearch",
      ],
      common: PROJECT_JAVA_TESTED.concat([
        "spring-boot",
        "postgresql",
        "sql",
        "uml",
      ]),
    },
  };

  function skillLabelForSort(skill, lang) {
    return (skill[lang] || skill.en)
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&");
  }

  /* RU: interleaved Cyrillic→Latin (а before a, б before b, …), not two separate blocks. */
  var RU_MIXED_ALPHABET =
    "аaбbвvwгgдdеeёжзzийjкkqлlмmнnоoпpрrсscтtуuфfхhцчшщъыyьэюяx";
  var RU_MIXED_CHAR_RANK = {};
  for (var ri = 0; ri < RU_MIXED_ALPHABET.length; ri++) {
    RU_MIXED_CHAR_RANK[RU_MIXED_ALPHABET.charAt(ri)] = ri;
  }

  function ruMixedCharRank(ch) {
    var rank = RU_MIXED_CHAR_RANK[ch.toLowerCase()];
    if (rank !== undefined) return rank;
    if (ch === " ") return -1;
    if (/[0-9]/.test(ch)) return 200 + ch.charCodeAt(0);
    return 300 + ch.charCodeAt(0);
  }

  function compareRuMixedScript(a, b) {
    var left = a.toLowerCase();
    var right = b.toLowerCase();
    var maxLen = left.length > right.length ? left.length : right.length;
    for (var i = 0; i < maxLen; i++) {
      var ca = left.charAt(i);
      var cb = right.charAt(i);
      if (!ca) return -1;
      if (!cb) return 1;
      var diff = ruMixedCharRank(ca) - ruMixedCharRank(cb);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  function compareSkillLabels(a, b, lang) {
    var left = skillLabelForSort(a, lang);
    var right = skillLabelForSort(b, lang);
    if (lang === "ru") return compareRuMixedScript(left, right);
    var locale = lang === "cs" ? "cs-CZ" : "en";
    return left.localeCompare(right, locale, { sensitivity: "base" });
  }

  function skillsChipsHtml(lang) {
    return SKILL_CATALOG
      .slice()
      .sort(function (a, b) {
        return compareSkillLabels(a, b, lang);
      })
      .map(function (skill) {
        var label = skill[lang] || skill.en;
        return '<li data-skill="' + skill.id + '"><span class="chip-text">' + label + "</span></li>";
      })
      .join("");
  }

  function repoPrintLink(href, label) {
    var display = href.replace(/^https?:\/\//, "");
    return (
      '<a href="' +
      href +
      '" class="print-explicit-url"><span class="link-screen">' +
      label +
      '</span><span class="link-print"><span class="link-print-label">' +
      label +
      ': </span><span class="link-print-url">' +
      display +
      "</span></span></a>"
    );
  }

  function urlOnlyPrintLink(href) {
    return '<a href="' + href + '" class="print-url-only">' + href + "</a>";
  }

  function demoPrintLink(href, screenLabel) {
    var display = href.replace(/^https?:\/\//, "");
    return (
      '<a href="' +
      href +
      '" class="print-explicit-url"><span class="link-screen">' +
      screenLabel +
      '</span><span class="link-print"><span class="link-print-url">' +
      display +
      "</span></span></a>"
    );
  }

  function patchWorkPrintLinks(lang, repoLabel, demoLabel) {
    var pack = strings[lang];
    if (!pack) return;
    var repoRe = /<a href="(https:\/\/github\.com\/[^"]+)">(?:GitHub|Гитхаб)<\/a>/g;
    var demoRe = /<a href="(https:\/\/youtu\.be\/[^"]+)">https:\/\/youtu\.be\/[^<]+<\/a>/g;
    WORK_KEYS.forEach(function (key) {
      if (!pack[key]) return;
      pack[key] = pack[key].replace(repoRe, function (_, href) {
        return repoPrintLink(href, repoLabel);
      });
      pack[key] = pack[key].replace(demoRe, function (_, href) {
        return demoPrintLink(href, demoLabel);
      });
    });
  }

  function patchContactPrintLinks(lang) {
    var pack = strings[lang];
    if (!pack || !pack.contacts_line) return;
    pack.contacts_line = pack.contacts_line
      .replace(
        /<a href="mailto:vladimir\.zubkov@gmail\.com">vladimir\.zubkov@gmail\.com<\/a>/g,
        '<a href="mailto:vladimir.zubkov@gmail.com" class="print-url-only">vladimir.zubkov@gmail.com</a>'
      )
      .replace(
        /<a href="https:\/\/github\.com\/vladimirzubkov">github\.com\/vladimirzubkov<\/a>/g,
        '<a href="https://github.com/vladimirzubkov" class="print-url-only">github.com/vladimirzubkov</a>'
      );
  }

  var strings = {
    en: {
      meta_title: "Vladimir Zubkov, cv",
      brand_name: "Vladimir Zubkov",
      meta_desc:
        "Professional cv of Vladimir Zubkov – Software Engineering, Java, Python, and more. CTU, Prague.",
      tagline_lead:
        "Backend Software Developer located in Prague ",
      tagline_paren: "(Permanent Residence)",
      lede_1:
        "Learning to build useful tools. I combine a background in finance, logistics, and software engineering. My main focus is <strong>backend development, software architecture, and DevOps</strong>.",
      lede_2:
        "At CTU FEL I study <strong>Software Engineering and Technology — Enterprise Systems</strong>: Java, databases, requirements modeling, UML, software testing, enterprise and distributed systems, and computer networks.",
      contacts_line:
        'Contact:&nbsp;<a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub:&nbsp;<a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      work_it_title: "IT work in the field (in development)",
      work_it_empty:
        "There are no work entries here yet, making this a great opportunity to start our collaboration. For me, an ideal offer means aligned interests, prospects, and engineering culture. My primary focus is on long-term cooperation, and I prefer to view it as a strategic mutual investment.",
      work_it_seeking:
        "I'm currently looking to join a professional team and gain hands-on experience building reliable multi-user enterprise systems. This is my specialty. I'm also open to other interesting projects in related areas, including project management and software design. School project examples are listed in the CV below.",
      work_it_schedule:
        "I'm open to work at ~20 hours per week alongside my studies, with a predictable schedule and flexibility during exam periods.",
      work_it_style: "<u>I prefer an open and direct communication style at work.</u>",
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
        '<span class="edu-program">Software Engineering and Technology</span>, specialization <span class="edu-program">Enterprise Systems</span>. Bachelor studies <em>(currently finalizing. Note: studies were paused between 2023 and 2024 to complete the bachelor&apos;s degree at the University of Pardubice, see below).</em>',
      edu_upce_when: "09/2021 – 06/2024",
      edu_upce_school: "Jan Perner Transport Faculty, University of Pardubice (UPCE)",
      edu_upce_detail:
        "Transport Technology and Management, specialization Logistics.",
      edu_upce_thesis:
        'Bachelor thesis: &quot;Means of optimizing the system of city logistics by the example of the city of Prague&quot;<span class="print-only">.</span><span class="print-hide"> (<a href="https://theses.cz/id/5otu4x/">thesis</a>, 58 pages) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">text on the topic</a>, 210 pages)</span><span class="screen-only">.</span>',
      edu_bseu_when: "1999–2005",
      edu_bseu_school: "Belarus State Economic University",
      edu_bseu_detail: "Finance and banking — university degree.",
      skills: "Key skills and topics for discussion",
      languages: "Languages",
      lang_cs: "Czech — advanced (C1 CCE, ÚJOP, 2021)",
      lang_en: "English — upper intermediate (B2, IELTS Score 6.0)",
      lang_ru: "Russian — native; understand spoken and written Belarusian, Ukrainian, Slovak languages",
      lang_de: "German — elementary (A2)",
      work: "Selected projects from CTU",
      work_arimaa:
        '<strong>Arimaa</strong> — Java/JavaFX desktop game — MVC, rule engine, Minimax AI, TCP multiplayer, JUnit tests; semester project from the course Programming in Java (B0B36PJV). <a href="https://github.com/vladimirzubkov/sem-pjv-arimaa">GitHub</a>, demo:&nbsp;<a href="https://youtu.be/2yoAgMzYmRU">https://youtu.be/2yoAgMzYmRU</a>.',
      work_seafood:
        '<strong>Smart Seafood Chain</strong> — discrete-event supply chain simulation — blockchain traceability, YAML config, GoF patterns; semester project from the course Object-Oriented Design and Modeling (B6B36OMO). <a href="https://github.com/vladimirzubkov/sem-omo-seafoodchain">GitHub</a>.',
      work_alladin:
        '<strong>Alladin the Bargainer</strong> — marketplace with AI price negotiation — Spring Boot, React, PostgreSQL, Docker; team project from the course Management of Software Projects (B6B36PM2). <a href="https://github.com/vladimirzubkov/sem-pm2-alladin">GitHub</a>.',
      work_aletheia:
        '<strong>Aletheia</strong> — university course scheduling API — Spring Boot, JPA, Security, Docker, Swagger; semester project from the course Enterprise Architectures (B6B36EAR). <a href="https://github.com/vladimirzubkov/sem-ear-aletheia">GitHub</a>.',
      work_auctionhouse:
        '<strong>Auction House</strong> — english auction monolith — Spring Boot, Kafka, PostgreSQL, Docker, Swagger; semester project from the course Software Systems Design (B6B36NSS). <a href="https://github.com/vladimirzubkov/sem-nss-auctionhouse">GitHub</a>.',
      sports: "Sports",
      sports_body: "Tennis, swimming, basketball, jogging, amateur chess.",
      hosted: "Hosted on GitHub Pages ·",
      visitor_today: "today",
      visitor_total: "total",
      updated: "Updated",
      updated_print: "updated:",
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
        "Pracovní životopis Vladimira Zubkova – softwarové inženýrství, Java, Python a další. ČVUT, Praha.",
      tagline_lead:
        "Backend vývojář softwaru se sídlem v Praze ",
      tagline_paren: "(trvalý pobyt)",
      lede_1:
        "Učím se vytvářet užitečné nástroje. Kombinuji zázemí ve financích, logistice a softwarovém inženýrství. Hlavní zaměření: <strong>backend, softwarová architektura a DevOps</strong>.",
      lede_2:
        "Na FEL ČVUT studuji <strong>Softwarové inženýrství a technologie — Enterprise systémy</strong>: Java, databáze, modelování požadavků, UML, testování softwaru, podnikové a distribuované systémy a počítačové sítě.",
      contacts_line:
        'Kontakt:&nbsp;<a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · GitHub:&nbsp;<a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      work_it_title: "Práce v IT v oboru (ve vývoji)",
      work_it_empty:
        "Zatím zde nejsou žádné pracovní záznamy, což je skvělá příležitost pro začátek naší spolupráce. Ideální nabídka pro mě znamená shodu v zájmech, perspektivách a inženýrské kultuře. Soustředím se především na dlouhodobou spolupráci a rád ji vnímám jako strategickou investici pro obě strany.",
      work_it_seeking:
        "Aktuálně hledám práci v profesionálním týmu a praktické zkušenosti s vývojem spolehlivých víceuživatelských podnikových systémů. To je moje specializace. Zvážím i další zajímavé projekty v příbuzných oblastech, včetně řízení projektů a návrhu softwaru. Příklady školních prací jsou uvedeny v životopisu níže.",
      work_it_schedule:
        "Jsem otevřen práci cca 20 hodin týdně vedle studia, s předvídatelným rozvrhem a flexibilitou v období zkoušek.",
      work_it_style: "<u>V práci preferuji otevřený a přímý styl komunikace.</u>",
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
        '<span class="edu-program">Softwarové inženýrství a technologie</span>, specializace <span class="edu-program">Enterprise systémy</span>. Bakalářské studium <em>(právě dokončuji. Poznámka: studium bylo pozastaveno v letech 2023–2024 kvůli dokončení bakalářského studia na Univerzitě Pardubice, viz níže).</em>',
      edu_upce_when: "09/2021 – 06/2024",
      edu_upce_school: "Dopravní fakulta Jana Pernera, Univerzita Pardubice (UPCE)",
      edu_upce_detail:
        "Technologie a management v dopravě, specializace Logistika.",
      edu_upce_thesis:
        'Bakalářská práce: &quot;Prostředky optimalizace systému městské logistiky na příkladu města Praha&quot;<span class="print-only">.</span><span class="print-hide"> (<a href="https://theses.cz/id/5otu4x/">práce</a>, 58 stran) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">texty na téma</a>, 210 stran)</span><span class="screen-only">.</span>',
      edu_bseu_when: "1999–2005",
      edu_bseu_school: "Běloruská státní ekonomická univerzita",
      edu_bseu_detail: "Finance a bankovnictví — vysokoškolské vzdělání.",
      skills: "Klíčové dovednosti a témata k diskuzi",
      languages: "Jazyky",
      lang_cs: "Čeština — pokročilá (C1 CCE, ÚJOP, 2021)",
      lang_en: "Angličtina — vyšší středně pokročilá, (B2, IELTS Score 6.0)",
      lang_ru: "Ruština — mateřský jazyk; rozumím mluvené a psané běloruštině, ukrajinštině a slovenštině",
      lang_de: "Němčina — základní (A2)",
      work: "Vybrané projekty z ČVUT",
      work_arimaa:
        '<strong>Arimaa</strong> — desktopová hra v Java/JavaFX — MVC, herní pravidla, Minimax AI, TCP multiplayer, JUnit testy; semestrální práce z předmětu Programování v Javě (B0B36PJV). <a href="https://github.com/vladimirzubkov/sem-pjv-arimaa">GitHub</a>, demo:&nbsp;<a href="https://youtu.be/2yoAgMzYmRU">https://youtu.be/2yoAgMzYmRU</a>.',
      work_seafood:
        '<strong>Smart Seafood Chain</strong> — diskrétní simulace dodavatelského řetězce — blockchain, YAML konfigurace, návrhové vzory; semestrální práce z předmětu Objektový návrh a modelování (B6B36OMO). <a href="https://github.com/vladimirzubkov/sem-omo-seafoodchain">GitHub</a>.',
      work_alladin:
        '<strong>Alladin the Bargainer</strong> — inzertní portál s AI vyjednáváním cen — Spring Boot, React, PostgreSQL, Docker; týmový projekt z předmětu Řízení softwarových projektů (B6B36PM2). <a href="https://github.com/vladimirzubkov/sem-pm2-alladin">GitHub</a>.',
      work_aletheia:
        '<strong>Aletheia</strong> — backend pro rozvrhování kurzů — Spring Boot, JPA, Security, Docker, Swagger; semestrální práce z předmětu Enterprise architektury (B6B36EAR). <a href="https://github.com/vladimirzubkov/sem-ear-aletheia">GitHub</a>.',
      work_auctionhouse:
        '<strong>Auction House</strong> — monolit anglické aukce — Spring Boot, Kafka, PostgreSQL, Docker, Swagger; semestrální práce z předmětu Návrh softwarových systémů (B6B36NSS). <a href="https://github.com/vladimirzubkov/sem-nss-auctionhouse">GitHub</a>.',
      sports: "Sporty",
      sports_body: "Tenis, plavání, basketbal, běh klusem, amatérské šachy.",
      hosted: "Hostováno na GitHub Pages ·",
      visitor_today: "dnes",
      visitor_total: "celkem",
      updated: "Aktualizováno",
      updated_print: "aktualizováno:",
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
        "Резюме Владимира Зубкова для работодателей — проектирование ПО, джава, пайтон и другое. ЧВУТ, Прага.",
      tagline_lead:
        "Бэкенд разработчик ПО, живу в Праге ",
      tagline_paren: "(ПМЖ)",
      lede_1:
        "Учусь делать полезные инструменты. Сочетаю опыт в финансах, логистике и разработке ПО. Основной фокус — <strong>бэкенд, архитектура ПО и ДевОпс</strong>.",
      lede_2:
        "На ФЭЛ ЧВУТ изучаю программную инженерию и технологии, специализация корпоративные системы: Джава, базы данных, моделирование требований, УМЛ, тестирование ПО, корпоративные и распределённые системы, компьютерные сети.",
      contacts_line:
        'Контакт:&nbsp;<a href="mailto:vladimir.zubkov@gmail.com">vladimir.zubkov@gmail.com</a> · Гитхаб:&nbsp;<a href="https://github.com/vladimirzubkov">github.com/vladimirzubkov</a>',
      work_it_title: "Работа в IT по специальности (в разработке)",
      work_it_empty:
        "Здесь пока нет записей о работе, и это отличная возможность для начала нашего сотрудничества. Для меня идеальный оффер — это совпадение интересов, перспектив и инженерной культуры. Я нацелен прежде всего на долгосрочную работу и рад рассматривать ее как стратегическую инвестицию каждой из сторон.",
      work_it_seeking:
        "Сейчас ищу работу в профессиональной команде и практический опыт разработки надёжных многопользовательских корпоративных систем. Это моя специальность. Рассмотрю и другие интересные проекты в смежных сферах, в том числе управление проектами и проектирование ПО. Примеры работ со школы приведены в резюме ниже.",
      work_it_schedule:
        "Открыт к работе на ~20 часов в неделю параллельно с учёбой, с предсказуемым графиком и гибкостью в период сессии.",
      work_it_style: "<u>В работе предпочитаю открытый и прямой стиль общения.</u>",
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
        '<span class="edu-program">Программная инженерия и технологии</span>, специализация <span class="edu-program">«Корпоративные информационные системы»</span>. Бакалавриат <em>(завершаю. Примечание: обучение было приостановлено в 2023–2024 гг., чтобы закончить бакалавриат в Университете Пардубице, см. ниже).</em>',
      edu_upce_when: "09/2021 — 06/2024",
      edu_upce_school: "Транспортный факультет Яна Пернера, Университет Пардубице (УПЦЕ)",
      edu_upce_detail:
        "Технологии и менеджмент на транспорте, специализация Логистика.",
      edu_upce_thesis:
        'Бакалаврская работа: &quot;Средства оптимизации системы городской логистики на примере города Прага&quot;<span class="print-only">.</span><span class="print-hide"> (<a href="https://theses.cz/id/5otu4x/">работа</a>, 58 стр.) (<a href="https://github.com/vladimirzubkov/upce-bc/blob/main/Texty_na_t%C3%A9ma_m%C4%9Bstsk%C3%A9_logistiky.pdf">тексты по теме</a>, 210 стр.)</span><span class="screen-only">.</span>',
      edu_bseu_when: "1999—2005",
      edu_bseu_school: "Белорусский государственный экономический университет",
      edu_bseu_detail: "Финансы и банковское дело — высшее образование.",
      skills: "Ключевые навыки и темы для обсуждения",
      languages: "Языки",
      lang_cs: "Чешский — продвинутый (C1 CCE, ÚJOP, 2021)",
      lang_en: "Английский — выше среднего, (B2, IELTS Score 6.0)",
      lang_ru: "Русский — родной; понимаю устную и письменную белорусскую, украинскую и словацкую речь",
      lang_de: "Немецкий — начальный (A2)",
      work: "Избранные проекты с ЧВУТ",
      work_arimaa:
        '<strong>Arimaa</strong> — настольная игра на Java/JavaFX — MVC, движок правил, Minimax AI, TCP-мультиплеер, JUnit-тесты; курсовая работа по предмету «Программирование на Java» (B0B36PJV). <a href="https://github.com/vladimirzubkov/sem-pjv-arimaa">Гитхаб</a>, демо:&nbsp;<a href="https://youtu.be/2yoAgMzYmRU">https://youtu.be/2yoAgMzYmRU</a>.',
      work_seafood:
        '<strong>Smart Seafood Chain</strong> — дискретная симуляция цепочки поставок — blockchain, YAML-конфигурация, паттерны GoF; курсовая работа по предмету «Объектное проектирование и моделирование» (B6B36OMO). <a href="https://github.com/vladimirzubkov/sem-omo-seafoodchain">Гитхаб</a>.',
      work_alladin:
        '<strong>Alladin the Bargainer</strong> — маркетплейс с AI-переговорами о цене — Spring Boot, React, PostgreSQL, Docker; командный проект по предмету «Управление программными проектами» (B6B36PM2). <a href="https://github.com/vladimirzubkov/sem-pm2-alladin">Гитхаб</a>.',
      work_aletheia:
        '<strong>Aletheia</strong> — API для расписания курсов — Spring Boot, JPA, Security, Docker, Swagger; курсовая работа по предмету «Enterprise-архитектуры» (B6B36EAR). <a href="https://github.com/vladimirzubkov/sem-ear-aletheia">Гитхаб</a>.',
      work_auctionhouse:
        '<strong>Auction House</strong> — монолит английского аукциона — Spring Boot, Kafka, PostgreSQL, Docker, Swagger; курсовая работа по предмету «Проектирование программных систем» (B6B36NSS). <a href="https://github.com/vladimirzubkov/sem-nss-auctionhouse">Гитхаб</a>.',
      sports: "Виды спорта",
      sports_body: "Теннис, плавание, баскетбол, бег трусцой, любительские шахматы.",
      hosted: "Хостинг гитхаб-страницы ·",
      visitor_today: "сегодня",
      visitor_total: "всего",
      updated: "Обновлено",
      updated_print: "обновлено:",
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

  patchWorkPrintLinks("en", "GitHub", "youtube");
  patchWorkPrintLinks("cs", "GitHub", "youtube");
  patchWorkPrintLinks("ru", "Гитхаб", "ютуб");
  patchContactPrintLinks("en");
  patchContactPrintLinks("cs");
  patchContactPrintLinks("ru");
  SUPPORTED.forEach(function (lang) {
    strings[lang].skills_chips = skillsChipsHtml(lang);
  });

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

  function stabilizeScroll(y) {
    if (typeof y !== "number") y = getScrollY();
    pinScroll(y);
    requestAnimationFrame(function () {
      pinScroll(y);
      requestAnimationFrame(function () {
        pinScroll(y);
      });
    });
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

  function updatedStampForLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    var d = new Date(document.lastModified);
    if (Number.isNaN(d.getTime())) d = new Date();
    var locale = lang === "cs" ? "cs-CZ" : lang === "ru" ? "ru-RU" : "en-GB";
    return {
      iso: d.toISOString(),
      text: d.toLocaleString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  function buildPrintFooterText(lang) {
    var stamp = updatedStampForLang(lang);
    return "vladimirzubkov.github.io · " + t(lang, "updated_print") + " " + stamp.text;
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

    var stamp = updatedStampForLang(lang);
    var updated = document.getElementById("updated");
    if (updated) {
      updated.setAttribute("datetime", stamp.iso);
      updated.textContent = stamp.text;
    }
    document.querySelectorAll(".footer-print-time").forEach(function (el) {
      el.setAttribute("datetime", stamp.iso);
      el.textContent = stamp.text;
    });

    currentLang = lang;
    document.documentElement.setAttribute("data-print-footer", buildPrintFooterText(lang));
    if (clearProjectSkillFocus) clearProjectSkillFocus();
    if (refreshPrintPageBoxes) refreshPrintPageBoxes();
    if (refitPrintLayout && !opts.skipPrintFit) {
      window.requestAnimationFrame(refitPrintLayout);
    }
  }

  function nudgeHeroCollapseDuringWidth() {
    if (syncHeroTextColumnForWidth) syncHeroTextColumnForWidth();
    if (syncTopbarLineFn) syncTopbarLineFn();
    if (!refitHeroCollapse) return;
    refitHeroCollapse();
    var start = performance.now();
    function tick(now) {
      if (syncHeroTextColumnForWidth) syncHeroTextColumnForWidth();
      if (syncTopbarLineFn) syncTopbarLineFn();
      refitHeroCollapse();
      if (now - start < LANG_WIDTH_MS + 80) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function schedulePrintRefitAfterLang() {
    if (!refitPrintLayout) return;
    window.setTimeout(function () {
      refitPrintLayout();
    }, LANG_WIDTH_MS + 50);
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

    function settleLayoutAfterLang() {
      if (resetHeroCollapseMetrics) resetHeroCollapseMetrics();
      nudgeHeroCollapseDuringWidth();
      schedulePrintRefitAfterLang();
      stabilizeScroll(scrollY);
      window.setTimeout(function () {
        stabilizeScroll(scrollY);
      }, LANG_WIDTH_MS + 80);
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
      settleLayoutAfterLang();
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
      nudgeHeroCollapseDuringWidth();

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
            settleLayoutAfterLang();
          if (main) main.removeAttribute("aria-busy");
          langSwitching = false;
          });
        });
    }, LANG_FADE_OUT_MS);
  }

  var VISITOR_COUNT_KEY = "vladimirzubkov.github.io-cv";
  var VISITOR_COUNT_API = "https://badge-visitor-count.vercel.app/api/hit/";

  function fetchVisitorHit(key) {
    return fetch(VISITOR_COUNT_API + encodeURIComponent(key)).then(function (r) {
        return r.json();
    });
  }

  function loadVisitorCount() {
    var todayEl = document.getElementById("visitor-count-today");
    var totalEl = document.getElementById("visitor-count-total");
    if (!todayEl && !totalEl) return;
    var dayKey = VISITOR_COUNT_KEY + "-" + new Date().toISOString().slice(0, 10);
    Promise.all([fetchVisitorHit(dayKey), fetchVisitorHit(VISITOR_COUNT_KEY)])
      .then(function (results) {
        var today = results[0];
        var total = results[1];
        if (todayEl) {
          todayEl.textContent =
            today && typeof today.value === "number" ? String(today.value) : "—";
        }
        if (totalEl) {
          totalEl.textContent =
            total && typeof total.value === "number" ? String(total.value) : "—";
        }
      })
      .catch(function () {
        if (todayEl) todayEl.textContent = "—";
        if (totalEl) totalEl.textContent = "—";
      });
  }

  function initStickyTopbar() {
    var topbar = document.querySelector(".topbar");
    var toggle = document.getElementById("sticky-lang");
    if (!topbar || !toggle) return;

    var FADE_RANGE = 160;
    var enabled = true;
    try {
      var saved = localStorage.getItem(STICKY_KEY);
      if (saved === "0") enabled = false;
    } catch (e) {}

    function fadeContentEl() {
      return (
        document.querySelector(".hero-text") ||
        document.querySelector(".page-hero .lede") ||
        document.querySelector(".page-main")
      );
    }

    function lineHeight() {
      var el = fadeContentEl() || document.body;
      var lh = parseFloat(getComputedStyle(el).lineHeight);
      return Number.isFinite(lh) && lh > 0 ? lh : 26;
    }

    function syncClipTop() {
      var toggleWrap = toggle.closest(".sticky-toggle");
      if (!toggleWrap) return;
      var pull =
        toggleWrap.getBoundingClientRect().top -
        topbar.getBoundingClientRect().top;
      if (pull > 0) {
        topbar.style.setProperty("--clip-top-pull", pull + "px");
      }
    }

    function syncTopbarLine() {
      var langSwitch = topbar.querySelector(".lang-switch");
      if (!langSwitch) return;
      var toggleWrap = toggle.closest(".sticky-toggle");
      var tb = topbar.getBoundingClientRect();
      var fadeStart = Math.max(0, langSwitch.getBoundingClientRect().left - tb.left);
      var fadeEnd = tb.width;
      if (toggleWrap) {
        var tw = toggleWrap.getBoundingClientRect();
        var clip = toggleWrap.querySelector(".clip-img");
        if (toggle.checked && clip) {
          fadeEnd = Math.max(fadeEnd, clip.getBoundingClientRect().right - tb.left);
        } else {
          fadeEnd = Math.max(fadeEnd, tw.right - tb.left);
        }
      }
      topbar.style.setProperty("--topbar-line-fade-start", fadeStart + "px");
      topbar.style.setProperty("--topbar-line-fade-end", fadeEnd + "px");
      topbar.style.setProperty("--topbar-line-width", fadeEnd + "px");
    }

    function updateStuck() {
      if (!topbar.classList.contains("is-sticky")) return;
      var stuck = window.scrollY > 0;
      topbar.classList.toggle("is-stuck", stuck);
      if (!stuck) {
        topbar.style.removeProperty("--topbar-fade-opacity");
        return;
      }
      if (window.matchMedia("(max-width: 640px)").matches) {
        topbar.style.setProperty("--topbar-fade-opacity", "1");
        return;
      }
      var content = fadeContentEl();
      if (!content) {
        topbar.style.setProperty("--topbar-fade-opacity", "1");
        return;
      }
      var topbarBottom = topbar.getBoundingClientRect().bottom;
      var contentTop = content.getBoundingClientRect().top;
      var gap = contentTop - topbarBottom;
      var fadeDelay = lineHeight();
      var dist = gap - fadeDelay;
      var approach =
        dist <= 0 ? 1 : dist >= FADE_RANGE ? 0 : 1 - dist / FADE_RANGE;
      topbar.style.setProperty("--topbar-fade-opacity", String(approach));
    }

    function setSticky(on) {
      topbar.classList.toggle("is-sticky", on);
      toggle.checked = on;
      if (!on) {
        topbar.classList.remove("is-stuck");
        topbar.style.removeProperty("--topbar-fade-opacity");
      } else {
        updateStuck();
        syncClipTop();
        syncTopbarLine();
      }
    }

    window.addEventListener("scroll", updateStuck, { passive: true });
    window.addEventListener("resize", function () {
      syncClipTop();
      syncTopbarLine();
    });
    setSticky(enabled);
    syncClipTop();
    syncTopbarLine();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        syncClipTop();
        syncTopbarLine();
      });
    }

    if (typeof ResizeObserver !== "undefined") {
      var tools = topbar.querySelector(".topbar-tools");
      if (tools) {
        var lineObserver = new ResizeObserver(syncTopbarLine);
        lineObserver.observe(tools);
        lineObserver.observe(topbar);
      }
    }

    toggle.addEventListener("change", function () {
      var on = toggle.checked;
      setSticky(on);
      syncTopbarLine();
      try {
        localStorage.setItem(STICKY_KEY, on ? "1" : "0");
      } catch (e) {}
    });

    syncTopbarLineFn = syncTopbarLine;
  }

  function initHeroCollapse() {
    var topbar = document.querySelector(".topbar");
    var toggle = document.getElementById("sticky-lang");
    var hero = document.querySelector(".hero");
    var brandAnchor = document.querySelector(".hero-brand-anchor");
    var photo = document.querySelector(".photo");
    var brand = document.querySelector(".brand");
    var heroText = document.querySelector(".hero-text");
    var pageBody = document.querySelector(".page-body");
    if (!topbar || !toggle || !hero || !brandAnchor || !photo || !brand || !heroText || !pageBody)
      return;

    var PHOTO_FULL = 160;
    var PHOTO_MIN = 110;
    var BRAND_MIN = 28;
    var PHOTO_CLIP_ABOVE = 9;
    var COLLAPSE_RANGE = 180;
    var SMOOTH_START_BIAS = 0.35;
    var metrics = null;
    var raf = 0;

    function disabled() {
      return (
        window.matchMedia("(max-width: 640px)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("print").matches
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
      heroText.removeAttribute("style");
      brandAnchor.style.minHeight = "";
    }

    function contentLeft() {
      var rect = topbar.getBoundingClientRect();
      var pad = parseFloat(getComputedStyle(topbar).paddingLeft);
      return rect.left + (Number.isNaN(pad) ? 0 : pad);
    }

    function eduTextLeft() {
      var el = document.querySelector(".timeline-head strong");
      if (!el) return contentLeft();
      return el.getBoundingClientRect().left;
    }

    function textColumnLeft() {
      return eduTextLeft();
    }

    function collapsedTargets(photoSize, brandSize) {
      var endBrandTop =
        metrics.topbarTop + (metrics.topbarHeight - brandSize * 1.1) / 2;
      return {
        photoTop: -PHOTO_CLIP_ABOVE,
        photoLeft: metrics.contentLeft,
        brandTop: endBrandTop,
        brandLeft: metrics.eduTextLeft,
        brandSize: brandSize,
      };
    }

    function captureMetrics() {
      var photoStyle = photo.getAttribute("style");
      var brandStyle = brand.getAttribute("style");
      var heroTextStyle = heroText.getAttribute("style");
      if (photoStyle) photo.removeAttribute("style");
      if (brandStyle) brand.removeAttribute("style");
      if (heroTextStyle) heroText.removeAttribute("style");

      var topbarRect = topbar.getBoundingClientRect();
      var scrollY = window.scrollY;
      var photoRect = photo.getBoundingClientRect();
      var brandRect = brand.getBoundingClientRect();
      var heroTextRect = heroText.getBoundingClientRect();
      metrics = {
        photoTop: photoRect.top + scrollY,
        photoLeft: photoRect.left,
        brandTop: brandRect.top + scrollY,
        brandLeft: brandRect.left,
        brandSize: parseFloat(getComputedStyle(brand).fontSize) || 32,
        brandHeight: brandRect.height,
        heroTextLeft: heroTextRect.left,
        eduTextLeft: eduTextLeft(),
        contentLeft: contentLeft(),
        topbarHeight: topbar.offsetHeight,
        topbarTop: topbarRect.top,
      };
      brandAnchor.style.minHeight = metrics.brandHeight + "px";

      if (photoStyle) photo.setAttribute("style", photoStyle);
      if (brandStyle) brand.setAttribute("style", brandStyle);
      if (heroTextStyle) heroText.setAttribute("style", heroTextStyle);
    }

    // When page width changes (language), layout shifts horizontally —
    // slide cached left edges by the delta (gap stays the same).
    function syncTextColumnForWidth() {
      if (!metrics) return;
      var edu = eduTextLeft();
      var delta = edu - metrics.eduTextLeft;
      if (!delta) return;
      metrics.eduTextLeft = edu;
      metrics.heroTextLeft += delta;
      metrics.photoLeft += delta;
      metrics.brandLeft += delta;
      metrics.contentLeft += delta;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }

    // Faster than smoothstep at the start (non-zero slope), still eases to a soft landing.
    function smoothstepWithSeamlessStart(t) {
      var s = smoothstep(t);
      return s + SMOOTH_START_BIAS * t * (1 - s);
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

      var rawProgress = Math.min(1, scrollY / COLLAPSE_RANGE);
      var progress = smoothstepWithSeamlessStart(rawProgress);
      var root = document.documentElement;
      root.style.setProperty("--hero-collapse", String(progress));
      root.style.setProperty("--topbar-height", metrics.topbarHeight + "px");
      root.style.setProperty("--hero-photo-mini", PHOTO_MIN + "px");
      root.classList.add("is-hero-collapse-active");

      var photoSize = lerp(PHOTO_FULL, PHOTO_MIN, progress);
      var endBrandSize = lerp(metrics.brandSize, BRAND_MIN, progress);
      var targets = collapsedTargets(photoSize, endBrandSize);

      var naturalPhotoTop = metrics.photoTop - scrollY;
      var naturalBrandTop = metrics.brandTop - scrollY;
      var expandPhotoTop = Math.max(naturalPhotoTop, targets.photoTop);
      var expandBrandTop = Math.max(naturalBrandTop, targets.brandTop);

      var photoTop = lerp(expandPhotoTop, targets.photoTop, progress);
      var photoLeft = lerp(metrics.photoLeft, targets.photoLeft, progress);
      var brandTop = lerp(expandBrandTop, targets.brandTop, progress);
      var brandLeft = lerp(metrics.brandLeft, targets.brandLeft, progress);
      var brandSize = lerp(metrics.brandSize, targets.brandSize, progress);
      var borderW = lerp(3, 2, progress);
      var shadowBlur = lerp(28, 10, progress);
      var shadowY = lerp(8, 3, progress);
      var shadowAlpha = lerp(0.12, 0.08, progress);

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
        ");z-index:101;margin:0;";

      brand.style.cssText =
        "position:fixed;top:" +
        brandTop +
        "px;left:" +
        brandLeft +
        "px;font-size:" +
        brandSize +
        "px;line-height:1.1;margin:0;z-index:101;";

      var maxTextShift = Math.max(0, metrics.heroTextLeft - metrics.eduTextLeft);
      heroText.style.marginLeft = -maxTextShift * progress + "px";
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        apply();
      });
    }

    refitHeroCollapse = schedule;
    syncHeroTextColumnForWidth = syncTextColumnForWidth;
    resetHeroCollapseMetrics = function () {
      metrics = null;
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () {
      metrics = null;
      schedule();
    });
    toggle.addEventListener("change", function () {
      metrics = null;
      schedule();
    });
    window.addEventListener("beforeprint", function () {
      metrics = null;
      reset();
    });
    window.addEventListener("afterprint", schedule);

    if (typeof ResizeObserver !== "undefined") {
      var layoutObserver = new ResizeObserver(schedule);
      layoutObserver.observe(topbar);
      layoutObserver.observe(pageBody);
    }

    schedule();
  }

  function initPrintFit() {
    var PAGE_HEIGHT_MM = 270.2; // A4 297mm − 14.4mm top − 12.4mm bottom
    var TAIL_SAFETY_MM = 1; // guards the trailing blank line from the content-area edge
    var MIN_SCALE = 0.68;
    var MAX_SCALE = 1;
    var MAX_PAGES = 2;
    var SEARCH_STEPS = 7; // (1 − 0.68) / 2^7 ≈ 0.25% scale precision
    var BLOCK_SELECTOR = ".hero, .page-hero, main > section";
    var root = document.documentElement;
    var fitting = false;
    var pxPerMm = 0;
    var printPageStyle = document.getElementById("print-page-numbers");
    if (!printPageStyle) {
      printPageStyle = document.createElement("style");
      printPageStyle.id = "print-page-numbers";
      document.head.appendChild(printPageStyle);
    }

    function inPrintMedia() {
      return window.matchMedia && window.matchMedia("print").matches;
    }

    function measurePxPerMm() {
      var probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;left:-9999px;top:0;width:1px;visibility:hidden;height:100mm;";
      document.body.appendChild(probe);
      var px = probe.getBoundingClientRect().height / 100;
      document.body.removeChild(probe);
      return px;
    }

    function applyScale(scale) {
      var value = String(scale);
      root.style.setProperty("--print-scale", value);
      root.style.setProperty("--print-u", value);
    }

    function resetPrintState() {
      document.querySelectorAll(".print-break-after").forEach(function (el) {
        el.classList.remove("print-break-after");
      });
      root.classList.remove("print-multi-page");
      root.removeAttribute("data-print-pages");
      root.removeAttribute("data-print-scale");
      printPageStyle.textContent = "";
      var pageNumEl = document.querySelector(".print-page-number");
      if (pageNumEl) pageNumEl.removeAttribute("data-total");
    }

    /* Reads the print clone at the current scale. Heights come from rects, so
       the trailing blank line and the footer are measured at that same scale. */
    function readLayout() {
      var container = document.querySelector(".page-body") || document.body;
      var footer = document.querySelector("footer");
      var layout = { blocks: [], tailPx: 0, footerPx: 0 };
      var nodes = container.querySelectorAll(BLOCK_SELECTOR);
      if (!nodes.length) return layout;
      var baseTop = container.getBoundingClientRect().top;
      for (var i = 0; i < nodes.length; i++) {
        var rect = nodes[i].getBoundingClientRect();
        layout.blocks.push({
          node: nodes[i],
          top: rect.top - baseTop,
          height: rect.height,
        });
      }
      var last = nodes[nodes.length - 1];
      if (last) {
        layout.tailPx = parseFloat(window.getComputedStyle(last).marginBottom) || 0;
      }
      if (footer) layout.footerPx = footer.getBoundingClientRect().height;
      return layout;
    }

    /* Greedy packing whose decisions are then forced onto the browser with
       explicit page breaks, so printed pagination cannot diverge from this.
       On the last sheet we reserve the blank line (tailPx) only — the print
       footer lives in @page @bottom-right, outside the content area. */
    function packPages(layout, pagePx, tailSafetyPx) {
      var blocks = layout.blocks;
      var reserve = layout.tailPx + tailSafetyPx;
      if (!blocks.length) {
        return { pages: 1, breaks: [], usedOnLast: reserve, overflow: false };
      }
      var pages = 1;
      var used = 0;
      var breaks = [];
      var overflow = false;
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var previous = blocks[i - 1];
        var spacing = used > 0 ? block.top - (previous.top + previous.height) : 0;
        var extra = i === blocks.length - 1 ? reserve : 0;
        if (used > 0 && used + spacing + block.height + extra > pagePx) {
          breaks.push(i - 1);
          pages += 1;
          used = block.height + extra;
        } else {
          used += spacing + block.height + extra;
        }
        if (used > pagePx) overflow = true;
      }
      return { pages: pages, breaks: breaks, usedOnLast: used, overflow: overflow };
    }

    function layoutFits(layout, pagePx, gapPx, maxPages) {
      var packed = packPages(layout, pagePx, gapPx);
      return !packed.overflow && packed.pages <= maxPages;
    }

    function findScale(pagePx, gapPx, maxPages) {
      applyScale(MAX_SCALE);
      var largest = readLayout();
      if (layoutFits(largest, pagePx, gapPx, maxPages)) {
        return { scale: MAX_SCALE, layout: largest };
      }
      applyScale(MIN_SCALE);
      var smallest = readLayout();
      if (!layoutFits(smallest, pagePx, gapPx, maxPages)) return null;

      var lo = MIN_SCALE;
      var hi = MAX_SCALE;
      var best = { scale: MIN_SCALE, layout: smallest };
      for (var step = 0; step < SEARCH_STEPS; step++) {
        var mid = (lo + hi) / 2;
        applyScale(mid);
        var probe = readLayout();
        if (layoutFits(probe, pagePx, gapPx, maxPages)) {
          best = { scale: mid, layout: probe };
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return best;
    }

    function applyBreaks(blocks, breaks) {
      var forced = {};
      for (var i = 0; i < breaks.length; i++) forced[breaks[i]] = true;
      for (var j = 0; j < blocks.length; j++) {
        blocks[j].node.classList.toggle("print-break-after", forced[j] === true);
      }
    }

    function escapeCssContent(value) {
      return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }

    function mountPrintPageStyle(css) {
      if (printPageStyle.parentNode) printPageStyle.parentNode.removeChild(printPageStyle);
      printPageStyle = document.createElement("style");
      printPageStyle.id = "print-page-numbers";
      printPageStyle.textContent = css;
      document.head.appendChild(printPageStyle);
    }

    function getPrintScaleLabel() {
      var scale = parseFloat(root.style.getPropertyValue("--print-scale") || "1");
      return String(Math.round(scale * 100));
    }

    function syncPrintPageBoxes(pages) {
      var pageNumEl = document.querySelector(".print-page-number");
      if (pageNumEl) pageNumEl.setAttribute("data-total", String(pages));
      var scale = parseFloat(root.style.getPropertyValue("--print-scale") || "1");
      var boxFont = (10 * scale).toFixed(2) + "pt";
      var pageNumRule =
        "@bottom-center {content: counter(page) \" / " +
        pages +
        '";font-size: ' +
        boxFont +
        ";color: #555;vertical-align: middle;margin-bottom: 2mm;}";
      var footerText = root.getAttribute("data-print-footer") || buildPrintFooterText(currentLang || "en");
      var footerRule =
        "@bottom-right {" +
        'content: "' +
        escapeCssContent(footerText) +
        '";' +
        "font-size: " +
        boxFont +
        ";color: #555;white-space: nowrap;vertical-align: top;}";
      var scaleRule =
        "@bottom-left {" +
        'content: "' +
        escapeCssContent(getPrintScaleLabel()) +
        '";' +
        "font-size: 5pt;" +
        "color: #555;vertical-align: top;}";
      var css = "";
      if (pages >= 2) {
        css +=
          "@page :first {@bottom-right {content: none;}@bottom-left {content: none;}}" +
          "@page {counter-increment: page;" + pageNumRule + footerRule + scaleRule + "}";
      } else {
        css += "@page {" + footerRule + scaleRule + "}";
      }
      mountPrintPageStyle(css);
    }

    function fitPrintLayout() {
      if (fitting || inPrintMedia()) return;
      var scrollY = getScrollY();
      var releaseHold = holdScroll(scrollY);
      fitting = true;
      resetPrintState();
      if (!pxPerMm) pxPerMm = measurePxPerMm();
      root.classList.add("is-print-measure");
      try {
        var pagePx = PAGE_HEIGHT_MM * pxPerMm;
        var tailSafetyPx = TAIL_SAFETY_MM * pxPerMm;
        var chosen = findScale(pagePx, tailSafetyPx, 1);
        if (!chosen) chosen = findScale(pagePx, tailSafetyPx, MAX_PAGES);
        if (!chosen) {
          applyScale(MIN_SCALE);
          chosen = { scale: MIN_SCALE, layout: readLayout() };
        } else if (parseFloat(root.style.getPropertyValue("--print-scale")) !== chosen.scale) {
          applyScale(chosen.scale);
        }

        var packed = packPages(chosen.layout, pagePx, tailSafetyPx);
        applyBreaks(chosen.layout.blocks, packed.breaks);
        root.classList.toggle("print-multi-page", packed.pages > 1);
        root.setAttribute("data-print-pages", String(packed.pages));
        root.setAttribute("data-print-scale", (chosen.scale * 100).toFixed(1) + "%");
        syncPrintPageBoxes(packed.pages);
      } finally {
        root.classList.remove("is-print-measure");
        fitting = false;
        releaseHold();
        stabilizeScroll(scrollY);
      }
    }

    function cleanupMeasure() {
      root.classList.remove("is-print-measure");
    }

    function scheduleFit() {
      if (inPrintMedia()) return;
      fitPrintLayout();
    }

    refitPrintLayout = fitPrintLayout;
    function ensurePrintFooterFresh() {
      var lang = currentLang || "en";
      root.setAttribute("data-print-footer", buildPrintFooterText(lang));
      var pages = parseInt(root.getAttribute("data-print-pages") || "1", 10);
      if (!Number.isFinite(pages) || pages < 1) pages = 1;
      syncPrintPageBoxes(pages);
    }

    refreshPrintPageBoxes = ensurePrintFooterFresh;

    var photo = document.querySelector(".photo");
    if (photo && !photo.complete) {
      photo.addEventListener("load", scheduleFit, { once: true });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFit);
    }
    scheduleFit();

    window.addEventListener("beforeprint", function () {
      cleanupMeasure();
      if (!inPrintMedia()) fitPrintLayout();
      else ensurePrintFooterFresh();
    });
    window.addEventListener("afterprint", cleanupMeasure);

    if (window.matchMedia) {
      var printMql = window.matchMedia("print");
      var onChange = function (event) {
        if (event.matches) ensurePrintFooterFresh();
        else cleanupMeasure();
      };
      if (printMql.addEventListener) printMql.addEventListener("change", onChange);
      else if (printMql.addListener) printMql.addListener(onChange);
    }
  }

  function initProjectSkillHighlight() {
    var skillsSection = document.querySelector("section.skills");
    var workSection = document.querySelector("section.work-projects");
    if (!skillsSection || !workSection) return;

    var workItems = workSection.querySelectorAll(".work-item[data-project]");

    function skillChips() {
      return skillsSection.querySelectorAll(".chips [data-skill]");
    }

    function clearFocus() {
      skillsSection.classList.remove("is-skill-focus");
      workItems.forEach(function (item) {
        item.classList.remove("is-work-hover");
      });
      skillChips().forEach(function (chip) {
        chip.classList.remove("skill-chip-primary", "skill-chip-common", "skill-chip-dimmed");
      });
    }

    function setFocus(projectId) {
      var mapping = PROJECT_SKILLS[projectId];
      if (!mapping) return;
      var scrollY = getScrollY();
      var primary = {};
      var common = {};
      mapping.primary.forEach(function (id) {
        primary[id] = true;
      });
      mapping.common.forEach(function (id) {
        common[id] = true;
      });

      skillsSection.classList.add("is-skill-focus");
      skillChips().forEach(function (chip) {
        var id = chip.getAttribute("data-skill");
        chip.classList.remove("skill-chip-primary", "skill-chip-common", "skill-chip-dimmed");
        if (primary[id]) chip.classList.add("skill-chip-primary");
        else if (common[id]) chip.classList.add("skill-chip-common");
        else chip.classList.add("skill-chip-dimmed");
      });
      stabilizeScroll(scrollY);
    }

    workItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        item.classList.add("is-work-hover");
        workItems.forEach(function (other) {
          if (other !== item) other.classList.remove("is-work-hover");
        });
        setFocus(item.getAttribute("data-project"));
      });
    });

    workSection.addEventListener("mouseleave", clearFocus);
    clearProjectSkillFocus = clearFocus;
  }

  function init() {
    var lang = detectLang();
    var brand = getBrandEl();
    if (brand) syncBrandState(brand, lang, true);
    apply(lang, { skipBrand: !!brand });
    loadVisitorCount();
    initStickyTopbar();
    initHeroCollapse();
    initProjectSkillHighlight();
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
    refitHeroCollapse: function () {
      if (refitHeroCollapse) refitHeroCollapse();
    },
  };
})(window);
