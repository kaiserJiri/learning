# Little Step

Česká aplikace pro procvičování angličtiny. První funkční prototyp: čtyři lekce úrovně A1, dvacet slovíček s příklady, výslovnost pomocí prohlížeče, kvízy a přehled pokroku.

## Vývoj

Vyžaduje Node.js 22.12+ (ověřeno na 24) a npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

Pokrok zůstává v `localStorage` daného prohlížeče. Není synchronizovaný mezi zařízeními. Dokončení lekce vyžaduje pět správných odpovědí z pěti; statistiky zahrnují všechny dokončené kvízy. Výslovnost závisí na dostupném anglickém hlasu v prohlížeči a systému. Fonty z Google Fonts jsou volitelné, aplikace funguje i bez nich.

## Samostatná ukázka bez serveru

Příkaz `npm run export:demo` vytvoří `dist/little-step.html`. Tento soubor obsahuje skripty i styly a lze ho stáhnout a otevřít přímo v běžném prohlížeči bez instalace Node.js. Výslovnost nadále závisí na hlasových možnostech prohlížeče. Vestavěné náhledy chatu mohou spouštění JavaScriptu omezovat; v tom případě soubor stáhněte a otevřete mimo náhled. Hlavní `index.html` je vstup pro Vite a samostatně se neotevírá.

## Web přes GitHub Pages

Publikovaná verze je v `docs/index.html` (včetně JavaScriptu a stylů). Po změnách spusťte `npm run build:pages` a nahrajte aktualizovaný obsah `docs/` spolu se zdrojovými soubory.

V repozitáři na GitHubu otevřete **Settings → Pages**, jako Source vyberte **Deploy from a branch**, větev **main** a složku **/docs**, potom **Save**. Až GitHub dokončí nasazení, aplikace bude na `https://kaiserjiri.github.io/learning/`. Dokud není Pages aktivní a nasazení dokončeno, adresa fungovat nemusí. Viditelnost repozitáře a tarif GitHubu mohou ovlivnit dostupnost Pages.

Tento web používá jen prohlížeč; neposílá pokrok na server a neobsahuje účty ani platby. Uživatelé si mohou procvičovat obsah přímo na webu, bez stahování a instalace.

## Ověření

```sh
npx playwright install chromium
npm test
```

Pokud je Chromium již nainstalovaný systémově, lze místo stahování použít `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`.

## Směr produktu

Cílem je angličtina pro různé věkové skupiny a úrovně. Aktuální obsah je společný základ A1. Jde o lokální prototyp, ne o hotovou předplatitelskou službu.

Před prodejem je potřeba ověřit zájem a kvalitu výuky s uživateli, doplnit další úrovně a věkové varianty, účty se synchronizací, serverové ověřování předplatného a platby. Součástí přípravy na prodej budou také podmínky používání, ochrana osobních údajů a pravidla pro případné dětské účty. Zatím se nevybírají žádné platby a nevytvářejí uživatelské účty.
