# HTML26

HTML26 on Joel Tynin Keudan ohjelmointikurssin sivusto syksylle 2026. Repository kokoaa samaan paikkaan tunneilla tehdyt harjoitukset, Pinjasta löytyvät tehtävät ja myöhemmin mahdollisesti tulevat projektit.

Sivusto on toteutettu kurssilla käytettävillä perusteknologioilla:

- HTML
- CSS
- JavaScript

## Linkit

- [Julkaistu sivusto](https://zoncuu.github.io/HTML26/)
- [GitHub-repository](https://github.com/Zoncuu/HTML26)
- [Keudan verkkosivut](https://www.keuda.fi/)

## Kansiorakenne

```text
HTML26/
├── .github/                       GitHubin automaattiset työnkulut
│   └── workflows/                 Kurssiarkiston päivitys GitHubissa
│
├── css/                           Pääsivun tyylitiedostot
│
├── main/                          Pääsivun JavaScript ja arkiston toiminta
│   └── images/                    Pääsivun kuvat, logot ja tunnukset
│
├── pinja-harjoitukset/            Pinjan antamat harjoitukset
│   ├── pages/                     Harjoitusten HTML-sivut
│   ├── css/                       Harjoitusten tyylitiedostot
│   ├── js/                        Harjoitusten JavaScript-tiedostot
│   ├── images/                    Harjoituksissa käytettävät kuvat
│   ├── audio/                     Harjoituksissa käytettävät äänet
│   └── videos/                    Harjoituksissa käytettävät videot
│
├── tunti-harjoitukset/            Oppitunneilla tehdyt harjoitukset
│   ├── pages/                     Harjoitukset lajiteltuina kurssin osioihin
│   │   ├── osio_1/                HTML-perusteet
│   │   ├── osio_2/                Teksti ja otsikot
│   │   ├── osio_3/                Linkit, kuvat ja monisivuinen linkkisivusto
│   │   ├── osio_4/                HTML-attribuutit
│   │   ├── osio_5/                HTML-listat
│   │   ├── osio_6/                HTML-taulukot
│   │   ├── osio_7/                HTML-lomakkeet
│   │   ├── osio_8/                Semanttinen HTML
│   │   ├── osio_9/                Multimedia HTML:ssä
│   │   └── osio_10/               Kansiorakenne ja monisivuinen kokonaisuus
│   ├── css/                       Tuntiharjoitusten yhteiset tyylit
│   ├── images/                    Tuntiharjoitusten kuvat
│   ├── audio/                     Ääniharjoitusten mediatiedostot
│   ├── videos/                    Videoharjoitusten mediatiedostot
│   └── subtitles/                 Videoiden tekstitystiedostot
│
└── projektit/                     Tulevat laajemmat kurssiprojektit
```

## Kansioiden tarkoitukset

| Polku | Tarkoitus |
| --- | --- |
| `index.html` | Sivuston pääsivu ja navigointinäkymä. |
| `css/style.css` | Pääsivun visuaalinen ilme ja responsiivisuus. |
| `main/app.js` | Pääsivun navigaatio, haku, suodatus ja arkiston näyttäminen. |
| `main/images/` | Pääsivun kuvat ja tunnukset. |
| `main/pages.json` | Automaattisesti muodostettu luettelo HTML-sivuista ja tuntiharjoitusten osiokansioista. Tätä tiedostoa ei tarvitse muokata käsin. |
| `main/generate-archive.mjs` | Etsii repositoryn HTML-tiedostot ja muodostaa `pages.json`-luettelon. |
| `.github/workflows/update-archive.yml` | Päivittää kurssiarkiston automaattisesti GitHubissa. |
| `tunti-harjoitukset/` | Oppitunneilla tehdyt harjoitukset ja niihin kuuluvat materiaalit. |
| `tunti-harjoitukset/pages/` | Tuntiharjoitukset kurssin osioiden mukaan lajiteltuina. Jokaisessa osiokansiossa on oma README. |
| `tunti-harjoitukset/pages/osio_3/linkkisivusto-demo/` | Osion 3 monisivuinen linkkisivustoharjoitus omine tyyleineen ja kuvineen. |
| `tunti-harjoitukset/pages/osio_10/` | Osion 10 oma sivukokonaisuus, jolla on erilliset tyylit, kuvat ja alasivut. |
| `pinja-harjoitukset/` | Pinjan antamat tehtävät ja niiden materiaalit. |
| `pinja-harjoitukset/pages/` | Pinja-harjoitusten yksittäiset HTML-sivut. |
| `audio/`, `videos/`, `images/` ja `subtitles/` | Harjoituksissa käytettävät media- ja tekstitystiedostot. |

## Kurssiarkiston automaattinen päivitys

Pääsivun **Kurssin arkisto** muodostetaan automaattisesti. Arkistoon lisätään vain sellaiset sivut, joille löytyy oikea `.html`-tiedosto.

- **Kaikki** näyttää kaikki löydetyt HTML-tiedostot yhtenä luettelona.
- **Tunti harjoitukset** näyttää kaikki `osio_x`-kansiot. Myös tyhjä osio näkyy ja kertoo, ettei siinä ole vielä HTML-tiedostoja.
- **Pinja Harjoitukset** näyttää vain HTML-tiedostoja sisältävät kansiot niiden omilla kansionimillä.

Automaation toimintaperiaate:

1. Uusi HTML-harjoitus lisätään `tunti-harjoitukset`- tai `pinja-harjoitukset`-kansion alle.
2. Sivulle kirjoitetaan kuvaava `<title>`-elementti.
3. Muutokset viedään GitHubin `main`-haaraan.
4. GitHub Actions suorittaa `main/generate-archive.mjs`-tiedoston.
5. Generaattori päivittää `main/pages.json`-luettelon.
6. Uusi sivu ilmestyy automaattisesti Kurssin arkistoon.

Jos HTML-tiedosto poistetaan, se poistuu arkistosta seuraavan päivityksen yhteydessä. Repositoryn juuressa olevaa pääsivua `index.html` ei lisätä harjoitusarkistoon.

Arkiston voi päivittää myös paikallisesti repositoryn juuressa:

```powershell
node main/generate-archive.mjs
```

`pages.json` on generoitu tiedosto, joten sen sisältöä ei pidä ylläpitää käsin.

## Uuden harjoituksen lisääminen

### Tuntiharjoitus

1. Luo HTML-tiedosto sen aihetta vastaavaan `tunti-harjoitukset/pages/osio_x/`-kansioon.
2. Lisää sivulle vähintään toimiva HTML-rakenne ja kuvaava `<title>`.
3. Lisää tehtävän tarvitsemat kuvat, äänet, videot ja tekstitykset niitä vastaaviin materiaalikansioihin.
4. Tarkista suhteelliset tiedostopolut selaimessa.
5. Vie muutokset `main`-haaraan, jolloin arkisto päivittyy automaattisesti.

### Pinja-harjoitus

1. Luo HTML-tiedosto sopivaan kansioon `pinja-harjoitukset/`-hakemiston alle. Arkisto muodostaa näkymän automaattisesti tiedoston sisältävän kansion perusteella.
2. Käytä Pinja-harjoitusten omaa `css/style.css`-tiedostoa, jos tehtävä kuuluu samaan sivukokonaisuuteen.
3. Lisää mahdolliset JavaScript-, kuva-, ääni- ja videotiedostot niiden omiin kansioihin.
4. Vie muutokset `main`-haaraan.

### Projekti

Varsinaisia projekteja ei ole vielä lisätty. Kun ensimmäinen projekti aloitetaan, sille voidaan tehdä oma kansio `projektit/`-hakemiston alle. Arkistogeneraattori tunnistaa tämän ryhmän valmiiksi.

## Paikallinen esikatselu

Sivuston voi avata paikallisesti käynnistämällä repositoryn juuressa yksinkertaisen verkkopalvelimen:

```powershell
py -m http.server 8000
```

Avaa tämän jälkeen selaimessa:

```text
http://localhost:8000/
```

Palvelimen voi lopettaa terminaalissa näppäinyhdistelmällä `Ctrl + C`.

## Julkaiseminen

Sivusto julkaistaan GitHub Pagesissa repositoryn `main`-haarasta. Kun muutokset on viety GitHubiin, sivusto ja kurssiarkisto päivittyvät GitHubin työnkulun valmistuttua.

## Periaatteet

- Pääsivu käyttää vain juuren `index.html`-tiedostoa sekä `css/`- ja `main/`-kansioita.
- Harjoituskansioiden sisältö pidetään erillään pääsivun tiedostoista.
- Sivut tehdään HTML:llä, CSS:llä ja JavaScriptillä ilman tarpeettomia kirjastoja.
- Tiedostopolkujen tulee olla suhteellisia, jotta sivut toimivat myös GitHub Pagesissa.
- Jokaisella arkistoon tulevalla HTML-sivulla tulee olla selkeä `<title>`.
- Generoitua `main/pages.json`-tiedostoa ei muokata käsin.
