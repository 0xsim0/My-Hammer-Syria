# Code Review – Landing Page Redesign

**Datum:** 2026-03-02
**Commit:** `40ee333` – design: redesign landing page, footer, and navbar with animations
**Geänderte Dateien:** `src/app/[locale]/page.tsx`, `src/app/globals.css`, `src/components/layout/Footer.tsx`, `src/components/layout/Navbar.tsx`

---

## Behobene Fehler

### 1. `titleAr` fehlte in der Datenbankabfrage (Zweisprachigkeitsfehler)
**Datei:** `src/app/[locale]/page.tsx` · Zeile 69
**Problem:** Die `FeaturedJobs`-Abfrage hat nur `title` (Englisch) geladen, aber nicht `titleAr`. Arabische Nutzer sahen dadurch englische Jobtitel.
**Lösung:** `titleAr: true` zur Prisma-Select-Abfrage hinzugefügt. Rendering jetzt: `locale === "ar" ? (job.titleAr || job.title) : job.title`.

---

### 2. Währungssymbol – vorhandene Konstante nicht genutzt
**Datei:** `src/app/[locale]/page.tsx` · Zeile 133
**Problem:** Inline-Ternary `job.currency === "SYP" ? "ل.س" : "$"` statt der bereits existierenden Konstante `CURRENCY_SYMBOLS` aus `src/lib/constants.ts`.
**Lösung:** Ersetzt durch `CURRENCY_SYMBOLS[job.currency] ?? job.currency`.

---

### 3. Ungültige Tailwind-Klasse `duration-250`
**Datei:** `src/app/[locale]/page.tsx` · Zeile 108
**Problem:** `duration-250` existiert nicht in Tailwinds Standard-Skala (erlaubt: 100, 150, 200, 300, 500, 700, 1000). Die Klasse wurde nie generiert – die Transition hatte keine Wirkung.
**Lösung:** Ersetzt durch `duration-200`.

---

### 4. Tote CSS-Klassen `h-13 w-13`
**Datei:** `src/app/[locale]/page.tsx` · Zeile 551
**Problem:** `h-13 w-13` sind keine Standard-Tailwind-Klassen und werden nie generiert. Gleichzeitig waren bereits `h-[52px] w-[52px]` (korrekte Arbitrary-Values) vorhanden – die beiden ersten Klassen waren reiner toter Code.
**Lösung:** `h-13 w-13` entfernt, `h-[52px] w-[52px]` behalten.

---

## Offene Baustellen (nicht behoben)

### 5. Hartcodierte zweisprachige Strings – i18n wird umgangen
**Dateien:** `src/app/[locale]/page.tsx` (ca. 11 Stellen), `src/components/layout/Footer.tsx` (ca. 7 Stellen)
**Problem:** Viele UI-Texte sind direkt im JSX hartcodiert als `locale === "ar" ? "عربي" : "English"`, statt das vorhandene Übersetzungssystem (`getTranslations()` / `useTranslations()`) zu nutzen. Das erschwert Wartung und Übersetzungen.
**Betroffene Strings (Auswahl):**
- `"لا توجد طلبات حالياً"` / `"No jobs available yet"` (page.tsx:100)
- `"كيف يعمل"` / `"How It Works"` (page.tsx:390)
- `"التخصصات"` / `"Services"` (page.tsx:464)
- `"منصة تستحق ثقتك"` / `"A Platform You Can Trust"` (page.tsx:507)
- `"Browse Jobs"` / `"تصفح الطلبات"` (page.tsx:668)
- Logo-Text und Tagline in Footer (Footer.tsx:11–14)
- 6 weitere Strings im Footer

**Empfehlung:** Fehlende Keys in `messages/ar.json` und `messages/en.json` ergänzen und `t("key")` verwenden.

---

### 6. Dupliziertes `isRTL`-Muster in mehreren Komponenten
**Dateien:** `page.tsx:225`, `Navbar.tsx:30`, `Footer.tsx:10` (+ weitere 4 Dateien im Projekt)
**Problem:** Jede Komponente berechnet `const isRTL = locale === "ar"` unabhängig voneinander.
**Empfehlung:** Gemeinsamen Hook `useIsRTL()` oder Hilfsfunktion `isArabic(locale)` in `src/lib/utils.ts` extrahieren.

---

### 7. Dupliziertes `ArrowIcon`-Muster
**Dateien:** `page.tsx:232`, `Footer.tsx:15`
**Problem:** `const ArrowIcon = isRTL ? ArrowRight : ArrowLeft` wird an mindestens 7 Stellen im Projekt wiederholt.
**Empfehlung:** Kleine Hilfskomponente `<DirectionalArrow />` extrahieren.

---

### 8. Logo-Rendering dupliziert
**Dateien:** `Navbar.tsx:84–94`, `Footer.tsx:26–33`
**Problem:** Navbar und Footer rendern beide das Logo (Hammer-Icon + Text) mit fast identischer Struktur, aber leicht unterschiedlichen Größen.
**Empfehlung:** Gemeinsame `<Logo>` Komponente unter `src/components/layout/Logo.tsx` extrahieren.

---

### 9. Kein Keyboard-Handler (Escape) am Profil-Dropdown
**Datei:** `src/components/layout/Navbar.tsx` · Zeile 157–162
**Problem:** Das Dropdown schließt per Klick auf ein Overlay, aber nicht per `Escape`-Taste. Verstößt gegen WCAG-Richtlinien für schließbare Elemente.
**Empfehlung:** `onKeyDown`-Handler mit `e.key === "Escape"` ergänzen oder Radix-UI `Popover`/`DropdownMenu` nutzen (ist bereits im Projekt vorhanden unter `src/components/ui/`).
