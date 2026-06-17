/* ============================================================================
 *  data.js — Datos sembrados de la Plataforma de Matrícula UPN
 *  Proyecto académico — Interacción Humano-Computador (IHC)
 *
 *  Cargado como script clásico (sin módulos). Expone variables globales:
 *    - COURSES        → catálogo de cursos ofertados este semestre
 *    - HISTORY        → historial de matrículas por semestre
 *    - IMPORTANT_DATES→ fechas importantes del calendario académico
 *    - PLAN_TOTAL     → total de cursos del plan de estudios (para métricas)
 * ========================================================================== */

/**
 * Modelo de cada curso:
 *  code          {string}  Código único (ej. "ALG-101")
 *  name          {string}  Nombre del curso
 *  credits       {number}  Créditos
 *  type          {'Obligatorio'|'Electivo'}
 *  faculty       {string}  Facultad
 *  cycle         {number}  Ciclo al que pertenece
 *  area          {'Ciencias'|'Tecnología'|'Humanidades'}
 *  teacher       {string}  Docente
 *  schedule      {Array<{day:string, start:number, end:number}>}  bloques (hora 24h)
 *  room          {string}  Aula
 *  total         {number}  Cupos totales
 *  enrolled      {number}  Matriculados actuales
 *  prerequisites {string[]} Códigos de cursos requeridos
 */
const COURSES = [
  {
    code: 'ALG-101', name: 'Álgebra Lineal', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 1, area: 'Ciencias', teacher: 'Dr. Luis Vega',
    schedule: [{ day: 'Lun', start: 8, end: 10 }, { day: 'Mié', start: 8, end: 10 }],
    room: 'A-201', total: 40, enrolled: 28, prerequisites: []
  },
  {
    code: 'PRO-101', name: 'Programación I', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 1, area: 'Tecnología', teacher: 'Mg. Ana Ríos',
    schedule: [{ day: 'Mar', start: 10, end: 12 }, { day: 'Jue', start: 10, end: 12 }],
    room: 'B-103', total: 40, enrolled: 32, prerequisites: []
  },
  {
    code: 'EST-101', name: 'Estadística', credits: 3, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 2, area: 'Ciencias', teacher: 'Dra. Carla Soto',
    schedule: [{ day: 'Mar', start: 14, end: 16 }, { day: 'Vie', start: 14, end: 16 }],
    room: 'C-204', total: 30, enrolled: 15, prerequisites: []
  },
  {
    code: 'FIS-101', name: 'Física I', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 1, area: 'Ciencias', teacher: 'Dr. Jorge Pino',
    schedule: [{ day: 'Lun', start: 10, end: 12 }, { day: 'Mié', start: 10, end: 12 }],
    room: 'A-101', total: 40, enrolled: 40, prerequisites: [] // ← Sin cupos (40/40)
  },
  {
    code: 'ING-101', name: 'Inglés I', credits: 2, type: 'Obligatorio',
    faculty: 'Estudios Generales', cycle: 1, area: 'Humanidades', teacher: 'Lic. Mary Cruz',
    schedule: [{ day: 'Vie', start: 8, end: 10 }],
    room: 'D-301', total: 30, enrolled: 10, prerequisites: []
  },
  {
    code: 'ELE-201', name: 'Electiva: Inteligencia Artificial', credits: 3, type: 'Electivo',
    faculty: 'Ingeniería', cycle: 3, area: 'Tecnología', teacher: 'Dr. Pablo Núñez',
    schedule: [{ day: 'Jue', start: 16, end: 18 }],
    room: 'E-205', total: 30, enrolled: 12, prerequisites: ['PRO-101'] // prerequisito SÍ aprobado
  },
  {
    code: 'EST-201', name: 'Estadística II', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 3, area: 'Ciencias', teacher: 'Dra. Carla Soto',
    schedule: [{ day: 'Lun', start: 14, end: 16 }, { day: 'Mié', start: 14, end: 16 }],
    room: 'C-205', total: 30, enrolled: 8, prerequisites: ['EST-101'] // prerequisito NO aprobado → valida RN-2
  },
  {
    code: 'QUI-101', name: 'Química General', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 1, area: 'Ciencias', teacher: 'Mg. Rosa Díaz',
    schedule: [{ day: 'Mar', start: 8, end: 10 }, { day: 'Jue', start: 8, end: 10 }],
    room: 'A-105', total: 35, enrolled: 20, prerequisites: []
  },
  {
    code: 'BD-201', name: 'Bases de Datos', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 3, area: 'Tecnología', teacher: 'Mg. Iván Torres',
    schedule: [{ day: 'Lun', start: 16, end: 18 }, { day: 'Mié', start: 16, end: 18 }],
    room: 'B-201', total: 35, enrolled: 22, prerequisites: ['PRO-101']
  },
  {
    code: 'HUM-101', name: 'Comunicación Efectiva', credits: 2, type: 'Electivo',
    faculty: 'Estudios Generales', cycle: 2, area: 'Humanidades', teacher: 'Lic. Elena Mora',
    schedule: [{ day: 'Vie', start: 10, end: 12 }],
    room: 'D-110', total: 30, enrolled: 14, prerequisites: []
  },
  {
    code: 'CAL-201', name: 'Cálculo II', credits: 4, type: 'Obligatorio',
    faculty: 'Ingeniería', cycle: 2, area: 'Ciencias', teacher: 'Dr. Luis Vega',
    // Mismo bloque que ALG-101 (Lun/Mié 8-10) → permite demostrar el cruce de horarios (RN-3)
    schedule: [{ day: 'Lun', start: 8, end: 10 }, { day: 'Mié', start: 8, end: 10 }],
    room: 'A-210', total: 35, enrolled: 19, prerequisites: []
  }
];

/**
 * Modelo de cada semestre del historial:
 *  term      {string}  Periodo (ej. "2024-II")
 *  status    {'Actual'|'Finalizado'}
 *  enrollDate{string}  Rango de fechas de matrícula
 *  courses   {number}  Cursos matriculados ese semestre
 *  credits   {number}  Créditos matriculados
 *  average   {number|null}  Promedio del semestre (null = en curso)
 *  order     {number}  Orden cronológico ascendente (para gráficos)
 */
const HISTORY = [
  { term: '2024-II', status: 'Actual',     enrollDate: '15 - 20 ago. 2024', courses: 5, credits: 17, average: null, order: 8 },
  { term: '2024-I',  status: 'Finalizado', enrollDate: '12 - 17 mar. 2024', courses: 5, credits: 17, average: 16.2, order: 7 },
  { term: '2023-II', status: 'Finalizado', enrollDate: '14 - 19 ago. 2023', courses: 6, credits: 20, average: 15.8, order: 6 },
  { term: '2023-I',  status: 'Finalizado', enrollDate: '13 - 18 mar. 2023', courses: 5, credits: 17, average: 17.5, order: 5 },
  { term: '2022-II', status: 'Finalizado', enrollDate: '15 - 20 ago. 2022', courses: 6, credits: 20, average: 15.1, order: 4 },
  { term: '2022-I',  status: 'Finalizado', enrollDate: '14 - 19 mar. 2022', courses: 5, credits: 18, average: 14.8, order: 3 },
  { term: '2021-II', status: 'Finalizado', enrollDate: '16 - 21 ago. 2021', courses: 6, credits: 19, average: 14.2, order: 2 },
  { term: '2021-I',  status: 'Finalizado', enrollDate: '15 - 20 mar. 2021', courses: 5, credits: 17, average: 13.9, order: 1 }
];

/** Fechas importantes del calendario académico (Inicio / Dashboard) */
const IMPORTANT_DATES = [
  { label: 'Inicio de clases',       date: '18 de marzo' },
  { label: 'Último día de matrícula', date: '07 de marzo' },
  { label: 'Último día de cambios',   date: '10 de marzo' }
];

/** Notificaciones del estudiante (panel de la campana) */
const NOTIFICATIONS = [
  { icon: 'calendar', title: 'Matrícula abierta', text: 'Tu turno de matrícula es el 05 de marzo.', time: 'hace 1 h' },
  { icon: 'warning',  title: 'Revisa tu horario',  text: 'Verifica que no existan cruces antes de confirmar.', time: 'hace 3 h' },
  { icon: 'info',     title: 'Nuevo curso electivo', text: 'Se abrió la electiva de Inteligencia Artificial (ELE-201).', time: 'ayer' }
];

/** Total de cursos del plan de estudios completo (para % de avance / gráficos) */
const PLAN_TOTAL = 45;

/* Sección de cada curso (forma parte del dato; el Resumen la renderiza sin literales) */
const SECTIONS = ['001', '001', '002', '001', '001', '001', '002', '001', '001', '001', '002'];
COURSES.forEach((c, i) => { c.section = SECTIONS[i] || '001'; });
