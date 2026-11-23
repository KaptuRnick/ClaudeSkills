// Style zakładki „Do sprawdzenia”: karty ze zrzutami, nagłówek wyniku, przełącznik OK / Nie ok z polem uwag, pasek wysyłki.
export const STYL = `
:root{--ivory:#FAF9F5;--slate:#141413;--clay:#D97757;--oat:#E3DACC;--mute:#8a877f;--sky:#6A9BCC;--ok:#3f7d3a;--nie:#c0453a}
*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--slate);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1100px;margin:0 auto;padding:24px 20px 60px}
h1{font-size:24px;margin:0 0 4px}h2{font-size:19px;margin:28px 0 8px}.adres{margin:0 0 6px}.pods{color:var(--mute);margin:0 0 18px}
a{color:#b5552f}code{font:13.5px ui-monospace,monospace;background:#efe9df;padding:0 4px;border-radius:3px}
.karty{display:grid;gap:18px}
.karta{background:#fff;border:1px solid var(--oat);border-radius:12px;overflow:hidden}
.karta header{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--oat)}
.karta .nr{flex:none;width:32px;height:32px;border-radius:50%;background:var(--clay);color:#fff;font-weight:700;display:grid;place-items:center}
.karta.ukryta .nr{background:var(--sky)}.karta.ukryta{border-color:#c9daea}
.karta .akcja{font-weight:600}.karta .kod{margin-left:auto;font:12px ui-monospace,monospace;color:var(--mute);white-space:nowrap}
.zr{display:grid;grid-template-columns:minmax(0,360px) auto minmax(0,360px);justify-content:center;gap:14px;align-items:center;padding:14px 14px 4px}
.zr.jeden{grid-template-columns:minmax(0,360px)}
.zr figure{margin:0}.zr img{width:100%;display:block;border:1px solid var(--oat);border-radius:10px}
.zr figcaption{font-size:12px;color:var(--mute);margin-top:4px;text-align:center}
.strz{font-size:30px;color:var(--clay)}
.opis{padding:12px 16px 0;margin:0}.opis p{margin:4px 0}
.odp{padding:6px 16px 14px}
.ma-byc{font-size:17px;font-weight:700;margin:6px 0 10px;line-height:1.35}
.odp-rzad{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center}
.przel{display:inline-flex;align-items:center;gap:10px;font-size:15px;font-weight:700;cursor:pointer;user-select:none}
.przel input{position:absolute;opacity:0;pointer-events:none}
.przel .tor{position:relative;width:46px;height:26px;border-radius:13px;background:#d8d2c6;transition:background .15s}
.przel .tor::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;transition:transform .15s}
.przel input:checked+.tor{background:var(--ok)}.przel input:checked+.tor::after{transform:translateX(20px)}
.przel input:focus-visible+.tor{outline:3px solid var(--slate);outline-offset:2px}
.nie-ok{padding:8px 12px;border:1px dashed #e3a49d;border-radius:8px;color:var(--nie);font-size:13.5px}
.karta:has(.odp-ok:checked){border-color:#a9c9a4}.karta:has(.odp-ok:checked) .nie-ok{opacity:.45}
.uwagi textarea{width:100%;font:inherit;font-size:14px;padding:8px;border:1px solid var(--oat);border-radius:8px;resize:vertical}
ol.md li{margin:10px 0;padding:10px 12px;background:#fff;border:1px solid var(--oat);border-radius:8px}ol.md li::marker{font-weight:700;color:var(--clay)}
.uwagi{margin-top:28px;padding:12px 16px;background:#fff;border:1px dashed var(--oat);border-radius:12px}.uwagi h2{font-size:15px;margin:0 0 2px}.uwagi p{margin:0 0 8px;font-size:13px;color:var(--mute)}
.wysylka{position:sticky;bottom:0;display:flex;align-items:center;gap:12px;margin-top:16px;padding:10px 16px;background:var(--ivory);border-top:1px solid var(--oat)}
.wysylka button{font:inherit;font-size:14px;font-weight:600;padding:8px 16px;border:0;border-radius:8px;background:var(--clay);color:#fff;cursor:pointer}
.wysylka [role=status]{font-size:13px;color:var(--mute)}
@media (max-width:760px){.zr{grid-template-columns:1fr}.strz{transform:rotate(90deg);justify-self:center}.odp-rzad{grid-template-columns:1fr}}
`;
