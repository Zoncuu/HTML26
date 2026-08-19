let pages = [];

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

async function loadPages() {
    try {
        const response = await fetch("main/pages.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error("Arkistoluetteloa ei löytynyt.");
        }

        const archive = await response.json();
        pages = archive.filter((page) => (
            typeof page.title === "string"
            && typeof page.group === "string"
            && typeof page.path === "string"
            && page.path.toLocaleLowerCase("fi").endsWith(".html")
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

function renderPages() {
    const query = search.value.trim().toLocaleLowerCase("fi");
    const visiblePages = pages.filter((page) => {
        const matchesGroup = activeFilter === "kaikki" || page.group === activeFilter;
        const matchesSearch = `${page.title} ${page.group}`.toLocaleLowerCase("fi").includes(query);

        return matchesGroup && matchesSearch;
    });

    const pageLinks = visiblePages.map((page) => {
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
    });

    list.replaceChildren(...pageLinks);
    resultCount.textContent = `${visiblePages.length} / ${pages.length} sivua`;
    emptyState.hidden = visiblePages.length !== 0;
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
