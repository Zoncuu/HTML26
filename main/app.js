const pages = [
    { title: "Harjoitukset – etusivu", group: "harjoitukset", path: "harjoitukset/index.html" },
    { title: "Harjoitukset 1–3", group: "harjoitukset", path: "harjoitukset/pracc1-3.html" },
    { title: "Linkkisivusto – etusivu", group: "linkkisivusto", path: "linkkisivusto/index.html" },
    { title: "Minusta", group: "linkkisivusto", path: "linkkisivusto/minusta.html" },
    { title: "Kuvagalleria", group: "linkkisivusto", path: "linkkisivusto/kuvagalleria.html" },
    { title: "Yhteystiedot", group: "linkkisivusto", path: "linkkisivusto/yhteys.html" },
    { title: "Testit – etusivu", group: "testit", path: "testit/index.html" },
    { title: "Joel Tyni", group: "testit", path: "testit/joeltyni.html" },
    { title: "Kuvaharjoittelu", group: "testit", path: "testit/kuvaharjoittelu.html" },
    { title: "Lempipeli", group: "testit", path: "testit/lempi_peli.html" },
    { title: "Kirjautuminen", group: "testit", path: "testit/login.html" },
    { title: "Rakenna kortti", group: "testit", path: "testit/rakenna_kortti.html" },
    { title: "Yhteydenottolomake", group: "testit", path: "testit/yhteydenottolomake.html" }
];

const list = document.querySelector("#page-list");
const search = document.querySelector("#page-search");
const resultCount = document.querySelector(".result-count");
const emptyState = document.querySelector("#empty-state");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");
let activeFilter = "kaikki";

function readableGroup(group) {
    const names = { harjoitukset: "Harjoitukset", linkkisivusto: "Linkkisivusto", testit: "Testit" };
    return names[group] || group;
}

function renderPages() {
    const query = search.value.trim().toLocaleLowerCase("fi");
    const visiblePages = pages.filter((page) => {
        const matchesGroup = activeFilter === "kaikki" || page.group === activeFilter;
        const matchesSearch = `${page.title} ${page.group}`.toLocaleLowerCase("fi").includes(query);
        return matchesGroup && matchesSearch;
    });

    list.replaceChildren(...visiblePages.map((page) => {
        const link = document.createElement("a");
        link.className = "page-item";
        link.href = page.path;
        link.innerHTML = `
            <span class="page-item-index">${String(pages.indexOf(page) + 1).padStart(2, "0")}</span>
            <span><strong>${page.title}</strong><small>${readableGroup(page.group)}</small></span>
            <span class="page-item-arrow" aria-hidden="true">→</span>`;
        return link;
    }));

    resultCount.textContent = `${visiblePages.length} / ${pages.length} sivua`;
    emptyState.hidden = visiblePages.length !== 0;
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        renderPages();
    });
});

search.addEventListener("input", renderPages);
document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        search.focus();
        document.querySelector("#kaikki-sivut").scrollIntoView();
    }
    if (event.key === "Escape") search.blur();
});

menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("is-open", !isOpen);
});

mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        mainNav.classList.remove("is-open");
    }
});

document.querySelector("#page-count").textContent = pages.length;
renderPages();
