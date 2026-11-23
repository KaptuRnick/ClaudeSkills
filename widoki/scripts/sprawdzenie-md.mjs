// Lista „Do sprawdzenia” z Markdown (zapas dla projektów bez skryptu zrzutów): nagłówki, akapity, listy numerowane (numery
// jak w pliku) i punktowane, **pogrubienie**, `kod`, [link](adres) i gołe adresy.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

export function mdNaHtml(tekst) {
  const html = [];
  let lista = null;
  const zamknij = () => { if (lista) { html.push(`</${lista}>`); lista = null; } };
  for (const linia of tekst.split('\n')) {
    const h = /^(#{1,3})\s+(.*)$/.exec(linia);
    const ol = /^\s*(\d+)\.\s+(.*)$/.exec(linia);
    const ul = /^\s*[-*]\s+(.*)$/.exec(linia);
    if (h) { zamknij(); const n = h[1].length; html.push(`<h${n}>${inline(h[2])}</h${n}>`); }
    else if (ol) { if (lista !== 'ol') { zamknij(); html.push('<ol class="md">'); lista = 'ol'; } html.push(`<li value="${ol[1]}">${inline(ol[2])}</li>`); }
    else if (ul) { if (lista !== 'ul') { zamknij(); html.push('<ul>'); lista = 'ul'; } html.push(`<li>${inline(ul[1])}</li>`); }
    else if (linia.trim()) { zamknij(); html.push(`<p>${inline(linia)}</p>`); }
    else zamknij();
  }
  zamknij();
  return html.join('\n');
}
