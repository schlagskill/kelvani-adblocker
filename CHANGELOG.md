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
