# Instrucciones y Prompt de Unificación para ChatGPT

Este archivo contiene la estructura y el **Prompt optimizado** que debes copiar y pegar en ChatGPT para que procese tus 4 PDFs actuales y los unifique en un único documento coherente, bien estructurado, sin duplicados y con un formato profesional y consistente para todos los 57 ejercicios.

---

## 1. Archivos que debes subir a ChatGPT

Debes subir los siguientes **4 archivos PDF** que se encuentran en tu carpeta `docs/pdf/` en el siguiente orden:

1. **`guia_reciclaje_componentes_web_01_10_actualizada_2026.pdf`** (Bloque 1: Funcionalidades 1 a 10)
2. **`guia_reciclaje_componentes_web_10_25_actualizada_2026.pdf`** (Bloque 2: Funcionalidades 11 a 25)
3. **`guia_reciclaje_componentes_web_26_40_actualizada_2026.pdf`** (Bloque 3: Funcionalidades 26 a 40)
4. **`guia_reciclaje_componentes_web_41_50_orden_correcto.pdf`** (Bloque 4: Funcionalidades 41 a 50)
5. **`guia_reciclaje_componentes_web_41_57_actualizada_2026.pdf`** (Bloque 4: Funcionalidades 41 a 57)
este ultimo tiene errores.

---

## 2. Prompt para copiar y pegar en ChatGPT

Copia el bloque de texto de abajo y pégalo en el chat donde subiste los 4 PDFs:

```text
Actúa como un redactor técnico experto, desarrollador Frontend senior y especialista en diseño de documentación de software.

Te he proporcionado 4 documentos PDF que contienen las guías de reciclaje y códigos de 57 funcionalidades de desarrollo web. Tu tarea es unificarlos y compilarlos en un único documento maestro perfectamente formateado y coherente.

### OBJETIVO PRINCIPAL:
Generar un único archivo unificado que sirva como una guía de aprendizaje paso a paso para que cualquier persona (principiante o avanzado) pueda entender, copiar, pegar e implementar estas 57 funcionalidades en sus propios sitios web.

---

### ESTRUCTURA REQUERIDA DEL DOCUMENTO UNIFICADO:

1. **Portada Profesional**:
   - Título: "Kit de Componentes Web Reutilizables - 57 Funcionalidades Prácticas"
   - Subtítulo: "Guía completa de implementación, código fuente y personalización paso a paso"
   - Fecha de actualización: 2026

2. **Tabla de Contenidos (Índice)**:
   - Debe listar los 57 ejercicios numerados secuencialmente del 1 al 57 en orden ascendente exacto, indicando sus nombres correctos.

3. **Estructura Interna de Cada una de las 57 Funcionalidades**:
   Para CADA uno de los ejercicios, debes estructurar la información usando estrictamente el siguiente formato uniforme:

   ---
   ## [Número]. [Nombre del Componente]

   ### Descripción
   [Explicación clara y concisa de qué hace este componente, su propósito práctico en una web y qué problemas resuelve].

   ### Tabla de Elementos, Variables y Propiedades
   [Incluir una tabla detallada con los elementos HTML clave, clases, IDs, variables CSS o variables JS usadas en el código, con el siguiente formato]:
   | Elemento / Variable | Tipo / Selector | Función / Propósito | ¿Es Modificable? | Impacto o Valor Sugerido |
   | :--- | :--- | :--- | :--- | :--- |
   | `id-ejemplo` | ID HTML | Contenedor principal de la funcionalidad | Sí | Puede cambiarse, requiere actualizar el JS |
   | `--color-accent` | Variable CSS | Color del borde y foco del elemento | Sí | Cambiar por cualquier color HSL/Hex |
   | `const delay` | Variable JS | Tiempo en ms del debounce | Sí | Por defecto 300ms, ajustar según necesidad |

   ### Explicación Detallada del Código
   [Proporcionar un análisis didáctico del código para estudiantes, desglosando]:
   - **Lógica HTML**: Qué etiquetas se usaron (semántica) y por qué estructuran el componente de esa manera.
   - **Estilos CSS**: Explicación de las propiedades críticas de diseño (flexbox, grid, transiciones, variables, responsive).
   - **Comportamiento JS**: Explicación detallada de cómo funcionan los eventos, las funciones asociadas, y el manejo de datos paso a paso.

   ### Paso a Paso para la Implementación
   1. **HTML**: Explicación breve de la estructura HTML básica necesaria para empezar.
   2. **CSS**: Explicación de los estilos visuales clave y clases aplicadas.
   3. **JavaScript (si aplica)**: Explicación de la lógica del script (eventos, funciones y flujo de datos).

   ### Código Fuente Completo e Integrado
   [Colocar aquí el código completo y listo para copiar y pegar. Utiliza bloques de código markdown con sintaxis coloreada (`html`, `css`, `javascript`). Si el código está dividido, asegúrate de presentarlo con comentarios claros indicando dónde pegar cada bloque].
   ---

---

### REGLAS IMPORTANTES DE FORMATO Y CONTENIDO (EVITAR ERRORES):

1. **Numeración Absoluta y Continua**:
   - Asegúrate de que los ejercicios se numeren consecutivamente del 1 al 57 sin saltarse números ni reiniciar la numeración en ningún bloque.
   - En el Bloque 5, asegúrate de que el orden sea secuencial hasta la barra de desplazamiento en el ejercicio 57.

2. **Eliminación de Duplicados e Inconsistencias**:
   - Revisa que ningún ejercicio se repita en diferentes secciones del documento. Cada funcionalidad debe aparecer una sola vez.
   - Si encuentras fragmentos de código duplicados o explicaciones redundantes a partir de la funcionalidad 41 en adelante, elimínalos y consolida una única explicación clara y limpia.

3. **Estilo del Código**:
   - Todo el código debe estar bien tabulado y formateado.
   - Los comentarios en el código deben estar en español, explicando qué hace cada sección clave del script o de la hoja de estilos.

4. **Tono y Redacción**:
   - Profesional, didáctico y directo al grano.
   - Evita textos genéricos o vacíos. Cada funcionalidad debe tener su explicación técnica correspondiente para que sirva como material de aprendizaje real.

---

### ANÁLISIS DE CONSISTENCIA ENTRE WEB Y PDF (IMPORTANTE):

He comparado el código de la aplicación web actual con el código presente en los PDFs. A continuación te indico qué componentes coinciden exactamente y cuáles tienen diferencias. Para los que difieren, al final de este prompt encontrarás el código oficial y correcto que DEBES usar.

**Funcionalidades 1 a 50 (Bloques 1, 2, 3 y base del 4):**
- ✅ COINCIDEN: Todos los componentes de los bloques 1 a 3 (funcionalidades 1 a 40) tienen el mismo código en la web y en el PDF. Usa el código de los PDFs tal como está.
- ✅ COINCIDEN: Funcionalidades 41 a 50 del Bloque 4 base también coinciden.

**Funcionalidades 51 a 57 (Apéndice del Bloque 4 — ATENCIÓN):**

- ✅ 51. Confirmación visual de copia → El PDF contiene el código correcto. Úsalo tal cual.
- ✅ 52. Debounce para buscador → El PDF contiene el código correcto. Úsalo tal cual.
- ✅ 53. Tarjeta de presentación Bootstrap → El PDF contiene el código correcto. Úsalo tal cual.
- ⚠️ **54. Carrito de compras interactivo → DIFERENCIA ENCONTRADA.** El PDF usa texto `"X"` para el botón eliminar. La web usa el carácter `"✕"`. Usa el código corregido que aparece abajo (Sección A).
- ✅ 55. Footer dinámico y adaptable → El PDF contiene el código correcto. Úsalo tal cual.
- ✅ 56. Tarjetas de precios Bootstrap → El PDF contiene el código correcto. Úsalo tal cual.
- ✅ 57. Barra de desplazamiento personalizada → El PDF contiene el código correcto. Úsalo tal cual.

**También verifica el componente 43 (Conversor C/F/K):**
- ⚠️ **43. Conversor de temperatura → DIFERENCIA ENCONTRADA.** El PDF muestra un código más antiguo sin validación de campo vacío. La web tiene la versión actualizada. Usa el código corregido que aparece abajo (Sección B).

---

### CÓDIGO OFICIAL CORREGIDO (DEBE REEMPLAZAR AL DEL PDF DONDE DIFIERE):

**[SECCIÓN A] — Funcionalidad 54: Carrito de compras interactivo (código correcto para el botón eliminar)**

El único cambio es el botón eliminar que en el código oficial usa el símbolo `✕` (no la letra `X`). El resto del código es idéntico al PDF. Cuando llegues a la funcionalidad 54, usa el siguiente bloque JS (sustituye solo la línea del `innerHTML` del botón):

```javascript
// Línea del botón eliminar — versión correcta (reemplazar "X" por ✕):
item.innerHTML = `
  <div>
    <strong>${name}</strong>
    <p class="muted">${this.formatPrice(price)}</p>
  </div>
  <button type="button" class="danger-button">✕</button>
`;
```

**[SECCIÓN B] — Funcionalidad 43: Conversor de temperatura C/F/K (código correcto con validación de campo vacío)**

El PDF puede mostrar código sin validar campo vacío. Usa esta versión oficial completa:

```javascript
// funciones.js — versión modular exportada
export class TemperatureTool {
  constructor(toast) {
    this.toast = toast;
    this.selectedUnit = 'celsius';
    this.buttons = document.querySelectorAll('.unit-button');
    this.input = document.getElementById('temperatureInput');
    this.result = document.getElementById('temperatureResult');
    this.message = document.getElementById('temperatureMessage');
    this.calculateButton = document.getElementById('calculateTemperature');
    this.container = document.getElementById('temperatureTool');
    if (this.container && this.input && this.calculateButton && this.result) {
      this.init();
    }
  }

  init() {
    this.buttons.forEach((button) => {
      button.addEventListener('click', () => {
        this.selectedUnit = button.dataset.unit;
        this.buttons.forEach((b) => b.classList.remove('is-active'));
        button.classList.add('is-active');
        this.applyBackground();
      });
    });
    this.calculateButton.addEventListener('click', () => this.calculate());
    this.buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.unit === 'celsius'));
    this.message.textContent = 'Unidad seleccionada: celsius';
  }

  applyBackground() {
    this.container.classList.remove('unit-celsius', 'unit-fahrenheit', 'unit-kelvin');
    this.container.classList.add(`unit-${this.selectedUnit}`);
  }

  calculate() {
    // VALIDACIÓN CAMPO VACÍO — diferencia clave respecto a versión antigua del PDF
    const rawValue = this.input.value.trim();
    if (rawValue === '') {
      this.message.textContent = 'El campo está vacío. Ingresa una temperatura para convertir.';
      this.result.textContent = 'No se pudo calcular.';
      return;
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      this.message.textContent = 'Ingresa un número válido.';
      this.result.textContent = 'No se pudo calcular.';
      return;
    }
    let celsius;
    if (this.selectedUnit === 'celsius') celsius = value;
    if (this.selectedUnit === 'fahrenheit') celsius = (value - 32) * 5 / 9;
    if (this.selectedUnit === 'kelvin') celsius = value - 273.15;

    const fahrenheit = (celsius * 9 / 5) + 32;
    const kelvin = celsius + 273.15;

    this.result.innerHTML = `
      <strong>Resultado desde ${this.selectedUnit}</strong><br>
      Celsius: ${celsius.toFixed(2)} °C<br>
      Fahrenheit: ${fahrenheit.toFixed(2)} °F<br>
      Kelvin: ${kelvin.toFixed(2)} K
    `;
    this.toast?.show('Temperatura calculada.');
  }
}

// script.js
import { TemperatureTool } from './funciones.js';
document.addEventListener('DOMContentLoaded', () => {
  const toast = new ToastManager();
  new TemperatureTool(toast);
});
```

```javascript
// script-normal.js — versión sin módulos (igual pero sin export)
class TemperatureTool {
  constructor(toast) {
    this.toast = toast;
    this.selectedUnit = 'celsius';
    this.buttons = document.querySelectorAll('.unit-button');
    this.input = document.getElementById('temperatureInput');
    this.result = document.getElementById('temperatureResult');
    this.message = document.getElementById('temperatureMessage');
    this.calculateButton = document.getElementById('calculateTemperature');
    this.container = document.getElementById('temperatureTool');
    if (this.container && this.input && this.calculateButton && this.result) {
      this.init();
    }
  }
  // ... (mismos métodos init, applyBackground, calculate que la versión modular)
}
document.addEventListener('DOMContentLoaded', () => {
  const toast = new ToastManager();
  new TemperatureTool(toast);
});
```

Por favor, lee detalladamente los 4 archivos adjuntos y genera el documento Markdown unificado listo para ser exportado a PDF.
```

---

## 3. Lista y Orden de las 57 Funcionalidades (Para verificar)

Para tu referencia y control, este es el listado ordenado que ChatGPT debe mantener:

### Bloque 1 (1 a 10)
1. Acordeón Dinámico
2. Alerta Temporal
3. Carrusel Básico
4. Contador de Caracteres
5. Menú Desplegable (Dropdown)
6. Modal Sencillo
7. Pestañas Flexibles (Tabs)
8. Tooltip Básico
9. Selector de Color (Color Picker)
10. Validar Formulario Sencillo

### Bloque 2 (11 a 25)
11. Filtro de Búsqueda
12. Modo Oscuro (Dark Mode)
13. Reloj Digital
14. Botón "Volver Arriba" (Scroll to Top)
15. Menú Hamburguesa
16. Temporizador (Countdown)
17. Tarjetas con Efecto Hover
18. Barra de Progreso de Lectura
19. Notificaciones Push Simuladas
20. Generador de Contraseñas
21. Efecto de Carga (Spinner)
22. Calificación por Estrellas (Star Rating)
23. Reproductor de Audio Simple
24. Galería con Filtro de Categorías
25. Autocompletado de Búsqueda (Autocomplete)

### Bloque 3 (26 a 40)
26. Formulario con Pasos (Multi-step Form)
27. Desplazamiento Suave (Smooth Scroll)
28. Acordeón con Iconos
29. Alerta Confirmable (Confirm Dialog)
30. Carrusel con Autoplay
31. Contador de Números Animado
32. Menú Desplegable con Hover
33. Modal Animado con Efecto
34. Pestañas con Transición Desvanecida
35. Tooltip con Dirección
36. Selector de Archivos (Drag & Drop File Upload)
37. Validación con Indicador de Fuerza
38. Filtro Avanzado Multi-criterio
39. Modo Oscuro con LocalStorage
40. Reloj con Alarma Configurable

### Bloque 4 (41 a 57)
41. Todo list (Teoría y Código)
42. Drag and drop (Teoría y Código)
43. Conversor C/F/K (Teoría y Código)
44. Temporizador avanzado (Teoría y Código)
45. Tarjetas con animación 3D (Teoría y Código)
46. Buscador inteligente (Teoría y Código)
47. Reloj mundial (Teoría y Código)
48. Formulario dinámico (Teoría y Código)
49. Conversor de bases numéricas (Teoría y Código)
50. Responsive design (Teoría y Código)
51. Confirmación visual de copia de código (Código y Guía)
52. Debounce para buscador en tiempo real (Código y Guía)
53. Tarjeta de presentación dinámica (Código y Guía Bootstrap)
54. Carrito de compras interactivo (Código y Guía DOM)
55. Footer dinámico y adaptable (Código y Guía)
56. Tarjetas de precios responsivas (Código y Guía Bootstrap)
57. Barra de desplazamiento personalizada (Código y Guía)
