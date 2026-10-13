# KelvaniAdBlocker

Original browser extension by schlagskill. Chrome / Edge, Manifest V3. Test release; live Edge and YouTube behavior is not yet verified.

Current version: **0.3.1**. Shared UI source and synchronization are documented in `assets/ui/README.md`.

## Install / update
Extract the extension ZIP into a permanent folder. Open edge://extensions or chrome://extensions, enable Developer mode, choose Load unpacked and select the folder containing manifest.json. To update an existing unpacked installation, replace its files and reload the extension. Check requested permissions and reload affected websites. The compact 340px toolbar popup detects the active website automatically. Click Website ausnehmen to exempt it and reload the page, or Schutz wieder aktivieren to undo the exception. Alle Einstellungen öffnen opens full settings in a separate tab.

## Included
- EasyList advertisement protection and separately switchable EasyPrivacy tracking protection.
- 104,240 supported source filters compiled to 7,861 native rules. Counts describe source filters, not blocked ads.
- Plain domain and domain-anchored URL-path filters. Supported path options: resource types, third-party/first-party, match-case, positive/negative initiator domains.
- Global pause, website exceptions including subdomains, and custom blocked domains.
- Explicit cosmetic rules for common advertisement containers.
- Optional YouTube mode: removes adPlacements, playerAds and adSlots from ytInitialPlayerResponse and JSON player fetch responses; clicks visible skip buttons in an ad-marked player.
- Per-site detector compatibility: provides non-detection callbacks for BlockAdBlock/FuckAdBlock API names. Never enabled globally by default.
- Browser diagnosis uses testMatchOutcome without making a request to an advertisement server. Only available in unpacked extensions.
- Local settings, no account, telemetry or remote executable code.

## Using additional protection
YouTube mode and detector compatibility are off by default. Enable YouTube mode and reload YouTube. For a website with an adblock notice, enable its detector compatibility switch and reload it. Disable the mode if website functionality breaks. A website exception overrides all protection. The full settings page lets you edit the compatibility-site list.

## Honest limitations
This is not a complete EasyList engine. Regex rules, generic path rules, advanced scriptlets, redirects, CSP rewriting, generic cosmetic lists and unsupported options are skipped. Domains named in unsupported anchored source exceptions are omitted conservatively to reduce breakage. The source snapshots and conversion report are included. No automatic filter downloads yet. Replace source snapshots and run node compile-filters.js before rebuilding/reloading.

YouTube implementation does not cover every response transport or server-side advertisement insertion. It does not bypass account-level/server-side playback restrictions or alter attestation and playability data. Detector compatibility only covers two known API families; geometry, network checks and other detection systems can still detect blocking. These are implemented features tested against controlled fixtures, not a claim of verified coverage on today's live websites.

MAIN-world helpers are registered at document_start only after opt-in. Disabling protection turns off subsequent hook behavior; a page reload is needed to restore already changed initial data. Third-party application data is not transmitted to the extension. Existing page getters/nonconfigurable properties are respected.

## Permissions and storage
storage stores switches, domain lists and revision numbers locally. activeTab reads the current hostname after opening the popup. declarativeNetRequest applies network filters. scripting and HTTP/HTTPS host access let the extension install the opted-in page helpers. Website access is also used for cosmetic cleanup. No browsing history, passwords or request bodies are stored. The YouTube helper processes player responses locally in the website context only.

## Validation
Run node --test. 43 tests cover filter scope and exceptions, safe URL handling, native rule budgets, settings conflicts, atomic failure rollback, script registration, source response preservation, targeted YouTube cleanup, detector callbacks and content-script disabling. All JavaScript syntax is checked during packaging. Native Edge/Chrome installation and live YouTube behavior remain unverified. Local HTML is clearly marked as a design preview and blocks no requests.

## Licenses
Original code: MIT (LICENSE). EasyList/EasyPrivacy source data and derived rules: CC BY-SA 3.0, credited to The EasyList authors, https://easylist.to/. See filters/NOTICE.md. No third-party application source code or UI was copied.


## Aktuelle Änderungen 0.3.1

Rotes K-Logo statt Schild. Redundanten Aktiv-Text entfernt. Skip-Beobachtung verwirft veraltete Aktionen und klickt denselben Button nicht mehrfach.

Nach dem Ersetzen der Dateien die entpackte Erweiterung im Browser neu laden. Das ZIP allein aktualisiert keine bereits installierte Erweiterung.
