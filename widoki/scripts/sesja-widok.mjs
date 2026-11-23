// Jeden widok HTML jako sekcja wspólnej strony sesji (bez iframe, żeby Lavish mógł przypinać komentarze do treści).
// Izolacja: style w @scope sekcji (:root, html, body → :scope), identyfikatory z prefiksem widoku (także w odwołaniach
// href="#…", url(#…), for, aria-*), skrypty w funkcji z `document` zawężonym do sekcji (getElementById, querySelector*).

const re = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ODWOLANIA = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'list', 'form', 'headers'];

/** Reguły, których nie wolno zagnieździć w @scope: @import, @font-face, @keyframes, @property, @charset. */
function wyjmijGlobalne(css) {
  const glob = [], reszta = [];
  let i = 0;
  while (i < css.length) {
    const m = /@(import|charset|font-face|keyframes|-webkit-keyframes|property)\b/g;
    m.lastIndex = i;
    const t = m.exec(css);
    if (!t) { reszta.push(css.slice(i)); break; }
    reszta.push(css.slice(i, t.index));
    if (t[1] === 'import' || t[1] === 'charset') {
      const k = css.indexOf(';', t.index);
      glob.push(css.slice(t.index, k + 1)); i = k + 1; continue;
    }
    let j = css.indexOf('{', t.index), d = 0;
    for (; j < css.length; j++) { if (css[j] === '{') d++; else if (css[j] === '}' && --d === 0) break; }
    glob.push(css.slice(t.index, j + 1)); i = j + 1;
  }
  return { glob: glob.join('\n'), reszta: reszta.join('') };
}

function prefiksujCss(css, ids, P) {
  return css.replace(/#([A-Za-z_][\w-]*)/g, (c, n) => (ids.has(n) ? `#${P}${n}` : c));
}

function zakresCss(css, i) {
  const s = css.replace(/:root\b/g, ':scope')
    .replace(/(^|[{},\s>+~])html\s+body\b/g, '$1:scope')
    .replace(/(^|[{},\s>+~])(html|body)\b(?![-\w])/g, '$1:scope');
  return `@scope ([data-widok="${i}"]) {\n${s}\n}`;
}

function prefiksujHtml(html, ids, P) {
  const jeden = (v) => (ids.has(v) ? P + v : v);
  let h = html.replace(/(\sid=")([^"]+)"/g, (c, a, v) => `${a}${jeden(v)}"`);
  h = h.replace(/(\s(?:xlink:)?href="#)([^"]+)"/g, (c, a, v) => `${a}${jeden(v)}"`);
  h = h.replace(/url\(#([^)\s]+)\)/g, (c, v) => `url(#${jeden(v)})`);
  const atr = new RegExp(`(\\s(?:${ODWOLANIA.map(re).join('|')})=")([^"]+)"`, 'g');
  return h.replace(atr, (c, a, v) => `${a}${v.split(/\s+/).map(jeden).join(' ')}"`);
}

/** Rozkłada dokument widoku na części do złożenia w stronie sesji. */
export function skladajWidok(html, i) {
  const P = `w${i}-`;
  const style = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  const linki = [...html.matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)].map((m) => m[0]);
  const zrodla = [...html.matchAll(/<script\b[^>]*\bsrc=[^>]*><\/script>/gi)].map((m) => m[0]);
  const b = /<body([^>]*)>([\s\S]*?)(?:<\/body>|$)/i.exec(html);
  let body = b ? b[2] : html;
  const skrypty = [...body.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  body = body.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const ids = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const klasa = b && /\sclass="([^"]*)"/.exec(b[1]);
  const { glob, reszta } = wyjmijGlobalne(style);
  const js = skrypty.map((s) => s.replace(/window\.lavish\?\.setDocumentMeta\?\.\([\s\S]*?\)\s*;?/g, ''))
    .map((s) => `(function(document){\n${s}\n})(widokDokument(${i}));`).join('\n');
  return {
    glowa: [...linki, ...zrodla].join('\n'),
    css: `${glob}\n${zakresCss(prefiksujCss(reszta, ids, P), i)}`,
    body: prefiksujHtml(body, ids, P),
    klasa: klasa ? klasa[1] : '',
    js,
  };
}

/** Skrypt strony: `document` zawężony do sekcji widoku (identyfikatory z prefiksem, zapytania w sekcji). */
export const SKRYPT_ZAKRESU = `function widokDokument(i){const R=document.querySelector('[data-widok="'+i+'"]'),P='w'+i+'-';
const rw=s=>s.replace(/#([A-Za-z_][\\w-]*)/g,(c,n)=>document.getElementById(P+n)?'#'+P+n:c);
const own={getElementById:id=>document.getElementById(P+id)||null,querySelector:s=>R.querySelector(rw(s)),querySelectorAll:s=>R.querySelectorAll(rw(s)),body:R};
return new Proxy(document,{get(t,k){if(k in own)return own[k];const v=Reflect.get(t,k);return typeof v==='function'?v.bind(t):v}})}`;
