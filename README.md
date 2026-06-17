# Plataforma de Matrícula Universitaria UPN

Single Page Application (SPA) para el proceso de matrícula universitaria.
Proyecto académico del curso **Interacción Humano-Computador (IHC)**.

Construida con **HTML5 + CSS3 + JavaScript vanilla (ES6+)**. Sin frameworks, sin
empaquetadores (bundlers), sin `npm`. Los gráficos usan **Chart.js** por CDN.

---

## 🚀 Cómo ejecutar (VS Code + Live Server)

1. Abre **esta carpeta** en Visual Studio Code
   (`Archivo → Abrir carpeta…` y selecciona `Plataforma-Matricula-UPN`).
2. Si VS Code lo sugiere, instala la extensión recomendada **Live Server**
   (`ritwickdey.LiveServer`). También puedes instalarla manualmente desde el
   panel de Extensiones.
3. Haz **clic derecho sobre `index.html`** → **Open with Live Server**.
4. Se abrirá en tu navegador (normalmente `http://127.0.0.1:5500`).

> 💡 También funciona abriendo `index.html` directamente, pero se recomienda
> Live Server para recarga automática. Chart.js se descarga por CDN, así que se
> necesita conexión a internet para ver los gráficos del Dashboard analítico.

---

## 📁 Estructura del proyecto

```
Plataforma-Matricula-UPN/
├── index.html              # Shell de la app (sidebar, topbar, contenedor de vistas)
├── tests.html              # Pruebas automatizadas de las reglas de negocio (RN-1…RN-6)
├── css/
│   └── styles.css          # Estilos, tokens de color, modo claro/oscuro, responsivo, impresión
├── js/
│   ├── data.js             # Datos sembrados: COURSES, HISTORY, NOTIFICATIONS, IMPORTANT_DATES
│   ├── state.js            # STATE: estado central (fuente única de verdad)
│   ├── rules.js            # Lógica de negocio PURA, sin DOM (RN-1…RN-6) — reutilizada por la app y por tests.html
│   └── app.js              # Navegación, render de vistas, acciones y UI
├── .vscode/
│   └── extensions.json     # Recomienda la extensión Live Server
└── README.md
```

---

## 🧭 Pantallas

| Vista | Descripción |
|-------|-------------|
| **Inicio** | Saludo, **turno de matrícula** (orden de mérito), pasos en 4 etapas, estado de matrícula (cambia a *Confirmada / 100%* tras confirmar), fechas importantes y accesos rápidos. |
| **Mi matrícula** | *Resumen de matrícula* renderizado **dinámicamente** desde `STATE.selectedCourses`. Totales de créditos calculados. Botón *Confirmar* → modal de éxito con **comprobante descargable (PDF)**. Estado vacío si no hay cursos. |
| **Catálogo de cursos** | Lista desde `COURSES` con búsqueda (nombre/código), filtros (facultad, ciclo, **área real**), orden y paginación. Botón *Agregar/Quitar* con cupos en tiempo real. |
| **Mi horario** | Calendario semanal Lun–Vie (8:00–18:00). Cada curso ocupa visualmente sus horas reales. Pie de resumen (créditos, cursos obligatorios/electivos, conflictos), botón **Continuar a confirmar matrícula**, toggle **calendario/lista** y **Descargar horario (PDF)** (impresión). Contador de conflictos **calculado**. |
| **Validaciones** | Alertas **calculadas en tiempo real**: cruces de horario, exceso de créditos y prerrequisitos. Si no hay errores → *Todo en orden*. |
| **Dashboard analítico** | Gráficos con Chart.js: créditos por ciclo, aprobados vs. pendientes y evolución del promedio (Semana 12). |
| **Historial de matrículas** | Tarjetas por semestre desde `HISTORY`, con tarjetas-resumen y paginación. |
| **Mis datos / Ayuda** | Perfil del estudiante y FAQ (opcionales). |

La **barra superior** incluye campana de **notificaciones** y **menú de usuario** (paneles
desplegables accesibles, con cierre por clic-fuera/Escape), botón de **tema** y, en el menú,
**Reiniciar demo** (limpia la matrícula guardada en `localStorage`).

---

## ✅ Reglas de negocio (funcionan de verdad)

| # | Regla | Cómo se cumple |
|---|-------|----------------|
| **RN-1** | Tope de **20 créditos** | Se advierte al agregar y se **bloquea la confirmación** mientras se exceda. |
| **RN-2** | **Prerrequisitos** | No se confirma si falta un prerrequisito (mensaje en lenguaje natural, p. ej. *“Falta aprobar EST-101”*). |
| **RN-3** | **Cruce de horarios** | Detección por solapamiento de intervalos reales. |
| **RN-4** | **Cupos en 0** | El botón cambia a *“Sin cupo”* y queda deshabilitado. |
| **RN-5** | **Bloqueo tras confirmar** | Confirmada la matrícula, no se permite agregar/quitar. |
| **RN-6** | **Orden de mérito** | El *turno de matrícula* se calcula a partir de `STATE.ponderado`. |

> **Decisión de diseño (IHC):** agregar un curso con un problema (cruce,
> prerrequisito o exceso de créditos) **se permite** pero genera una *advertencia
> inmediata* y aparece en **Validaciones**; la **confirmación** queda bloqueada
> hasta resolverlo. Así la pantalla de Validaciones se alimenta de cursos reales
> y nunca muestra datos inventados. La excepción es *Sin cupo* (RN-4), que sí
> impide agregar.

### 🔬 Cómo probar cada regla
- **Cruce de horario (RN-3):** agrega **Álgebra Lineal (ALG-101)** y **Cálculo II (CAL-201)** — ambos Lun/Mié 8:00–10:00.
- **Prerrequisito (RN-2):** agrega **Estadística II (EST-201)** → pide aprobar EST-101.
- **Sin cupo (RN-4):** intenta agregar **Física I (FIS-101)** (40/40).
- **Exceso de créditos (RN-1):** agrega varios cursos hasta pasar de 20 créditos.
- **Bloqueo (RN-5):** confirma y luego intenta modificar.

> Los cursos del array `approvedCourses` (PRO-101, ING-101, QUI-101) aparecen como
> **“Aprobado”** (deshabilitados) en el catálogo, para que el flujo de prerrequisitos sea coherente.

### ✅ Pruebas automatizadas
Abre **`tests.html`** con Live Server: ejecuta 17 casos contra `js/rules.js` (el mismo
código de la app) y muestra ✓/✗ por regla. Estado esperado: **17/17 PASA**.

---

## ♿ Accesibilidad y calidad (WCAG 2.1)

- Roles ARIA, `aria-label`, `aria-current`, `aria-expanded`; `aria-live` solo en los *toasts*.
- Navegable con teclado (Tab), enlace *“Saltar al contenido”*, foco visible, modal con
  *focus-trap* + Escape y fondo inertizado (`aria-hidden`).
- Estados con **icono/forma + texto**, no solo color (apto para daltonismo).
- Contraste de texto ≥ 4.5:1 en modo claro y oscuro (tokens de color dedicados).
- Jerarquía de encabezados coherente (`h1` → `h2` de sección → `h3` de tarjeta).
- Gráficos `<canvas>` con `role="img"` y **alternativa textual** de los datos.
- **Modo oscuro** con botón en la barra superior (se recuerda con `localStorage`).
- Diseño **responsivo** (móvil y escritorio) con barra lateral tipo *drawer*.

> **Auditoría:** verificado con **axe-core (WCAG 2.1 A/AA)** → **0 violaciones** en las
> 9 vistas, en modo claro y oscuro.

---

## 🧠 Heurísticas de usabilidad (Nielsen)

| # | Heurística | Dónde se aplica |
|---|------------|-----------------|
| 1 | Visibilidad del estado | Stepper de 4 pasos, barra de progreso, badge de validaciones, *toasts*. |
| 2 | Correspondencia con el mundo real | Lenguaje del dominio (matrícula, créditos, ciclo, turno de mérito). |
| 3 | Control y libertad del usuario | *Quitar* curso, *Volver*, cerrar modal/panel con Escape, **Reiniciar demo**. |
| 4 | Consistencia y estándares | Tokens de color/tipografía reutilizados; mismos componentes en todas las vistas. |
| 5 | **Prevención de errores** | Pantalla de Validaciones + bloqueo de *Confirmar*; *“Sin cupo”* deshabilitado. |
| 6 | Reconocer mejor que recordar | Filtros, búsqueda, accesos rápidos, horario visual. |
| 7 | Flexibilidad y eficiencia | Filtros/orden/paginación, *“Más filtros”*, vista calendario o lista. |
| 8 | Diseño estético y minimalista | Layout limpio fiel a las maquetas; sin ruido visual. |
| 9 | Ayuda a reconocer/recuperarse de errores | Mensajes en lenguaje natural con la acción sugerida. |
| 10 | Ayuda y documentación | Sección **Ayuda** (FAQ) y este README. |

---

## 🧱 Arquitectura

- **`data.js`** define los datos sembrados (cursos, historial, notificaciones).
- **`state.js`** centraliza el estado mutable (`STATE`).
- **`rules.js`** contiene la **lógica de negocio pura** (sin DOM): RN-1…RN-6 y las
  métricas del historial. Al no depender del DOM, se reutiliza tal cual en `tests.html`.
- **`app.js`** consume `rules.js`, renderiza la vista activa tras cada acción y
  persiste la matrícula en `localStorage`. **No hay datos hardcodeados** en las
  pantallas de Resumen ni Validaciones: el flujo *Catálogo → Horario → Resumen →
  Confirmar* siempre muestra exactamente los cursos que el usuario seleccionó.
