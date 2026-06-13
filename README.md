# Proyecto Web Reutilizable 40+ Componentes

Este kit contiene una sola pagina demo con 55 funcionalidades reutilizables para proyectos web con HTML, CSS, JavaScript y actividades guiadas para practicar Bootstrap.

## Mantenimiento de guias

Si actualizas snippets o detalles de la guia, puedes resincronizar las fuentes consumidas por la web con:

```bash
python tools/sync_guide_sources.py
```

## Estructura del proyecto

```
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── funciones.js
│       ├── script.js
│       ├── script-normal.js
│       ├── guide-data.js
│       └── guide-details-data.js
├── docs/
│   └── pdf/
│       └── (guías y actividades en PDF)
├── referencias/
│   └── (proyectos de ejemplo)
└── tools/
    └── (scripts auxiliares)
```

## Archivos principales

- `index.html`: estructura completa de la pagina y ejemplos de uso.
- `assets/css/styles.css`: estilos reutilizables, glassmorphism, responsive, componentes y variables.
- `assets/js/funciones.js`: version modular con `export` para usar desde otros archivos.
- `assets/js/script.js`: archivo principal que importa `initApp()` desde `funciones.js`.
- `assets/js/script-normal.js`: version sin modulos, lista para usar con `<script src="assets/js/script-normal.js"></script>`.
- `README.md`: guia corta de uso.

## Como ejecutar

Abre `index.html` con Live Server o desde un servidor local. Para modulos JS se recomienda Live Server.

```html
<script type="module" src="assets/js/script.js"></script>
```

Si necesitas la version normal sin `import/export`, comenta la linea anterior y usa:

```html
<script src="assets/js/script-normal.js"></script>
```

## Funcionalidades incluidas

1. Navbar fija con blur tipo glass.
2. Menu lateral ocultable.
3. Overlay para cerrar menu lateral.
4. Submenus desplegables dentro del sidebar.
5. Cambio de secciones del body con `data-section`.
6. Link activo en navbar y sidebar.
7. Dropdown superior.
8. Tema claro/oscuro.
9. Guardar tema en localStorage.
10. Barra de progreso de scroll.
11. Boton volver arriba.
12. Animacion reveal on scroll.
13. Contador animado.
14. Login demo.
15. Logout demo.
16. Recordar usuario.
17. Mostrar/ocultar contraseña.
18. Validacion de formulario.
19. Mensajes de error por campo.
20. Contador de caracteres.
21. Range slider con valor visible.
22. Informacion de archivo seleccionado.
23. Autoguardado de borrador.
24. Stepper de pasos.
25. Skeleton loader.
26. Select personalizado editable.
27. Tabs.
28. Acordeon.
29. Modal.
30. Toast notifications.
31. Carrusel.
32. Tooltip.
33. Badge de notificacion.
34. Copiar al portapapeles.
35. Cards dinamicas desde array.
36. Busqueda con debounce.
37. Filtros con chips.
38. Ordenamiento de cards.
39. Paginacion de cards.
40. Tabla ordenable.
41. Filtro de tabla.
42. Notas con localStorage.
43. Exportar notas a JSON.
44. Lista de tareas.
45. Drag and drop en tareas.
46. Borrar tareas.
47. Conversor con botones C/F/K.
48. Cambio de fondo segun unidad.
49. Calculo dinamico de temperatura.
50. Imprimir pagina.
51. Reset visual de demo.
52. Helpers reutilizables para DOM, storage y debounce.
53. Tarjeta de presentacion Bootstrap como actividad guiada.
54. Carrito de compras DOM como actividad guiada.
55. Footer reutilizable como pie de pagina profesional.

## Como agregar una nueva seccion

Agrega un boton con `data-section`:

```html
<button data-section="servicios">Servicios</button>
```

Agrega una seccion con el mismo id:

```html
<section id="servicios" data-view-section>
    <h2>Servicios</h2>
</section>
```

El router de `funciones.js` la detecta automaticamente.

## Como editar el selector personalizado

Para agregar opciones, duplica un `li` y cambia `data-value` y el texto visible:

```html
<li class="custom-select__option" data-value="nueva-opcion">Nueva opcion</li>
```

El valor real se guarda en el input hidden:

```html
<input type="hidden" id="selectProducto" value="apa">
```

## Como cambiar colores globales

Edita variables en `assets/css/styles.css`:

```css
:root {
    --primary: #2563eb;
    --secondary: #7c3aed;
    --radius-lg: 24px;
}
```

## Como crear una clase nueva modular

En `assets/js/funciones.js`:

```js
export class MiComponente {
    constructor() {
        console.log("Componente iniciado");
    }
}
```

En `assets/js/script.js`:

```js
import { MiComponente } from "./funciones.js";
new MiComponente();
```

## Recomendacion

Usa este proyecto como plantilla. Copia solamente los componentes que necesites y conserva los nombres de clases, ids y atributos `data-*` para que el JavaScript siga funcionando.



