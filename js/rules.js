/* ============================================================================
 *  rules.js — Lógica de negocio PURA (sin DOM)
 *  Plataforma de Matrícula UPN · Interacción Humano-Computador
 *
 *  Estas funciones sólo dependen de COURSES, HISTORY y STATE. No tocan el DOM,
 *  por eso pueden reutilizarse tanto en la app (app.js) como en las pruebas
 *  automatizadas (tests.html). Aquí viven RN-1 … RN-6.
 * ========================================================================== */
'use strict';

const pad2 = (n) => String(n).padStart(2, '0');

const getCourse = (code) => COURSES.find((c) => c.code === code);
const selectedObjs = () => STATE.selectedCourses.map(getCourse).filter(Boolean);
const totalCredits = () => selectedObjs().reduce((s, c) => s + c.credits, 0);
const creditsAvailable = () => STATE.maxCredits - totalCredits();
const creditExcess = () => Math.max(0, totalCredits() - STATE.maxCredits);          // RN-1

const enrolledDisplay = (c) => c.enrolled + (STATE.selectedCourses.includes(c.code) ? 1 : 0);
const seatsLeft = (c) => c.total - enrolledDisplay(c);                              // RN-4

/** ¿Dos bloques de horario se solapan? (lógica de intervalos real — RN-3) */
const blocksOverlap = (a, b) => a.day === b.day && a.start < b.end && b.start < a.end;

/** Pares de cursos seleccionados con cruce de horario (RN-3) */
function getConflicts() {
  const sel = selectedObjs();
  const pairs = [];
  for (let i = 0; i < sel.length; i++) {
    for (let j = i + 1; j < sel.length; j++) {
      const A = sel[i], B = sel[j];
      const clash = A.schedule.some((ba) => B.schedule.some((bb) => blocksOverlap(ba, bb)));
      if (clash) pairs.push({ a: A, b: B });
    }
  }
  return pairs;
}
const conflictCodes = () => {
  const set = new Set();
  getConflicts().forEach((p) => { set.add(p.a.code); set.add(p.b.code); });
  return set;
};

/** Prerrequisitos no cumplidos de los cursos seleccionados (RN-2) */
function getPrereqIssues() {
  return selectedObjs()
    .map((c) => ({
      course: c,
      missing: c.prerequisites.filter((p) => !STATE.approvedCourses.includes(p))
    }))
    .filter((x) => x.missing.length > 0);
}

/** Resumen de errores que impiden confirmar (RN-1/2/3) */
function getValidationErrors() {
  const conflicts = getConflicts();
  const prereqs = getPrereqIssues();
  const over = creditExcess();
  const count = conflicts.length + prereqs.length + (over > 0 ? 1 : 0);
  return { conflicts, prereqs, over, count, hasErrors: count > 0 };
}
const canConfirm = () => STATE.selectedCourses.length > 0 && !getValidationErrors().hasErrors && !STATE.confirmed;

/** Turno de matrícula por orden de mérito (RN-6) */
function computeTurno() {
  const p = STATE.ponderado;
  const cohort = 850;
  const percentile = Math.min(1, p / 20);
  const rank = Math.max(1, Math.round((1 - percentile) * cohort));
  const minutesIntoWindow = Math.round((rank / cohort) * 8 * 60); // ventana 08:00–16:00
  const h = 8 + Math.floor(minutesIntoWindow / 60);
  const m = minutesIntoWindow % 60;
  const suffix = h < 12 ? 'a.m.' : 'p.m.';
  const h12 = h % 12 || 12;
  return { rank, cohort, percentile, dateLabel: '05 de marzo', timeLabel: `${pad2(h12)}:${pad2(m)} ${suffix}` };
}

/* --- Métricas del historial (calculadas, no hardcodeadas) --- */
const finalized = () => HISTORY.filter((h) => h.status === 'Finalizado');
function historyStats() {
  const fin = finalized();
  const creditsApproved = fin.reduce((s, h) => s + h.credits, 0);
  const coursesApproved = fin.reduce((s, h) => s + h.courses, 0);
  const best = fin.reduce((b, h) => (h.average > b.average ? h : b), fin[0]);
  const sorted = [...HISTORY].sort((a, b) => a.order - b.order);
  return {
    semesters: HISTORY.length,
    from: sorted[0].term,
    to: sorted[sorted.length - 1].term,
    creditsApproved,
    coursesApproved,
    best
  };
}
