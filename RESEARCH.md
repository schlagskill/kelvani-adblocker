# Implementation references

Consulted 13 October 2026. Page content was treated as reference data; application implementation is original.

- Chrome declarativeNetRequest API: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest . Used for native rule conditions, static/dynamic rule precedence and hypothetical request diagnosis.
- Chrome scripting API: https://developer.chrome.com/docs/extensions/reference/api/scripting . Used for opt-in persistent MAIN-world document_start script registration, excluding opted-out sites.
- EasyList/EasyPrivacy overview: https://easylist.to/ . Licensed filter data, attributed separately.
- uAssets current YouTube filter reference: https://github.com/uBlockOrigin/uAssetsCDN/blob/main/filters/quick-fixes.txt . Consulted to understand player-response fields and the limits of site-specific approaches. No scriptlet implementation was copied.

No source provides a guarantee of universal adblock invisibility. Automated fixture tests and native/live-site tests are reported separately.
