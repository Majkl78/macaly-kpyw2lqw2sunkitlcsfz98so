# 🚗 Správa zakázek a vozidel

Webová aplikace pro správu autoservisních zakázek a vozidel. Migrace z Excel souboru `zakazky.xlsm` do moderní webové aplikace s databází Convex.

## 📊 Funkce

- **Dashboard** - Přehled statistik, zakázky po termínu, rychlé akce
- **Seznam zakázek** - Filtrovatelný seznam všech zakázek s vyhledáváním
- **Detail zakázky** - Kompletní informace o zakázce včetně kontaktů, termínů a pick-up služby
- **Databáze vozidel** - Seznam všech vozidel s možností vyhledávání
- **Import dat** - Snadný import dat z Excel souboru

## 🚀 Spuštění projektu

### 1. Instalace závislostí
```bash
npm install
```

### 2. Spuštění Convex databáze
```bash
npx convex dev
```

### 3. Spuštění vývojového serveru
```bash
npm run dev
```

Aplikace běží na: `http://localhost:3000`

## 📥 Import dat z Excel

### Krok 1: Příprava dat
Data jsou již připravená v `/tmp/` složce:
- `vehicles-import.json` - 2437 vozidel
- `orders-import.json` - 1803 zakázek

### Krok 2: Import do databáze
1. Otevři `http://localhost:3000/admin/import`
2. Nahraj oba JSON soubory
3. Klikni na "Importovat data"
4. Počkej na dokončení (může trvat několik minut)

## 📁 Struktura dat

### Vozidla (Vehicles)
- **SPZ** (licencePlate) - Registrační značka
- **Značka** (make) - Výrobce vozidla
- **Model** (modelLine)
- **VIN** (vinCode)
- **Motorizace** (powertrain)
- **Pronajímatel** (lessor)

### Zakázky (Orders)
- **Číslo zakázky** (orderNumber)
- **Datum** - Datum vytvoření
- **SPZ** (licencePlate) - Propojení s vozidlem
- **Firma** (company)
- **Kontaktní údaje** - Jméno, telefon, email
- **Požadavek opravy** (repairRequest)
- **Termín** (deadline) a čas
- **Pick-up služba** - Adresa, časy vyzvednutí/vrácení
- **Stavy** - Potvrzeno, kalkulace, fakturace, po termínu

## 🎯 Hlavní stránky

- `/` - Dashboard s přehledem
- `/orders` - Seznam všech zakázek
- `/orders/[id]` - Detail zakázky
- `/vehicles` - Seznam vozidel
- `/admin/import` - Import dat

## 🔍 Funkce vyhledávání a filtrování

### Seznam zakázek
- Hledání podle SPZ, firmy, čísla zakázky
- Filtr: Po termínu / V termínu
- Řazení podle data (nejnovější první)

### Vozidla
- Hledání podle SPZ, značky, VIN

## 📊 Statistiky na dashboardu

- Celkový počet zakázek
- Zakázky po termínu (🔴)
- Potvrzené zakázky (✅)
- Zakázky s pick-up službou

## 🎨 Design

Aplikace používá moderní design s:
- Gradientním pozadím (slate-blue)
- Responzivním layoutem
- Intuitivní navigací
- Barvovým rozlišením stavů (červená = po termínu, zelená = potvrzeno)

## 🛠️ Technologie

- **Next.js 15** - React framework
- **Convex** - Real-time databáze
- **TypeScript** - Typová bezpečnost
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI komponenty

## 📝 Import z Excelu - původní data

Původní Excel soubor `zakazky.xlsm` obsahoval:
- 3455 zakázek (list "Objednávky")
- 2440 vozidel (list "SPZ")
- 85 ActiveX ovládacích prvků
- VBA makra pro automatizaci

Všechna data byla úspěšně exportována do JSON a jsou připravena k importu.

## 🔐 Bezpečnost

- Data jsou uložena v zabezpečené Convex databázi
- Real-time aktualizace
- Validace dat na frontendu i backendu

## 📞 Kontakt

Pro otázky nebo problémy kontaktujte administrátora systému.
