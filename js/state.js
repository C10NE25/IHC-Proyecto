/* ============================================================================
 *  state.js — Estado central de la aplicación (única fuente de verdad)
 *
 *  TODA pantalla de Resumen y Validaciones se renderiza a partir de este objeto.
 *  No hay datos hardcodeados en esas vistas: si cambia STATE, cambian las vistas.
 * ========================================================================== */

const STATE = {
  /* --- Datos del estudiante --- */
  student: {
    name: 'María Pérez',
    firstName: 'María',
    code: 'N00123456',
    career: 'Ingeniería de Sistemas',
    faculty: 'Ingeniería',
    email: 'maria.perez@upn.pe',
    avatar: 'https://i.pravatar.cc/120?img=47'
  },

  /* --- Núcleo de la matrícula --- */
  selectedCourses: [],                                  // códigos de cursos seleccionados (carrito)
  approvedCourses: ['PRO-101', 'ING-101', 'QUI-101'], // cursos ya aprobados — habilitan prerrequisitos (ALG-101 queda libre para demostrar el cruce con CAL-201)
  confirmed: false,                                     // ¿matrícula confirmada? (bloquea cambios — RN-5)
  maxCredits: 20,                                       // tope de créditos (RN-1)
  ponderado: 15.8,                                      // promedio ponderado (orden de mérito — RN-6)

  /* --- Estado de interfaz (no afecta reglas de negocio) --- */
  ui: {
    currentView: 'inicio',     // vista activa
    theme: 'light',            // 'light' | 'dark'
    sidebarOpen: false,        // drawer en móvil
    notifications: 3,          // contador de la campana
    catalog: {                 // controles del catálogo
      filtersOpen: true,       // visibilidad de la fila de filtros (botón "Filtros")
      moreOpen: false,         // filtros avanzados ("Más filtros")
      search: '',
      faculty: 'Todas',
      cycle: 'Todos',
      area: 'Todas',
      type: 'Todos',           // Todos | Obligatorio | Electivo
      onlyAvailable: false,    // sólo cursos con cupos
      sort: 'name-asc',        // name-asc | name-desc | credits-asc | credits-desc
      page: 1,
      pageSize: 6
    },
    history: {                 // paginación del historial
      page: 1,
      pageSize: 5
    },
    horario: {                 // vista del horario: 'grid' (calendario) | 'list'
      mode: 'grid'
    }
  }
};
