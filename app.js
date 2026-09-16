'use strict';
const $ = id => document.getElementById(id);
const canvas = $('chart'), ctx = canvas.getContext('2d');
let samples = [], view, initial, frame, width, height, area;
const fmt = (value, digits = 3) => value.toLocaleString('ca-ES', {maximumFractionDigits: digits});
// NumPy rounds exact ties to the nearest even integer.
function roundEven(value) { const floor = Math.floor(value); return value - floor === 0.5 ? floor + (floor % 2) : Math.round(value); }
function update() {
  const amplitude = Number($('amplitude').value), bits = Number($('bits').value), range = Number($('range').value);
  const levels = 2 ** bits, lsb = 2 * range / levels;
  samples = Array.from({length: 1000}, (_, i) => {
    const t = i / 999, analog = amplitude * Math.sin(2 * Math.PI * t);
    const digital = roundEven((Math.max(-range, Math.min(range, analog)) + range) / lsb) * lsb - range;
    return {t, analog, digital};
  });
  $('lsb').textContent = `${fmt(lsb * 1000, 3)} mV`;
  $('levels').textContent = fmt(levels, 0);
  $('status').textContent = amplitude > range ? 'Saturació' : 'Dins del rang';
  $('status').classList.toggle('warning', amplitude > range);
  canvas.setAttribute('aria-label', `Sinusoide d’${amplitude} V, ADC de ${bits} bits, rang de −${range} a ${range} V. Resolució ${fmt(lsb * 1000)} mV. ${$('status').textContent}.`);
  initial = {x0: 0, x1: 1, y0: -amplitude * 1.16, y1: amplitude * 1.16};
  view = {...initial}; schedule();
}
function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); }
function draw() {
  const rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  width = rect.width; height = rect.height;
  if (!width || !height) return;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  area = {left: width < 400 ? 46 : 58, right: width - 14, top: 17, bottom: height - 33};
  const x = t => area.left + (t - view.x0) / (view.x1 - view.x0) * (area.right - area.left);
  const y = v => area.bottom - (v - view.y0) / (view.y1 - view.y0) * (area.bottom - area.top);
  ctx.font = '10px system-ui'; ctx.lineWidth = 1;
  const rows = height < 200 ? 2 : 4, cols = width < 400 ? 4 : 5;
  for (let i = 0; i <= rows; i++) {
    const v = view.y0 + (view.y1 - view.y0) * i / rows, py = y(v);
    ctx.strokeStyle = '#e4ecea'; ctx.beginPath(); ctx.moveTo(area.left, py); ctx.lineTo(area.right, py); ctx.stroke();
    ctx.fillStyle = '#58716e'; ctx.textAlign = 'right'; ctx.fillText(fmt(v, 2), area.left - 7, py + 3);
  }
  for (let i = 0; i <= cols; i++) {
    const t = view.x0 + (view.x1 - view.x0) * i / cols, px = x(t);
    ctx.strokeStyle = '#e4ecea'; ctx.beginPath(); ctx.moveTo(px, area.top); ctx.lineTo(px, area.bottom); ctx.stroke();
    ctx.fillStyle = '#58716e'; ctx.textAlign = 'center'; ctx.fillText(fmt(t, 3), px, area.bottom + 14);
  }
  ctx.textAlign = 'left'; ctx.fillText('V', 7, 13);
  ctx.textAlign = 'center'; ctx.fillText('Temps (s)', (area.left + area.right) / 2, height - 3);
  ctx.save(); ctx.beginPath(); ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top); ctx.clip();
  ctx.strokeStyle = '#47616c'; ctx.lineWidth = 1.7; ctx.setLineDash([5, 4]); ctx.beginPath();
  samples.forEach((s, i) => i ? ctx.lineTo(x(s.t), y(s.analog)) : ctx.moveTo(x(s.t), y(s.analog))); ctx.stroke();
  ctx.setLineDash([]); ctx.strokeStyle = '#df653b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(samples[0].t), y(samples[0].digital));
  for (let i = 1; i < samples.length; i++) { const a = samples[i - 1], b = samples[i], mid = x((a.t + b.t) / 2); ctx.lineTo(mid, y(a.digital)); ctx.lineTo(mid, y(b.digital)); }
  ctx.lineTo(x(1), y(samples[999].digital)); ctx.stroke(); ctx.restore();
}
function zoom(factor, rx = 0.5, ry = 0.5) {
  const span = view.x1 - view.x0;
  factor = Math.max(0.002 / span, Math.min(4 / span, factor));
  const dx = span, dy = view.y1 - view.y0;
  view.x0 += dx * rx * (1 - factor); view.x1 = view.x0 + dx * factor;
  view.y0 += dy * ry * (1 - factor); view.y1 = view.y0 + dy * factor; schedule();
}
['amplitude', 'bits', 'range'].forEach(id => $(id).addEventListener('change', update));
$('zoom-in').onclick = () => zoom(1 / 1.4);
$('zoom-out').onclick = () => zoom(1.4);
$('reset').onclick = () => { view = {...initial}; schedule(); };
canvas.addEventListener('wheel', e => {
  e.preventDefault(); if (!area) return;
  const r = canvas.getBoundingClientRect();
  zoom(e.deltaY < 0 ? 1 / 1.2 : 1.2, Math.max(0, Math.min(1, (e.clientX - r.left - area.left) / (area.right - area.left))), Math.max(0, Math.min(1, (area.bottom - e.clientY + r.top) / (area.bottom - area.top))));
}, {passive: false});
const pointers = new Map();
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, {x: e.clientX, y: e.clientY}); });
canvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId) || !area) return;
  const prev = pointers.get(e.pointerId), next = {x: e.clientX, y: e.clientY};
  if (pointers.size === 2) {
    const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)[1];
    const before = Math.hypot(prev.x - other.x, prev.y - other.y), after = Math.hypot(next.x - other.x, next.y - other.y);
    if (before > 5 && after > 5) zoom(before / after);
  } else if (pointers.size === 1) {
    const dx = (next.x - prev.x) / (area.right - area.left) * (view.x1 - view.x0);
    const dy = (next.y - prev.y) / (area.bottom - area.top) * (view.y1 - view.y0);
    view.x0 -= dx; view.x1 -= dx; view.y0 += dy; view.y1 += dy; schedule();
  }
  pointers.set(e.pointerId, next);
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, e => pointers.delete(e.pointerId)));
new ResizeObserver(schedule).observe(canvas.parentElement);
window.addEventListener('resize', schedule);
let installPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
$('install').onclick = async () => {
  if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; }
  else $('install-help').showModal();
};
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
    $('offline').textContent = 'Disponible sense connexió';
  }).catch(() => { $('offline').textContent = 'Ús sense connexió no disponible'; });
} else $('offline').textContent = 'Obre amb HTTPS o localhost';
update();
