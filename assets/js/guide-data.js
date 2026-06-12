window.GUIDE_DATA = [
    {
        "id": 1,
        "name": "Navbar fija glass",
        "category": "Navegación",
        "description": "Barra superior fija con efecto blur y transparencia para un diseño moderno.",
        "html": "<header class=\"glass-navbar\">\n    <a href=\"#inicio\" class=\"brand\">\n        <span class=\"brand__mark\">CW</span>\n        <span class=\"brand__text\">Componentes Web</span>\n    </a>\n    <nav class=\"navbar-links\">\n        <button class=\"nav-link is-active\" data-section=\"inicio\">Inicio</button>\n        <button class=\"nav-link\" data-section=\"componentes\">Componentes</button>\n    </nav>\n</header>",
        "css": ".glass-navbar {\n    position: fixed;\n    top: 16px;\n    left: 50%;\n    transform: translateX(-50%);\n    z-index: 1000;\n    width: min(1120px, calc(100% - 32px));\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: var(--glass);\n    border: 1px solid var(--border);\n    border-radius: 999px;\n    backdrop-filter: blur(18px);\n    box-shadow: var(--shadow);\n}",
        "jsModular": "// No requiere JS adicional, pero se usa con RouterSections para navegar",
        "jsNormal": "// Cargar en index.html y asociar con el control de secciones"
    },
    {
        "id": 2,
        "name": "Sidebar ocultable",
        "category": "Navegación",
        "description": "Menú lateral colapsable para pantallas pequeñas controlado por eventos de clic.",
        "html": "<aside class=\"sidebar\" id=\"sidebar\">\n    <div class=\"sidebar__header\">\n        <strong>Menú lateral</strong>\n        <button id=\"closeSidebar\">×</button>\n    </div>\n    <div class=\"sidebar__content\">\n        <button data-section=\"inicio\">Inicio</button>\n    </div>\n</aside>\n<div class=\"overlay\" id=\"overlay\"></div>\n<button id=\"openSidebar\">☰</button>",
        "css": ".sidebar {\n    position: fixed;\n    top: 0; left: 0;\n    z-index: 1500;\n    width: 300px; height: 100vh;\n    background: var(--glass-strong);\n    backdrop-filter: blur(20px);\n    transform: translateX(-105%);\n    transition: transform var(--transition);\n}\n.sidebar.is-open {\n    transform: translateX(0);\n}\n.overlay {\n    position: fixed; inset: 0;\n    background: rgba(0,0,0,0.5); opacity: 0; pointer-events: none;\n}\n.overlay.is-active { opacity: 1; pointer-events: auto; }",
        "jsModular": "export class SidebarMenu {\n    constructor() {\n        this.sidebar = document.getElementById(\"sidebar\");\n        this.overlay = document.getElementById(\"overlay\");\n        this.openBtn = document.getElementById(\"openSidebar\");\n        this.closeBtn = document.getElementById(\"closeSidebar\");\n        this.init();\n    }\n    init() {\n        this.openBtn.addEventListener(\"click\", () => {\n            this.sidebar.classList.add(\"is-open\");\n            this.overlay.classList.add(\"is-active\");\n        });\n        this.closeBtn.addEventListener(\"click\", () => this.close());\n        this.overlay.addEventListener(\"click\", () => this.close());\n    }\n    close() {\n        this.sidebar.classList.remove(\"is-open\");\n        this.overlay.classList.remove(\"is-active\");\n    }\n}",
        "jsNormal": "class SidebarMenu {\n    // Mismo código que la versión modular sin la palabra \"export\"\n}"
    },
    {
        "id": 3,
        "name": "Submenús laterales",
        "category": "Navegación",
        "description": "Menús colapsables dentro del sidebar para agrupar enlaces por categorías.",
        "html": "<div class=\"side-group\">\n    <button class=\"side-group__button\">Interfaz ▾</button>\n    <div class=\"side-group__content\">\n        <button data-section=\"componentes\">Componentes UI</button>\n        <button data-section=\"formularios\">Formularios</button>\n    </div>\n</div>",
        "css": ".side-group__content {\n    max-height: 0;\n    overflow: hidden;\n    transition: max-height var(--transition);\n    padding-left: 12px;\n}\n.side-group.is-open .side-group__content {\n    max-height: 220px;\n}",
        "jsModular": "this.groupButtons = document.querySelectorAll(\".side-group__button\");\nthis.groupButtons.forEach(button => {\n    button.addEventListener(\"click\", () => button.parentElement.classList.toggle(\"is-open\"));\n});",
        "jsNormal": "// Incluido en la inicialización de la clase SidebarMenu"
    },
    {
        "id": 4,
        "name": "Router de secciones",
        "category": "Navegación",
        "description": "Controla el cambio de vistas activas en una SPA sencilla de forma dinámica.",
        "html": "<button data-section=\"inicio\">Inicio</button>\n<section id=\"inicio\" data-view-section class=\"view-section is-active\">\n    <!-- Contenido -->\n</section>",
        "css": ".view-section {\n    display: none;\n    animation: fadeIn 0.35s ease;\n}\n.view-section.is-active {\n    display: block;\n}",
        "jsModular": "export class RouterSections {\n    constructor() {\n        this.sections = [...document.querySelectorAll(\"[data-view-section]\")];\n        this.buttons = [...document.querySelectorAll(\"[data-section]\")];\n        this.init();\n    }\n    init() {\n        this.buttons.forEach(btn => {\n            btn.addEventListener(\"click\", () => this.showSection(btn.dataset.section));\n        });\n    }\n    showSection(id) {\n        this.sections.forEach(s => s.classList.toggle(\"is-active\", s.id === id));\n        this.buttons.forEach(b => b.classList.toggle(\"is-active\", b.dataset.section === id));\n    }\n}",
        "jsNormal": "class RouterSections {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 5,
        "name": "Dropdown superior",
        "category": "Navegación",
        "description": "Menú desplegable en la barra de navegación para configuraciones o perfiles.",
        "html": "<div class=\"dropdown\" data-dropdown>\n    <button data-dropdown-button>Más ▾</button>\n    <div class=\"dropdown__menu\">\n        <button data-section=\"login\">Login</button>\n    </div>\n</div>",
        "css": ".dropdown__menu {\n    position: absolute;\n    top: 100%; right: 0;\n    display: none;\n    background: var(--glass-strong);\n    border: 1px solid var(--border);\n    border-radius: var(--radius-md);\n}\n.dropdown.is-open .dropdown__menu {\n    display: grid;\n}",
        "jsModular": "export class Dropdowns {\n    constructor() {\n        this.dropdowns = [...document.querySelectorAll(\"[data-dropdown]\")];\n        this.init();\n    }\n    init() {\n        this.dropdowns.forEach(d => {\n            const btn = d.querySelector(\"[data-dropdown-button]\");\n            btn.addEventListener(\"click\", (e) => {\n                e.stopPropagation();\n                d.classList.toggle(\"is-open\");\n            });\n        });\n        document.addEventListener(\"click\", () => {\n            this.dropdowns.forEach(d => d.classList.remove(\"is-open\"));\n        });\n    }\n}",
        "jsNormal": "class Dropdowns {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 6,
        "name": "Tema claro/oscuro",
        "category": "Navegación",
        "description": "Alterna entre temas claro y oscuro guardando la preferencia en localStorage.",
        "html": "<button id=\"themeToggle\">☾</button>",
        "css": ":root {\n    --bg: #0f172a;\n    --text: #ffffff;\n}\n[data-theme=\"light\"] {\n    --bg: #ffffff;\n    --text: #0f172a;\n}",
        "jsModular": "export class ThemeManager {\n    constructor() {\n        this.button = document.getElementById(\"themeToggle\");\n        this.theme = localStorage.getItem(\"theme\") || \"dark\";\n        this.init();\n    }\n    init() {\n        this.apply();\n        this.button.addEventListener(\"click\", () => {\n            this.theme = this.theme === \"dark\" ? \"light\" : \"dark\";\n            localStorage.setItem(\"theme\", this.theme);\n            this.apply();\n        });\n    }\n    apply() {\n        document.documentElement.dataset.theme = this.theme;\n        this.button.textContent = this.theme === \"dark\" ? \"☾\" : \"☀\";\n    }\n}",
        "jsNormal": "class ThemeManager {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 7,
        "name": "Scroll progress",
        "category": "Navegación",
        "description": "Línea superior que indica el porcentaje de scroll en la página actual.",
        "html": "<div class=\"scroll-progress\" id=\"scrollProgress\"></div>",
        "css": ".scroll-progress {\n    position: fixed; top: 0; left: 0;\n    width: 0%; height: 4px; z-index: 2000;\n    background: linear-gradient(90deg, var(--primary), var(--secondary));\n}",
        "jsModular": "export class ScrollTools {\n    constructor() {\n        this.progress = document.getElementById(\"scrollProgress\");\n        window.addEventListener(\"scroll\", () => {\n            const total = document.documentElement.scrollHeight - window.innerHeight;\n            const pct = total > 0 ? (window.scrollY / total) * 100 : 0;\n            this.progress.style.width = `${pct}%`;\n        });\n    }\n}",
        "jsNormal": "class ScrollTools {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 8,
        "name": "Back to top",
        "category": "Navegación",
        "description": "Botón flotante que aparece al hacer scroll hacia abajo y permite volver al inicio.",
        "html": "<button class=\"back-to-top\" id=\"backToTop\">↑</button>",
        "css": ".back-to-top {\n    position: fixed; right: 20px; bottom: 20px;\n    opacity: 0; pointer-events: none;\n    transition: opacity var(--transition);\n}\n.back-to-top.is-visible {\n    opacity: 1; pointer-events: auto;\n}",
        "jsModular": "export class ScrollTools {\n    // Añadir al constructor:\n    // this.backButton = document.getElementById(\"backToTop\");\n    // this.backButton.addEventListener(\"click\", () => window.scrollTo({ top: 0, behavior: \"smooth\" }));\n    // En scroll handler:\n    // this.backButton.classList.toggle(\"is-visible\", window.scrollY > 400);\n}",
        "jsNormal": "// Implementado dentro de ScrollTools"
    },
    {
        "id": 9,
        "name": "Reveal on scroll",
        "category": "Animaciones",
        "description": "Efecto de aparición gradual de elementos utilizando el API IntersectionObserver.",
        "html": "<div class=\"reveal\">Contenido animado</div>",
        "css": ".reveal {\n    opacity: 0; transform: translateY(18px);\n    transition: opacity 0.6s ease, transform 0.6s ease;\n}\n.reveal.is-visible {\n    opacity: 1; transform: translateY(0);\n}",
        "jsModular": "export class RevealOnScroll {\n    constructor() {\n        this.elements = document.querySelectorAll(\".reveal\");\n        this.observer = new IntersectionObserver((entries) => {\n            entries.forEach(e => {\n                if (e.isIntersecting) e.target.classList.add(\"is-visible\");\n            });\n        }, { threshold: 0.15 });\n        this.elements.forEach(el => this.observer.observe(el));\n    }\n}",
        "jsNormal": "class RevealOnScroll {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 10,
        "name": "Contador animado",
        "category": "Animaciones",
        "description": "Sube el valor numérico de una estadística desde 0 hasta la meta de forma progresiva.",
        "html": "<span data-counter data-target=\"150\">0</span>",
        "css": "/* Estilos personalizados de la tarjeta */",
        "jsModular": "export class CounterAnimation {\n    constructor() {\n        this.counters = document.querySelectorAll(\"[data-counter]\");\n        this.init();\n    }\n    init() {\n        this.counters.forEach(c => {\n            const target = +c.dataset.target;\n            let curr = 0;\n            const step = Math.max(1, Math.ceil(target / 40));\n            const timer = setInterval(() => {\n                curr += step;\n                if (curr >= target) { curr = target; clearInterval(timer); }\n                c.textContent = curr;\n            }, 30);\n        });\n    }\n}",
        "jsNormal": "class CounterAnimation {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 11,
        "name": "Login demo",
        "category": "Autenticación",
        "description": "Simula un inicio de sesión local para pruebas de desarrollo frontend.",
        "html": "<form id=\"loginForm\">\n    <input type=\"email\" id=\"loginEmail\" required>\n    <input type=\"password\" id=\"loginPassword\" required>\n    <button type=\"submit\">Ingresar</button>\n</form>",
        "css": "/* Estilos de inputs y botones de validación */",
        "jsModular": "export class LoginDemo {\n    constructor() {\n        this.form = document.getElementById(\"loginForm\");\n        this.form.addEventListener(\"submit\", (e) => {\n            e.preventDefault();\n            // Guardar sesión simulada\n            sessionStorage.setItem(\"session\", \"true\");\n        });\n    }\n}",
        "jsNormal": "class LoginDemo {\n    // Versión normal sin export\n}"
    },
    {
        "id": 12,
        "name": "Logout demo",
        "category": "Autenticación",
        "description": "Borra el token o indicador de sesión simulada del almacenamiento local.",
        "html": "<button id=\"logoutButton\">Cerrar sesión</button>",
        "css": "/* Estilos del botón de logout */",
        "jsModular": "export class LoginDemo {\n    // Método logout:\n    logout() {\n        sessionStorage.removeItem(\"session\");\n        localStorage.removeItem(\"user\");\n    }\n}",
        "jsNormal": "// Implementado en la clase LoginDemo"
    },
    {
        "id": 13,
        "name": "Recordar usuario",
        "category": "Autenticación",
        "description": "Guarda el correo de login en localStorage para recordar las credenciales del usuario.",
        "html": "<input type=\"checkbox\" id=\"rememberUser\"> Recordar usuario",
        "css": "/* Alineaciones de checkbox */",
        "jsModular": "if (rememberCheckbox.checked) {\n    localStorage.setItem(\"user\", emailVal);\n}",
        "jsNormal": "// Se implementa dentro de la lógica del submit del LoginDemo"
    },
    {
        "id": 14,
        "name": "Password toggle",
        "category": "Autenticación",
        "description": "Botón integrado que alterna el atributo de entrada de tipo 'password' a 'text'.",
        "html": "<input id=\"passwordInput\" type=\"password\">\n<button data-toggle-password=\"passwordInput\">Ver</button>",
        "css": ".input-action { display: flex; gap: 8px; }",
        "jsModular": "export class PasswordToggle {\n    constructor() {\n        this.buttons = document.querySelectorAll(\"[data-toggle-password]\");\n        this.buttons.forEach(btn => {\n            btn.addEventListener(\"click\", () => {\n                const input = document.getElementById(btn.dataset.togglePassword);\n                input.type = input.type === \"password\" ? \"text\" : \"password\";\n                btn.textContent = input.type === \"password\" ? \"Ver\" : \"Ocultar\";\n            });\n        });\n    }\n}",
        "jsNormal": "class PasswordToggle {\n    // Mismo código sin \"export\"\n}"
    },
    {
        "id": 15,
        "name": "Validación formularios",
        "category": "Autenticación",
        "description": "Comprueba campos vacíos, correos correctos y longitudes mínimas en el cliente.",
        "html": "<form id=\"contactForm\" novalidate>\n    <input id=\"name\" required minlength=\"3\">\n</form>",
        "css": "input:invalid { border-color: red; }",
        "jsModular": "export class FormValidation {\n    validate() {\n        let valid = true;\n        // Lógica de comprobación de validez en campos obligatorios\n        return valid;\n    }\n}",
        "jsNormal": "class FormValidation {\n    // Sin export\n}"
    },
    {
        "id": 16,
        "name": "Mensajes de error",
        "category": "Autenticación",
        "description": "Mensajes descriptivos por campo que aparecen de forma dinámica si hay error.",
        "html": "<input id=\"emailInput\" required>\n<small class=\"field-error\" data-error=\"emailInput\"></small>",
        "css": ".field-error { color: #ef4444; min-height: 18px; }",
        "jsModular": "const errorText = document.querySelector(`[data-error=\"${input.id}\"]`);\nif (errorText) errorText.textContent = \"Correo no válido.\";",
        "jsNormal": "// Controlado desde la clase FormValidation"
    },
    {
        "id": 17,
        "name": "Character counter",
        "category": "Formularios",
        "description": "Contador de caracteres dinámico para áreas de texto con límite de caracteres.",
        "html": "<textarea id=\"msg\" maxlength=\"160\"></textarea>\n<span><span id=\"counter\">0</span>/160</span>",
        "css": "/* Estilos del contador de texto */",
        "jsModular": "export class CharacterCounter {\n    constructor(inputId, counterId) {\n        this.input = document.getElementById(inputId);\n        this.counter = document.getElementById(counterId);\n        this.input.addEventListener(\"input\", () => {\n            this.counter.textContent = this.input.value.length;\n        });\n    }\n}",
        "jsNormal": "class CharacterCounter {\n    // Sin export\n}"
    },
    {
        "id": 18,
        "name": "Range preview",
        "category": "Formularios",
        "description": "Visualiza el valor dinámico actual de un selector deslizante de tipo rango.",
        "html": "<input type=\"range\" id=\"range\" min=\"0\" max=\"100\">\n<span id=\"rangeVal\">50</span>",
        "css": "/* Estilos personalizados de controles deslizantes */",
        "jsModular": "export class RangePreview {\n    constructor(inputId, valueId) {\n        this.input = document.getElementById(inputId);\n        this.value = document.getElementById(valueId);\n        this.input.addEventListener(\"input\", () => {\n            this.value.textContent = this.input.value;\n        });\n    }\n}",
        "jsNormal": "class RangePreview {\n    // Sin export\n}"
    },
    {
        "id": 19,
        "name": "File info",
        "category": "Formularios",
        "description": "Muestra el nombre del archivo subido y su peso en kilobytes para guiar al usuario.",
        "html": "<input type=\"file\" id=\"file\">\n<p id=\"fileInfo\">No hay archivo seleccionado.</p>",
        "css": "/* Diseño de input file */",
        "jsModular": "export class FileInfo {\n    constructor(inputId, infoId) {\n        this.input = document.getElementById(inputId);\n        this.info = document.getElementById(infoId);\n        this.input.addEventListener(\"change\", () => {\n            const file = this.input.files[0];\n            this.info.textContent = file ? `${file.name} - ${(file.size / 1024).toFixed(1)} KB` : \"Vacio\";\n        });\n    }\n}",
        "jsNormal": "class FileInfo {\n    // Sin export\n}"
    },
    {
        "id": 20,
        "name": "Autosave draft",
        "category": "Formularios",
        "description": "Guarda de forma automática en localStorage el borrador de un campo de texto.",
        "html": "<textarea id=\"msg\"></textarea>\n<button id=\"clearDraft\">Limpiar</button>",
        "css": "/* Estilos */",
        "jsModular": "export class AutoSaveDraft {\n    constructor(inputId, clearId, key) {\n        this.input = document.getElementById(inputId);\n        this.input.value = localStorage.getItem(key) || \"\";\n        this.input.addEventListener(\"input\", () => localStorage.setItem(key, this.input.value));\n    }\n}",
        "jsNormal": "class AutoSaveDraft {\n    // Sin export\n}"
    },
    {
        "id": 21,
        "name": "Stepper",
        "category": "Formularios",
        "description": "Guía al usuario en un proceso de varios pasos mostrando el paso activo.",
        "html": "<div class=\"stepper\" id=\"stepper\">\n    <div class=\"stepper__steps\">\n        <span class=\"is-active\">1</span>\n        <span>2</span>\n    </div>\n    <p class=\"stepper__text\">Paso 1</p>\n    <button data-step-prev>Anterior</button>\n    <button data-step-next>Siguiente</button>\n</div>",
        "css": ".stepper__steps span { width: 32px; height: 32px; border-radius: 50%; background: #ddd; }\n.stepper__steps span.is-active { background: var(--primary); color: white; }",
        "jsModular": "export class Stepper {\n    // Controla la clase is-active en los spans e incrementa/decrementa el indice del paso actual.\n}",
        "jsNormal": "class Stepper {\n    // Versión normal de la clase stepper\n}"
    },
    {
        "id": 22,
        "name": "Skeleton loader",
        "category": "Formularios",
        "description": "Muestra bloques grises de carga animados mientras se descargan datos reales.",
        "html": "<div id=\"skeletonArea\"></div>",
        "css": ".skeleton {\n    height: 18px; margin: 8px 0; border-radius: 4px;\n    background: linear-gradient(90deg, #eee, #f5f5f5, #eee);\n    background-size: 200% 100%;\n    animation: loading 1.2s infinite;\n}\n@keyframes loading { to { background-position: -200% 0; } }",
        "jsModular": "export class SkeletonLoader {\n    // Inyecta el div .skeleton en el contenedor y luego lo reemplaza por el texto final\n}",
        "jsNormal": "class SkeletonLoader {\n    // Sin export\n}"
    },
    {
        "id": 23,
        "name": "Select personalizado",
        "category": "Componentes UI",
        "description": "Reemplaza el select del navegador con una lista estilizable y adaptada.",
        "html": "<div class=\"custom-select\" data-custom-select>\n    <input type=\"hidden\" id=\"selectProd\" value=\"apa\">\n    <button type=\"button\" class=\"custom-select__button\">\n        <span class=\"custom-select__value\">APA artesanal</span>\n        <span class=\"custom-select__arrow\">⌄</span>\n    </button>\n    <ul class=\"custom-select__options\">\n        <li class=\"custom-select__option is-selected\" data-value=\"apa\">APA</li>\n        <li class=\"custom-select__option\" data-value=\"stout\">Stout</li>\n    </ul>\n</div>",
        "css": ".custom-select { position: relative; }\n.custom-select__options {\n    position: absolute; top: 100%; left: 0; width: 100%;\n    display: none; background: var(--glass-strong);\n}\n.custom-select.is-open .custom-select__options { display: block; }",
        "jsModular": "export class CustomSelect {\n    // Escucha clics en el botón para alternar is-open, y clics en opciones para actualizar el input hidden.\n}",
        "jsNormal": "class CustomSelect {\n    // Sin export\n}"
    },
    {
        "id": 24,
        "name": "Tabs",
        "category": "Componentes UI",
        "description": "Agrupa información diferente en la misma área alternando pestañas activas.",
        "html": "<div class=\"tabs\" data-tabs>\n    <button data-tab=\"panel1\" class=\"is-active\">HTML</button>\n    <button data-tab=\"panel2\">CSS</button>\n    <div class=\"tab-panel is-active\" id=\"panel1\">Contenido HTML</div>\n    <div class=\"tab-panel\" id=\"panel2\">Contenido CSS</div>\n</div>",
        "css": ".tab-panel { display: none; }\n.tab-panel.is-active { display: block; }",
        "jsModular": "export class Tabs {\n    constructor() {\n        this.init();\n    }\n    init() {\n        // Escuchar clics en los botones de pestañas y agregar is-active al panel correspondiente\n    }\n}",
        "jsNormal": "class Tabs {\n    // Sin export\n}"
    },
    {
        "id": 25,
        "name": "Acordeón",
        "category": "Componentes UI",
        "description": "Sección colapsable ideal para FAQs donde solo se muestra el texto al hacer clic.",
        "html": "<div class=\"accordion\" data-accordion>\n    <button class=\"accordion__button\">¿Para qué sirve?</button>\n    <div class=\"accordion__content\">Para reutilizar código.</div>\n</div>",
        "css": ".accordion__content {\n    max-height: 0; overflow: hidden;\n    transition: max-height var(--transition), padding var(--transition);\n}\n.accordion__content.is-open {\n    max-height: 140px; padding: 12px;\n}",
        "jsModular": "export class Accordion {\n    // Añade el evento clic al botón para alternar la clase is-open en el siguiente elemento hermano\n}",
        "jsNormal": "class Accordion {\n    // Sin export\n}"
    },
    {
        "id": 26,
        "name": "Modal",
        "category": "Componentes UI",
        "description": "Ventana emergente que superpone contenido importante usando el tag diálogo nativo.",
        "html": "<dialog class=\"modal\" id=\"demoModal\">\n    <div class=\"modal__content\">\n        <h3>Título modal</h3>\n        <button data-close-modal>Entendido</button>\n    </div>\n</dialog>\n<button data-open-modal=\"demoModal\">Abrir</button>",
        "css": ".modal {\n    border: 1px solid var(--border); border-radius: 12px;\n    background: var(--glass-strong); box-shadow: var(--shadow);\n}\n.modal::backdrop { background: rgba(0,0,0,0.5); }",
        "jsModular": "export class ModalManager {\n    // Muestra el dialog usando el metodo showModal() nativo e implementa close() para cerrar\n}",
        "jsNormal": "class ModalManager {\n    // Sin export\n}"
    },
    {
        "id": 27,
        "name": "Toast",
        "category": "Componentes UI",
        "description": "Mensaje flotante que aparece abajo a la derecha y se descarta solo en segundos.",
        "html": "<div class=\"toast-container\" id=\"toastContainer\"></div>",
        "css": ".toast-container { position: fixed; right: 20px; bottom: 80px; }\n.toast { background: var(--glass-strong); border: 1px solid var(--border); animation: slide 0.3s; }",
        "jsModular": "export class ToastManager {\n    show(msg) {\n        const t = document.createElement(\"div\");\n        t.className = \"toast\"; t.textContent = msg;\n        document.getElementById(\"toastContainer\").appendChild(t);\n        setTimeout(() => t.remove(), 2800);\n    }\n}",
        "jsNormal": "class ToastManager {\n    // Sin export\n}"
    },
    {
        "id": 28,
        "name": "Carrusel",
        "category": "Componentes UI",
        "description": "Visor de imágenes o testimonios interactivo con controles de avanzar y retroceder.",
        "html": "<div class=\"carousel\" data-carousel>\n    <div class=\"carousel__slide is-active\">Slide 1</div>\n    <div class=\"carousel__slide\">Slide 2</div>\n    <button data-carousel-prev>Anterior</button>\n    <button data-carousel-next>Siguiente</button>\n</div>",
        "css": ".carousel__slide { display: none; }\n.carousel__slide.is-active { display: grid; }",
        "jsModular": "export class Carousel {\n    // Controla el indice de la diapositiva activa agregando is-active en base al boton clicado\n}",
        "jsNormal": "class Carousel {\n    // Sin export\n}"
    },
    {
        "id": 29,
        "name": "Tooltip",
        "category": "Extras UI",
        "description": "Globo de ayuda que aparece por encima de un botón al pasar el mouse por encima.",
        "html": "<button class=\"tooltip\" data-tooltip=\"Información extra\">?</button>",
        "css": ".tooltip { position: relative; }\n.tooltip::after {\n    content: attr(data-tooltip); position: absolute; bottom: 100%;\n    background: var(--glass-strong); color: var(--text);\n    opacity: 0; pointer-events: none; transition: opacity 0.2s;\n}\n.tooltip:hover::after { opacity: 1; }",
        "jsModular": "// No requiere JS. Se maneja al 100% con selectores y pseudo-elementos de CSS.",
        "jsNormal": "// No requiere JS."
    },
    {
        "id": 30,
        "name": "Badge",
        "category": "Extras UI",
        "description": "Etiqueta circular o numérica pequeña para indicar notificaciones o etiquetas.",
        "html": "<span class=\"notification-badge\">3</span>",
        "css": ".notification-badge {\n    display: inline-flex; align-items: center; justify-content: center;\n    width: 32px; height: 32px; border-radius: 50%;\n    background: rgba(37, 99, 235, 0.9); color: white;\n}",
        "jsModular": "// No requiere JS para renderizar, solo para cambiar el número si se quiere.",
        "jsNormal": "// Solo HTML y CSS"
    },
    {
        "id": 31,
        "name": "Copy clipboard",
        "category": "Extras UI",
        "description": "Permite copiar un bloque de texto al portapapeles del sistema con un clic.",
        "html": "<code id=\"code\">WEB-2026</code>\n<button data-copy=\"#code\">Copiar</button>",
        "css": "/* Estilos de botones */",
        "jsModular": "export class CopyToClipboard {\n    constructor() {\n        this.buttons = document.querySelectorAll(\"[data-copy]\");\n        this.buttons.forEach(btn => {\n            btn.addEventListener(\"click\", async () => {\n                const target = document.querySelector(btn.dataset.copy);\n                await navigator.clipboard.writeText(target.textContent);\n            });\n        });\n    }\n}",
        "jsNormal": "class CopyToClipboard {\n    // Sin export\n}"
    },
    {
        "id": 32,
        "name": "Cards dinámicas",
        "category": "Datos dinámicos",
        "description": "Renderiza tarjetas visuales en el DOM a partir de una lista de objetos JSON.",
        "html": "<div class=\"card-grid\" id=\"catalogGrid\"></div>",
        "css": ".card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }",
        "jsModular": "const data = [{ name: \"APA\", price: 12000 }];\ngrid.innerHTML = data.map(item => `\n    <article class=\"product-card\">\n        <h3>${item.name}</h3>\n        <p>$${item.price}</p>\n    </article>\n`).join(\"\");",
        "jsNormal": "// Incluido en la inicialización y render de CatalogCards"
    },
    {
        "id": 33,
        "name": "Búsqueda",
        "category": "Datos dinámicos",
        "description": "Filtra tarjetas del catálogo buscando coincidencias con el texto de entrada.",
        "html": "<input id=\"catalogSearch\" type=\"search\" placeholder=\"Buscar...\">",
        "css": "/* Estilos input search */",
        "jsModular": "this.search = \"\";\n$(\"#catalogSearch\").addEventListener(\"input\", debounce((event) => {\n    this.search = event.target.value.toLowerCase();\n    this.render();\n}));",
        "jsNormal": "// Incluido en CatalogCards"
    },
    {
        "id": 34,
        "name": "Filtros chips",
        "category": "Datos dinámicos",
        "description": "Filtrado rápido de elementos mediante botones estilo pastilla de categorías.",
        "html": "<div id=\"catalogChips\">\n    <button class=\"chip is-active\" data-category=\"all\">Todos</button>\n    <button class=\"chip\" data-category=\"cerveza\">Cerveza</button>\n</div>",
        "css": ".chip.is-active { background: var(--primary); color: white; }",
        "jsModular": "chips.forEach(chip => chip.addEventListener(\"click\", () => {\n    this.category = chip.dataset.category;\n    this.render();\n}));",
        "jsNormal": "// Incluido en CatalogCards"
    },
    {
        "id": 35,
        "name": "Ordenamiento",
        "category": "Datos dinámicos",
        "description": "Ordena el catálogo dinámico por orden alfabético, precio o valoraciones.",
        "html": "<select id=\"catalogSort\">\n    <option value=\"name\">Nombre</option>\n    <option value=\"price\">Precio</option>\n</select>",
        "css": "/* Estilos select */",
        "jsModular": "data.sort((a, b) => {\n    if (this.sort === \"price\") return a.price - b.price;\n    return a.name.localeCompare(b.name);\n});",
        "jsNormal": "// Incluido en CatalogCards"
    },
    {
        "id": 36,
        "name": "Paginación",
        "category": "Datos dinámicos",
        "description": "Segmenta el catálogo en páginas para mejorar el rendimiento y legibilidad.",
        "html": "<div class=\"pagination\" id=\"catalogPagination\"></div>",
        "css": ".pagination button.is-active { background: var(--primary); }",
        "jsModular": "const pageItems = items.slice((this.page - 1) * this.perPage, this.page * this.perPage);\n// Generar botones de paginación dinámicamente",
        "jsNormal": "// Incluido en el render de la paginación de CatalogCards"
    },
    {
        "id": 37,
        "name": "Tabla ordenable",
        "category": "Datos dinámicos",
        "description": "Permite ordenar las filas de una tabla al hacer clic en los encabezados.",
        "html": "<table id=\"demoTable\">\n    <thead>\n        <tr><th data-sort-table=\"name\">Nombre</th></tr>\n    </thead>\n    <tbody>...</tbody>\n</table>",
        "css": ".data-table th { cursor: pointer; color: var(--primary); }",
        "jsModular": "export class SortableTable {\n    // Ordena las filas del tbody en base al contenido de texto de la columna seleccionada.\n}",
        "jsNormal": "class SortableTable {\n    // Sin export\n}"
    },
    {
        "id": 38,
        "name": "Filtro de tabla",
        "category": "Datos dinámicos",
        "description": "Filtra las filas de una tabla según las coincidencias con el texto ingresado.",
        "html": "<input id=\"tableSearch\" type=\"search\" placeholder=\"Filtrar...\">",
        "css": "/* Estilos del buscador de tabla */",
        "jsModular": "this.search.addEventListener(\"input\", () => {\n    const term = this.search.value.toLowerCase();\n    rows.forEach(row => row.style.display = row.textContent.toLowerCase().includes(term) ? \"\" : \"none\");\n});",
        "jsNormal": "// Integrado dentro de la inicialización de la clase SortableTable"
    },
    {
        "id": 39,
        "name": "LocalStorage notas",
        "category": "Estado local",
        "description": "Guarda y recupera un listado de notas del almacenamiento local del navegador.",
        "html": "<textarea id=\"noteInput\"></textarea>\n<button id=\"saveNote\">Guardar</button>\n<ul id=\"noteList\"></ul>",
        "css": "/* Estilos */",
        "jsModular": "export class NotesManager {\n    // Lee y guarda un array de notas usando las utilidades saveJSON() y readJSON().\n}",
        "jsNormal": "class NotesManager {\n    // Sin export\n}"
    },
    {
        "id": 40,
        "name": "Export JSON",
        "category": "Estado local",
        "description": "Genera y descarga un archivo .json con los datos guardados por el usuario.",
        "html": "<button id=\"exportNotes\">Exportar notas JSON</button>",
        "css": "/* Estilos del botón */",
        "jsModular": "export class NotesManager {\n    export() {\n        const blob = new Blob([JSON.stringify(this.notes, null, 2)], { type: \"application/json\" });\n        const link = document.createElement(\"a\");\n        link.href = URL.createObjectURL(blob);\n        link.download = \"notas.json\";\n        link.click();\n    }\n}",
        "jsNormal": "// Incluido en la clase NotesManager"
    },
    {
        "id": 41,
        "name": "Todo list",
        "category": "Estado local",
        "description": "Lista de tareas interactivas donde se pueden marcar como completadas o eliminarse.",
        "html": "<input id=\"todoInput\">\n<button id=\"addTodo\">Agregar</button>\n<ul id=\"todoList\"></ul>",
        "css": ".check-line { display: flex; align-items: center; gap: 8px; }",
        "jsModular": "export class TodoManager {\n    // Maneja la creación, toggle de finalizado y eliminación de tareas.\n}",
        "jsNormal": "class TodoManager {\n    // Sin export\n}"
    },
    {
        "id": 42,
        "name": "Drag and drop",
        "category": "Estado local",
        "description": "Arrastra y suelta elementos de la lista de tareas para cambiar su orden visual.",
        "html": "<li draggable=\"true\" data-id=\"1\">Tarea 1</li>",
        "css": ".draggable-list li { cursor: grab; }",
        "jsModular": "li.addEventListener(\"dragstart\", () => this.dragged = li);\nli.addEventListener(\"drop\", () => {\n    this.list.insertBefore(this.dragged, li);\n    // Reordenar array en base al nuevo orden en el DOM\n});",
        "jsNormal": "// Controlado dinámicamente en el render de TodoManager"
    },
    {
        "id": 43,
        "name": "Confirmación visual",
        "category": "Estado local",
        "description": "Pequeñas alertas tipo toast o badges de cambio de estado tras guardar o eliminar.",
        "html": "<!-- Notificación toast -->",
        "css": "/* Estilos */",
        "jsModular": "this.toast.show(\"Nota guardada correctamente.\");",
        "jsNormal": "// Se invoca a toast.show() tras completar acciones en el DOM o Storage"
    },
    {
        "id": 44,
        "name": "Conversor C/F/K",
        "category": "Utilidades",
        "description": "Calcula y muestra de forma simultánea temperaturas en Fahrenheit y Kelvin desde una entrada base.",
        "html": "<input id=\"temperatureInput\" type=\"number\">\n<div id=\"temperatureResult\"></div>",
        "css": "/* Estilos del cuadro de resultado */",
        "jsModular": "export class TemperatureTool {\n    // Recibe el valor, lo pasa a Celsius, y luego calcula Fahrenheit y Kelvin\n}",
        "jsNormal": "class TemperatureTool {\n    // Sin export\n}"
    },
    {
        "id": 45,
        "name": "Cambio fondo dinámico",
        "category": "Utilidades",
        "description": "Cambia gradientes de fondo dentro de la tarjeta de la sección de temperatura.",
        "html": "<button class=\"unit-button\" data-unit=\"celsius\">C</button>",
        "css": ".temperature-tool.unit-celsius {\n    background: radial-gradient(...) , linear-gradient(...);\n}",
        "jsModular": "const container = $(\"#temperatureTool\");\ncontainer.classList.remove(\"unit-celsius\", \"unit-fahrenheit\", \"unit-kelvin\");\ncontainer.classList.add(`unit-${unit}`);",
        "jsNormal": "// Se aplica la clase de estado al contenedor al pulsar el botón de unidad"
    },
    {
        "id": 46,
        "name": "Print page",
        "category": "Utilidades",
        "description": "Lanza el diálogo de impresión nativo del navegador mediante una acción rápida.",
        "html": "<button id=\"printPage\">Imprimir página</button>",
        "css": "/* Estilos del botón */",
        "jsModular": "document.getElementById(\"printPage\").addEventListener(\"click\", () => window.print());",
        "jsNormal": "document.getElementById(\"printPage\").addEventListener(\"click\", () => window.print());"
    },
    {
        "id": 47,
        "name": "Reset demo",
        "category": "Utilidades",
        "description": "Quita las clases de unidad de temperatura y resetea el fondo a su estado inicial.",
        "html": "<button id=\"resetDemo\">Reiniciar demo</button>",
        "css": "/* Estilos del botón */",
        "jsModular": "$(\"#resetDemo\").addEventListener(\"click\", () => {\n    $(\"#temperatureTool\")?.classList.remove(\"unit-celsius\", \"unit-fahrenheit\", \"unit-kelvin\");\n});",
        "jsNormal": "// Limpia las clases del contenedor en el manejador del botón"
    },
    {
        "id": 48,
        "name": "Debounce",
        "category": "Utilidades",
        "description": "Retrasa la ejecución de llamadas a funciones costosas hasta que se detenga el tipeo.",
        "html": "<!-- Se asocia a inputs de búsqueda o guardado automático -->",
        "css": "/* No aplica */",
        "jsModular": "export function debounce(callback, delay = 300) {\n    let timeoutId;\n    return (...args) => {\n        clearTimeout(timeoutId);\n        timeoutId = setTimeout(() => callback(...args), delay);\n    };\n}",
        "jsNormal": "function debounce(callback, delay = 300) {\n    // Mismo código sin export\n}"
    },
    {
        "id": 49,
        "name": "Helpers reutilizables",
        "category": "Utilidades",
        "description": "Funciones auxiliares para abreviar selectores del DOM y JSON parsing.",
        "html": "<!-- No aplica -->",
        "css": "/* No aplica */",
        "jsModular": "export const $ = (selector, parent = document) => parent.querySelector(selector);\nexport const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];\nexport function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }",
        "jsNormal": "const $ = (selector, parent = document) => parent.querySelector(selector);\nconst $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];"
    },
    {
        "id": 50,
        "name": "Versión modular",
        "category": "Utilidades",
        "description": "Uso de import/export de ES Modules para mantener un código limpio e independiente.",
        "html": "<script type=\"module\" src=\"script.js\"></script>",
        "css": "/* No aplica */",
        "jsModular": "import { initApp } from \"./funciones.js\";\ndocument.addEventListener(\"DOMContentLoaded\", () => { initApp(); });",
        "jsNormal": "// No aplicable"
    },
    {
        "id": 51,
        "name": "Versión normal",
        "category": "Utilidades",
        "description": "Carga de código tradicional cargando todas las clases en el ámbito global.",
        "html": "<script src=\"script-normal.js\"></script>",
        "css": "/* No aplica */",
        "jsModular": "// No aplicable",
        "jsNormal": "document.addEventListener(\"DOMContentLoaded\", () => { initApp(); });"
    },
    {
        "id": 52,
        "name": "Responsive design",
        "category": "Utilidades",
        "description": "Reglas de CSS media queries que adaptan el catálogo y el layout general a pantallas de móviles.",
        "html": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
        "css": "@media (max-width: 900px) {\n    .navbar-links { display: none; }\n    .stats-grid, .two-column, .card-grid { grid-template-columns: 1fr; }\n}",
        "jsModular": "// No requiere JS",
        "jsNormal": "// No requiere JS"
    },
    {
        "id": 53,
        "name": "Tarjeta de presentación Bootstrap",
        "category": "Utilidades",
        "description": "Actividad guiada basada en LAB1 para crear una card personal con estructura tipo Bootstrap, estilo propio y vista alterna de tecnologías.",
        "html": "<article class=\"profile-lab\">\n    <div class=\"profile-lab__flip\" id=\"profileLabFlip\">\n        <section class=\"profile-lab__face profile-lab__face--front\">\n            <div class=\"profile-lab__avatar\">CM</div>\n            <h4>Carlos Madero</h4>\n            <p class=\"profile-lab__role\">Full Stack Java Developer</p>\n            <button id=\"showProfileTech\">Ver tecnologías</button>\n        </section>\n        <section class=\"profile-lab__face profile-lab__face--back\">\n            <h4>Tecnologías</h4>\n            <button id=\"hideProfileTech\">Volver</button>\n        </section>\n    </div>\n</article>",
        "css": ".profile-lab {\n    perspective: 1200px;\n}\n.profile-lab__flip {\n    transform-style: preserve-3d;\n    transition: transform 0.8s ease;\n}\n.profile-lab__flip.is-flipped {\n    transform: rotateY(180deg);\n}\n.profile-lab__face {\n    backface-visibility: hidden;\n}\n.profile-lab__face--back {\n    transform: rotateY(180deg);\n}",
        "jsModular": "export class ProfilePresentationActivity {\n    constructor() {\n        this.container = document.getElementById(\"profileLabFlip\");\n        document.getElementById(\"showProfileTech\")?.addEventListener(\"click\", () => this.container.classList.add(\"is-flipped\"));\n        document.getElementById(\"hideProfileTech\")?.addEventListener(\"click\", () => this.container.classList.remove(\"is-flipped\"));\n    }\n}",
        "jsNormal": "const flip = document.getElementById(\"profileLabFlip\");\ndocument.getElementById(\"showProfileTech\")?.addEventListener(\"click\", () => flip.classList.add(\"is-flipped\"));\ndocument.getElementById(\"hideProfileTech\")?.addEventListener(\"click\", () => flip.classList.remove(\"is-flipped\"));"
    },
    {
        "id": 54,
        "name": "Carrito de compras DOM",
        "category": "Utilidades",
        "description": "Actividad guiada para practicar DOM y eventos con una mini tienda: agregar productos, actualizar badge, calcular total, eliminar ítems y vaciar carrito.",
        "html": "<div class=\"shop-lab\">\n    <button class=\"shop-add-button\" data-name=\"Pack IPA\" data-price=\"18000\">Agregar</button>\n    <span id=\"shopBadge\">0</span>\n    <ul id=\"shopCartList\"></ul>\n    <strong id=\"shopCartTotal\">$0</strong>\n    <button id=\"clearShopCart\">Vaciar</button>\n</div>",
        "css": ".shop-lab__badge {\n    border-radius: 999px;\n    background: linear-gradient(135deg, var(--primary), var(--secondary));\n}\n.shop-cart__item {\n    display: flex;\n    justify-content: space-between;\n    gap: 12px;\n}",
        "jsModular": "export class ShoppingCartActivity {\n    constructor() {\n        this.buttons = document.querySelectorAll(\".shop-add-button\");\n        this.list = document.getElementById(\"shopCartList\");\n        this.badge = document.getElementById(\"shopBadge\");\n        this.total = document.getElementById(\"shopCartTotal\");\n    }\n    // Agrega listeners, crea items en el DOM, actualiza badge, total y vaciado\n}",
        "jsNormal": "const buttons = document.querySelectorAll(\".shop-add-button\");\n// Lee data-name y data-price, crea elementos li, actualiza badge y total, y vacia el carrito"
    },
    {
        "id": 55,
        "name": "Footer reutilizable",
        "category": "Estructura",
        "description": "Pie de pagina profesional con marca, enlaces de navegacion, contacto, redes sociales y barra de copyright. Totalmente responsive y adaptable.",
        "html": "<footer class=\"site-footer\" id=\"siteFooter\">\n    <div class=\"site-footer__grid\">\n        <div class=\"site-footer__brand\">\n            <span class=\"brand__mark\">CW</span>\n            <strong>Componentes Web</strong>\n            <p class=\"muted\">Banco de componentes reutilizables.</p>\n        </div>\n        <div class=\"site-footer__links\">\n            <strong>Secciones</strong>\n            <nav>\n                <a href=\"#inicio\">Inicio</a>\n                <a href=\"#componentes\">Componentes</a>\n                <a href=\"#guia\">Guia</a>\n            </nav>\n        </div>\n        <div class=\"site-footer__contact\">\n            <strong>Contacto</strong>\n            <a href=\"mailto:email@ejemplo.com\">Email</a>\n            <a href=\"https://github.com\">GitHub</a>\n        </div>\n    </div>\n    <div class=\"site-footer__bottom\">\n        <span>© 2026 Autor. Todos los derechos reservados.</span>\n        <span>55 funcionalidades documentadas</span>\n    </div>\n</footer>",
        "css": ".site-footer {\n    margin-top: 40px;\n    padding: 48px 32px 24px;\n    background: rgba(255, 255, 255, 0.04);\n    border-top: 1px solid var(--border);\n}\n.site-footer__grid {\n    display: grid;\n    grid-template-columns: 2fr 1fr 1fr;\n    gap: 40px;\n    max-width: 1120px;\n    margin: 0 auto 32px;\n}\n.site-footer__links a,\n.site-footer__contact a {\n    display: block;\n    font-size: 14px;\n    color: var(--muted);\n    text-decoration: none;\n    transition: color var(--transition);\n}\n.site-footer__links a:hover,\n.site-footer__contact a:hover {\n    color: var(--primary);\n}\n.site-footer__bottom {\n    display: flex;\n    justify-content: space-between;\n    gap: 16px;\n    max-width: 1120px;\n    margin: 0 auto;\n    padding-top: 24px;\n    border-top: 1px solid var(--border);\n    font-size: 13px;\n    color: var(--muted);\n}",
        "jsModular": "// No requiere JS. Los enlaces internos usan hash o se conectan con RouterSections.",
        "jsNormal": "// No requiere JS. Si usas enlaces internos con hash, el navegador los maneja automaticamente."
    }
];
