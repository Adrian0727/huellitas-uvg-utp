/* Íconos de línea (estilo SF Symbols) e ilustraciones de productos. */
const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  bag: '<path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c1.4-3.6 4.2-5.5 7.5-5.5s6.1 1.9 7.5 5.5"/>',
  leaf: '<path d="M5 19C5 11 10.5 5 19 5c0 8.5-6 14-14 14z"/><path d="M5 19l8-8"/>',
  truck: '<path d="M3 6.5h11v10H3z"/><path d="M14 10h3.8l3.2 3.4v3.1H14"/><circle cx="7" cy="18" r="1.7"/><circle cx="17.5" cy="18" r="1.7"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  left: '<path d="M14.5 6l-6 6 6 6"/>',
  right: '<path d="M9.5 6l6 6-6 6"/>',
  down: '<path d="M6 9.5l6 6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  bank: '<path d="M3 9l9-5 9 5M5 10v7M10 10v7M14 10v7M19 10v7M3 20h18"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  box: '<path d="M3.5 7.5L12 3.5l8.5 4-8.5 4z"/><path d="M3.5 7.5v9l8.5 4 8.5-4v-9M12 11.5v9"/>',
  store: '<path d="M4 9.5V20h16V9.5"/><path d="M3 9.5l2-5.5h14l2 5.5c0 1.4-1.2 2.5-2.6 2.5s-2.6-1.1-2.6-2.5c0 1.4-1.2 2.5-2.6 2.5h-2.4c-1.4 0-2.6-1.1-2.6-2.5 0 1.4-1.2 2.5-2.6 2.5S3 10.9 3 9.5z"/><path d="M10 20v-5h4v5"/>',
  building: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20.5v-4h3v4"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.5v.1"/>',
  x: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 8v.1"/>',
  upload: '<path d="M12 15V4.5M7.5 9L12 4.5 16.5 9"/><path d="M4.5 15v4.5h15V15"/>',
  recycle: '<path d="M7 19h10l-2.5-4.5M4.5 14.5L9.5 6l2.5 4.5"/><path d="M19.5 14.5L14.5 6h-5"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  receipt: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  shield: '<path d="M12 3.5l7 3v5.5c0 4.3-3 7.6-7 8.5-4-.9-7-4.2-7-8.5V6.5z"/><path d="M9 12l2 2 4-4"/>',
  logout: '<path d="M15 4.5h3.5v15H15"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  sparkle: '<path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z"/>',
  cat: '<path d="M6 20v-8l-1.5-6 4 3h7l4-3-1.5 6v8z"/><path d="M10 13v.1M14 13v.1"/>',
  dog: '<path d="M7 20v-6c0-3 2-5.5 5-5.5s5 2.5 5 5.5v6z"/><path d="M8 10L5 6.5 4 11M16 10l3-3.5 1 4.5"/><path d="M11 15.5h2"/>',
  fish: '<path d="M3 12c3-4 7-5.5 11-4.5 2.3.6 4 2.2 5 4.5-1 2.3-2.7 3.9-5 4.5-4 1-8-.5-11-4.5z"/><path d="M19 12l2.5-2.5v5z"/><path d="M8 11v.1"/>'
};

function icon(name, size = 22, extra = '') {
  return `<svg class="ico" viewBox="0 0 24 24" style="width:${size}px;height:${size}px" aria-hidden="true" ${extra}>${ICONS[name] || ''}</svg>`;
}

/* Ilustraciones de línea para los productos que no tienen foto */
const ARTS = {
  bed: '<rect x="14" y="44" width="72" height="26" rx="13"/><path d="M22 44c0-9 8-14 28-14s28 5 28 14"/><path d="M30 70v6M70 70v6"/>',
  collar: '<ellipse cx="50" cy="46" rx="28" ry="20"/><ellipse cx="50" cy="46" rx="21" ry="14"/><circle cx="50" cy="72" r="7"/><path d="M50 66v-6"/>',
  tower: '<path d="M26 82h48"/><rect x="32" y="30" width="10" height="52" rx="3"/><rect x="58" y="50" width="10" height="32" rx="3"/><rect x="22" y="22" width="30" height="9" rx="4.5"/><rect x="50" y="42" width="30" height="9" rx="4.5"/><path d="M74 51v12"/><circle cx="74" cy="66" r="3.5"/>',
  ball: '<circle cx="50" cy="50" r="26"/><path d="M27 40c14 6 32 6 46 0M27 60c14-6 32-6 46 0"/>',
  harness: '<path d="M28 34c10 10 34 10 44 0"/><path d="M30 34l6 30h28l6-30"/><rect x="40" y="46" width="20" height="12" rx="3"/><path d="M50 64v12"/>',
  bowl: '<path d="M18 50h64c-2 16-15 26-32 26S20 66 18 50z"/><path d="M30 50c4-6 12-9 20-9s16 3 20 9"/>',
  fountain: '<rect x="28" y="52" width="44" height="26" rx="8"/><path d="M50 52V34M50 34c-6 0-10 4-12 9M50 34c6 0 10 4 12 9"/>',
  cage: '<rect x="24" y="30" width="52" height="46" rx="6"/><path d="M36 30v46M50 30v46M64 30v46M24 46h52"/><path d="M40 30c0-8 20-8 20 0"/>',
  brush: '<rect x="22" y="40" width="40" height="16" rx="5"/><path d="M28 56v8M36 56v8M44 56v8M52 56v8M62 48h16"/>',
  carrier: '<rect x="20" y="36" width="60" height="38" rx="8"/><path d="M38 36c0-8 24-8 24 0"/><rect x="30" y="46" width="22" height="18" rx="3"/><path d="M36 46v18M42 46v18M48 46v18"/>',
  leash: '<path d="M30 24c-8 0-12 6-12 12s4 12 12 12"/><path d="M30 48c10 0 14 6 20 14s14 16 26 16"/><rect x="24" y="18" width="14" height="12" rx="4"/>',
  tank: '<rect x="20" y="30" width="60" height="44" rx="6"/><path d="M20 42h60"/><path d="M36 62c4-4 10-4 14 0-4 4-10 4-14 0zM50 62l5-3v6z"/>',
  box: '<path d="M22 38l28-12 28 12-28 12z"/><path d="M22 38v26l28 12 28-12V38M50 50v26"/>'
};

function art(key, size = 110) {
  return `<svg class="ico" viewBox="0 0 100 100" style="width:${size}px;height:${size}px;stroke-width:1.75" aria-hidden="true">${ARTS[key] || ARTS.box}</svg>`;
}

/* Logo de Huellitas: huella de mascota con una hoja en la almohadilla (toque ecológico).
   También está como archivo en img/logo.svg */
function logo(size = 36) {
  return `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;flex:none" role="img" aria-label="Huellitas">
    <rect width="24" height="24" rx="7" fill="#2f6b4f"/>
    <g fill="#fff">
      <ellipse cx="6.3" cy="10.6" rx="1.85" ry="2.3" transform="rotate(-22 6.3 10.6)"/>
      <ellipse cx="9.7" cy="6.9" rx="1.9" ry="2.35" transform="rotate(-8 9.7 6.9)"/>
      <ellipse cx="14.3" cy="6.9" rx="1.9" ry="2.35" transform="rotate(8 14.3 6.9)"/>
      <ellipse cx="17.7" cy="10.6" rx="1.85" ry="2.3" transform="rotate(22 17.7 10.6)"/>
      <path d="M12 11.4c-3.3 0-6.1 3.5-6.1 6 0 1.7 1.4 2.6 3 2.6 1.3 0 2-.7 3.1-.7s1.8.7 3.1.7c1.6 0 3-.9 3-2.6 0-2.5-2.8-6-6.1-6z"/>
    </g>
    <path d="M12 19.2v-5.4M12 17.2l-1.7-1.3M12 15.6l1.7-1.3" stroke="#2f6b4f" stroke-width=".95" stroke-linecap="round" fill="none"/>
  </svg>`;
}
