import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const outputFile = resolve(projectRoot, "main", "pages.json");
const ignoredDirectories = new Set([".git", ".github", "CSS", "main", "node_modules"]);
const groupNames = {
    "tunti-harjoitukset": "tunti",
    "pinja-harjoitukset": "pinja",
    projektit: "projektit"
};

async function findHtmlFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const absolutePath = resolve(directory, entry.name);

        if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
            files.push(...await findHtmlFiles(absolutePath));
        }

        if (entry.isFile() && extname(entry.name).toLocaleLowerCase("fi") === ".html") {
            files.push(absolutePath);
        }
    }

    return files;
}

function decodeTitle(value) {
    return value
        .replace(/<[^>]*>/g, "")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", "\"")
        .replaceAll("&#39;", "'")
        .replace(/\s+/g, " ")
        .trim();
}

function fallbackTitle(filePath) {
    const fileName = filePath.split("/").at(-1).replace(/\.html$/i, "");
    const parentName = filePath.split("/").at(-2);
    const sourceName = fileName === "index" ? parentName : fileName;

    return sourceName
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/^./, (letter) => letter.toLocaleUpperCase("fi"));
}

function groupFor(filePath) {
    const topDirectory = filePath.split("/")[0];
    return groupNames[topDirectory] || topDirectory;
}

const htmlFiles = await findHtmlFiles(projectRoot);
const pages = [];

for (const absolutePath of htmlFiles) {
    const filePath = relative(projectRoot, absolutePath).split(sep).join("/");

    if (filePath === "index.html") continue;

    const html = await readFile(absolutePath, "utf8");
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const headingMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = decodeTitle(titleMatch?.[1] || headingMatch?.[1] || fallbackTitle(filePath));

    pages.push({
        title,
        group: groupFor(filePath),
        path: filePath
    });
}

pages.sort((first, second) => (
    first.group.localeCompare(second.group, "fi")
    || first.path.localeCompare(second.path, "fi")
));

await writeFile(outputFile, `${JSON.stringify(pages, null, 4)}\n`, "utf8");
console.log(`Kurssiarkistoon lisättiin ${pages.length} HTML-sivua.`);
