/* ============================================================================
 *  app.js — Navegación, render y lógica de negocio
 *  Plataforma de Matrícula UPN · Interacción Humano-Computador
 *
 *  Principio rector: TODAS las pantallas (en especial Resumen y Validaciones)
 *  se derivan de STATE. No hay datos hardcodeados en esas vistas.
 * ========================================================================== */
'use strict';

/* ----------------------------- Utilidades -------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
// pad2() y la lógica de negocio (getCourse, getConflicts, etc.) viven en js/rules.js
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const ROW_H = 56;            // debe coincidir con --cal-row en styles.css
let focusAfterRender = null; // selector a re-enfocar tras un re-render

/* ----------------------------- Iconos SVG -------------------------------- */
const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS = {
  home:    I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'),
  doc:     I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  catalog: I('<path d="M4 5h16v14H4z"/><path d="M9 5v14M14 5v14"/>'),
  calendar:I('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'),
  shield:  I('<path d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z"/>'),
  chart:   I('<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>'),
  user:    I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  history: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v5l3 2"/>'),
  help:    I('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'),
  logout:  I('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>'),
  menu:    I('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  moon:    I('<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z"/>'),
  sun:     I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>'),
  bell:    I('<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  chevron: I('<path d="M6 9l6 6 6-6"/>'),
  search:  I('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>'),
  filter:  I('<path d="M3 5h18l-7 8v6l-4-2v-4z"/>'),
  clock:   I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pin:     I('<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  users:   I('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.3 3.1-5 7-5s7 1.7 7 5"/><path d="M16 5a3.5 3.5 0 0 1 0 7M22 20c0-2.5-1.7-4.2-4-4.8"/>'),
  trash:   I('<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/>'),
  check:   I('<path d="M5 12l5 5 9-11"/>'),
  checkCircle: I('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5 5-6"/>'),
  warning: I('<path d="M12 3l9.5 16.5H2.5z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".7" fill="currentColor"/>'),
  alert:   I('<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16" r=".7" fill="currentColor"/>'),
  info:    I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".7" fill="currentColor"/>'),
  plus:    I('<path d="M12 5v14M5 12h14"/>'),
  minus:   I('<path d="M5 12h14"/>'),
  arrowL:  I('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  arrowR:  I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  upRight: I('<path d="M7 17 17 7M9 7h8v8"/>'),
  bulb:    I('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.6.6-1 1.3-1 2.2H9c0-.9-.4-1.6-1-2.2A6 6 0 0 1 12 3z"/>'),
  mega:    I('<path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>'),
  grad:    I('<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2.5 9 2.5 12 0v-5"/>'),
  award:   I('<circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 21l4-2 4 2-1-7.5"/>'),
  book:    I('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M19 19H6"/>'),
  headset: I('<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2zM20 13a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2z"/><path d="M18 19a4 4 0 0 1-4 3h-2"/>'),
  star:    I('<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8z"/>'),
  trend:   I('<path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v5h-5"/>'),
  list:    I('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="3.5" cy="12" r="1" fill="currentColor"/><circle cx="3.5" cy="18" r="1" fill="currentColor"/>'),
  download:I('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>'),
  x:       I('<path d="M6 6l12 12M18 6 6 18"/>'),
};
function fillIcons(root = document) {
  $$('[data-icon]', root).forEach((el) => {
    const name = el.getAttribute('data-icon');
    if (ICONS[name]) el.innerHTML = ICONS[name];
  });
}

/* La LÓGICA DE NEGOCIO (RN-1…RN-6, métricas del historial) está en js/rules.js */

/* ============================================================================
 *  ACCIONES
 * ========================================================================== */
function addCourse(code) {
  if (STATE.confirmed) { toast('Matrícula confirmada', 'No puedes modificar tu matrícula.', 'error'); return; }
  const c = getCourse(code);
  if (!c || STATE.selectedCourses.includes(code)) return;
  if (seatsLeft(c) <= 0) { toast('Sin cupos', `${c.name} no tiene cupos disponibles.`, 'error'); return; } // RN-4

  STATE.selectedCourses.push(code);

  // Feedback inmediato según las reglas (se permite agregar, pero se advierte)
  const missing = c.prerequisites.filter((p) => !STATE.approvedCourses.includes(p));
  const clashes = getConflicts().filter((p) => p.a.code === code || p.b.code === code);
  if (missing.length) {                                                   // RN-2
    const m = missing.map((mc) => `${getCourse(mc) ? getCourse(mc).name : mc} (${mc})`).join(', ');
    toast('Prerrequisito pendiente', `Agregaste ${c.name}, pero falta aprobar ${m}.`, 'warning');
  } else if (clashes.length) {                                            // RN-3
    const other = clashes[0].a.code === code ? clashes[0].b : clashes[0].a;
    toast('Cruce de horario', `${c.name} se cruza con ${other.name}. Revísalo antes de confirmar.`, 'warning');
  } else if (creditExcess() > 0) {                                        // RN-1
    toast('Excediste el máximo', `Vas ${totalCredits()}/${STATE.maxCredits} créditos. Reduce ${creditExcess()} para confirmar.`, 'warning');
  } else {
    toast('Curso agregado', `${c.name} se añadió a tu matrícula.`, 'success');
  }
  saveState();
  render();
}

function removeCourse(code) {
  if (STATE.confirmed) { toast('Matrícula confirmada', 'No puedes modificar tu matrícula.', 'error'); return; }
  const c = getCourse(code);
  STATE.selectedCourses = STATE.selectedCourses.filter((x) => x !== code);
  toast('Curso quitado', `${c ? c.name : code} se eliminó de tu selección.`, 'info');
  saveState();
  render();
}

function confirmEnrollment() {
  if (STATE.confirmed) return;
  if (STATE.selectedCourses.length === 0) { toast('Sin cursos', 'Agrega al menos un curso para matricularte.', 'error'); return; }
  const errs = getValidationErrors();
  if (errs.hasErrors) {                                                   // RN-1/2/3
    toast('Revisa las validaciones', `Tienes ${errs.count} alerta(s) que impiden confirmar.`, 'error');
    navigate('validaciones');
    return;
  }
  STATE.confirmed = true;                                                 // RN-5
  saveState();
  openSuccessModal();
  render();
}

function toggleTheme() {
  closeAllPopovers();
  const dark = STATE.ui.theme === 'dark';
  STATE.ui.theme = dark ? 'light' : 'dark';
  applyTheme();
  try { localStorage.setItem('upn-theme', STATE.ui.theme); } catch (e) {}
  if (STATE.ui.currentView === 'analisis') renderCharts();
}
function applyTheme() {
  const dark = STATE.ui.theme === 'dark';
  document.documentElement.setAttribute('data-theme', STATE.ui.theme);
  const btn = $('#theme-toggle');
  if (btn) {
    btn.querySelector('[data-icon]').innerHTML = dark ? ICONS.sun : ICONS.moon;
    btn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    btn.setAttribute('aria-pressed', String(dark));
  }
}

function toggleSidebar(force) {
  STATE.ui.sidebarOpen = typeof force === 'boolean' ? force : !STATE.ui.sidebarOpen;
  document.body.classList.toggle('sidebar-open', STATE.ui.sidebarOpen);
  const ov = $('#overlay');
  if (ov) ov.hidden = !STATE.ui.sidebarOpen;
}

/* --- Persistencia ligera de la matrícula (localStorage) --- */
function saveState() {
  try { localStorage.setItem('upn-state', JSON.stringify({ selectedCourses: STATE.selectedCourses, confirmed: STATE.confirmed })); } catch (e) {}
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('upn-state') || 'null');
    if (!s) return;
    if (Array.isArray(s.selectedCourses)) STATE.selectedCourses = s.selectedCourses.filter(getCourse);
    STATE.confirmed = !!s.confirmed;
  } catch (e) {}
}
function resetDemo() {
  try { localStorage.removeItem('upn-state'); } catch (e) {}
  STATE.selectedCourses = [];
  STATE.confirmed = false;
  closeAllPopovers();
  navigate('inicio');
  toast('Demo reiniciada', 'Se limpió la matrícula seleccionada.', 'info');
}

/* --- Popovers de la barra superior (notificaciones / usuario) --- */
function closeAllPopovers() {
  ['pop-notifs', 'pop-user'].forEach((id) => { const p = $('#' + id); if (p) p.hidden = true; });
  ['btn-notifs', 'btn-user'].forEach((id) => { const b = $('#' + id); if (b) b.setAttribute('aria-expanded', 'false'); });
}
function togglePopover(id, btnId) {
  const p = $('#' + id), btn = $('#' + btnId);
  if (!p || !btn) return;
  const willOpen = p.hidden;
  closeAllPopovers();
  if (willOpen) {
    p.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const first = p.querySelector('button, [href], [tabindex]');
    if (first) first.focus();
  }
}
function renderNotifs() {
  const list = $('#notifs-list');
  if (!list) return;
  list.innerHTML = NOTIFICATIONS.map((n) => `<div class="notif-item">
    <span class="notif-item__icon" data-icon="${n.icon}" aria-hidden="true"></span>
    <div><div class="notif-item__title">${esc(n.title)}</div><div class="notif-item__text">${esc(n.text)}</div><div class="notif-item__time">${esc(n.time)}</div></div>
  </div>`).join('');
  fillIcons(list);
}

/* --- Comprobante de matrícula imprimible (Guardar como PDF) --- */
function printComprobante() {
  const sel = selectedObjs();
  const t = computeTurno();
  const root = $('#comprobante-root');
  if (!root) return;
  root.innerHTML = `<div class="comprobante">
    <div class="comprobante__head">
      <div><h1>Universidad Nacional</h1><p>Comprobante de matrícula · Semestre 2024-II</p></div>
    </div>
    <div class="comprobante__meta">
      <div><b>Estudiante</b>${esc(STATE.student.name)}</div>
      <div><b>Código</b>${esc(STATE.student.code)}</div>
      <div><b>Carrera</b>${esc(STATE.student.career)}</div>
      <div><b>Turno</b>${t.dateLabel} · ${t.timeLabel}</div>
      <div><b>Estado</b>${STATE.confirmed ? 'CONFIRMADA' : 'EN PROCESO'}</div>
    </div>
    <table>
      <thead><tr><th>Código</th><th>Curso</th><th>Sección</th><th>Horario</th><th>Créditos</th></tr></thead>
      <tbody>${sel.map((c) => `<tr><td>${esc(c.code)}</td><td>${esc(c.name)}</td><td>${esc(c.section || '001')}</td><td>${schedLines(c).map(esc).join(' / ')}</td><td>${c.credits}</td></tr>`).join('')}</tbody>
    </table>
    <div class="comprobante__total">Total de créditos: ${totalCredits()}</div>
    <div class="comprobante__foot">Documento generado por la Plataforma de Matrícula UPN — proyecto académico de Interacción Humano-Computador. Comprobante simulado con fines educativos.</div>
  </div>`;
  document.body.classList.add('print-comprobante');
  const cleanup = () => { document.body.classList.remove('print-comprobante'); window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup);
  toast('Comprobante', 'Se abrirá el diálogo de impresión. Elige "Guardar como PDF".', 'info');
  setTimeout(() => window.print(), 400);
}

/* ============================================================================
 *  NAVEGACIÓN
 * ========================================================================== */
const VIEW_META = {
  inicio:       { title: '¡Hola, María!',            subtitle: 'Bienvenida al sistema de matrícula' },
  matricula:    { title: 'Resumen de matrícula',     subtitle: 'Revisa y confirma los cursos que llevarás este semestre.' },
  catalogo:     { title: 'Catálogo de cursos',       subtitle: 'Explora y agrega los cursos que deseas llevar este semestre.' },
  horario:      { title: 'Mi horario',               subtitle: 'Calendario semanal que se actualiza con cada curso seleccionado.' },
  validaciones: { title: 'Prevención de errores / Validaciones', subtitle: 'Revisa las alertas para poder continuar con tu matrícula.' },
  analisis:     { title: 'Dashboard analítico',      subtitle: 'Visualiza tu avance académico (Semana 12 del proyecto).' },
  datos:        { title: 'Mis datos',                subtitle: 'Información personal y académica del estudiante.' },
  historial:    { title: 'Historial de matrículas',  subtitle: 'Consulta el resumen de tus matrículas realizadas por semestre.' },
  ayuda:        { title: 'Centro de ayuda',          subtitle: 'Preguntas frecuentes sobre el proceso de matrícula.' }
};

function navigate(view) {
  if (!VIEW_META[view]) view = 'inicio';
  closeAllPopovers();
  STATE.ui.currentView = view;
  $$('.nav__item[data-view]').forEach((b) => {
    const active = b.dataset.view === view;
    if (active) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  $('#topbar-title').textContent = VIEW_META[view].title;
  $('#topbar-subtitle').textContent = VIEW_META[view].subtitle;
  toggleSidebar(false);
  render();
  const v = $('#view');
  if (v) v.focus();
}

/* ============================================================================
 *  RENDER (dispatcher)
 * ========================================================================== */
const VIEWS = {
  inicio: renderInicio, matricula: renderMatricula, catalogo: renderCatalogo,
  horario: renderHorario, validaciones: renderValidaciones, analisis: renderAnalisis,
  datos: renderDatos, historial: renderHistorial, ayuda: renderAyuda
};
function setView(html) {
  const v = $('#view');
  // h2 de sección (oculto visualmente) para una jerarquía de encabezados coherente: h1(topbar) -> h2 -> h3
  const h2 = `<h2 class="sr-only">${esc((VIEW_META[STATE.ui.currentView] || {}).title || '')}</h2>`;
  v.innerHTML = h2 + html;
  fillIcons(v);
  if (focusAfterRender) {
    const el = $(focusAfterRender);
    if (el) { el.focus(); if (el.setSelectionRange) { const n = el.value.length; el.setSelectionRange(n, n); } }
    focusAfterRender = null;
  }
}
function updateValidBadge() {
  const badge = $('#nav-valid-badge');
  if (!badge) return;
  const n = getValidationErrors().count;
  if (n > 0 && !STATE.confirmed) { badge.hidden = false; badge.textContent = String(n); }
  else badge.hidden = true;
}
function render() {
  (VIEWS[STATE.ui.currentView] || renderInicio)();
  updateValidBadge();
}

/* ----------------------------- Vista: INICIO ----------------------------- */
function buildSteps() {
  const sel = STATE.selectedCourses.length;
  const conflicts = getConflicts().length;
  const done = {
    plan: true,
    cursos: sel > 0,
    horario: sel > 0 && conflicts === 0,
    confirma: STATE.confirmed
  };
  return [
    { key: 'plan',     label: 'Plan de estudios',  desc: 'Revisa los cursos de tu plan.',        icon: 'book',     done: done.plan,     view: 'matricula' },
    { key: 'cursos',   label: 'Selecciona cursos', desc: 'Agrega los cursos que deseas llevar.',  icon: 'doc',      done: done.cursos,   view: 'catalogo' },
    { key: 'horario',  label: 'Revisa tu horario', desc: 'Verifica que no existan cruces.',       icon: 'calendar', done: done.horario,  view: 'horario' },
    { key: 'confirma', label: 'Confirma matrícula',desc: 'Revisa y confirma tu matrícula.',       icon: 'check',    done: done.confirma, view: 'matricula' }
  ];
}
function stepperHTML(variant = '') {
  const steps = buildSteps();
  const firstPending = steps.findIndex((s) => !s.done);
  return `<ol class="stepper ${variant}" role="list" aria-label="Pasos para tu matrícula">${steps.map((s, i) => {
    const state = s.done ? 'is-done' : (i === firstPending ? 'is-active' : '');
    return `<li class="step ${state}">
      <span class="step__icon" data-icon="${s.done ? 'check' : s.icon}" aria-hidden="true"></span>
      <span class="step__label">${i + 1}. ${esc(s.label)}</span>
      <span class="step__desc">${esc(s.desc)}</span>
    </li>`;
  }).join('')}</ol>`;
}

function renderInicio() {
  const steps = buildSteps();
  const doneCount = steps.filter((s) => s.done).length;
  const pct = STATE.confirmed ? 100 : Math.round((doneCount / steps.length) * 100);
  const t = computeTurno();
  const statusBadge = STATE.confirmed
    ? '<span class="badge badge--green">Confirmada</span>'
    : '<span class="badge badge--green">En progreso</span>';
  const statusText = STATE.confirmed ? '¡Matrícula confirmada con éxito!' : 'Aún no has confirmado tu matrícula.';

  setView(`
    <section class="turno-card" aria-label="Turno de matrícula">
      <span class="turno-card__icon" data-icon="award" aria-hidden="true"></span>
      <div class="turno-card__body">
        <h3>Tu turno de matrícula</h3>
        <p>Orden de mérito · puesto <strong>${t.rank}</strong> de ${t.cohort} · promedio ponderado ${STATE.ponderado}</p>
      </div>
      <div class="turno-card__when">
        <strong>${t.dateLabel}</strong>
        <span>${t.timeLabel}</span>
      </div>
    </section>

    <h2 class="section-title">Pasos para tu matrícula</h2>
    ${stepperHTML()}

    <div class="dash-grid">
      <div class="dash-main">
        <div class="card">
          <div class="status-head">
            <h3 class="card__title">Estado de matrícula</h3>${statusBadge}
          </div>
          <p class="muted">${statusText}</p>
          <div class="progressbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avance de matrícula">
            <div class="progressbar__fill ${STATE.confirmed ? 'progressbar__fill--green' : ''}" style="width:${pct}%"></div>
          </div>
          <p class="muted">${pct}% completado</p>
        </div>

        <div class="card">
          <h3 class="card__title" style="margin-bottom:14px">Próximas fechas importantes</h3>
          <div class="date-list">
            ${IMPORTANT_DATES.map((d) => `
              <div class="date-item">
                <span data-icon="calendar" aria-hidden="true"></span>
                <span class="date-item__label">${esc(d.label)}</span>
                <span class="date-item__date">${esc(d.date)}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="card span-2">
          <h3 class="card__title" style="margin-bottom:8px">Consejos</h3>
          <div class="tips-illu">
            <p>Revisa tu plan de estudios y asegúrate de cumplir con los prerrequisitos antes de seleccionar tus cursos. Verifica también que no existan cruces de horario en la pantalla <strong>Mi horario</strong>.</p>
            <span class="empty-state__icon" data-icon="bulb" aria-hidden="true" style="margin:0"></span>
          </div>
        </div>
      </div>

      <div class="dash-aside">
        <div class="card announce">
          <span class="announce__icon" data-icon="mega" aria-hidden="true"></span>
          <h3 class="card__title">¡Atención!</h3>
          <p class="muted" style="margin:6px 0 14px">Revisa tu horario antes de confirmar tu matrícula para evitar cruces.</p>
          <button class="btn btn--outline btn--block" data-action="nav" data-view="horario">Ir a mi horario</button>
        </div>

        <div class="card">
          <h3 class="card__title" style="margin-bottom:12px">Accesos rápidos</h3>
          <div class="quick-list">
            <button class="quick-item" data-action="nav" data-view="matricula"><span class="quick-item__icon" data-icon="grad"></span><span>Ver mi plan de estudios</span><span class="chev" data-icon="chevron"></span></button>
            <button class="quick-item" data-action="nav" data-view="analisis"><span class="quick-item__icon" data-icon="chart"></span><span>Evaluar carga académica</span><span class="chev" data-icon="chevron"></span></button>
            <button class="quick-item" data-action="nav" data-view="catalogo"><span class="quick-item__icon" data-icon="star"></span><span>Catálogo de cursos</span><span class="chev" data-icon="chevron"></span></button>
            <button class="quick-item" data-action="nav" data-view="historial"><span class="quick-item__icon" data-icon="history"></span><span>Historial de matrículas</span><span class="chev" data-icon="chevron"></span></button>
          </div>
        </div>
      </div>
    </div>
  `);
}

/* ----------------------------- Vista: CATÁLOGO --------------------------- */
function filteredCourses() {
  const f = STATE.ui.catalog;
  let list = COURSES.slice();
  const q = f.search.trim().toLowerCase();
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  if (f.faculty !== 'Todas') list = list.filter((c) => c.faculty === f.faculty);
  if (f.cycle !== 'Todos') list = list.filter((c) => String(c.cycle) === String(f.cycle));
  if (f.area !== 'Todas') list = list.filter((c) => c.area === f.area);
  if (f.type && f.type !== 'Todos') list = list.filter((c) => c.type === f.type);
  if (f.onlyAvailable) list = list.filter((c) => seatsLeft(c) > 0);
  switch (f.sort) {
    case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
    case 'credits-asc': list.sort((a, b) => a.credits - b.credits); break;
    case 'credits-desc': list.sort((a, b) => b.credits - a.credits); break;
    default: list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}
const avatarClass = (c) => c.type === 'Electivo' ? 'av--electivo'
  : c.area === 'Ciencias' ? 'av--ciencias' : c.area === 'Tecnología' ? 'av--tecnologia' : 'av--humanidades';
const schedLines = (c) => c.schedule.map((b) => `${b.day} ${pad2(b.start)}:00 - ${pad2(b.end)}:00`);

function renderCatalogo() {
  const f = STATE.ui.catalog;
  const fo = f.filtersOpen !== false; // ¿fila de filtros visible?
  const list = filteredCourses();
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / f.pageSize));
  if (f.page > pages) f.page = pages;
  const start = (f.page - 1) * f.pageSize;
  const slice = list.slice(start, start + f.pageSize);

  const faculties = ['Todas', ...new Set(COURSES.map((c) => c.faculty))];
  const cycles = ['Todos', ...[...new Set(COURSES.map((c) => c.cycle))].sort((a, b) => a - b)];
  const areas = ['Todas', 'Ciencias', 'Tecnología', 'Humanidades'];
  const opt = (arr, cur, prefix = '') => arr.map((v) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${prefix}${v}</option>`).join('');

  setView(`
    <div class="toolbar">
      <div class="input-wrap">
        <span data-icon="search" aria-hidden="true"></span>
        <input class="input" id="catalog-search" type="search" placeholder="Buscar curso por nombre o código"
               aria-label="Buscar curso" value="${esc(f.search)}" data-input="catalog-search" />
      </div>
      <button class="btn btn--ghost" data-action="toggle-filters" aria-expanded="${fo}" aria-controls="catalog-filters"><span data-icon="filter"></span>Filtros</button>
    </div>

    <div class="filters-row" id="catalog-filters" role="group" aria-label="Filtros del catálogo" ${fo ? '' : 'hidden'}>
      <select class="select" data-filter="faculty" aria-label="Filtrar por facultad">${opt(faculties, f.faculty, 'Facultad: ')}</select>
      <select class="select" data-filter="cycle" aria-label="Filtrar por ciclo">${opt(cycles, f.cycle, 'Ciclo: ')}</select>
      <select class="select" data-filter="area" aria-label="Filtrar por área">${opt(areas, f.area, 'Área: ')}</select>
      <button class="link-btn" data-action="toggle-more" aria-expanded="${f.moreOpen}" aria-controls="catalog-more">Más filtros <span data-icon="chevron" aria-hidden="true"></span></button>
    </div>
    ${f.moreOpen ? `<div class="filters-more" id="catalog-more">
      <div class="field-inline"><label for="f-type">Tipo:</label>
        <select class="select" id="f-type" data-filter="type">
          <option value="Todos" ${f.type === 'Todos' ? 'selected' : ''}>Todos</option>
          <option value="Obligatorio" ${f.type === 'Obligatorio' ? 'selected' : ''}>Obligatorio</option>
          <option value="Electivo" ${f.type === 'Electivo' ? 'selected' : ''}>Electivo</option>
        </select>
      </div>
      <label class="field-inline"><input type="checkbox" data-filter="available" ${f.onlyAvailable ? 'checked' : ''} /> Sólo cursos con cupos</label>
    </div>` : ''}

    <div class="results-meta">
      <span class="muted">${total === 0 ? 'No se encontraron cursos' : `Mostrando ${start + 1} a ${Math.min(start + f.pageSize, total)} de ${total} resultados`}</span>
      <div class="sortbox">
        <label for="catalog-sort">Ordenar por:</label>
        <select class="select" id="catalog-sort" data-filter="sort" aria-label="Ordenar resultados">
          <option value="name-asc" ${f.sort === 'name-asc' ? 'selected' : ''}>Nombre A-Z</option>
          <option value="name-desc" ${f.sort === 'name-desc' ? 'selected' : ''}>Nombre Z-A</option>
          <option value="credits-asc" ${f.sort === 'credits-asc' ? 'selected' : ''}>Créditos (menor)</option>
          <option value="credits-desc" ${f.sort === 'credits-desc' ? 'selected' : ''}>Créditos (mayor)</option>
        </select>
      </div>
    </div>

    <div class="course-list">
      ${slice.length === 0 ? '<div class="empty-state"><div class="empty-state__icon" data-icon="search"></div><h3>Sin resultados</h3><p>Prueba con otros filtros o términos de búsqueda.</p></div>'
      : slice.map((c) => {
        const selected = STATE.selectedCourses.includes(c.code);
        const approved = STATE.approvedCourses.includes(c.code);
        const left = seatsLeft(c);
        let action;
        if (approved) {
          action = `<button class="btn btn--success" disabled aria-label="${esc(c.name)}: curso ya aprobado"><span data-icon="check"></span>Aprobado</button>`;
        } else if (STATE.confirmed) {
          action = `<button class="btn ${selected ? 'btn--success' : 'btn--ghost'}" disabled>${selected ? 'Matriculado' : 'Agregar'}</button>`;
        } else if (left <= 0 && !selected) {
          action = `<button class="btn btn--ghost" disabled aria-label="${esc(c.name)}: sin cupo">Sin cupo</button>`;
        } else if (selected) {
          action = `<button class="btn btn--danger-ghost" data-action="remove" data-code="${c.code}" aria-label="Quitar ${esc(c.name)}"><span data-icon="minus"></span>Quitar</button>`;
        } else {
          action = `<button class="btn btn--outline" data-action="add" data-code="${c.code}" aria-label="Agregar ${esc(c.name)}"><span data-icon="plus"></span>Agregar</button>`;
        }
        return `<article class="course-card">
          <span class="course-card__avatar ${avatarClass(c)}" aria-hidden="true">${esc(c.code.split('-')[0])}</span>
          <div>
            <div class="course-card__name">${esc(c.name)}</div>
            <div class="course-card__meta">${esc(c.code)} · ${esc(c.type)} · ${c.credits} créditos · Ciclo ${c.cycle}</div>
            <div class="course-card__cupos ${left > 0 ? 'cupos-ok' : 'cupos-none'}">${left > 0 ? `Cupos disponibles: ${left}` : 'Sin cupos disponibles'}</div>
          </div>
          <div class="course-card__sched">
            ${c.schedule.map((b) => `<span class="line"><span data-icon="clock"></span>${b.day} ${pad2(b.start)}:00 - ${pad2(b.end)}:00</span>`).join('')}
            <span class="line"><span data-icon="pin"></span>Aula: ${esc(c.room)}</span>
          </div>
          <div class="course-card__enroll"><span data-icon="users"></span> Matriculados <span class="num">${enrolledDisplay(c)} / ${c.total}</span></div>
          <div class="course-card__action">${action}</div>
        </article>`;
      }).join('')}
    </div>

    ${pages > 1 ? paginationHTML(f.page, pages, 'catalog') : ''}
  `);
}

function paginationHTML(page, pages, scope) {
  let btns = '';
  for (let i = 1; i <= pages; i++) {
    btns += `<button class="page-btn" data-action="page" data-scope="${scope}" data-page="${i}" ${i === page ? 'aria-current="true"' : ''} aria-label="Página ${i}">${i}</button>`;
  }
  return `<nav class="pagination" aria-label="Paginación">
    <button class="page-btn" data-action="page" data-scope="${scope}" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Anterior"><span data-icon="arrowL"></span></button>
    ${btns}
    <button class="page-btn" data-action="page" data-scope="${scope}" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Siguiente"><span data-icon="arrowR"></span></button>
  </nav>`;
}

/* ----------------------------- Vista: HORARIO ---------------------------- */
function layoutEvents() {
  const cset = conflictCodes();
  const raw = [];
  selectedObjs().forEach((c) => c.schedule.forEach((b) => {
    raw.push({ course: c, day: b.day, start: b.start, end: b.end, conflict: cset.has(c.code) });
  }));
  // posicionar lado a lado cuando se solapan en el mismo día
  DAYS.forEach((day, dayIndex) => {
    const evs = raw.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
    let group = [], groupEnd = -1;
    const flush = () => {
      group.forEach((e, idx) => { e.col = idx; e.cols = group.length; });
      group = []; groupEnd = -1;
    };
    evs.forEach((e) => {
      if (group.length && e.start >= groupEnd) flush();
      group.push(e); groupEnd = Math.max(groupEnd, e.end);
    });
    flush();
    evs.forEach((e) => { e.dayIndex = dayIndex; });
  });
  return raw;
}

function renderHorario() {
  const hv = STATE.ui.horario || (STATE.ui.horario = { mode: 'grid' });
  const mode = hv.mode === 'list' ? 'list' : 'grid';
  const sel = selectedObjs();
  const conflicts = getConflicts();
  const cset = conflictCodes();
  const events = layoutEvents();

  // Skeleton de la cuadrícula
  let cells = '<div class="cal__corner"></div>';
  DAYS.forEach((d, i) => { cells += `<div class="cal__day ${i === DAYS.length - 1 ? 'is-last-col' : ''}">${d}</div>`; });
  for (let h = 8; h < 18; h++) {
    cells += `<div class="cal__time">${pad2(h)}:00</div>`;
    for (let d = 0; d < 5; d++) cells += `<div class="cal__cell ${d === 4 ? 'is-last-col' : ''}"></div>`;
  }

  const eventEls = events.map((e) => {
    const top = (e.start - 8) * ROW_H;
    const height = (e.end - e.start) * ROW_H - 6;
    const widthPct = 20 / (e.cols || 1);
    const leftPct = e.dayIndex * 20 + (e.col || 0) * widthPct;
    const cls = `event ev--${e.course.type === 'Electivo' ? 'electivo' : e.course.area === 'Ciencias' ? 'ciencias' : e.course.area === 'Tecnología' ? 'tecnologia' : 'humanidades'} ${e.conflict ? 'is-conflict' : ''}`;
    const aria = `${e.course.code} ${e.course.name}, ${e.day} ${pad2(e.start)}:00 a ${pad2(e.end)}:00, aula ${e.course.room}, área ${e.course.area}${e.conflict ? ', en conflicto de horario' : ''}`;
    return `<div class="${cls}" role="group" aria-label="${esc(aria)}" style="top:${top + 3}px;height:${height}px;left:calc(${leftPct}% + 4px);width:calc(${widthPct}% - 8px)">
      ${e.conflict ? '<span class="event__warn" data-icon="warning" title="Cruce de horario" aria-hidden="true"></span>' : ''}
      <strong>${esc(e.course.code)}</strong>
      <small>${esc(e.course.name)}</small>
      <small>${pad2(e.start)}:00–${pad2(e.end)}:00 · ${esc(e.course.room)}</small>
      ${e.conflict ? '<span class="sr-only">En conflicto de horario</span>' : ''}
    </div>`;
  }).join('');

  // Vista de lista (alternativa accesible al calendario)
  const dayIdx = (d) => DAYS.indexOf(d);
  const listRows = sel.slice().sort((a, b) => {
    const sa = a.schedule[0], sb = b.schedule[0];
    return (dayIdx(sa.day) - dayIdx(sb.day)) || (sa.start - sb.start);
  }).map((c) => {
    const conflict = cset.has(c.code);
    return `<div class="cal-list__row ${conflict ? 'is-conflict' : ''}">
      <span class="course-card__avatar ${avatarClass(c)}" aria-hidden="true">${esc(c.code.split('-')[0])}</span>
      <div><div class="course-card__name">${esc(c.name)}</div><div class="course-card__meta">${esc(c.code)} · ${esc(c.type)} · ${c.credits} créditos</div></div>
      <div class="cal-list__times">${schedLines(c).map((l) => `<span>${esc(l)}</span>`).join('')}<span class="muted">Aula: ${esc(c.room)}</span></div>
      <div>${conflict ? '<span class="badge badge--red"><span data-icon="warning"></span>Cruce</span>' : '<span class="badge badge--green"><span data-icon="check"></span>Sin cruce</span>'}</div>
    </div>`;
  }).join('');

  // Pie de resumen del horario (deriva de STATE)
  const total = totalCredits();
  const ob = sel.filter((c) => c.type === 'Obligatorio').length;
  const el = sel.filter((c) => c.type === 'Electivo').length;
  const pct = Math.min(100, Math.round((total / STATE.maxCredits) * 100));
  const footer = sel.length === 0 ? '' : `
    <div class="cal-footer">
      <div class="cal-foot-item">
        <div class="cal-foot-k"><span data-icon="star"></span>Créditos seleccionados</div>
        <div class="cal-foot-v" style="color:${total > STATE.maxCredits ? 'var(--danger)' : 'inherit'}">${total} / ${STATE.maxCredits}</div>
        <div class="progressbar" role="progressbar" aria-label="Créditos seleccionados" aria-valuenow="${total}" aria-valuemin="0" aria-valuemax="${STATE.maxCredits}"><div class="progressbar__fill ${total > STATE.maxCredits ? '' : 'progressbar__fill--green'}" style="width:${pct}%"></div></div>
      </div>
      <div class="cal-foot-item">
        <div class="cal-foot-k"><span data-icon="book"></span>Cursos seleccionados</div>
        <div class="cal-foot-v">${sel.length}</div>
        <div class="cal-foot-sub">Obligatorios: ${ob} · Electivos: ${el}</div>
      </div>
      <div class="cal-foot-item">
        <div class="cal-foot-k"><span data-icon="${conflicts.length ? 'warning' : 'check'}"></span>Conflictos de horario</div>
        <div class="cal-foot-v" style="color:${conflicts.length ? 'var(--danger)' : 'var(--success-strong)'}">${conflicts.length}</div>
        <div class="cal-foot-sub">${conflicts.length ? 'Revisa los cruces marcados en rojo' : '¡No tienes cruces de horario!'}</div>
      </div>
      <div class="cal-foot-actions">
        <button class="btn btn--primary btn--lg" data-action="nav" data-view="matricula"><span data-icon="check"></span>Continuar a confirmar matrícula</button>
        <button class="btn btn--ghost" data-action="print-horario"><span data-icon="download"></span>Descargar horario (PDF)</button>
      </div>
    </div>`;

  const toggle = sel.length === 0 ? '' :
    `<button class="btn btn--ghost" data-action="toggle-horario-mode"><span data-icon="${mode === 'grid' ? 'list' : 'calendar'}"></span>${mode === 'grid' ? 'Ver en modo lista' : 'Ver en modo calendario'}</button>`;

  setView(`
    <div class="cal-toolbar">
      <div class="legend" aria-hidden="true">
        <span><span class="dot" style="background:var(--brand)"></span>Ciencias</span>
        <span><span class="dot" style="background:var(--success)"></span>Tecnología</span>
        <span><span class="dot" style="background:var(--purple)"></span>Humanidades</span>
        <span><span class="dot" style="background:var(--warning)"></span>Electivo</span>
      </div>
      ${toggle}
    </div>
    ${sel.length === 0
      ? '<div class="empty-state"><div class="empty-state__icon" data-icon="calendar"></div><h3>Tu horario está vacío</h3><p>Agrega cursos desde el catálogo para verlos aquí.</p><button class="btn btn--primary" style="margin-top:12px" data-action="nav" data-view="catalogo">Ir al catálogo</button></div>'
      : (mode === 'list'
        ? `<div class="cal-list">${listRows}</div>`
        : `<div class="cal-wrap"><div class="cal">${cells}<div class="cal__events">${eventEls}</div></div></div>`)}
    ${footer}
  `);
}

/* ----------------------------- Vista: RESUMEN (Mi matrícula) ------------- */
function renderMatricula() {
  const sel = selectedObjs();
  const total = totalCredits();
  const avail = creditsAvailable();
  const errs = getValidationErrors();

  const body = sel.length === 0
    ? `<div class="empty-state">
         <div class="empty-state__icon" data-icon="doc"></div>
         <h3>Aún no has seleccionado cursos</h3>
         <p>Ve al catálogo y agrega los cursos que deseas llevar este semestre.</p>
         <button class="btn btn--primary" style="margin-top:14px" data-action="nav" data-view="catalogo"><span data-icon="plus"></span>Ir al catálogo</button>
       </div>`
    : `<div class="summary-layout">
        <div class="card">
          <h3 class="card__title" style="margin-bottom:14px">Cursos seleccionados</h3>
          <table class="table">
            <thead><tr><th>Curso</th><th>Sección</th><th>Horario</th><th class="t-center">Créditos</th><th class="t-center">Acción</th></tr></thead>
            <tbody>
              ${sel.map((c) => `<tr>
                <td><div class="strong">${esc(c.name)}</div><div class="muted">${esc(c.code)}</div></td>
                <td>${esc(c.section || '001')}</td>
                <td>${schedLines(c).map((l) => `<div>${esc(l)}</div>`).join('')}</td>
                <td class="t-center strong">${c.credits}</td>
                <td class="t-center">${STATE.confirmed
                  ? '<span class="badge badge--green">✓</span>'
                  : `<button class="icon-btn btn--danger-ghost" data-action="remove" data-code="${c.code}" aria-label="Quitar ${esc(c.name)}"><span data-icon="trash"></span></button>`}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3 class="card__title" style="margin-bottom:16px">Resumen</h3>
          <div class="summary-rows">
            <div class="summary-row"><span class="label">Total de créditos</span><span class="val">${total}</span></div>
            <div class="summary-row"><span class="label">Máximo de créditos</span><span class="val">${STATE.maxCredits}</span></div>
            <div class="summary-divider"></div>
            <div class="summary-row summary-row--green"><span class="label">Créditos seleccionados</span><span class="val">${total}</span></div>
            <div class="summary-row ${avail < 0 ? '' : 'summary-row--green'}"><span class="label" ${avail < 0 ? 'style="color:var(--danger)"' : ''}>Créditos disponibles</span><span class="val" ${avail < 0 ? 'style="color:var(--danger)"' : ''}>${avail}</span></div>
          </div>
        </div>
      </div>

      <div class="notice">
        <span class="notice__icon" data-icon="info" aria-hidden="true"></span>
        <div>
          <strong>Antes de confirmar</strong>
          <ul>
            <li><span data-icon="check"></span>Verifica que no existan cruces de horarios.</li>
            <li><span data-icon="check"></span>Asegúrate de cumplir con los prerrequisitos.</li>
            <li><span data-icon="check"></span>No podrás hacer cambios después de confirmar.</li>
          </ul>
        </div>
      </div>

      ${errs.hasErrors && !STATE.confirmed ? `<div class="alert alert--warning" style="margin-top:16px">
        <span class="alert__icon" data-icon="warning"></span>
        <div class="alert__body"><div class="alert__title">Tienes ${errs.count} validación(es) pendiente(s)</div>
        <p>Corrige las alertas antes de confirmar tu matrícula.</p>
        <div class="alert__actions"><button class="btn btn--outline" data-action="nav" data-view="validaciones">Ver validaciones</button></div></div>
      </div>` : ''}

      <div class="actions-bar">
        <button class="btn btn--ghost btn--lg" data-action="nav" data-view="catalogo"><span data-icon="arrowL"></span>Volver</button>
        <button class="btn btn--success btn--lg" data-action="confirm" ${canConfirm() ? '' : 'disabled'}>
          <span data-icon="check"></span>${STATE.confirmed ? 'Matrícula confirmada' : 'Confirmar matrícula'}
        </button>
      </div>`;

  setView(`${stepperHTML('stepper--wizard')}${body}`);
}

/* ----------------------------- Vista: VALIDACIONES ----------------------- */
function renderValidaciones() {
  const errs = getValidationErrors();
  const total = totalCredits();

  if (!errs.hasErrors) {
    setView(`<div class="card ok-state">
      <div class="ok-state__icon" data-icon="checkCircle" aria-hidden="true"></div>
      <h2>Todo en orden</h2>
      <p class="muted">${STATE.selectedCourses.length === 0
        ? 'Aún no has agregado cursos. Ve al catálogo para comenzar tu matrícula.'
        : 'No se detectaron conflictos de horario, prerrequisitos pendientes ni exceso de créditos. Puedes confirmar tu matrícula.'}</p>
      <div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn--outline" data-action="nav" data-view="catalogo">Ir al catálogo</button>
        ${STATE.selectedCourses.length > 0 && !STATE.confirmed ? '<button class="btn btn--success" data-action="confirm"><span data-icon="check"></span>Confirmar matrícula</button>' : ''}
      </div>
    </div>`);
    return;
  }

  // Tarjetas de alerta (calculadas)
  const alerts = [];
  errs.conflicts.forEach((p) => alerts.push(`<div class="alert alert--danger">
    <span class="alert__icon" data-icon="warning"></span>
    <div class="alert__body">
      <div class="alert__title">Conflicto de horario</div>
      <p>El curso ${esc(p.a.name)} (${esc(p.a.code)}) tiene un horario que se cruza con ${esc(p.b.name)} (${esc(p.b.code)}).</p>
      <div class="alert__actions"><button class="btn btn--ghost" data-action="nav" data-view="horario">Ver horario</button></div>
    </div></div>`));
  errs.prereqs.forEach((x) => {
    const m = x.missing.map((mc) => `${getCourse(mc) ? getCourse(mc).name : mc} (${mc})`).join(', ');
    alerts.push(`<div class="alert alert--danger">
      <span class="alert__icon" data-icon="warning"></span>
      <div class="alert__body">
        <div class="alert__title">Prerrequisito no cumplido</div>
        <p>Para llevar ${esc(x.course.name)} (${esc(x.course.code)}) necesitas aprobar ${esc(m)}.</p>
        <div class="alert__actions"><button class="btn btn--ghost" data-action="nav" data-view="matricula">Ver plan de estudios</button></div>
      </div></div>`);
  });

  // Tabla de cursos afectados
  const affected = [];
  errs.conflicts.forEach((p) => {
    [p.a, p.b].forEach((c) => affected.push({ c, motivo: 'Conflicto de horario', motivoClass: 'badge--red', accion: 'Cambiar de sección o eliminar el curso', btn: 'Ver horario', view: 'horario' }));
  });
  errs.prereqs.forEach((x) => affected.push({ c: x.course, motivo: 'Prerrequisito no cumplido', motivoClass: 'badge--amber', accion: `Aprobar ${x.missing.join(', ')}`, btn: 'Ver plan de estudios', view: 'matricula' }));
  const seen = new Set();
  const affectedUnique = affected.filter((a) => { const k = a.c.code + a.motivo; if (seen.has(k)) return false; seen.add(k); return true; });

  const over = errs.over;
  const ccPct = Math.min(100, Math.round((total / STATE.maxCredits) * 100));

  setView(`
    <div class="valid-layout">
      <div>
        ${alerts.join('')}
        <div class="card">
          <h3 class="card__title" style="display:flex;align-items:center;gap:8px"><span data-icon="bulb" style="color:var(--brand)"></span>Sugerencias para continuar</h3>
          <ul style="margin:12px 0 0;padding-left:18px;color:var(--text-2);display:flex;flex-direction:column;gap:8px">
            ${errs.conflicts.length ? '<li>Elimina o cambia uno de los cursos con horario en conflicto.</li>' : ''}
            ${errs.prereqs.length ? '<li>Revisa tu plan de estudios para asegurarte de cumplir con los prerrequisitos.</li>' : ''}
            ${over > 0 ? `<li>Reduce ${over} crédito(s) para no exceder el máximo permitido.</li>` : ''}
          </ul>
        </div>
      </div>

      <div class="card credits-card">
        <h3 class="card__title">Límites de créditos</h3>
        <p class="muted" style="margin:6px 0 12px">${over > 0 ? `Estás excediendo el número máximo de créditos permitidos (${STATE.maxCredits}).` : `Estás dentro del límite de créditos permitidos (${STATE.maxCredits}).`}</p>
        <div class="cc-num">Créditos seleccionados: <span style="color:${over > 0 ? 'var(--danger)' : 'var(--success-strong)'}">${total}</span></div>
        <div class="cc-bar"><div class="cc-bar__fill ${over > 0 ? 'cc-bar__fill--over' : 'cc-bar__fill--ok'}" style="width:${ccPct}%"></div></div>
        <div style="text-align:right;font-weight:700;color:${over > 0 ? 'var(--danger)' : 'var(--success-strong)'}">${total} / ${STATE.maxCredits}</div>
        <div class="cc-row"><span class="cc-row__icon up" data-icon="trend"></span><span class="cc-row__label">Máximo de créditos permitidos</span><span class="cc-row__val">${STATE.maxCredits}</span></div>
        <div class="cc-row"><span class="cc-row__icon ok" data-icon="check"></span><span class="cc-row__label">Créditos disponibles</span><span class="cc-row__val" style="color:${creditsAvailable() < 0 ? 'var(--danger)' : 'inherit'}">${creditsAvailable()}</span></div>
        ${over > 0 ? `<div class="cc-note"><span data-icon="warning"></span>Debes reducir ${over} crédito(s) para poder confirmar tu matrícula.</div>` : ''}
      </div>
    </div>

    ${affectedUnique.length ? `<div class="card" style="margin-top:18px">
      <h3 class="card__title" style="margin-bottom:6px">Cursos afectados</h3>
      <table class="table affected-table">
        <thead><tr><th>Curso</th><th>Código</th><th>Motivo</th><th>Acción sugerida</th><th class="t-right">&nbsp;</th></tr></thead>
        <tbody>
          ${affectedUnique.map((a) => `<tr>
            <td><div class="cell-course"><span class="mini-av ${avatarClass(a.c)}">${esc(a.c.code.split('-')[0])}</span>${esc(a.c.name)}</div></td>
            <td>${esc(a.c.code)}</td>
            <td><span class="badge ${a.motivoClass}">${a.motivo}</span></td>
            <td class="muted">${esc(a.accion)}</td>
            <td class="t-right"><button class="btn btn--outline" data-action="nav" data-view="${a.view}">${a.btn}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    <div class="help-banner">
      <span class="help-banner__icon" data-icon="headset" aria-hidden="true"></span>
      <div class="help-banner__body"><strong>¿Necesitas ayuda?</strong><span>Comunícate con tu facultad o visita el centro de ayuda para más información.</span></div>
      <button class="btn btn--primary" data-action="nav" data-view="ayuda">Ir al centro de ayuda</button>
    </div>
  `);
}

/* ----------------------------- Vista: HISTORIAL -------------------------- */
function filteredHistory() {
  const h = STATE.ui.history;
  let list = HISTORY.slice();
  if (h.term && h.term !== 'Todos') list = list.filter((x) => x.term === h.term);
  const q = (h.search || '').trim().toLowerCase();
  if (q) list = list.filter((x) => x.term.toLowerCase().includes(q));
  return list;
}
const TERM_ACCENTS = ['tc--blue', 'tc--green', 'tc--purple', 'tc--amber', 'tc--indigo'];

function renderHistorial() {
  const s = historyStats();
  const h = STATE.ui.history;
  if (h.term === undefined) h.term = 'Todos';
  if (h.search === undefined) h.search = '';
  const list = filteredHistory();
  const pages = Math.max(1, Math.ceil(list.length / h.pageSize));
  if (h.page > pages) h.page = pages;
  const start = (h.page - 1) * h.pageSize;
  const slice = list.slice(start, start + h.pageSize);

  setView(`
    <div class="stat-grid">
      <div class="card stat-card"><span class="stat-card__icon ic-blue" data-icon="grad"></span><div><div class="stat-card__label">Semestres matriculados</div><div class="stat-card__value">${s.semesters}</div><div class="stat-card__sub">Desde ${s.from} hasta ${s.to}</div></div></div>
      <div class="card stat-card"><span class="stat-card__icon ic-green" data-icon="checkCircle"></span><div><div class="stat-card__label">Créditos aprobados</div><div class="stat-card__value">${s.creditsApproved}</div><div class="stat-card__sub">Promedio ponderado: ${STATE.ponderado}</div></div></div>
      <div class="card stat-card"><span class="stat-card__icon ic-purple" data-icon="doc"></span><div><div class="stat-card__label">Cursos aprobados</div><div class="stat-card__value">${s.coursesApproved}</div><div class="stat-card__sub">De ${PLAN_TOTAL} cursos matriculados</div></div></div>
      <div class="card stat-card"><span class="stat-card__icon ic-amber" data-icon="award"></span><div><div class="stat-card__label">Mejor promedio</div><div class="stat-card__value">${s.best.average}</div><div class="stat-card__sub">Alcanzado en ${s.best.term}</div></div></div>
    </div>

    <div class="toolbar">
      <select class="select" style="max-width:240px" data-filter="history-term" aria-label="Filtrar por semestre">
        <option value="Todos" ${h.term === 'Todos' ? 'selected' : ''}>Todos los semestres</option>
        ${HISTORY.map((x) => `<option value="${x.term}" ${h.term === x.term ? 'selected' : ''}>${x.term}</option>`).join('')}
      </select>
      <div class="input-wrap" style="max-width:280px">
        <span data-icon="search"></span>
        <input class="input" id="history-search" type="search" placeholder="Buscar semestre" aria-label="Buscar semestre" value="${esc(h.search)}" data-input="history-search" />
      </div>
    </div>

    <div class="term-list">
      ${slice.length === 0 ? '<div class="empty-state"><div class="empty-state__icon" data-icon="history"></div><h3>Sin resultados</h3></div>'
      : slice.map((x, i) => {
        const accent = TERM_ACCENTS[(start + i) % TERM_ACCENTS.length];
        const isActual = x.status === 'Actual';
        const statusBadge = isActual ? '<span class="badge badge--blue">Actual</span>' : '<span class="badge badge--green">Finalizado</span>';
        return `<article class="term-card ${accent}">
          <div><div class="term-card__period">${esc(x.term)}</div>${statusBadge}</div>
          <div class="term-card__col"><div class="k"><span data-icon="calendar"></span>Fecha de matrícula</div><div class="v">${esc(x.enrollDate)}</div></div>
          <div class="term-card__col"><div class="k"><span data-icon="book"></span>Cursos matriculados</div><div class="v">${x.courses}</div></div>
          <div class="term-card__col"><div class="k"><span data-icon="star"></span>Créditos matriculados</div><div class="v">${x.credits}</div></div>
          <div class="term-card__avg"><div class="k muted" style="font-size:.8rem">Promedio del semestre</div><div class="score" style="color:${isActual ? 'var(--text-3)' : 'var(--text)'}">${x.average == null ? '—' : x.average}</div><div class="status">${isActual ? 'En curso' : 'Aprobado'}</div></div>
          <div><button class="btn btn--outline" data-action="term-detail" data-term="${esc(x.term)}">Ver detalle <span data-icon="arrowR"></span></button></div>
        </article>`;
      }).join('')}
    </div>

    ${pages > 1 ? paginationHTML(h.page, pages, 'history') : ''}
  `);
}

/* ----------------------------- Vista: ANÁLISIS --------------------------- */
let charts = {};
function destroyCharts() { Object.values(charts).forEach((c) => c && c.destroy()); charts = {}; }

function renderAnalisis() {
  destroyCharts();
  // Datos para alternativas textuales accesibles (mismo origen que los gráficos)
  const byCycle = {};
  COURSES.forEach((c) => { byCycle[c.cycle] = (byCycle[c.cycle] || 0) + c.credits; });
  const stats = historyStats();
  const pend = Math.max(0, PLAN_TOTAL - stats.coursesApproved);
  const fin = finalized().sort((a, b) => a.order - b.order);
  const cycleTxt = Object.keys(byCycle).sort((a, b) => a - b).map((k) => `ciclo ${k}: ${byCycle[k]} créditos`).join('; ');
  const avgTxt = fin.map((h) => `${h.term}: ${h.average}`).join('; ');
  setView(`
    <p class="muted" style="margin-bottom:18px">Indicadores de tu avance académico, calculados a partir de tu historial y del catálogo de cursos.</p>
    <div class="charts-grid">
      <div class="card chart-card"><h3>Distribución de créditos por ciclo</h3><p class="muted">Créditos ofertados del plan, agrupados por ciclo.</p><div class="chart-box"><canvas id="chart-cycle" aria-label="Gráfico de barras de créditos por ciclo. ${esc(cycleTxt)}." role="img"></canvas></div><p class="sr-only">Créditos por ciclo — ${esc(cycleTxt)}.</p></div>
      <div class="card chart-card"><h3>Cursos aprobados vs. pendientes</h3><p class="muted">Avance respecto al plan de estudios (${PLAN_TOTAL} cursos).</p><div class="chart-box"><canvas id="chart-status" aria-label="Gráfico circular. Aprobados: ${stats.coursesApproved}. Pendientes: ${pend}." role="img"></canvas></div><p class="sr-only">Cursos aprobados: ${stats.coursesApproved} de ${PLAN_TOTAL}; pendientes: ${pend}.</p></div>
      <div class="card chart-card span-2"><h3>Evolución del promedio</h3><p class="muted">Promedio obtenido en cada semestre finalizado.</p><div class="chart-box"><canvas id="chart-avg" aria-label="Gráfico de línea de la evolución del promedio. ${esc(avgTxt)}." role="img"></canvas></div><p class="sr-only">Evolución del promedio — ${esc(avgTxt)}.</p></div>
    </div>
  `);
  renderCharts();
}

function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function renderCharts() {
  if (typeof Chart === 'undefined' || STATE.ui.currentView !== 'analisis') return;
  destroyCharts();
  const text2 = cssVar('--text-2') || '#475569';
  const grid = cssVar('--border') || '#e6e8ef';
  const brand = cssVar('--brand') || '#2563eb';
  const success = cssVar('--success') || '#16a34a';
  const purple = cssVar('--purple') || '#7c3aed';
  const warning = cssVar('--warning') || '#d97706';
  Chart.defaults.color = text2;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

  // 1) Créditos por ciclo (barras)
  const byCycle = {};
  COURSES.forEach((c) => { byCycle[c.cycle] = (byCycle[c.cycle] || 0) + c.credits; });
  const cycles = Object.keys(byCycle).sort((a, b) => a - b);
  charts.cycle = new Chart($('#chart-cycle'), {
    type: 'bar',
    data: { labels: cycles.map((c) => `Ciclo ${c}`), datasets: [{ label: 'Créditos', data: cycles.map((c) => byCycle[c]), backgroundColor: brand, borderRadius: 8, maxBarThickness: 60 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: grid } }, x: { grid: { display: false } } } }
  });

  // 2) Aprobados vs pendientes (dona)
  const stats = historyStats();
  const aprobados = stats.coursesApproved;
  const pendientes = Math.max(0, PLAN_TOTAL - aprobados);
  charts.status = new Chart($('#chart-status'), {
    type: 'doughnut',
    data: { labels: ['Aprobados', 'Pendientes'], datasets: [{ data: [aprobados, pendientes], backgroundColor: [success, grid], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '64%', plugins: { legend: { position: 'bottom' } } }
  });

  // 3) Evolución del promedio (línea)
  const fin = finalized().sort((a, b) => a.order - b.order);
  charts.avg = new Chart($('#chart-avg'), {
    type: 'line',
    data: { labels: fin.map((h) => h.term), datasets: [{ label: 'Promedio', data: fin.map((h) => h.average), borderColor: purple, backgroundColor: 'transparent', tension: .35, pointRadius: 5, pointBackgroundColor: purple, borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 10, max: 20, grid: { color: grid } }, x: { grid: { display: false } } } }
  });
}

/* ----------------------------- Vista: MIS DATOS -------------------------- */
function renderDatos() {
  const st = STATE.student;
  const field = (label, value) => `<div class="field"><label>${esc(label)}</label><input class="input" value="${esc(value)}" readonly aria-label="${esc(label)}" /></div>`;
  setView(`
    <div class="card">
      <div class="profile-head">
        <img src="${esc(st.avatar)}" alt="Foto de ${esc(st.name)}" />
        <div><h2 style="font-size:1.4rem">${esc(st.name)}</h2><p class="muted">${esc(st.career)} · Código ${esc(st.code)}</p></div>
      </div>
      <div class="profile-grid">
        ${field('Nombres y apellidos', st.name)}
        ${field('Código de estudiante', st.code)}
        ${field('Carrera', st.career)}
        ${field('Facultad', st.faculty)}
        ${field('Correo institucional', st.email)}
        ${field('Promedio ponderado', String(STATE.ponderado))}
      </div>
      <div class="cc-note" style="margin-top:18px"><span data-icon="info"></span>Para actualizar tus datos personales, comunícate con tu facultad o el área de Registros Académicos.</div>
    </div>
  `);
}

/* ----------------------------- Vista: AYUDA ------------------------------ */
function renderAyuda() {
  const faqs = [
    ['¿Cómo selecciono mis cursos?', 'Ve a "Catálogo de cursos", usa la búsqueda y los filtros por facultad, ciclo o área, y presiona "Agregar" en cada curso que desees llevar.'],
    ['¿Por qué no puedo agregar un curso?', 'Puede que el curso no tenga cupos disponibles (botón "Sin cupo"), o que ya confirmaste tu matrícula. Tras confirmar, no se permiten cambios.'],
    ['¿Qué es un cruce de horario?', 'Ocurre cuando dos cursos comparten el mismo día y hora. La pantalla "Mi horario" y "Validaciones" lo detectan automáticamente y te avisan.'],
    ['¿Qué pasa si excedo los 20 créditos?', 'El sistema te lo advierte y no te dejará confirmar la matrícula hasta que reduzcas los créditos al máximo permitido.'],
    ['¿Cómo se calcula mi turno de matrícula?', 'Se asigna por orden de mérito según tu promedio ponderado: a mejor promedio, turno más temprano.']
  ];
  setView(`
    <div class="card">
      <h3 class="card__title" style="margin-bottom:14px">Preguntas frecuentes</h3>
      <div class="faq">
        ${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="faq__body">${esc(a)}</div></details>`).join('')}
      </div>
    </div>
    <div class="help-banner" style="margin-top:18px">
      <span class="help-banner__icon" data-icon="headset"></span>
      <div class="help-banner__body"><strong>¿No encuentras lo que buscas?</strong><span>Escríbenos a soporte.matricula@upn.pe o llama al (01) 555-1234.</span></div>
    </div>
  `);
}

/* ============================================================================
 *  TOASTS
 * ========================================================================== */
const TOAST_ICON = { success: 'check', error: 'x', warning: 'warning', info: 'info' };
const TOAST_TITLE = { success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información' };
function toast(title, msg, type = 'info') {
  const region = $('#toast-region');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
  el.innerHTML = `<span class="toast__icon" data-icon="${TOAST_ICON[type]}" aria-hidden="true"></span>
    <div class="toast__body"><div class="toast__title">${esc(title)}</div><div class="toast__msg">${esc(msg)}</div></div>
    <button class="toast__close" data-action="close-toast" aria-label="Cerrar notificación"><span data-icon="x"></span></button>`;
  region.appendChild(el);
  fillIcons(el);
  const remove = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 250); };
  el._timer = setTimeout(remove, 4200);
  el._remove = remove;
}

/* ============================================================================
 *  MODAL (éxito de confirmación)
 * ========================================================================== */
let lastFocused = null;
function openSuccessModal() {
  const sel = selectedObjs();
  const root = $('#modal-root');
  lastFocused = document.activeElement;
  const shell = $('.app-shell');
  if (shell) shell.setAttribute('aria-hidden', 'true'); // oculta el fondo a tecnologías de asistencia
  root.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal__icon" data-icon="checkCircle" aria-hidden="true"></div>
      <h2 id="modal-title">¡Matrícula confirmada!</h2>
      <p>Tu matrícula se registró correctamente. Recibirás un correo de confirmación.</p>
      <div class="modal__summary">
        <div class="row"><span class="label">Cursos matriculados</span><span class="v">${sel.length}</span></div>
        <div class="row"><span class="label">Créditos totales</span><span class="v">${totalCredits()}</span></div>
        <div class="row"><span class="label">Estado</span><span class="v" style="color:var(--success-strong)">Confirmada</span></div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" data-action="close-modal">Cerrar</button>
        <button class="btn btn--outline" data-action="print-comprobante"><span data-icon="download"></span>Comprobante (PDF)</button>
        <button class="btn btn--success" data-action="modal-home"><span data-icon="home"></span>Ir al inicio</button>
      </div>
    </div>
  </div>`;
  fillIcons(root);
  const modal = $('.modal', root);
  const focusables = $$('button, [href], input, select, [tabindex]:not([tabindex="-1"])', modal);
  if (focusables[0]) focusables[0].focus();
  root._keyHandler = (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab' && focusables.length) {
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', root._keyHandler);
}
function closeModal() {
  const root = $('#modal-root');
  if (root._keyHandler) document.removeEventListener('keydown', root._keyHandler);
  root.innerHTML = '';
  const shell = $('.app-shell');
  if (shell) shell.removeAttribute('aria-hidden');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

/* ============================================================================
 *  EVENTOS (delegación)
 * ========================================================================== */
function onClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const a = t.dataset.action;
  switch (a) {
    case 'nav': navigate(t.dataset.view); break;
    case 'toggle-theme': toggleTheme(); break;
    case 'toggle-sidebar': toggleSidebar(); break;
    case 'close-sidebar': toggleSidebar(false); break;
    case 'toggle-filters': STATE.ui.catalog.filtersOpen = !(STATE.ui.catalog.filtersOpen !== false); render(); break;
    case 'toggle-horario-mode': { const hv = STATE.ui.horario || (STATE.ui.horario = { mode: 'grid' }); hv.mode = hv.mode === 'list' ? 'grid' : 'list'; render(); break; }
    case 'print-horario': toast('Descargar horario', 'Se abrirá el diálogo de impresión. Elige "Guardar como PDF".', 'info'); setTimeout(() => window.print(), 400); break;
    case 'add': addCourse(t.dataset.code); break;
    case 'remove': removeCourse(t.dataset.code); break;
    case 'confirm': confirmEnrollment(); break;
    case 'page': {
      const scope = t.dataset.scope; const p = parseInt(t.dataset.page, 10);
      if (Number.isNaN(p)) break;
      if (scope === 'catalog') STATE.ui.catalog.page = p; else STATE.ui.history.page = p;
      render(); $('#view').scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
    }
    case 'close-toast': { const tt = t.closest('.toast'); if (tt && tt._remove) { clearTimeout(tt._timer); tt._remove(); } break; }
    case 'close-modal': closeModal(); break;
    case 'modal-backdrop': if (e.target === t) closeModal(); break;
    case 'modal-home': closeModal(); navigate('inicio'); break;
    case 'notifications': togglePopover('pop-notifs', 'btn-notifs'); break;
    case 'user-menu': togglePopover('pop-user', 'btn-user'); break;
    case 'reset-demo': resetDemo(); break;
    case 'print-comprobante': printComprobante(); break;
    case 'toggle-more': STATE.ui.catalog.moreOpen = !STATE.ui.catalog.moreOpen; render(); break;
    case 'logout': closeAllPopovers(); toast('Cerrar sesión', 'Esta es una demostración académica: la sesión no se cierra.', 'info'); break;
    case 'term-detail': { const x = HISTORY.find((h) => h.term === t.dataset.term); if (x) toast(`Semestre ${x.term}`, `${x.courses} cursos · ${x.credits} créditos · ${x.average == null ? 'en curso' : 'promedio ' + x.average}.`, 'info'); break; }
    default: break;
  }
}

function onInput(e) {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const kind = el.dataset.input;
  if (kind === 'catalog-search') { STATE.ui.catalog.search = el.value; STATE.ui.catalog.page = 1; focusAfterRender = '#catalog-search'; render(); }
  if (kind === 'history-search') { STATE.ui.history.search = el.value; STATE.ui.history.page = 1; focusAfterRender = '#history-search'; render(); }
}

function onChange(e) {
  const el = e.target.closest('[data-filter]');
  if (!el) return;
  const k = el.dataset.filter;
  const c = STATE.ui.catalog;
  if (k === 'faculty') { c.faculty = el.value; c.page = 1; render(); }
  else if (k === 'cycle') { c.cycle = el.value; c.page = 1; render(); }
  else if (k === 'area') { c.area = el.value; c.page = 1; render(); }
  else if (k === 'type') { c.type = el.value; c.page = 1; render(); }
  else if (k === 'available') { c.onlyAvailable = el.checked; c.page = 1; render(); }
  else if (k === 'sort') { c.sort = el.value; render(); }
  else if (k === 'history-term') { STATE.ui.history.term = el.value; STATE.ui.history.page = 1; render(); }
}

/* ============================================================================
 *  INICIALIZACIÓN
 * ========================================================================== */
function init() {
  // Tema y matrícula guardados
  try { const saved = localStorage.getItem('upn-theme'); if (saved) STATE.ui.theme = saved; } catch (e) {}
  loadState();
  applyTheme();
  fillIcons(document);            // iconos del shell (sidebar + topbar)
  renderNotifs();                 // panel de la campana
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  // Cerrar popovers al hacer clic fuera o con Escape
  document.addEventListener('click', (e) => { if (!e.target.closest('.popover-wrap')) closeAllPopovers(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllPopovers(); });
  navigate('inicio');             // primera vista
}
document.addEventListener('DOMContentLoaded', init);
