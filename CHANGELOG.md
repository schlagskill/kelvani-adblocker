# 0.4.1

Local diagnostics and bounded YouTube response inspection.

## 0.4.0 - experimental player filter

- Replace skip clicks with document-start player ad-schedule filtering.
- Preserve streaming and verification data; keep generic YouTube network bypass.
- Add bootstrap, fetch, parsed navigation and XHR JSON coverage.
- Live coverage remains unverified; not marketed as complete protection.

## 0.3.3 — YouTube playback correction

Withdraw player-response hooks; remove legacy registration. YouTube-initiated traffic bypasses network filtering. Cosmetic and detector helpers no longer modify YouTube. The optional assistant only clicks visible skip controls; YouTube ads are not fully blocked. Reload extension and YouTube after updating.

## 0.3.2

YouTube-Schalter direkt im Popup mit eigenem Status und automatischem Neuladen nach dem Speichern. Player-Filter verarbeitet zusätzlich XHR-Antworten und verschachtelte Player-Antworten von next. Fremde Endpunkte, fehlgeschlagene Antworten und Wiedergabe-/Attestierungsdaten bleiben unverändert. Keine bestätigte Garantie für werbefreies Live-YouTube.

## 0.3.1

Rotes K-Logo statt Schild. Redundanten Aktiv-Text entfernt. Skip-Beobachtung verwirft veraltete Aktionen und klickt denselben Button nicht mehrfach.

# UI release 0.3.0

Gemeinsame Controls, Rückmeldungen und aufgeräumte Filter-Einstellungen.

Gemeinsame Quelle: work/kelvani-ui. Siehe assets/ui/README.md.

# Changelog

## 0.2.3
- Applied the red/white theme to the full settings page and all extension icon sizes.
- Unified buttons, fields, switches, diagnostic text and focus indicators.

## 0.2.2
- Restyled compact popup in white and red with a light header, simple status panel and fewer labels.

## 0.2.1
- Replaced the full settings popup with a compact 340px interface.
- Added one-click exception for the active website, reversible from the same button.
- Reloads the correct tab only after successful saving; warns if reload fails.
- Guards against navigation and stale settings while the popup is open.
- Added eight popup behavior tests; 40 tests pass.

## 0.2.0
- Added EasyPrivacy and resource/domain-restricted URL-path filters.
- Added opt-in YouTube player-response cleanup in addition to skip-button assistance.
- Added per-site BlockAdBlock/FuckAdBlock compatibility.
- Added native browser rule diagnosis, without network test requests.
- Added revision checks for stale settings windows and rollback of page scripts/filter-list changes.
- Preserved invalid/unsaved inputs for correction. Added versioned preview assets to avoid stale cached code.
- Added disabling/cancellation tests; 32 automated tests pass.

## 0.1.0
Initial plain-domain blocker with exceptions and local settings.
