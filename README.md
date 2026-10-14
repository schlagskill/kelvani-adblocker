# KelvaniAdBlocker 0.4.0 ([kelvani.net](http://kelvani.net/adblocker.html))

Original Chrome/Edge Manifest V3 extension by schlagskill. Local settings, no account or telemetry.

## Experimental YouTube player filter (0.4.0)

The skip-click assistant has been removed. The opt-in filter runs at document start in the page world. It removes adPlacements and adSlots from playable player responses before the player consumes them, covering bootstrap assignment, parsed navigation data, fetch and XHR JSON. It retains playerAds, attestation, playabilityStatus, streamingData, captions and media URLs. It never seeks, mutes, speeds up videos or clicks skip buttons.

Playback requests still bypass generic domain filters to prevent the earlier endless-loading failure. Player data is filtered separately. Invalid payloads, unrelated endpoints, unplayable responses and network errors retain their original behavior. Pause and site exclusions disable the filter; enabling it requires a page reload, performed by the popup.

**Live YouTube ad blocking and playback remain unverified.** Server-side inserted ads and anti-block variants are not comprehensively handled. This is a development candidate, not a confirmed complete YouTube blocker.

## Update

Replace files in the existing unpacked extension folder, reload the extension in edge://extensions or chrome://extensions, and fully reload YouTube. Already loaded pages may retain older hooks until reloaded. Keep the existing extension identity to retain local settings.

## Other websites

Supported EasyList/EasyPrivacy filters, optional cosmetic cleanup, global pause, website exceptions and custom blocked domains. The popup recognizes the current hostname and supports one-click exceptions. Filter compilation supports a subset, not every EasyList feature. Source snapshots and conversion report are included; there is no automatic filter update yet.

## Validation

Run node --test. Tests check pre-consumption ad-field removal, intact video/verification data, malformed responses, unrelated requests, pause races, script registration, settings rollback and popup behavior. They do not establish live YouTube coverage.

## Licenses

Original code: MIT (LICENSE). EasyList/EasyPrivacy data and derived rules: CC BY-SA 3.0, The EasyList authors, https://easylist.to/; see filters/NOTICE.md. Inter: SIL Open Font License. Branding derives from owner-provided logos. Shared UI: assets/ui/README.md.
