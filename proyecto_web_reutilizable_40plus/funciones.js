export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

export function debounce(callback, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    };
}

export function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function readJSON(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

export class ToastManager {
    constructor(containerId = "toastContainer") {
        this.container = document.getElementById(containerId);
    }

    show(message, time = 2800) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        this.container.appendChild(toast);
        setTimeout(() => toast.remove(), time);
    }
}

export class RouterSections {
    constructor(toast) {
        this.sections = $$('[data-view-section]');
        this.buttons = $$('[data-section]');
        this.toast = toast;
        this.init();
    }

    init() {
        this.buttons.forEach((button) => {
            button.addEventListener("click", () => this.showSection(button.dataset.section));
        });
    }

    showSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (!target) return;

        this.sections.forEach((section) => section.classList.remove("is-active"));
        target.classList.add("is-active");

        this.buttons.forEach((button) => {
            button.classList.toggle("is-active", button.dataset.section === sectionId);
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
        this.toast?.show(`Seccion activa: ${sectionId}`);
    }
}

export class ThemeManager {
    constructor(buttonId = "themeToggle") {
        this.button = document.getElementById(buttonId);
        this.theme = localStorage.getItem("kit-theme") || "dark";
        this.init();
    }

    init() {
        this.applyTheme();
        this.button.addEventListener("click", () => {
            this.theme = this.theme === "dark" ? "light" : "dark";
            localStorage.setItem("kit-theme", this.theme);
            this.applyTheme();
        });
    }

    applyTheme() {
        document.documentElement.dataset.theme = this.theme;
        this.button.textContent = this.theme === "dark" ? "☾" : "☀";
    }
}

export class SidebarMenu {
    constructor() {
        this.sidebar = $("#sidebar");
        this.overlay = $("#overlay");
        this.openButton = $("#openSidebar");
        this.closeButton = $("#closeSidebar");
        this.groupButtons = $$(".side-group__button");
        this.sectionButtons = $$("#sidebar [data-section]");
        this.init();
    }

    init() {
        this.openButton.addEventListener("click", () => this.open());
        this.closeButton.addEventListener("click", () => this.close());
        this.overlay.addEventListener("click", () => this.close());
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.close();
        });
        this.groupButtons.forEach((button) => {
            button.addEventListener("click", () => button.parentElement.classList.toggle("is-open"));
        });
        this.sectionButtons.forEach((button) => button.addEventListener("click", () => this.close()));
    }

    open() {
        this.sidebar.classList.add("is-open");
        this.overlay.classList.add("is-active");
    }

    close() {
        this.sidebar.classList.remove("is-open");
        this.overlay.classList.remove("is-active");
    }
}

export class Dropdowns {
    constructor() {
        this.dropdowns = $$('[data-dropdown]');
        this.init();
    }

    init() {
        this.dropdowns.forEach((dropdown) => {
            const button = $('[data-dropdown-button]', dropdown);
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                dropdown.classList.toggle("is-open");
            });
        });
        document.addEventListener("click", () => this.dropdowns.forEach((d) => d.classList.remove("is-open")));
    }
}

export class CustomSelect {
    constructor(selector = "[data-custom-select]", onChange = null) {
        this.selects = $$(selector);
        this.onChange = onChange;
        this.init();
    }

    init() {
        this.selects.forEach((select) => {
            const button = $(".custom-select__button", select);
            const valueText = $(".custom-select__value", select);
            const hiddenInput = $("input[type='hidden']", select);
            const options = $$(".custom-select__option", select);

            button.addEventListener("click", (event) => {
                event.stopPropagation();
                this.closeAll(select);
                select.classList.toggle("is-open");
            });

            options.forEach((option) => {
                option.addEventListener("click", () => {
                    hiddenInput.value = option.dataset.value;
                    valueText.textContent = option.textContent;
                    options.forEach((item) => item.classList.remove("is-selected"));
                    option.classList.add("is-selected");
                    select.classList.remove("is-open");
                    this.onChange?.(hiddenInput.value, select);
                    document.dispatchEvent(new CustomEvent("custom-select:change", { detail: { value: hiddenInput.value } }));
                });
            });
        });

        document.addEventListener("click", () => this.closeAll());
    }

    closeAll(except = null) {
        this.selects.forEach((select) => {
            if (select !== except) select.classList.remove("is-open");
        });
    }
}

export class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        $$('[data-open-modal]').forEach((button) => {
            button.addEventListener("click", () => document.getElementById(button.dataset.openModal)?.showModal());
        });
        $$('[data-close-modal]').forEach((button) => {
            button.addEventListener("click", () => button.closest("dialog")?.close());
        });
    }
}

export class Tabs {
    constructor(selector = "[data-tabs]") {
        this.components = $$(selector);
        this.init();
    }

    init() {
        this.components.forEach((tabs) => {
            const buttons = $$("[data-tab]", tabs);
            const panels = $$(".tab-panel", tabs);
            buttons.forEach((button) => {
                button.addEventListener("click", () => {
                    buttons.forEach((item) => item.classList.remove("is-active"));
                    panels.forEach((panel) => panel.classList.remove("is-active"));
                    button.classList.add("is-active");
                    document.getElementById(button.dataset.tab)?.classList.add("is-active");
                });
            });
        });
    }
}

export class Accordion {
    constructor(selector = "[data-accordion]") {
        this.components = $$(selector);
        this.init();
    }

    init() {
        this.components.forEach((accordion) => {
            const buttons = $$(".accordion__button", accordion);
            buttons.forEach((button) => {
                button.addEventListener("click", () => button.nextElementSibling.classList.toggle("is-open"));
            });
        });
    }
}

export class Carousel {
    constructor(selector = "[data-carousel]") {
        this.carousels = $$(selector);
        this.init();
    }

    init() {
        this.carousels.forEach((carousel) => {
            const slides = $$(".carousel__slide", carousel);
            const next = $("[data-carousel-next]", carousel);
            const prev = $("[data-carousel-prev]", carousel);
            let index = 0;
            const render = () => slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
            next.addEventListener("click", () => { index = (index + 1) % slides.length; render(); });
            prev.addEventListener("click", () => { index = (index - 1 + slides.length) % slides.length; render(); });
        });
    }
}

export class ScrollTools {
    constructor() {
        this.progress = $("#scrollProgress");
        this.backButton = $("#backToTop");
        this.init();
    }

    init() {
        window.addEventListener("scroll", () => this.update());
        this.backButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        this.update();
    }

    update() {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
        this.progress.style.width = `${progress}%`;
        this.backButton.classList.toggle("is-visible", window.scrollY > 400);
    }
}

export class RevealOnScroll {
    constructor(selector = ".reveal") {
        this.elements = $$(selector);
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add("is-visible");
            });
        }, { threshold: 0.15 });
        this.elements.forEach((element) => this.observer.observe(element));
    }
}

export class CounterAnimation {
    constructor(selector = "[data-counter]") {
        this.counters = $$(selector);
        this.init();
    }

    init() {
        this.counters.forEach((counter) => {
            const target = Number(counter.dataset.target || 0);
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 40));
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                counter.textContent = current;
            }, 30);
        });
    }
}

export class LoginDemo {
    constructor(toast) {
        this.form = $("#loginForm");
        this.status = $("#sessionStatus");
        this.logout = $("#logoutButton");
        this.remember = $("#rememberUser");
        this.toast = toast;
        this.init();
    }

    init() {
        this.renderStatus();
        this.form.addEventListener("submit", (event) => this.login(event));
        this.logout.addEventListener("click", () => this.logoutUser());
    }

    login(event) {
        event.preventDefault();
        const email = $("#loginEmail").value.trim();
        const password = $("#loginPassword").value.trim();
        if (!email.includes("@") || password.length < 6) {
            this.toast.show("Revisa correo y contraseña.");
            return;
        }
        const user = { email, date: new Date().toLocaleString() };
        if (this.remember.checked) saveJSON("kit-user", user);
        sessionStorage.setItem("kit-session", JSON.stringify(user));
        this.renderStatus(user);
        this.toast.show("Sesion iniciada correctamente.");
    }

    logoutUser() {
        sessionStorage.removeItem("kit-session");
        localStorage.removeItem("kit-user");
        this.renderStatus(null);
        this.toast.show("Sesion cerrada.");
    }

    renderStatus(user = null) {
        const current = user || readJSON("kit-user") || JSON.parse(sessionStorage.getItem("kit-session") || "null");
        this.status.textContent = current ? `Usuario activo: ${current.email}. Ingreso: ${current.date}` : "Aun no hay sesion iniciada.";
    }
}

export class PasswordToggle {
    constructor() {
        this.buttons = $$('[data-toggle-password]');
        this.init();
    }

    init() {
        this.buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const input = document.getElementById(button.dataset.togglePassword);
                input.type = input.type === "password" ? "text" : "password";
                button.textContent = input.type === "password" ? "Ver" : "Ocultar";
            });
        });
    }
}

export class FormValidation {
    constructor(formId, toast) {
        this.form = document.getElementById(formId);
        this.toast = toast;
        if (this.form) this.init();
    }

    init() {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const valid = this.validate();
            this.toast.show(valid ? "Formulario enviado correctamente." : "Completa los campos requeridos.");
        });
    }

    validate() {
        let isValid = true;
        $$('input[required], textarea[required], select[required]', this.form).forEach((input) => {
            const error = document.querySelector(`[data-error="${input.id}"]`);
            let message = "";
            if (!input.value.trim()) message = "Este campo es obligatorio.";
            if (input.type === "email" && input.value && !input.value.includes("@")) message = "Correo no valido.";
            if (input.minLength > 0 && input.value.length < input.minLength) message = `Minimo ${input.minLength} caracteres.`;
            if (error) error.textContent = message;
            input.style.borderColor = message ? "#ef4444" : "#22c55e";
            if (message) isValid = false;
        });
        return isValid;
    }
}

export class CharacterCounter {
    constructor(inputId, counterId) {
        this.input = document.getElementById(inputId);
        this.counter = document.getElementById(counterId);
        this.init();
    }

    init() {
        this.input.addEventListener("input", () => this.counter.textContent = this.input.value.length);
    }
}

export class RangePreview {
    constructor(inputId, valueId) {
        this.input = document.getElementById(inputId);
        this.value = document.getElementById(valueId);
        this.init();
    }

    init() {
        this.input.addEventListener("input", () => this.value.textContent = this.input.value);
    }
}

export class FileInfo {
    constructor(inputId, infoId) {
        this.input = document.getElementById(inputId);
        this.info = document.getElementById(infoId);
        this.init();
    }

    init() {
        this.input.addEventListener("change", () => {
            const file = this.input.files[0];
            this.info.textContent = file ? `${file.name} - ${(file.size / 1024).toFixed(1)} KB` : "No hay archivo seleccionado.";
        });
    }
}

export class AutoSaveDraft {
    constructor(inputId, clearId, key, toast) {
        this.input = document.getElementById(inputId);
        this.clearButton = document.getElementById(clearId);
        this.key = key;
        this.toast = toast;
        this.init();
    }

    init() {
        this.input.value = localStorage.getItem(this.key) || "";
        this.input.dispatchEvent(new Event("input"));
        this.input.addEventListener("input", debounce(() => localStorage.setItem(this.key, this.input.value), 250));
        this.clearButton.addEventListener("click", () => {
            localStorage.removeItem(this.key);
            this.input.value = "";
            this.input.dispatchEvent(new Event("input"));
            this.toast.show("Borrador eliminado.");
        });
    }
}

export class Stepper {
    constructor(selector = "[data-stepper]") {
        this.stepper = $(selector);
        this.index = 0;
        this.texts = ["Paso 1: Datos personales", "Paso 2: Preferencias", "Paso 3: Confirmacion"];
        this.init();
    }

    init() {
        $('[data-step-next]', this.stepper).addEventListener("click", () => this.move(1));
        $('[data-step-prev]', this.stepper).addEventListener("click", () => this.move(-1));
        this.render();
    }

    move(direction) {
        this.index = Math.min(2, Math.max(0, this.index + direction));
        this.render();
    }

    render() {
        $$(".stepper__steps span", this.stepper).forEach((step, i) => step.classList.toggle("is-active", i <= this.index));
        $(".stepper__text", this.stepper).textContent = this.texts[this.index];
    }
}

export class SkeletonLoader {
    constructor(buttonId, areaId, toast) {
        this.button = document.getElementById(buttonId);
        this.area = document.getElementById(areaId);
        this.toast = toast;
        this.init();
    }

    init() {
        this.button.addEventListener("click", () => {
            this.area.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
            setTimeout(() => {
                this.area.innerHTML = `<p class="muted">Contenido cargado correctamente.</p>`;
                this.toast.show("Carga simulada finalizada.");
            }, 1200);
        });
    }
}

export class CatalogCards {
    constructor() {
        this.data = [
            { name: "APA", category: "cerveza", price: 12000, rating: 4.8 },
            { name: "Stout", category: "cerveza", price: 14000, rating: 4.7 },
            { name: "Sour", category: "cerveza", price: 13000, rating: 4.6 },
            { name: "Barley Wine", category: "cerveza", price: 18000, rating: 4.9 },
            { name: "Hamburguesa Xue", category: "comida", price: 26000, rating: 4.9 },
            { name: "Sandwich artesanal", category: "comida", price: 22000, rating: 4.5 },
            { name: "Brownie", category: "postre", price: 9000, rating: 4.4 },
            { name: "Cheesecake", category: "postre", price: 11000, rating: 4.7 }
        ];
        this.page = 1;
        this.perPage = 6;
        this.category = "all";
        this.search = "";
        this.sort = "name";
        this.grid = $("#catalogGrid");
        this.pagination = $("#catalogPagination");
        this.init();
    }

    init() {
        $("#catalogSearch").addEventListener("input", debounce((event) => { this.search = event.target.value.toLowerCase(); this.page = 1; this.render(); }, 250));
        $("#catalogSort").addEventListener("change", (event) => { this.sort = event.target.value; this.render(); });
        $$("#catalogChips .chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                $$("#catalogChips .chip").forEach((item) => item.classList.remove("is-active"));
                chip.classList.add("is-active");
                this.category = chip.dataset.category;
                this.page = 1;
                this.render();
            });
        });
        this.render();
    }

    getFilteredData() {
        return this.data
            .filter((item) => this.category === "all" || item.category === this.category)
            .filter((item) => item.name.toLowerCase().includes(this.search))
            .sort((a, b) => typeof a[this.sort] === "string" ? a[this.sort].localeCompare(b[this.sort]) : a[this.sort] - b[this.sort]);
    }

    render() {
        const items = this.getFilteredData();
        const totalPages = Math.max(1, Math.ceil(items.length / this.perPage));
        this.page = Math.min(this.page, totalPages);
        const pageItems = items.slice((this.page - 1) * this.perPage, this.page * this.perPage);
        this.grid.innerHTML = pageItems.map((item) => `
            <article class="product-card">
                <h3>${item.name}</h3>
                <p class="muted">Categoria: ${item.category}</p>
                <div class="product-card__meta"><strong>$${item.price.toLocaleString()}</strong><span>★ ${item.rating}</span></div>
            </article>
        `).join("") || `<p class="muted">No hay resultados.</p>`;
        this.pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `<button class="${i + 1 === this.page ? "is-active" : ""}" data-page="${i + 1}">${i + 1}</button>`).join("");
        $$('button', this.pagination).forEach((button) => button.addEventListener("click", () => { this.page = Number(button.dataset.page); this.render(); }));
    }
}

export class SortableTable {
    constructor(tableId, searchId) {
        this.table = document.getElementById(tableId);
        this.search = document.getElementById(searchId);
        this.direction = 1;
        this.init();
    }

    init() {
        $$('[data-sort-table]', this.table).forEach((header, index) => {
            header.addEventListener("click", () => this.sort(index));
        });
        this.search.addEventListener("input", () => this.filter());
    }

    sort(index) {
        const rows = $$("tbody tr", this.table);
        rows.sort((a, b) => a.children[index].textContent.localeCompare(b.children[index].textContent, undefined, { numeric: true }) * this.direction);
        this.direction *= -1;
        rows.forEach((row) => this.table.tBodies[0].appendChild(row));
    }

    filter() {
        const term = this.search.value.toLowerCase();
        $$("tbody tr", this.table).forEach((row) => row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none");
    }
}

export class NotesManager {
    constructor(toast) {
        this.input = $("#noteInput");
        this.saveButton = $("#saveNote");
        this.list = $("#noteList");
        this.exportButton = $("#exportNotes");
        this.toast = toast;
        this.notes = readJSON("kit-notes", []);
        this.init();
    }

    init() {
        this.saveButton.addEventListener("click", () => this.add());
        this.exportButton.addEventListener("click", () => this.export());
        this.render();
    }

    add() {
        const text = this.input.value.trim();
        if (!text) return this.toast.show("Escribe una nota primero.");
        this.notes.push({ id: Date.now(), text });
        saveJSON("kit-notes", this.notes);
        this.input.value = "";
        this.render();
        this.toast.show("Nota guardada.");
    }

    remove(id) {
        this.notes = this.notes.filter((note) => note.id !== id);
        saveJSON("kit-notes", this.notes);
        this.render();
    }

    render() {
        this.list.innerHTML = this.notes.map((note) => `<li><span>${note.text}</span><button class="danger-button" data-id="${note.id}">Borrar</button></li>`).join("");
        $$('button', this.list).forEach((button) => button.addEventListener("click", () => this.remove(Number(button.dataset.id))));
    }

    export() {
        const blob = new Blob([JSON.stringify(this.notes, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "notas.json";
        link.click();
        URL.revokeObjectURL(link.href);
    }
}

export class TodoManager {
    constructor(toast) {
        this.input = $("#todoInput");
        this.addButton = $("#addTodo");
        this.clearButton = $("#clearTodos");
        this.list = $("#todoList");
        this.toast = toast;
        this.todos = readJSON("kit-todos", []);
        this.dragged = null;
        this.init();
    }

    init() {
        this.addButton.addEventListener("click", () => this.add());
        this.clearButton.addEventListener("click", () => this.clear());
        this.render();
    }

    add() {
        const text = this.input.value.trim();
        if (!text) return this.toast.show("Escribe una tarea.");
        this.todos.push({ id: Date.now(), text, done: false });
        this.input.value = "";
        this.saveRender();
    }

    toggle(id) {
        this.todos = this.todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo);
        this.saveRender();
    }

    remove(id) {
        this.todos = this.todos.filter((todo) => todo.id !== id);
        this.saveRender();
    }

    clear() {
        this.todos = [];
        this.saveRender();
        this.toast.show("Tareas borradas.");
    }

    saveRender() {
        saveJSON("kit-todos", this.todos);
        this.render();
    }

    render() {
        this.list.innerHTML = this.todos.map((todo) => `
            <li draggable="true" data-id="${todo.id}">
                <label class="check-line"><input type="checkbox" ${todo.done ? "checked" : ""}> <span>${todo.done ? "✅" : "⬜"} ${todo.text}</span></label>
                <button class="danger-button">Borrar</button>
            </li>
        `).join("");
        $$('li', this.list).forEach((li) => {
            const id = Number(li.dataset.id);
            $('input', li).addEventListener("change", () => this.toggle(id));
            $('button', li).addEventListener("click", () => this.remove(id));
            li.addEventListener("dragstart", () => this.dragged = li);
            li.addEventListener("dragover", (event) => event.preventDefault());
            li.addEventListener("drop", () => {
                if (this.dragged && this.dragged !== li) {
                    this.list.insertBefore(this.dragged, li);
                    this.todos = $$('li', this.list).map((item) => this.todos.find((todo) => todo.id === Number(item.dataset.id)));
                    saveJSON("kit-todos", this.todos);
                }
            });
        });
    }
}

export class TemperatureTool {
    constructor(toast) {
        this.selectedUnit = "celsius";
        this.buttons = $$(".unit-button");
        this.input = $("#temperatureInput");
        this.result = $("#temperatureResult");
        this.message = $("#temperatureMessage");
        this.calculateButton = $("#calculateTemperature");
        this.toast = toast;
        this.init();
    }

    init() {
        this.buttons.forEach((button) => {
            button.addEventListener("click", () => this.selectUnit(button.dataset.unit));
        });
        this.calculateButton.addEventListener("click", () => this.calculate());
        this.selectUnit("celsius");
    }

    selectUnit(unit) {
        this.selectedUnit = unit;
        this.buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.unit === unit));
        document.body.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
        document.body.classList.add(`unit-${unit}`);
        this.message.textContent = `Unidad seleccionada: ${unit}`;
    }

    calculate() {
        const value = Number(this.input.value);
        if (!Number.isFinite(value)) {
            this.message.textContent = "Ingresa un numero valido.";
            this.result.textContent = "No se pudo calcular.";
            return;
        }

        let celsius;
        if (this.selectedUnit === "celsius") celsius = value;
        if (this.selectedUnit === "fahrenheit") celsius = (value - 32) * 5 / 9;
        if (this.selectedUnit === "kelvin") celsius = value - 273.15;

        const fahrenheit = (celsius * 9 / 5) + 32;
        const kelvin = celsius + 273.15;

        this.result.innerHTML = `
            <strong>Resultado desde ${this.selectedUnit}</strong><br>
            Celsius: ${celsius.toFixed(2)} °C<br>
            Fahrenheit: ${fahrenheit.toFixed(2)} °F<br>
            Kelvin: ${kelvin.toFixed(2)} K
        `;
        this.toast.show("Temperatura calculada.");
    }
}

export class CopyToClipboard {
    constructor(toast) {
        this.buttons = $$('[data-copy]');
        this.toast = toast;
        this.init();
    }

    init() {
        this.buttons.forEach((button) => {
            button.addEventListener("click", async () => {
                const target = document.querySelector(button.dataset.copy);
                await navigator.clipboard.writeText(target.textContent);
                this.toast.show("Texto copiado.");
            });
        });
    }
}

export class FeatureList {
    constructor() {
        this.features = [
            "Navbar fija glass", "Sidebar ocultable", "Submenus laterales", "Router de secciones",
            "Dropdown", "Tema claro/oscuro", "Scroll progress", "Back to top",
            "Reveal on scroll", "Contador animado", "Login demo", "Logout demo",
            "Recordar usuario", "Password toggle", "Validacion formularios", "Mensajes de error",
            "Character counter", "Range preview", "File info", "Autosave draft",
            "Stepper", "Skeleton loader", "Select personalizado", "Tabs",
            "Acordeon", "Modal", "Toast", "Carrusel",
            "Tooltip", "Badge", "Copy clipboard", "Cards dinamicas",
            "Busqueda", "Filtros chips", "Ordenamiento", "Paginacion",
            "Tabla ordenable", "Filtro de tabla", "LocalStorage notas", "Export JSON",
            "Todo list", "Drag and drop", "Confirmacion visual", "Conversor C/F/K",
            "Cambio fondo dinamico", "Print page", "Reset demo", "Debounce",
            "Helpers reutilizables", "Version modular", "Version normal", "Responsive design"
        ];
        this.container = $("#featureList");
        this.render();
    }

    render() {
        this.container.innerHTML = this.features.map((feature, index) => `
            <article class="feature-card">
                <strong>${index + 1}. ${feature}</strong>
                <span class="muted">Reutilizable en proyectos web.</span>
            </article>
        `).join("");
    }
}

export class UtilityActions {
    constructor(toast) {
        this.toast = toast;
        this.init();
    }

    init() {
        $$('[data-toast]').forEach((button) => button.addEventListener("click", () => this.toast.show(button.dataset.toast)));
        $("#printPage").addEventListener("click", () => window.print());
        $("#resetDemo").addEventListener("click", () => {
            document.body.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
            this.toast.show("Demo visual reiniciada.");
        });
        document.addEventListener("custom-select:change", (event) => {
            const target = $("#selectedProductText");
            if (target) target.textContent = event.detail.value;
        });
    }
}

export function initApp() {
    const toast = new ToastManager();
    new FeatureList();
    new RouterSections(toast);
    new ThemeManager();
    new SidebarMenu();
    new Dropdowns();
    new CustomSelect();
    new ModalManager();
    new Tabs();
    new Accordion();
    new Carousel();
    new ScrollTools();
    new RevealOnScroll();
    new CounterAnimation();
    new LoginDemo(toast);
    new PasswordToggle();
    new FormValidation("contactForm", toast);
    new CharacterCounter("messageText", "charCounter");
    new RangePreview("rangeInput", "rangeValue");
    new FileInfo("fileInput", "fileInfo");
    new AutoSaveDraft("messageText", "clearDraft", "kit-message-draft", toast);
    new Stepper();
    new SkeletonLoader("loadSkeleton", "skeletonArea", toast);
    new CatalogCards();
    new SortableTable("demoTable", "tableSearch");
    new NotesManager(toast);
    new TodoManager(toast);
    new TemperatureTool(toast);
    new CopyToClipboard(toast);
    new UtilityActions(toast);
}
