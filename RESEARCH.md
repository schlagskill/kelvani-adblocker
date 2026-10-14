# Implementation references

Consulted 13 October 2026. Page content was treated as reference data; application implementation is original.

- Chrome declarativeNetRequest API: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest . Used for native rule conditions, static/dynamic rule precedence and hypothetical request diagnosis.
- Chrome scripting API: https://developer.chrome.com/docs/extensions/reference/api/scripting . Used for opt-in persistent MAIN-world document_start script registration, excluding opted-out sites.
- EasyList/EasyPrivacy overview: https://easylist.to/ . Licensed filter data, attributed separately.
- uAssets current YouTube filter reference: https://github.com/uBlockOrigin/uAssetsCDN/blob/main/filters/quick-fixes.txt . Consulted to understand player-response fields and the limits of site-specific approaches. No scriptlet implementation was copied.

No source provides a guarantee of universal adblock invisibility. Automated fixture tests and native/live-site tests are reported separately.


## YouTube update 0.3.2

Official browser API reference: https://developer.chrome.com/docs/extensions/reference/api/scripting and https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts . Registered MAIN-world scripts use document_start, so enabling the module requires reloading existing YouTube pages. Our targeted fetch/XHR code is original; no global JSON.parse override or playback/attestation bypass is used. Tests use controlled fixtures, not a claim of verified live ad blocking.


## 0.3.3: Playback incident

User reported endless loading in 0.3.2. Player mutation is withdrawn. Fixtures check unchanged APIs and registration cleanup; native playback and complete ad blocking remain unverified.
