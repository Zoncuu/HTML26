let pages = [];
let lessonSections = [];

const list = document.querySelector("#page-list");
const search = document.querySelector("#page-search");
const resultCount = document.querySelector(".result-count");
const emptyState = document.querySelector("#empty-state");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const archiveFilterLinks = [...document.querySelectorAll("[data-archive-filter]")];
const menuButton = document.querySelector(".menu-button");
const menuLabel = menuButton.querySelector(".sr-only");
const mainNav = document.querySelector(".main-nav");
const siteHeader = document.querySelector(".site-header");
const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeFilter = "kaikki";
let scrollFrame;

function readableGroup(group) {
    const names = {
        tunti: "Tunti harjoitukset",
        pinja: "Pinja Harjoitukset",
        projektit: "Projektit"
    };

    return names[group] || group
        .replaceAll("-", " ")
        .replace(/^./, (letter) => letter.toLocaleUpperCase("fi"));
}

function readableFolderName(folderPath) {
    const folderName = folderPath.split("/").at(-1) || folderPath;
    const sectionMatch = folderName.match(/^osio_(\d+)$/i);

    if (sectionMatch) {
        return `Osio ${Number(sectionMatch[1])}`;
    }

    return folderName
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/^./, (letter) => letter.toLocaleUpperCase("fi"));
}

function folderForPage(page) {
    return page.folder || page.path.split("/").slice(0, -1).join("/");
}

function matchesSearch(page, query) {
    return `${page.title} ${page.path} ${readableGroup(page.group)}`
        .toLocaleLowerCase("fi")
        .includes(query);
}

async function loadPages() {
    try {
        const response = await fetch("main/pages.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error("Arkistoluetteloa ei löytynyt.");
        }

        const archive = await response.json();
        const archivePages = Array.isArray(archive) ? archive : archive.pages;
        const archiveSections = Array.isArray(archive) ? [] : archive.lessonSections;

        pages = (Array.isArray(archivePages) ? archivePages : []).filter((page) => (
            typeof page.title === "string"
            && typeof page.group === "string"
            && typeof page.path === "string"
            && page.path.toLocaleLowerCase("fi").endsWith(".html")
        ));
        lessonSections = (Array.isArray(archiveSections) ? archiveSections : []).filter((section) => (
            typeof section.name === "string"
            && typeof section.label === "string"
            && typeof section.path === "string"
        ));

        document.querySelector("#page-count").textContent = pages.length;
        renderPages();
    } catch (error) {
        resultCount.textContent = "Arkistoa ei voitu ladata";
        emptyState.textContent = "Harjoitusarkiston lataaminen epäonnistui.";
        emptyState.hidden = false;
        console.error(error);
    }
}

function createPageLink(page) {
    const link = document.createElement("a");
    const index = pages.indexOf(page) + 1;
    link.className = "page-item";
    link.href = page.path;

    const number = document.createElement("span");
    number.className = "page-item-index";
    number.textContent = String(index).padStart(2, "0");

    const copy = document.createElement("span");
    const title = document.createElement("strong");
    const group = document.createElement("small");
    title.textContent = page.title;
    group.textContent = readableGroup(page.group);
    copy.append(title, group);

    const arrow = document.createElement("span");
    arrow.className = "page-item-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    link.append(number, copy, arrow);
    return link;
}

function createFolder(folder, folderPages, query, emptyMessage) {
    const details = document.createElement("details");
    details.className = "archive-folder";
    details.open = query.length > 0;

    const summary = document.createElement("summary");
    const folderIcon = document.createElement("span");
    const folderCopy = document.createElement("span");
    const folderTitle = document.createElement("strong");
    const folderCount = document.createElement("small");
    const folderArrow = document.createElement("span");

    folderIcon.className = "archive-folder-icon";
    folderIcon.setAttribute("aria-hidden", "true");
    folderTitle.textContent = folder.label;
    folderCount.textContent = folderPages.length === 1
        ? "1 HTML-tiedosto"
        : `${folderPages.length} HTML-tiedostoa`;
    folderCopy.className = "archive-folder-copy";
    folderCopy.append(folderTitle, folderCount);
    folderArrow.className = "archive-folder-arrow";
    folderArrow.setAttribute("aria-hidden", "true");
    folderArrow.textContent = "+";
    summary.append(folderIcon, folderCopy, folderArrow);

    const content = document.createElement("div");
    content.className = "archive-folder-content";

    if (folderPages.length === 0) {
        const message = document.createElement("p");
        message.className = "archive-folder-empty";
        message.textContent = emptyMessage;
        content.append(message);
    } else {
        const folderPageList = document.createElement("div");
        folderPageList.className = "folder-page-list";
        folderPageList.append(...folderPages.map(createPageLink));
        content.append(folderPageList);
    }

    details.append(summary, content);
    return details;
}

function lessonFolderData(query) {
    return lessonSections.flatMap((section) => {
        const sectionPages = pages.filter((page) => (
            page.group === "tunti"
            && page.path.startsWith(`${section.path}/`)
        ));
        const folderMatches = `${section.label} ${section.name}`
            .toLocaleLowerCase("fi")
            .includes(query);
        const visiblePages = !query || folderMatches
            ? sectionPages
            : sectionPages.filter((page) => matchesSearch(page, query));

        if (query && !folderMatches && visiblePages.length === 0) {
            return [];
        }

        return [{ ...section, pages: visiblePages }];
    });
}

function pinjaFolderData(query) {
    const folders = new Map();

    pages.filter((page) => page.group === "pinja").forEach((page) => {
        const folderPath = folderForPage(page);

        if (!folders.has(folderPath)) {
            folders.set(folderPath, {
                name: folderPath.split("/").at(-1),
                label: readableFolderName(folderPath),
                path: folderPath,
                pages: []
            });
        }

        folders.get(folderPath).pages.push(page);
    });

    return [...folders.values()]
        .sort((first, second) => first.path.localeCompare(second.path, "fi"))
        .flatMap((folder) => {
            const folderMatches = `${folder.label} ${folder.path}`
                .toLocaleLowerCase("fi")
                .includes(query);
            const visiblePages = !query || folderMatches
                ? folder.pages
                : folder.pages.filter((page) => matchesSearch(page, query));

            return query && !folderMatches && visiblePages.length === 0
                ? []
                : [{ ...folder, pages: visiblePages }];
        });
}

function renderPages() {
    const query = search.value.trim().toLocaleLowerCase("fi");

    if (activeFilter === "kaikki") {
        const visiblePages = pages.filter((page) => matchesSearch(page, query));
        list.classList.remove("is-folder-view");
        list.replaceChildren(...visiblePages.map(createPageLink));
        resultCount.textContent = `${visiblePages.length} / ${pages.length} HTML-tiedostoa`;
        emptyState.textContent = "Hakua vastaavia HTML-tiedostoja ei löytynyt.";
        emptyState.hidden = visiblePages.length !== 0;
        return;
    }

    const folders = activeFilter === "tunti"
        ? lessonFolderData(query)
        : pinjaFolderData(query);
    const visiblePageCount = folders.reduce((total, folder) => total + folder.pages.length, 0);
    const emptyMessage = activeFilter === "tunti"
        ? "Tässä osiossa ei ole vielä HTML-tiedostoja."
        : "Tässä kansiossa ei ole HTML-tiedostoja.";

    list.classList.add("is-folder-view");
    list.replaceChildren(...folders.map((folder) => (
        createFolder(folder, folder.pages, query, emptyMessage)
    )));
    resultCount.textContent = `${visiblePageCount} HTML-tiedostoa · ${folders.length} ${activeFilter === "tunti" ? "osiota" : "kansiota"}`;
    emptyState.textContent = "Hakua vastaavia kansioita tai HTML-tiedostoja ei löytynyt.";
    emptyState.hidden = folders.length !== 0;
}

function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuLabel.textContent = "Avaa valikko";
    mainNav.classList.remove("is-open");
}

function setActiveNavigation(hash) {
    navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === hash;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function updateActiveNavigation() {
    const sectionIds = ["harjoitukset", "kaikki-sivut", "teknologiat"];
    const readingLine = window.scrollY + siteHeader.offsetHeight + Math.min(180, window.innerHeight * 0.22);
    let activeHash = "#alku";

    sectionIds.forEach((id) => {
        const section = document.querySelector(`#${id}`);

        if (section && section.offsetTop <= readingLine) {
            activeHash = `#${id}`;
        }
    });

    if (window.scrollY < 80) {
        activeHash = "#alku";
    }

    setActiveNavigation(activeHash);
}

function selectFilter(filter) {
    activeFilter = filter;
    search.value = "";

    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    renderPages();
}

filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));

    button.addEventListener("click", () => {
        selectFilter(button.dataset.filter);
    });
});

archiveFilterLinks.forEach((link) => {
    link.addEventListener("click", () => {
        selectFilter(link.dataset.archiveFilter);
    });
});

search.addEventListener("input", renderPages);

menuButton.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menuLabel.textContent = willOpen ? "Sulje valikko" : "Avaa valikko";
    mainNav.classList.toggle("is-open", willOpen);
});

anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        const target = document.querySelector(hash);

        if (!target) return;

        event.preventDefault();
        closeMenu();

        if (hash === "#alku") {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        } else {
            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        }

        window.history.replaceState(null, "", hash);
        setActiveNavigation(hash);
    });
});

document.addEventListener("click", (event) => {
    if (!mainNav.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector("#kaikki-sivut").scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start"
        });
        window.setTimeout(() => search.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 350);
    }

    if (event.key === "Escape") {
        closeMenu();
        search.blur();
    }
});

window.addEventListener("scroll", () => {
    if (scrollFrame) return;

    scrollFrame = window.requestAnimationFrame(() => {
        updateActiveNavigation();
        scrollFrame = null;
    });
}, { passive: true });

window.addEventListener("resize", updateActiveNavigation);
loadPages();
updateActiveNavigation();
