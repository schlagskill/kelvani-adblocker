# KelvaniAdBlocker 0.3.3 ([kelvani.net](http://kelvani.net/adblocker.html))

Original Chrome/Edge Manifest V3 extension by schlagskill. Local settings, no account or telemetry.

## YouTube playback correction

A user reported endless video loading with 0.3.2. Version 0.3.3 retires fetch/XHR/player-response hooks and unregisters the old YouTube page script. Requests initiated by youtube.com or youtube-nocookie.com bypass network filtering. Cosmetic cleanup and detector compatibility also leave YouTube untouched.

**YouTube ads are not currently fully blocked.** The optional assistant only clicks visible skip buttons in an ad-marked player. It does not alter video time, playback rate, media URLs, player responses or network APIs. The popup states this limitation. Live playback after this correction is still unverified.

## Update

Replace files in the existing unpacked extension folder, reload the extension in edge://extensions or chrome://extensions, and fully reload YouTube. Already loaded pages may retain older hooks until reloaded. Keep the existing extension identity to retain local settings.

## Other websites

Supported EasyList/EasyPrivacy filters, optional cosmetic cleanup, global pause, website exceptions and custom blocked domains. The popup recognizes the current hostname and supports one-click exceptions. Filter compilation supports a subset, not every EasyList feature. Source snapshots and conversion report are included; there is no automatic filter update yet.

## Validation

Run node --test. Fixtures check untouched player APIs, removal of legacy registrations, YouTube-scoped allow rules, settings rollback, skip controls and popup behavior. These tests do not prove live ad-block coverage.

## Licenses

Original code: MIT (LICENSE). EasyList/EasyPrivacy data and derived rules: CC BY-SA 3.0, The EasyList authors, https://easylist.to/; see filters/NOTICE.md. Inter: SIL Open Font License. Branding derives from owner-provided logos. Shared UI: assets/ui/README.md.
