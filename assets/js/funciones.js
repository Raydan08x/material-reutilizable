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

export async function copyText(value) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    try {
        document.execCommand("copy");
        return true;
    } finally {
        helper.remove();
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
        this.button.textContent = this.theme === "dark" ? "Dark" : "Light";
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
                    document.dispatchEvent(new CustomEvent("custom-select:change", { detail: { value: hiddenInput.value, inputId: hiddenInput.id } }));
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
        document.addEventListener("custom-select:change", (event) => {
            if (event.detail.inputId === "catalogSort") {
                this.sort = event.detail.value;
                this.render();
            }
        });
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
        // Solo marcar activo sin cambiar fondo local o global al inicio
        this.selectedUnit = "celsius";
        this.buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.unit === "celsius"));
        this.message.textContent = `Unidad seleccionada: celsius`;
    }

    selectUnit(unit) {
        this.selectedUnit = unit;
        this.buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.unit === unit));
        const container = $("#temperatureTool");
        if (container) {
            container.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
            container.classList.add(`unit-${unit}`);
        }
        this.message.textContent = `Unidad seleccionada: ${unit}`;
    }

    calculate() {
        const rawValue = this.input.value.trim();
        if (rawValue === "") {
            this.message.textContent = "El campo está vacío. Ingresa una temperatura para convertir.";
            this.result.textContent = "No se pudo calcular.";
            return;
        }

        const value = Number(rawValue);
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

export class ProfilePresentationActivity {
    constructor() {
        this.container = $("#profileLabFlip");
        this.showButton = $("#showProfileTech");
        this.hideButton = $("#hideProfileTech");
        if (this.container && this.showButton && this.hideButton) {
            this.init();
        }
    }

    init() {
        this.showButton.addEventListener("click", () => this.container.classList.add("is-flipped"));
        this.hideButton.addEventListener("click", () => this.container.classList.remove("is-flipped"));
    }
}

export class ShoppingCartActivity {
    constructor(toast) {
        this.toast = toast;
        this.buttons = $$(".shop-add-button");
        this.list = $("#shopCartList");
        this.badge = $("#shopBadge");
        this.total = $("#shopCartTotal");
        this.emptyMessage = $("#shopEmptyMessage");
        this.clearButton = $("#clearShopCart");
        this.itemsCount = 0;
        this.totalAmount = 0;
        if (this.buttons.length && this.list && this.badge && this.total && this.emptyMessage && this.clearButton) {
            this.init();
        }
    }

    init() {
        this.buttons.forEach((button) => {
            button.addEventListener("click", () => {
                this.addItem(button.dataset.name, Number(button.dataset.price));
            });
        });
        this.clearButton.addEventListener("click", () => this.clear());
        this.renderSummary();
    }

    addItem(name, price) {
        const item = document.createElement("li");
        item.className = "shop-cart__item";
        item.innerHTML = `
            <div>
                <strong>${name}</strong>
                <p class="muted">${this.formatPrice(price)}</p>
            </div>
            <button type="button" class="danger-button">✕</button>
        `;

        $("button", item)?.addEventListener("click", () => this.removeItem(item, price));
        this.list.appendChild(item);
        this.itemsCount += 1;
        this.totalAmount += price;
        this.renderSummary();
        this.toast?.show(`${name} agregado al carrito.`);
    }

    removeItem(item, price) {
        item.remove();
        this.itemsCount = Math.max(0, this.itemsCount - 1);
        this.totalAmount = Math.max(0, this.totalAmount - price);
        this.renderSummary();
    }

    clear() {
        $$("li", this.list).forEach((item) => item.remove());
        this.itemsCount = 0;
        this.totalAmount = 0;
        this.renderSummary();
        this.toast?.show("Carrito vaciado.");
    }

    renderSummary() {
        this.badge.textContent = String(this.itemsCount);
        this.total.textContent = this.formatPrice(this.totalAmount);
        this.emptyMessage.style.display = this.itemsCount ? "none" : "block";
    }

    formatPrice(value) {
        return `$${value.toLocaleString("es-CO")}`;
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
                if (!target) return;
                try {
                    await copyText(target.textContent);
                    this.toast.show("Texto copiado.");
                } catch {
                    this.toast.show("No se pudo copiar el texto.");
                }
            });
        });
    }
}

export function buildFunctionalGuideData(rawData) {
    const lines = (...parts) => parts.filter(Boolean).join("\n\n");
    const indent = (text, spaces = 4) => String(text)
        .split("\n")
        .map((line) => line ? `${" ".repeat(spaces)}${line}` : line)
        .join("\n");
    const onReady = (body) => `document.addEventListener("DOMContentLoaded", () => {\n${indent(body)}\n});`;
    const toNormal = (code) => code.replace(/^export\s+/gm, "");
    const classSource = (ClassRef) => ClassRef.toString();

    const domHelpers = `const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];`;

    const storageHelpers = `function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function readJSON(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}`;

    const debounceHelper = `function debounce(callback, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    };
}`;

    const copyHelper = `async function copyText(value) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    try {
        document.execCommand("copy");
        return true;
    } finally {
        helper.remove();
    }
}`;

    const baseToastClass = classSource(ToastManager);
    const moduleClass = (ClassRef, initCode, helpers = "") => {
        const code = lines(helpers, `export ${classSource(ClassRef)}`, onReady(initCode));
        return { jsModular: code, jsNormal: toNormal(code) };
    };
    const moduleFunction = (fnSource, initCode = "", helpers = "") => {
        const code = lines(helpers, fnSource, initCode ? onReady(initCode) : "");
        return { jsModular: code, jsNormal: toNormal(code) };
    };

    const overrides = {
        1: {
            html: `<header class="glass-navbar">
    <a href="#inicio" class="brand">
        <span class="brand__mark">CW</span>
        <span class="brand__text">Componentes Web</span>
    </a>

    <nav class="navbar-links" aria-label="Navegacion principal">
        <button class="nav-link is-active" type="button">Inicio</button>
        <button class="nav-link" type="button">Componentes</button>
        <button class="nav-link" type="button">Formularios</button>

        <div class="dropdown is-open">
            <button class="nav-link dropdown__button" type="button">Mas</button>
            <div class="dropdown__menu">
                <button type="button">Login demo</button>
                <button type="button">Storage</button>
                <button type="button">Guia</button>
            </div>
        </div>
    </nav>

    <div class="navbar-actions">
        <button class="icon-button icon-button--label" type="button">Dark</button>
        <button class="icon-button icon-button--label" type="button">Menu</button>
    </div>
</header>`,
            css: `:root {
    --nav-primary: #4f46e5;
    --nav-secondary: #0ea5e9;
    --nav-bg: rgba(15, 23, 42, 0.72);
    --nav-border: rgba(255, 255, 255, 0.16);
    --nav-text: #e5eefc;
}

body {
    min-height: 100vh;
    margin: 0;
    padding: 32px;
    font-family: Arial, Helvetica, sans-serif;
    background:
        radial-gradient(circle at top left, rgba(14, 165, 233, 0.22), transparent 30%),
        radial-gradient(circle at bottom right, rgba(79, 70, 229, 0.28), transparent 36%),
        linear-gradient(135deg, #0f172a, #1e293b);
}

.glass-navbar {
    width: min(1120px, 100%);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    border: 1px solid var(--nav-border);
    border-radius: 999px;
    background: var(--nav-bg);
    color: var(--nav-text);
    backdrop-filter: blur(20px);
    box-shadow: 0 24px 50px rgba(15, 23, 42, 0.28);
}

.brand,
.navbar-links,
.navbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand {
    color: inherit;
    text-decoration: none;
    font-weight: 800;
}

.brand__mark {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--nav-secondary), var(--nav-primary));
    color: #ffffff;
}

.nav-link,
.icon-button,
.dropdown__menu button {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    padding: 10px 14px;
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
}

.nav-link:hover,
.icon-button:hover,
.dropdown__menu button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.14);
}

.nav-link.is-active {
    border-color: transparent;
    background: linear-gradient(135deg, var(--nav-secondary), var(--nav-primary));
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.28);
}

.icon-button--label {
    min-width: 72px;
}

.dropdown {
    position: relative;
}

.dropdown__menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 190px;
    display: grid;
    gap: 8px;
    padding: 12px;
    border-radius: 18px;
    border: 1px solid var(--nav-border);
    background: rgba(15, 23, 42, 0.92);
    box-shadow: 0 18px 34px rgba(15, 23, 42, 0.34);
}

@media (max-width: 860px) {
    .glass-navbar {
        border-radius: 28px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .navbar-links {
        justify-content: center;
        flex-wrap: wrap;
    }

    .navbar-actions {
        width: 100%;
        justify-content: center;
    }
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".glass-navbar");
    if (!nav) return;

    const links = nav.querySelectorAll(".nav-link:not(.dropdown__button)");
    links.forEach((link) => {
        link.addEventListener("click", () => {
            links.forEach((item) => item.classList.remove("is-active"));
            link.classList.add("is-active");
        });
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".glass-navbar");
    if (!nav) return;

    const links = nav.querySelectorAll(".nav-link:not(.dropdown__button)");
    links.forEach((link) => {
        link.addEventListener("click", () => {
            links.forEach((item) => item.classList.remove("is-active"));
            link.classList.add("is-active");
        });
    });
});`
        },
        2: {
            html: `<aside class="sidebar" id="sidebar">
    <div class="sidebar__header">
        <strong>Menu lateral</strong>
        <button id="closeSidebar" type="button">Cerrar</button>
    </div>
    <nav class="sidebar__content">
        <button type="button">Inicio</button>
        <button type="button">Servicios</button>
        <button type="button">Contacto</button>
    </nav>
</aside>
<div class="overlay" id="overlay"></div>
<button id="openSidebar" type="button">Abrir menu</button>`,
            css: `.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    padding: 20px;
    background: #0f172a;
    color: #ffffff;
    transform: translateX(-105%);
    transition: transform 0.25s ease;
}
.sidebar.is-open { transform: translateX(0); }
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
}
.overlay.is-active {
    opacity: 1;
    pointer-events: auto;
}
.sidebar__content {
    display: grid;
    gap: 10px;
    margin-top: 16px;
}
.sidebar__content button,
#openSidebar,
#closeSidebar {
    padding: 10px 14px;
    border: 0;
    border-radius: 10px;
    cursor: pointer;
}`
        },
        3: {
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".side-group__button").forEach((button) => {
        button.addEventListener("click", () => {
            button.parentElement.classList.toggle("is-open");
        });
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".side-group__button").forEach((button) => {
        button.addEventListener("click", () => {
            button.parentElement.classList.toggle("is-open");
        });
    });
});`
        },
        4: {
            html: `<nav class="router-nav">
    <button type="button" data-section="inicio" class="is-active">Inicio</button>
    <button type="button" data-section="servicios">Servicios</button>
    <button type="button" data-section="contacto">Contacto</button>
</nav>

<section id="inicio" data-view-section class="view-section is-active">Contenido inicio</section>
<section id="servicios" data-view-section class="view-section">Contenido servicios</section>
<section id="contacto" data-view-section class="view-section">Contenido contacto</section>`,
            css: `.router-nav {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}
.router-nav button {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
    cursor: pointer;
}
.router-nav button.is-active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}
.view-section { display: none; }
.view-section.is-active { display: block; }`,
            ...moduleClass(RouterSections, `new RouterSections();`, domHelpers)
        },
        5: {
            html: `<div class="dropdown" data-dropdown>
    <button type="button" data-dropdown-button>Mas opciones</button>
    <div class="dropdown__menu">
        <button type="button">Perfil</button>
        <button type="button">Configuracion</button>
        <button type="button">Salir</button>
    </div>
</div>`,
            css: `.dropdown { position: relative; display: inline-block; }
.dropdown__menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    display: grid;
    gap: 8px;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: all 0.2s ease;
}
.dropdown.is-open .dropdown__menu {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}
.dropdown button {
    padding: 10px 14px;
    border-radius: 10px;
    border: 0;
    cursor: pointer;
}`,
            ...moduleClass(Dropdowns, `new Dropdowns();`, domHelpers)
        },
        6: {
            html: `<button id="themeToggle" type="button">Tema</button>`,
            css: `:root {
    --bg: #0f172a;
    --text: #ffffff;
}
[data-theme="light"] {
    --bg: #f8fafc;
    --text: #0f172a;
}
body {
    background: var(--bg);
    color: var(--text);
    transition: background 0.2s ease, color 0.2s ease;
}
#themeToggle {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
}`,
            ...moduleClass(ThemeManager, `new ThemeManager();`)
        },
        7: {
            html: `<div class="scroll-progress" id="scrollProgress"></div>
<button class="back-to-top" id="backToTop" type="button">Subir</button>
<div style="min-height: 200vh; padding-top: 24px;">Haz scroll para probar.</div>`,
            css: `.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 4px;
    background: linear-gradient(90deg, #2563eb, #7c3aed);
}
.back-to-top {
    position: fixed;
    right: 20px;
    bottom: 20px;
    opacity: 0;
    pointer-events: none;
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
}
.back-to-top.is-visible {
    opacity: 1;
    pointer-events: auto;
}`,
            ...moduleClass(ScrollTools, `new ScrollTools();`, domHelpers)
        },
        8: {
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("backToTop");
    if (!button) return;

    const update = () => {
        button.classList.toggle("is-visible", window.scrollY > 320);
    };

    window.addEventListener("scroll", update);
    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("backToTop");
    if (!button) return;

    const update = () => {
        button.classList.toggle("is-visible", window.scrollY > 320);
    };

    window.addEventListener("scroll", update);
    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
});`
        },
        9: {
            ...moduleClass(RevealOnScroll, `new RevealOnScroll();`, domHelpers)
        },
        10: {
            css: `[data-counter] {
    display: inline-block;
    font-size: 2rem;
    font-weight: 700;
    color: #2563eb;
}`,
            ...moduleClass(CounterAnimation, `new CounterAnimation();`, domHelpers)
        },
        11: {
            html: `<form id="loginForm" class="demo-form" novalidate>
    <label for="loginEmail">Correo</label>
    <input id="loginEmail" type="email" placeholder="usuario@correo.com" required>

    <label for="loginPassword">Contrasena</label>
    <input id="loginPassword" type="password" placeholder="Minimo 6 caracteres" required minlength="6">

    <label class="check-line">
        <input type="checkbox" id="rememberUser">
        Recordar usuario
    </label>

    <button type="submit">Ingresar</button>
    <button id="logoutButton" type="button">Cerrar sesion</button>
</form>
<p id="sessionStatus">Aun no hay sesion iniciada.</p>
<div id="toastContainer"></div>`,
            css: `.demo-form {
    display: grid;
    gap: 10px;
    max-width: 420px;
}
.demo-form input,
.demo-form button {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
}
.check-line {
    display: flex;
    gap: 8px;
    align-items: center;
}
#toastContainer {
    position: fixed;
    right: 20px;
    bottom: 20px;
    display: grid;
    gap: 10px;
}
.toast {
    padding: 12px 14px;
    border-radius: 12px;
    background: #0f172a;
    color: #ffffff;
}`,
            ...moduleClass(LoginDemo, `const toast = new ToastManager();\nnew LoginDemo(toast);`, lines(domHelpers, storageHelpers, baseToastClass))
        },
        12: {
            html: `<button id="logoutButton" type="button">Cerrar sesion</button>
<p id="sessionStatus">Sesión simulada activa.</p>`,
            css: `#logoutButton {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #ef4444;
    color: #ffffff;
    cursor: pointer;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("logoutButton");
    const status = document.getElementById("sessionStatus");
    sessionStorage.setItem("kit-session", JSON.stringify({ active: true }));

    button?.addEventListener("click", () => {
        sessionStorage.removeItem("kit-session");
        localStorage.removeItem("kit-user");
        if (status) status.textContent = "Sesion cerrada correctamente.";
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("logoutButton");
    const status = document.getElementById("sessionStatus");
    sessionStorage.setItem("kit-session", JSON.stringify({ active: true }));

    button?.addEventListener("click", () => {
        sessionStorage.removeItem("kit-session");
        localStorage.removeItem("kit-user");
        if (status) status.textContent = "Sesion cerrada correctamente.";
    });
});`
        },
        13: {
            html: `<form id="rememberForm" class="demo-form">
    <input id="rememberEmail" type="email" placeholder="usuario@correo.com">
    <label class="check-line">
        <input type="checkbox" id="rememberUser">
        Recordar usuario
    </label>
    <button type="submit">Guardar preferencia</button>
</form>
<p id="rememberStatus">Sin datos guardados.</p>`,
            css: `.demo-form {
    display: grid;
    gap: 10px;
    max-width: 420px;
}
.demo-form input,
.demo-form button {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
}
.check-line {
    display: flex;
    gap: 8px;
    align-items: center;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("rememberForm");
    const email = document.getElementById("rememberEmail");
    const remember = document.getElementById("rememberUser");
    const status = document.getElementById("rememberStatus");
    const saved = localStorage.getItem("remember-email");

    if (saved && email && remember) {
        email.value = saved;
        remember.checked = true;
        status.textContent = \`Usuario recordado: \${saved}\`;
    }

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!email || !remember || !status) return;
        if (remember.checked && email.value.trim()) {
            localStorage.setItem("remember-email", email.value.trim());
            status.textContent = \`Usuario recordado: \${email.value.trim()}\`;
        } else {
            localStorage.removeItem("remember-email");
            status.textContent = "Recordatorio eliminado.";
        }
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("rememberForm");
    const email = document.getElementById("rememberEmail");
    const remember = document.getElementById("rememberUser");
    const status = document.getElementById("rememberStatus");
    const saved = localStorage.getItem("remember-email");

    if (saved && email && remember) {
        email.value = saved;
        remember.checked = true;
        status.textContent = \`Usuario recordado: \${saved}\`;
    }

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!email || !remember || !status) return;
        if (remember.checked && email.value.trim()) {
            localStorage.setItem("remember-email", email.value.trim());
            status.textContent = \`Usuario recordado: \${email.value.trim()}\`;
        } else {
            localStorage.removeItem("remember-email");
            status.textContent = "Recordatorio eliminado.";
        }
    });
});`
        },
        14: {
            ...moduleClass(PasswordToggle, `new PasswordToggle();`, domHelpers)
        },
        15: {
            html: `<form id="contactForm" novalidate class="demo-form">
    <input id="contactName" type="text" placeholder="Nombre" required minlength="3">
    <small class="field-error" data-error="contactName"></small>

    <input id="contactEmail" type="email" placeholder="Correo" required>
    <small class="field-error" data-error="contactEmail"></small>

    <textarea id="contactMessage" placeholder="Mensaje" required minlength="10"></textarea>
    <small class="field-error" data-error="contactMessage"></small>

    <button type="submit">Enviar</button>
</form>
<div id="toastContainer"></div>`,
            css: `.demo-form {
    display: grid;
    gap: 10px;
    max-width: 420px;
}
.demo-form input,
.demo-form textarea,
.demo-form button {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
}
.field-error {
    min-height: 18px;
    color: #ef4444;
    font-size: 0.875rem;
}
.toast {
    padding: 12px 14px;
    border-radius: 12px;
    background: #0f172a;
    color: #ffffff;
}`,
            ...moduleClass(FormValidation, `const toast = new ToastManager();\nnew FormValidation("contactForm", toast);`, lines(domHelpers, baseToastClass))
        },
        16: {
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const email = document.getElementById("emailInput");
    const error = document.querySelector('[data-error="emailInput"]');

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!email || !error) return;
        error.textContent = email.value.includes("@") ? "" : "Correo no valido.";
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const email = document.getElementById("emailInput");
    const error = document.querySelector('[data-error="emailInput"]');

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!email || !error) return;
        error.textContent = email.value.includes("@") ? "" : "Correo no valido.";
    });
});`
        },
        17: {
            css: `#msg {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}
#counter {
    font-weight: 700;
    color: #2563eb;
}`,
            ...moduleClass(CharacterCounter, `new CharacterCounter("msg", "counter");`)
        },
        18: {
            css: `#range {
    width: 100%;
    accent-color: #2563eb;
}
#rangeVal {
    display: inline-block;
    min-width: 40px;
    font-weight: 700;
}`,
            ...moduleClass(RangePreview, `new RangePreview("range", "rangeVal");`)
        },
        19: {
            css: `#file {
    display: block;
    margin-bottom: 10px;
}
#fileInfo {
    color: #475569;
    font-size: 0.95rem;
}`,
            ...moduleClass(FileInfo, `new FileInfo("file", "fileInfo");`)
        },
        20: {
            html: `<textarea id="msg" rows="4" placeholder="Escribe tu borrador"></textarea>
<button id="clearDraft" type="button">Limpiar borrador</button>
<div id="toastContainer"></div>`,
            css: `#msg {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}
#clearDraft {
    margin-top: 10px;
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #ef4444;
    color: #ffffff;
}`,
            ...moduleClass(AutoSaveDraft, `const toast = new ToastManager();\nnew AutoSaveDraft("msg", "clearDraft", "draft-demo", toast);`, lines(debounceHelper, baseToastClass))
        },
        21: {
            html: `<div class="stepper" data-stepper>
    <div class="stepper__steps">
        <span class="is-active">1</span>
        <span>2</span>
        <span>3</span>
    </div>
    <p class="stepper__text">Paso 1: Datos personales</p>
    <button data-step-prev type="button">Anterior</button>
    <button data-step-next type="button">Siguiente</button>
</div>`,
            css: `.stepper { display: grid; gap: 12px; }
.stepper__steps {
    display: flex;
    gap: 10px;
}
.stepper__steps span {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #e2e8f0;
}
.stepper__steps span.is-active {
    background: #2563eb;
    color: #ffffff;
}`,
            ...moduleClass(Stepper, `new Stepper();`, domHelpers)
        },
        22: {
            html: `<button id="loadSkeleton" type="button">Simular carga</button>
<div id="skeletonArea"></div>
<div id="toastContainer"></div>`,
            css: `.skeleton {
    height: 18px;
    margin-top: 12px;
    border-radius: 999px;
    background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0);
    background-size: 200% 100%;
    animation: loading 1.2s infinite;
}
@keyframes loading {
    to { background-position: -200% 0; }
}`,
            ...moduleClass(SkeletonLoader, `const toast = new ToastManager();\nnew SkeletonLoader("loadSkeleton", "skeletonArea", toast);`, baseToastClass)
        },
        23: {
            css: `.custom-select {
    position: relative;
    max-width: 260px;
}
.custom-select__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    cursor: pointer;
}
.custom-select__options {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    margin: 0;
    padding: 8px;
    list-style: none;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    display: none;
}
.custom-select.is-open .custom-select__options {
    display: grid;
    gap: 6px;
}
.custom-select__option {
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
}
.custom-select__option.is-selected {
    background: #dbeafe;
}`,
            ...moduleClass(CustomSelect, `new CustomSelect();`, domHelpers)
        },
        24: {
            html: `<div class="tabs" data-tabs>
    <div class="tabs__buttons">
        <button type="button" data-tab="panel1" class="is-active">HTML</button>
        <button type="button" data-tab="panel2">CSS</button>
    </div>
    <div class="tab-panel is-active" id="panel1">Contenido HTML</div>
    <div class="tab-panel" id="panel2">Contenido CSS</div>
</div>`,
            css: `.tabs__buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}
.tabs__buttons button {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
    cursor: pointer;
}
.tabs__buttons button.is-active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}
.tab-panel { display: none; }
.tab-panel.is-active { display: block; }`,
            ...moduleClass(Tabs, `new Tabs();`, domHelpers)
        },
        25: {
            css: `.accordion {
    max-width: 520px;
}
.accordion__button {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    text-align: left;
    cursor: pointer;
}
.accordion__content {
    max-height: 0;
    overflow: hidden;
    margin-top: 8px;
    border-radius: 12px;
    background: #f8fafc;
    transition: max-height 0.2s ease, padding 0.2s ease;
}
.accordion__content.is-open {
    max-height: 140px;
    padding: 12px;
}`,
            ...moduleClass(Accordion, `new Accordion();`, domHelpers)
        },
        26: {
            html: `<button type="button" data-open-modal="demoModal">Abrir modal</button>
<dialog id="demoModal">
    <p>Este modal ya es funcional.</p>
    <button type="button" data-close-modal>Cerrar</button>
</dialog>`,
            css: `dialog {
    padding: 24px;
    border: 0;
    border-radius: 16px;
    max-width: 420px;
    box-shadow: 0 24px 50px rgba(15, 23, 42, 0.24);
}
.modal__content {
    display: grid;
    gap: 12px;
}
dialog::backdrop {
    background: rgba(15, 23, 42, 0.45);
}`,
            ...moduleClass(ModalManager, `new ModalManager();`, domHelpers)
        },
        27: {
            html: `<button id="showToast" type="button">Mostrar toast</button>
<div id="toastContainer"></div>`,
            css: `#toastContainer {
    position: fixed;
    right: 20px;
    bottom: 20px;
    display: grid;
    gap: 10px;
}
.toast {
    padding: 12px 14px;
    border-radius: 12px;
    background: #0f172a;
    color: #ffffff;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
}`,
            jsModular: `${baseToastClass}

document.addEventListener("DOMContentLoaded", () => {
    const toast = new ToastManager();
    document.getElementById("showToast")?.addEventListener("click", () => {
        toast.show("Toast mostrado correctamente.");
    });
});`,
            jsNormal: `${baseToastClass}

document.addEventListener("DOMContentLoaded", () => {
    const toast = new ToastManager();
    document.getElementById("showToast")?.addEventListener("click", () => {
        toast.show("Toast mostrado correctamente.");
    });
});`
        },
        28: {
            html: `<div class="carousel" data-carousel>
    <div class="carousel__slide is-active">Slide 1</div>
    <div class="carousel__slide">Slide 2</div>
    <div class="carousel__slide">Slide 3</div>
    <div class="carousel__actions">
        <button type="button" data-carousel-prev>Anterior</button>
        <button type="button" data-carousel-next>Siguiente</button>
    </div>
</div>`,
            css: `.carousel {
    display: grid;
    gap: 12px;
    max-width: 420px;
}
.carousel__slide {
    display: none;
    padding: 24px;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
    background: #f8fafc;
}
.carousel__slide.is-active {
    display: block;
}
.carousel__actions {
    display: flex;
    gap: 8px;
}`,
            ...moduleClass(Carousel, `new Carousel();`, domHelpers)
        },
        29: {
            css: `.tooltip {
    position: relative;
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
    cursor: help;
}
.tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
    white-space: nowrap;
    padding: 8px 10px;
    border-radius: 10px;
    background: #0f172a;
    color: #ffffff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
}
.tooltip:hover::after {
    opacity: 1;
}`
        },
        31: {
            css: `button[data-copy] {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
    cursor: pointer;
}
code {
    display: inline-block;
    margin-bottom: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    background: #e2e8f0;
}`,
            ...moduleClass(CopyToClipboard, `const toast = new ToastManager();\nnew CopyToClipboard(toast);`, lines(domHelpers, copyHelper, baseToastClass))
        },
        32: {
            html: `<div class="card-grid" id="catalogGrid"></div>`,
            css: `.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
}
.product-card {
    padding: 16px;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
    background: #ffffff;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const data = [
        { name: "APA", price: 12000 },
        { name: "Stout", price: 14000 },
        { name: "Cheesecake", price: 11000 }
    ];
    const grid = document.getElementById("catalogGrid");
    if (!grid) return;

    grid.innerHTML = data.map((item) => \`
        <article class="product-card">
            <h3>\${item.name}</h3>
            <p>$\${item.price.toLocaleString("es-CO")}</p>
        </article>
    \`).join("");
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const data = [
        { name: "APA", price: 12000 },
        { name: "Stout", price: 14000 },
        { name: "Cheesecake", price: 11000 }
    ];
    const grid = document.getElementById("catalogGrid");
    if (!grid) return;

    grid.innerHTML = data.map((item) => \`
        <article class="product-card">
            <h3>\${item.name}</h3>
            <p>$\${item.price.toLocaleString("es-CO")}</p>
        </article>
    \`).join("");
});`
        },
        33: {
            html: `<input id="catalogSearch" type="search" placeholder="Buscar producto">
<div class="card-grid" id="catalogGrid"></div>`,
            css: `.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-top: 16px;
}
.product-card {
    padding: 16px;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
}
#catalogSearch {
    width: 100%;
    max-width: 320px;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}`,
            jsModular: `${debounceHelper}

document.addEventListener("DOMContentLoaded", () => {
    const data = ["APA", "Stout", "Sour", "Cheesecake"];
    const input = document.getElementById("catalogSearch");
    const grid = document.getElementById("catalogGrid");
    if (!input || !grid) return;

    const render = (term = "") => {
        grid.innerHTML = data
            .filter((item) => item.toLowerCase().includes(term.toLowerCase()))
            .map((item) => \`<article class="product-card"><h3>\${item}</h3></article>\`)
            .join("") || "<p>No hay resultados.</p>";
    };

    input.addEventListener("input", debounce((event) => {
        render(event.target.value);
    }, 250));

    render();
});`,
            jsNormal: `${debounceHelper}

document.addEventListener("DOMContentLoaded", () => {
    const data = ["APA", "Stout", "Sour", "Cheesecake"];
    const input = document.getElementById("catalogSearch");
    const grid = document.getElementById("catalogGrid");
    if (!input || !grid) return;

    const render = (term = "") => {
        grid.innerHTML = data
            .filter((item) => item.toLowerCase().includes(term.toLowerCase()))
            .map((item) => \`<article class="product-card"><h3>\${item}</h3></article>\`)
            .join("") || "<p>No hay resultados.</p>";
    };

    input.addEventListener("input", debounce((event) => {
        render(event.target.value);
    }, 250));

    render();
});`
        },
        34: {
            html: `<div id="catalogChips">
    <button class="chip is-active" type="button" data-category="all">Todos</button>
    <button class="chip" type="button" data-category="cerveza">Cerveza</button>
    <button class="chip" type="button" data-category="postre">Postre</button>
</div>
<div class="card-grid" id="catalogGrid"></div>`,
            css: `.chip {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
    cursor: pointer;
}
.chip.is-active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-top: 16px;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const data = [
        { name: "APA", category: "cerveza" },
        { name: "Stout", category: "cerveza" },
        { name: "Cheesecake", category: "postre" }
    ];
    const chips = document.querySelectorAll("#catalogChips .chip");
    const grid = document.getElementById("catalogGrid");
    if (!grid || !chips.length) return;

    const render = (category = "all") => {
        grid.innerHTML = data
            .filter((item) => category === "all" || item.category === category)
            .map((item) => \`<article class="product-card"><h3>\${item.name}</h3><p>\${item.category}</p></article>\`)
            .join("");
    };

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((item) => item.classList.remove("is-active"));
            chip.classList.add("is-active");
            render(chip.dataset.category);
        });
    });

    render();
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const data = [
        { name: "APA", category: "cerveza" },
        { name: "Stout", category: "cerveza" },
        { name: "Cheesecake", category: "postre" }
    ];
    const chips = document.querySelectorAll("#catalogChips .chip");
    const grid = document.getElementById("catalogGrid");
    if (!grid || !chips.length) return;

    const render = (category = "all") => {
        grid.innerHTML = data
            .filter((item) => category === "all" || item.category === category)
            .map((item) => \`<article class="product-card"><h3>\${item.name}</h3><p>\${item.category}</p></article>\`)
            .join("");
    };

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((item) => item.classList.remove("is-active"));
            chip.classList.add("is-active");
            render(chip.dataset.category);
        });
    });

    render();
});`
        },
        35: {
            html: `<select id="catalogSort">
    <option value="name">Nombre</option>
    <option value="price">Precio</option>
</select>
<div class="card-grid" id="catalogGrid"></div>`,
            css: `#catalogSort {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-top: 16px;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const data = [
        { name: "APA", price: 12000 },
        { name: "Stout", price: 14000 },
        { name: "Cheesecake", price: 11000 }
    ];
    const select = document.getElementById("catalogSort");
    const grid = document.getElementById("catalogGrid");
    if (!select || !grid) return;

    const render = () => {
        const items = [...data].sort((a, b) => {
            if (select.value === "price") return a.price - b.price;
            return a.name.localeCompare(b.name);
        });
        grid.innerHTML = items.map((item) => \`<article class="product-card"><h3>\${item.name}</h3><p>$\${item.price}</p></article>\`).join("");
    };

    select.addEventListener("change", render);
    render();
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const data = [
        { name: "APA", price: 12000 },
        { name: "Stout", price: 14000 },
        { name: "Cheesecake", price: 11000 }
    ];
    const select = document.getElementById("catalogSort");
    const grid = document.getElementById("catalogGrid");
    if (!select || !grid) return;

    const render = () => {
        const items = [...data].sort((a, b) => {
            if (select.value === "price") return a.price - b.price;
            return a.name.localeCompare(b.name);
        });
        grid.innerHTML = items.map((item) => \`<article class="product-card"><h3>\${item.name}</h3><p>$\${item.price}</p></article>\`).join("");
    };

    select.addEventListener("change", render);
    render();
});`
        },
        36: {
            html: `<div class="card-grid" id="catalogGrid"></div>
<div class="pagination" id="catalogPagination"></div>`,
            css: `.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
}
.pagination {
    display: flex;
    gap: 8px;
    margin-top: 16px;
}
.pagination button {
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
}
.pagination button.is-active {
    background: #2563eb;
    color: #ffffff;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const data = Array.from({ length: 10 }, (_, index) => ({ name: \`Producto \${index + 1}\` }));
    const grid = document.getElementById("catalogGrid");
    const pagination = document.getElementById("catalogPagination");
    let page = 1;
    const perPage = 4;
    if (!grid || !pagination) return;

    const render = () => {
        const totalPages = Math.ceil(data.length / perPage);
        const items = data.slice((page - 1) * perPage, page * perPage);
        grid.innerHTML = items.map((item) => \`<article class="product-card"><h3>\${item.name}</h3></article>\`).join("");
        pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => \`
            <button type="button" data-page="\${index + 1}" class="\${index + 1 === page ? "is-active" : ""}">\${index + 1}</button>
        \`).join("");
        pagination.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
                page = Number(button.dataset.page);
                render();
            });
        });
    };

    render();
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const data = Array.from({ length: 10 }, (_, index) => ({ name: \`Producto \${index + 1}\` }));
    const grid = document.getElementById("catalogGrid");
    const pagination = document.getElementById("catalogPagination");
    let page = 1;
    const perPage = 4;
    if (!grid || !pagination) return;

    const render = () => {
        const totalPages = Math.ceil(data.length / perPage);
        const items = data.slice((page - 1) * perPage, page * perPage);
        grid.innerHTML = items.map((item) => \`<article class="product-card"><h3>\${item.name}</h3></article>\`).join("");
        pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => \`
            <button type="button" data-page="\${index + 1}" class="\${index + 1 === page ? "is-active" : ""}">\${index + 1}</button>
        \`).join("");
        pagination.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
                page = Number(button.dataset.page);
                render();
            });
        });
    };

    render();
});`
        },
        37: {
            html: `<input id="tableSearch" type="search" placeholder="Filtrar filas">
<table id="demoTable" class="data-table">
    <thead>
        <tr>
            <th data-sort-table="name">Nombre</th>
            <th data-sort-table="price">Precio</th>
        </tr>
    </thead>
    <tbody>
        <tr><td>APA</td><td>12000</td></tr>
        <tr><td>Stout</td><td>14000</td></tr>
        <tr><td>Sour</td><td>13000</td></tr>
    </tbody>
</table>`,
            css: `.data-table {
    width: 100%;
    border-collapse: collapse;
}
.data-table th,
.data-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #cbd5e1;
    text-align: left;
}
.data-table th {
    cursor: pointer;
    color: #2563eb;
}`,
            ...moduleClass(SortableTable, `new SortableTable("demoTable", "tableSearch");`, domHelpers)
        },
        38: {
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("tableSearch");
    const rows = document.querySelectorAll("#demoTable tbody tr");
    input?.addEventListener("input", () => {
        const term = input.value.toLowerCase();
        rows.forEach((row) => {
            row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
        });
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("tableSearch");
    const rows = document.querySelectorAll("#demoTable tbody tr");
    input?.addEventListener("input", () => {
        const term = input.value.toLowerCase();
        rows.forEach((row) => {
            row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
        });
    });
});`
        },
        39: {
            html: `<textarea id="noteInput" rows="4" placeholder="Escribe una nota"></textarea>
<button id="saveNote" type="button">Guardar</button>
<button id="exportNotes" type="button">Exportar JSON</button>
<ul id="noteList"></ul>
<div id="toastContainer"></div>`,
            css: `#noteInput {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}
#noteList {
    display: grid;
    gap: 10px;
    padding: 0;
    list-style: none;
}
#noteList li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}`,
            ...moduleClass(NotesManager, `const toast = new ToastManager();\nnew NotesManager(toast);`, lines(domHelpers, storageHelpers, baseToastClass))
        },
        40: {
            html: `<button id="exportNotes" type="button">Descargar notas.json</button>`,
            css: `#exportNotes {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
    cursor: pointer;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const notes = [
        { id: 1, text: "Primera nota" },
        { id: 2, text: "Segunda nota" }
    ];
    document.getElementById("exportNotes")?.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "notas.json";
        link.click();
        URL.revokeObjectURL(link.href);
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const notes = [
        { id: 1, text: "Primera nota" },
        { id: 2, text: "Segunda nota" }
    ];
    document.getElementById("exportNotes")?.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "notas.json";
        link.click();
        URL.revokeObjectURL(link.href);
    });
});`
        },
        41: {
            html: `<input id="todoInput" placeholder="Nueva tarea">
<button id="addTodo" type="button">Agregar</button>
<button id="clearTodos" type="button">Borrar tareas</button>
<ul id="todoList" class="draggable-list"></ul>
<div id="toastContainer"></div>`,
            css: `.draggable-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
}
.draggable-list li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
}
.check-line {
    display: flex;
    align-items: center;
    gap: 8px;
}`,
            ...moduleClass(TodoManager, `const toast = new ToastManager();\nnew TodoManager(toast);`, lines(domHelpers, storageHelpers, baseToastClass))
        },
        42: {
            html: `<ul id="dragList" class="draggable-list">
    <li draggable="true">Tarea 1</li>
    <li draggable="true">Tarea 2</li>
    <li draggable="true">Tarea 3</li>
</ul>`,
            css: `.draggable-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
}
.draggable-list li {
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    cursor: grab;
    background: #ffffff;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("dragList");
    let dragged = null;
    if (!list) return;

    list.querySelectorAll("li").forEach((item) => {
        item.addEventListener("dragstart", () => { dragged = item; });
        item.addEventListener("dragover", (event) => event.preventDefault());
        item.addEventListener("drop", () => {
            if (dragged && dragged !== item) {
                list.insertBefore(dragged, item);
            }
        });
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("dragList");
    let dragged = null;
    if (!list) return;

    list.querySelectorAll("li").forEach((item) => {
        item.addEventListener("dragstart", () => { dragged = item; });
        item.addEventListener("dragover", (event) => event.preventDefault());
        item.addEventListener("drop", () => {
            if (dragged && dragged !== item) {
                list.insertBefore(dragged, item);
            }
        });
    });
});`
        },
        43: {
            html: `<button id="saveVisualState" type="button">Guardar cambio</button>
<div id="toastContainer"></div>`,
            css: `#toastContainer {
    position: fixed;
    right: 20px;
    bottom: 20px;
    display: grid;
    gap: 10px;
}
.toast {
    padding: 12px 14px;
    border-radius: 12px;
    background: #0f172a;
    color: #ffffff;
}`,
            jsModular: `${baseToastClass}

document.addEventListener("DOMContentLoaded", () => {
    const toast = new ToastManager();
    document.getElementById("saveVisualState")?.addEventListener("click", () => {
        toast.show("Cambio guardado correctamente.");
    });
});`,
            jsNormal: `${baseToastClass}

document.addEventListener("DOMContentLoaded", () => {
    const toast = new ToastManager();
    document.getElementById("saveVisualState")?.addEventListener("click", () => {
        toast.show("Cambio guardado correctamente.");
    });
});`
        },
        44: {
            html: `<div id="temperatureTool" class="temperature-tool">
    <div class="unit-buttons">
        <button type="button" class="unit-button is-active" data-unit="celsius">C</button>
        <button type="button" class="unit-button" data-unit="fahrenheit">F</button>
        <button type="button" class="unit-button" data-unit="kelvin">K</button>
    </div>
    <input id="temperatureInput" type="number" placeholder="Ingresa un valor">
    <button id="calculateTemperature" type="button">Calcular</button>
    <p id="temperatureMessage">Unidad seleccionada: celsius</p>
    <div id="temperatureResult"></div>
</div>
<div id="toastContainer"></div>`,
            css: `.temperature-tool {
    display: grid;
    gap: 12px;
    padding: 20px;
    border: 1px solid #cbd5e1;
    border-radius: 18px;
}
.unit-buttons {
    display: flex;
    gap: 8px;
}
.unit-button {
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background: #ffffff;
}
.unit-button.is-active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}`,
            ...moduleClass(TemperatureTool, `const toast = new ToastManager();\nnew TemperatureTool(toast);`, lines(domHelpers, baseToastClass))
        },
        45: {
            html: `<div id="temperatureTool" class="temperature-tool">
    <button class="unit-button" type="button" data-unit="celsius">C</button>
    <button class="unit-button" type="button" data-unit="fahrenheit">F</button>
    <button class="unit-button" type="button" data-unit="kelvin">K</button>
</div>`,
            css: `.temperature-tool {
    display: flex;
    gap: 10px;
    padding: 20px;
    border-radius: 18px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
}
.temperature-tool.unit-celsius {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}
.temperature-tool.unit-fahrenheit {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
}
.temperature-tool.unit-kelvin {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("temperatureTool");
    const buttons = document.querySelectorAll(".unit-button");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            if (!container) return;
            container.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
            container.classList.add(\`unit-\${button.dataset.unit}\`);
        });
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("temperatureTool");
    const buttons = document.querySelectorAll(".unit-button");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            if (!container) return;
            container.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
            container.classList.add(\`unit-\${button.dataset.unit}\`);
        });
    });
});`
        },
        46: {
            css: `#printPage {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
    cursor: pointer;
}`
        },
        47: {
            html: `<div id="temperatureTool" class="temperature-tool unit-fahrenheit">Demo con estado aplicado</div>
<button id="resetDemo" type="button">Reiniciar demo</button>`,
            css: `.temperature-tool {
    padding: 20px;
    border-radius: 18px;
    background: #fee2e2;
}
.temperature-tool.unit-fahrenheit {
    background: #fecaca;
}`,
            jsModular: `document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("resetDemo");
    const container = document.getElementById("temperatureTool");
    button?.addEventListener("click", () => {
        container?.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
    });
});`,
            jsNormal: `document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("resetDemo");
    const container = document.getElementById("temperatureTool");
    button?.addEventListener("click", () => {
        container?.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
    });
});`
        },
        48: {
            ...moduleFunction(`export function debounce(callback, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    };
}`)
        },
        49: {
            jsModular: `export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

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
}`,
            jsNormal: `const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function readJSON(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}`
        },
        50: {
            html: `<script type="module" src="script.js"></script>`,
            jsModular: `export function saludar() {
    console.log("Modulo cargado correctamente.");
}

document.addEventListener("DOMContentLoaded", () => {
    saludar();
});`,
            jsNormal: `// Esta funcionalidad es para proyectos con ES Modules.
// Copia este archivo como script.js y cargalo con:
// <script type="module" src="script.js"></script>`
        },
        51: {
            html: `<script src="script-normal.js"></script>`,
            jsModular: `// Esta funcionalidad es para proyectos sin modulos.`,
            jsNormal: `function saludar() {
    console.log("Script tradicional cargado correctamente.");
}

document.addEventListener("DOMContentLoaded", () => {
    saludar();
});`
        },
        53: {
            css: `.profile-lab {
    max-width: 340px;
    perspective: 1200px;
}
.profile-lab__flip {
    position: relative;
    min-height: 320px;
    transform-style: preserve-3d;
    transition: transform 0.8s ease;
}
.profile-lab__flip.is-flipped {
    transform: rotateY(180deg);
}
.profile-lab__face {
    position: absolute;
    inset: 0;
    display: grid;
    gap: 12px;
    align-content: start;
    padding: 24px;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    background: #ffffff;
    backface-visibility: hidden;
}
.profile-lab__face--back {
    transform: rotateY(180deg);
}
.profile-lab__avatar {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #2563eb;
    color: #ffffff;
    font-weight: 700;
}`,
            ...moduleClass(ProfilePresentationActivity, `new ProfilePresentationActivity();`, domHelpers)
        },
        54: {
            html: `<div class="shop-lab">
    <div class="shop-lab__topbar">
        <strong>Mini tienda</strong>
        <span class="shop-lab__badge" id="shopBadge">0</span>
    </div>
    <div class="shop-lab__grid">
        <article class="shop-product">
            <h4>Pack IPA</h4>
            <p>$18,000</p>
            <button class="shop-add-button" type="button" data-name="Pack IPA" data-price="18000">Agregar</button>
        </article>
        <article class="shop-product">
            <h4>Cheesecake</h4>
            <p>$11,000</p>
            <button class="shop-add-button" type="button" data-name="Cheesecake" data-price="11000">Agregar</button>
        </article>
    </div>
    <div class="shop-cart">
        <div class="shop-cart__head">
            <h4>Carrito</h4>
            <button id="clearShopCart" type="button">Vaciar</button>
        </div>
        <p id="shopEmptyMessage">Tu carrito esta vacio.</p>
        <ul id="shopCartList"></ul>
        <strong id="shopCartTotal">$0</strong>
    </div>
</div>
<div id="toastContainer"></div>`,
            css: `.shop-lab {
    display: grid;
    gap: 18px;
}
.shop-lab__topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.shop-lab__badge {
    min-width: 34px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #2563eb;
    color: #ffffff;
    text-align: center;
}
.shop-lab__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
}
.shop-product,
.shop-cart {
    padding: 16px;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
}
.shop-cart__item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
}`,
            ...moduleClass(ShoppingCartActivity, `const toast = new ToastManager();\nnew ShoppingCartActivity(toast);`, lines(domHelpers, baseToastClass))
        },
        55: {
            css: `.site-footer {
    margin-top: 40px;
    padding: 48px 32px 24px;
    background: #0f172a;
    color: #ffffff;
}
.site-footer__grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 32px;
}
.site-footer__links a,
.site-footer__contact a {
    display: block;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    margin-top: 8px;
}
.site-footer__bottom {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
}
@media (max-width: 720px) {
    .site-footer__grid,
    .site-footer__bottom {
        grid-template-columns: 1fr;
        flex-direction: column;
    }
}`
        },
        56: {
            html: `<div class="pricing-lab">
    <article class="pricing-lab__card">
        <span class="pricing-lab__badge">Basico</span>
        <h4>Starter</h4>
        <p class="pricing-lab__price">$19<span>/mes</span></p>
        <ul class="pricing-lab__list">
            <li>1 proyecto</li>
            <li>Soporte por correo</li>
            <li>Componentes base</li>
        </ul>
        <button type="button" class="secondary-button">Elegir plan</button>
    </article>
    <article class="pricing-lab__card pricing-lab__card--featured">
        <span class="pricing-lab__badge">Popular</span>
        <h4>Pro</h4>
        <p class="pricing-lab__price">$49<span>/mes</span></p>
        <ul class="pricing-lab__list">
            <li>10 proyectos</li>
            <li>Soporte prioritario</li>
            <li>Layouts premium</li>
        </ul>
        <button type="button" class="primary-button">Elegir plan</button>
    </article>
    <article class="pricing-lab__card">
        <span class="pricing-lab__badge">Equipo</span>
        <h4>Scale</h4>
        <p class="pricing-lab__price">$99<span>/mes</span></p>
        <ul class="pricing-lab__list">
            <li>Proyectos ilimitados</li>
            <li>Equipo colaborativo</li>
            <li>Soporte dedicado</li>
        </ul>
        <button type="button" class="secondary-button">Elegir plan</button>
    </article>
</div>`,
            css: `.pricing-lab {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
}
.pricing-lab__card {
    display: grid;
    gap: 14px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.06);
}
.pricing-lab__card--featured {
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.2), rgba(255, 255, 255, 0.08));
    border-color: rgba(37, 99, 235, 0.5);
    box-shadow: 0 18px 36px rgba(37, 99, 235, 0.16);
}
[data-theme="light"] .pricing-lab__card {
    background: rgba(255, 255, 255, 0.82);
}
.pricing-lab__badge {
    display: inline-flex;
    width: fit-content;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.16);
    color: #bfdbfe;
    font-size: 12px;
    font-weight: 700;
}
[data-theme="light"] .pricing-lab__badge {
    color: #1d4ed8;
    background: rgba(37, 99, 235, 0.1);
}
.pricing-lab__price {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    color: var(--text);
}
.pricing-lab__price span {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--muted);
}
.pricing-lab__list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 18px;
    color: var(--muted);
}`,
            jsModular: `// No requiere JS. Esta actividad es de maquetación de componentes.`,
            jsNormal: `// No requiere JS. Esta actividad es de maquetación de componentes.`
        },
        57: {
            html: `<div class="custom-scrollable-container">
    <h3>Contenido desplazable</h3>
    <p>Desplaza este panel verticalmente para ver el estilo de la barra de movimiento personalizada en accion. Puedes adaptar los colores y radios segun tu diseño.</p>
    <div class="custom-scrollable-content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin elementum, dolor id pellentesque accumsan, tortor elit tincidunt nulla, a placerat risus sem a sem.</p>
        <p>Vivamus id urna quis eros sodales accumsan quis ac mi. Mauris tincidunt felis vitae lorem congue, sed dictum massa molestie.</p>
        <p>Proin sit amet elementum nulla. Aliquam convallis tellus sed leo congue feugiat. Vestibulum tristique risus eu nisl sodales efficitur.</p>
        <p>Donec feugiat tellus et elementum hendrerit. Etiam feugiat leo id lorem tristique, sit amet molestie leo tristique. Cras tempus feugiat nisl in accumsan.</p>
    </div>
</div>`,
            css: `/* Estilos de la barra de desplazamiento y el contenedor de demo */
.custom-scrollable-container {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.04);
}

.custom-scrollable-content {
    max-height: 150px;
    overflow-y: auto;
    padding-right: 10px;
    
    /* Reglas para Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) rgba(255, 255, 255, 0.02);
}

/* Reglas para navegadores basados en Webkit (Chrome, Safari, Edge) */
.custom-scrollable-content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollable-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 999px;
}

.custom-scrollable-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 999px;
}

.custom-scrollable-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--primary), var(--secondary));
}`,
            jsModular: `// No requiere JS. Estilo de scroll puro con CSS.`,
            jsNormal: `// No requiere JS. Estilo de scroll puro con CSS.`
        }
    };

    return rawData.map((feature) => ({ ...feature, ...(overrides[feature.id] || {}) }));
}

export class FeatureList {
    constructor() {
        this.data = window.GUIDE_DATA || [];
        this.features = this.data.map((feature) => feature.name);
        this.container = $("#featureList");
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.container?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-guide-feature]");
            if (!button) return;
            document.dispatchEvent(new CustomEvent("guide:select-feature", {
                detail: { id: Number(button.dataset.guideFeature) }
            }));
        });
    }

    render() {
        if (!this.container) return;

        if (!this.features.length) {
            this.container.innerHTML = `
                <article class="feature-card">
                    <strong>Guia en preparacion</strong>
                    <span class="muted">No se encontro el inventario de funcionalidades.</span>
                </article>
            `;
            return;
        }

        this.container.innerHTML = this.data.map((feature, index) => `
            <button type="button" class="feature-card feature-card--button" data-guide-feature="${feature.id}" data-section="guia">
                <strong>${index + 1}. ${feature.name}</strong>
                <span class="muted">Reutilizable en proyectos web.</span>
            </button>
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
        document.addEventListener("click", (event) => {
            const guideButton = event.target.closest("[data-guide-feature-action]");
            if (!guideButton) return;
            document.dispatchEvent(new CustomEvent("guide:select-feature", {
                detail: { id: Number(guideButton.dataset.guideFeatureAction) }
            }));
        });
        $("#printPage").addEventListener("click", () => window.print());
        $("#resetDemo").addEventListener("click", () => {
            const container = $("#temperatureTool");
            if (container) {
                container.classList.remove("unit-celsius", "unit-fahrenheit", "unit-kelvin");
            }
            this.toast.show("Demo visual reiniciada.");
        });
        document.addEventListener("custom-select:change", (event) => {
            if (event.detail.inputId === "selectProducto") {
                const target = $("#selectedProductText");
                if (target) target.textContent = event.detail.value;
            }
        });
    }
}

export class ImplementationGuide {
    constructor(toast) {
        this.toast = toast;
        this.container = $("#guideCategories");
        this.detailPanel = $("#guideDetail");
        this.data = window.GUIDE_DATA || [];
        this.filteredData = [...this.data];
        this.details = window.GUIDE_DETAILS || {};
        this.searchQuery = "";
        this.selectedId = null;
        this.pdfGroups = [
            { label: "Guía de Reciclaje Completa", file: "docs/pdf/guia_reciclaje_completa_2026.pdf" },
            { label: "Actividades Guiadas", file: "docs/pdf/actividades_guiadas_componentes_web_2026.pdf" }
        ];
        if (this.container && this.detailPanel) {
            this.init();
        }
    }

    init() {
        if (!this.data.length) {
            this.renderEmptyState();
            return;
        }

        this.renderSidebar();
        this.bindSidebarEvents();
        this.bindExternalSelection();
        this.activateFirstItem();
    }

    renderSidebar() {
        const categories = {};
        this.filteredData.forEach((item) => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        let html = this.renderSearchPanel();
        if (this.filteredData.length) {
            Object.entries(categories)
                .sort(([, a], [, b]) => a[0].id - b[0].id)
                .forEach(([cat, items], index) => {
                    html += `
                        <button class="accordion__button" type="button">
                            <span>${index + 1}. ${cat}</span>
                            <span class="guide-category-count">${items.length}</span>
                        </button>
                        <div class="accordion__content">
                            <ul class="guide-item-list">
                                ${items.map((feat) => `
                                    <li>
                                        <button class="guide-item-btn" type="button" data-id="${feat.id}">
                                            ${feat.id}. ${feat.name}
                                        </button>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    `;
                });
        } else {
            html += `
                <div class="guide-empty">
                    <strong>Sin coincidencias</strong>
                    <p class="muted">Prueba con otro nombre, categoría, número o palabra clave.</p>
                </div>
            `;
        }

        this.container.innerHTML = html;
        this.container.insertAdjacentHTML("beforeend", this.renderDownloadsPanel());
        if (this.filteredData.length) {
            new Accordion("#guideCategories");
        }
    }

    bindSidebarEvents() {
        this.container.addEventListener("input", (e) => {
            const input = e.target.closest("[data-guide-search]");
            if (!input) return;
            this.updateFilter(input.value);
        });

        this.container.addEventListener("click", (e) => {
            const btn = e.target.closest(".guide-item-btn");
            if (btn) {
                this.selectFeature(parseInt(btn.dataset.id, 10));
                return;
            }

            const preset = e.target.closest("[data-guide-preset]");
            if (preset) {
                this.updateFilter(preset.dataset.guidePreset || "");
                return;
            }

            const clear = e.target.closest("[data-guide-clear]");
            if (clear) {
                this.updateFilter("");
            }
        });
    }

    bindExternalSelection() {
        document.addEventListener("guide:select-feature", (event) => {
            const targetId = event.detail.id;
            if (!this.filteredData.some((item) => item.id === targetId)) {
                this.updateFilter("");
            }
            this.selectFeature(targetId, { scrollToDetail: true });
        });
    }

    renderDetail(id) {
        const feat = this.data.find((item) => item.id === id);
        if (!feat) return;

        const detailedText = this.details[String(id)] || "No hay detalle ampliado disponible para esta funcionalidad todavía.";
        const pdfInfo = this.getPdfForFeature(id);
        const tabIds = {
            html: `guide-html-${feat.id}`,
            css: `guide-css-${feat.id}`,
            jsMod: `guide-jsmod-${feat.id}`,
            jsNorm: `guide-jsnorm-${feat.id}`
        };

        this.detailPanel.innerHTML = `
            <div class="guide-detail__header">
                <span class="eyebrow">${feat.category}</span>
                <h3>${feat.name}</h3>
                <p>${feat.description}</p>
            </div>
            
            <div class="tabs" data-tabs id="guideTabs">
                <div class="tabs__buttons">
                    <button class="is-active" data-tab="${tabIds.html}">HTML</button>
                    <button data-tab="${tabIds.css}">CSS</button>
                    <button data-tab="${tabIds.jsMod}">JS Modular</button>
                    <button data-tab="${tabIds.jsNorm}">JS Normal</button>
                </div>
                
                <div class="tab-panel is-active" id="${tabIds.html}">
                    <div class="code-header">
                        <span>Estructura HTML recomendada</span>
                        <button class="secondary-button copy-code-btn" data-target="codeHTML">Copiar</button>
                    </div>
                    <pre><code id="codeHTML">${this.escapeHTML(feat.html)}</code></pre>
                </div>
                
                <div class="tab-panel" id="${tabIds.css}">
                    <div class="code-header">
                        <span>Estilos CSS recomendados</span>
                        <button class="secondary-button copy-code-btn" data-target="codeCSS">Copiar</button>
                    </div>
                    <pre><code id="codeCSS">${this.escapeHTML(feat.css)}</code></pre>
                </div>
                
                <div class="tab-panel" id="${tabIds.jsMod}">
                    <div class="code-header">
                        <span>Código JavaScript Modular</span>
                        <button class="secondary-button copy-code-btn" data-target="codeJSMod">Copiar</button>
                    </div>
                    <p class="muted">Listo para usar en <code>&lt;script type="module"&gt;</code>. Puede venir como <code>class</code>, <code>function</code> o modulo autoejecutable, segun convenga a la funcionalidad.</p>
                    <pre><code id="codeJSMod">${this.escapeHTML(feat.jsModular)}</code></pre>
                </div>
                
                <div class="tab-panel" id="${tabIds.jsNorm}">
                    <div class="code-header">
                        <span>Código JavaScript Normal (sin módulos)</span>
                        <button class="secondary-button copy-code-btn" data-target="codeJSNorm">Copiar</button>
                    </div>
                    <pre><code id="codeJSNorm">${this.escapeHTML(feat.jsNormal)}</code></pre>
                </div>
            </div>

            <div class="guide-actions">
                <button type="button" class="secondary-button guide-copy-all">
                    Copiar pack completo
                </button>
                <button type="button" class="secondary-button guide-more-toggle" aria-expanded="false">
                    Saber más
                </button>
                <span class="muted">Detalle ampliado extraído de la guía PDF de esta funcionalidad.</span>
            </div>

            <div class="guide-downloads">
                <a class="secondary-button" href="${pdfInfo.file}" download>Descargar PDF del bloque</a>
                <span class="muted">${pdfInfo.label}. El PDF sirve como apoyo; para implementar, usa como fuente principal los bloques HTML, CSS y JS de arriba.</span>
            </div>

            <section class="guide-more" hidden>
                <div class="guide-more__content">
                    ${this.renderDetailedContent(detailedText)}
                </div>
            </section>
        `;

        new Tabs("#guideTabs");

        $$(".copy-code-btn", this.detailPanel).forEach(copyBtn => {
            copyBtn.addEventListener("click", async () => {
                const codeId = copyBtn.dataset.target;
                const codeElement = document.getElementById(codeId);
                if (codeElement) {
                    try {
                        await copyText(codeElement.textContent);
                        this.toast?.show("Código copiado al portapapeles.");
                    } catch {
                        this.toast?.show("No se pudo copiar el código.");
                    }
                }
            });
        });

        const moreButton = $(".guide-more-toggle", this.detailPanel);
        const moreSection = $(".guide-more", this.detailPanel);
        const copyAllButton = $(".guide-copy-all", this.detailPanel);
        copyAllButton?.addEventListener("click", async () => {
            try {
                await copyText(this.buildCombinedSnippet(feat));
                this.toast?.show("Paquete completo copiado.");
            } catch {
                this.toast?.show("No se pudo copiar el paquete completo.");
            }
        });

        moreButton?.addEventListener("click", () => {
            const expanded = moreButton.getAttribute("aria-expanded") === "true";
            moreButton.setAttribute("aria-expanded", String(!expanded));
            moreButton.textContent = expanded ? "Saber más" : "Ocultar detalle";
            if (moreSection) {
                moreSection.hidden = expanded;
                if (!expanded) {
                    moreSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        });
    }

    escapeHTML(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    renderDetailedContent(text) {
        const normalized = this.normalizeDetailText(text);
        const lines = normalized.split("\n");
        const html = [];
        let paragraphBuffer = [];
        let listBuffer = [];
        let codeBuffer = [];

        const flushParagraph = () => {
            if (!paragraphBuffer.length) return;
            html.push(`<p class="guide-more__paragraph">${this.escapeHTML(paragraphBuffer.join(" "))}</p>`);
            paragraphBuffer = [];
        };

        const flushList = () => {
            if (!listBuffer.length) return;
            html.push(`<ul class="guide-more__list">${listBuffer.map((item) => `<li>${this.escapeHTML(item)}</li>`).join("")}</ul>`);
            listBuffer = [];
        };

        const flushCode = () => {
            if (!codeBuffer.length) return;
            html.push(`<pre class="guide-more__code"><code>${this.escapeHTML(codeBuffer.join("\n"))}</code></pre>`);
            codeBuffer = [];
        };

        lines.forEach((rawLine) => {
            const line = rawLine.trimEnd();
            const trimmed = line.trim();

            if (!trimmed) {
                flushParagraph();
                flushList();
                flushCode();
                return;
            }

            if (this.isDetailHeading(trimmed)) {
                flushParagraph();
                flushList();
                flushCode();
                const tag = /^(\d+\.)/.test(trimmed) ? "h3" : "h4";
                html.push(`<${tag} class="guide-more__heading">${this.escapeHTML(trimmed)}</${tag}>`);
                return;
            }

            if (this.isCodeLine(line)) {
                flushParagraph();
                flushList();
                codeBuffer.push(line);
                return;
            }

            flushCode();

            if (/^[-•]\s+/.test(trimmed)) {
                flushParagraph();
                listBuffer.push(trimmed.replace(/^[-•]\s+/, ""));
                return;
            }

            if (/^\d+\.\s+/.test(trimmed)) {
                flushParagraph();
                listBuffer.push(trimmed);
                return;
            }

            flushList();
            paragraphBuffer.push(trimmed);
        });

        flushParagraph();
        flushList();
        flushCode();

        return `<div class="guide-more__rich">${html.join("")}</div>`;
    }

    normalizeDetailText(text) {
        return String(text || "")
            .replaceAll("â€¢", "•")
            .replaceAll("\u007f", "•")
            .replaceAll("Â¿", "¿")
            .replaceAll("Â¡", "¡")
            .replaceAll("Ã¡", "á")
            .replaceAll("Ã©", "é")
            .replaceAll("Ã­", "í")
            .replaceAll("Ã³", "ó")
            .replaceAll("Ãº", "ú")
            .replaceAll("Ã±", "ñ")
            .replaceAll("Ã", "Á")
            .replaceAll("Ã‰", "É")
            .replaceAll("Ã", "Í")
            .replaceAll("Ã“", "Ó")
            .replaceAll("Ãš", "Ú")
            .replaceAll("Ã‘", "Ñ");
    }

    isDetailHeading(line) {
        return /^(\d+\.\s|¿Qué hace\?|¿Cuándo usarlo\?|Aspecto|Explicacion|Qué hace|Que hace|Donde se usa|Cómo se personaliza|Como se personaliza|Mapa rapido de reciclaje|Mapa rápido de reciclaje|Paso a paso|Implementacion paso a paso|Implementación paso a paso|Errores comunes|Checklist|Mejoras opcionales|Variables, clases|Variables, clases, ids|Variables, clases, IDs|Con qué combinarlo|Dónde se usa mejor|Implementación conceptual|Implementacion conceptual|Adaptaciones profesionales recomendadas|Código HTML mínimo|Codigo HTML minimo|HTML mínimo|CSS necesario|Código CSS mínimo|Codigo CSS minimo|CSS del componente|JavaScript modular|JavaScript normal|funciones\.js|script\.js|script-normal\.js|index\.html|styles\.css)/.test(line);
    }

    isCodeLine(line) {
        const trimmed = line.trim();
        if (!trimmed) return false;

        const codeIndicators = [
            '<', '>', '{', '}', '(', ')', '[', ']', ';', '//', '/*', '*/', '=>', '?.', '||', '&&', '===', '!==', '++', '--', '+=', '-=', '*=', '/=',
            'export ', 'import ', 'class ', 'function ', 'const ', 'let ', 'var ', 'new ', 'if ', 'else ', 'return ', 'try ', 'catch ', 'finally ', 'for ', 'while ', 'switch ', 'case ', 'break ', 'continue ', 'typeof ', 'instanceof ', 'await ', 'async ', 'yield ', 'throw ', 'debugger ',
            'window.', 'document.', 'localStorage', 'sessionStorage', 'console.', 'this.', 'JSON.', 'Math.', 'Date.', 'Array.', 'Object.', 'String.', 'Number.', 'Boolean.', 'Promise.', 'fetch(', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'addEventListener', 'removeEventListener', 'dispatchEvent', 'getElementById', 'querySelector', 'querySelectorAll', 'createElement', 'appendChild', 'removeChild', 'insertBefore', 'cloneNode', 'replaceChild', 'classList.', 'dataset.', 'style.', 'textContent', 'innerHTML', 'innerText', 'outerHTML', 'value', 'checked', 'disabled', 'selected', 'readOnly',
            'gradient(', 'rgba(', 'rgb(', 'hsl(', 'hsla(', 'url(', 'calc(', 'var(', 'clamp(', 'min(', 'max(', 'translate(', 'rotate(', 'scale(', 'skew(', 'matrix(', 'perspective(',
            '@media', '@keyframes', '@import', '@supports', '@font-face',
            'data-', 'aria-', 'role=', 'tabindex=', 'draggable', 'hidden', 'placeholder', 'minlength', 'maxlength', 'pattern', 'required', 'readonly', 'disabled', 'checked', 'selected',
            'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
            'prototype', '__proto__', 'constructor', 'super', 'extends', 'static', 'get ', 'set ',
            'event.', 'target.', 'currentTarget.', 'preventDefault', 'stopPropagation', 'stopImmediatePropagation', 'bubbles', 'cancelable', 'composed',
            '===', '!==', '==', '!=', '<=', '>=', '<', '>', '&&', '||', '??', '?.', '!!', '!', '~', '&', '|', '^', '<<', '>>', '>>>', '+', '-', '*', '/', '%',
            '...', '??=', '?.', '??',
        ];

        for (const indicator of codeIndicators) {
            if (trimmed.includes(indicator)) return true;
        }

        if (/^#[a-fA-F0-9]{3,8}\b/.test(trimmed)) return true;
        if (/\d+(px|em|rem|%|vh|vw|pt|cm|mm|in|ex|ch|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx|fr)\b/.test(trimmed)) return true;
        if (/^[a-z-]+\s*:\s*.+;?$/.test(trimmed)) return true;
        if (/^<[a-zA-Z][^>]*>/.test(trimmed)) return true;
        if (/^\w+(\.\w+)*\s*\(.*\)\s*;?$/.test(trimmed)) return true;
        if (/^}\s*;?$/.test(trimmed)) return true;
        if (/^[\{\}\(\)\[\]]$/.test(trimmed)) return true;

        return false;
    }

    getPdfForFeature(id) {
        return this.pdfGroups[0];
    }

    renderSearchPanel() {
        return `
            <div class="guide-search">
                <label class="guide-search__label" for="guideSearchInput">Buscar funcionalidad</label>
                <div class="guide-search__row">
                    <input
                        id="guideSearchInput"
                        class="guide-search__input"
                        type="search"
                        placeholder="Ej: navbar, modal, carrito, bootstrap..."
                        value="${this.escapeHTML(this.searchQuery)}"
                        data-guide-search
                    >
                    <button class="secondary-button" type="button" data-guide-clear>Limpiar</button>
                </div>
                <div class="guide-search__meta">
                    <span class="guide-results-count">${this.filteredData.length} resultados</span>
                    <span class="muted">Busca por nombre, categoría, id o descripción.</span>
                </div>
                <div class="guide-search__chips">
                    <button type="button" class="guide-search__chip" data-guide-preset="bootstrap">Bootstrap</button>
                    <button type="button" class="guide-search__chip" data-guide-preset="formulario">Formularios</button>
                    <button type="button" class="guide-search__chip" data-guide-preset="tabla">Tablas</button>
                    <button type="button" class="guide-search__chip" data-guide-preset="carrito">Carrito</button>
                </div>
            </div>
        `;
    }

    renderDownloadsPanel() {
        return `
            <div class="guide-download-panel">
                <h4>Descargas PDF</h4>
                <div class="guide-download-list">
                    ${this.pdfGroups.map((pdf) => `
                        <a class="guide-download-link" href="${pdf.file}" download>${pdf.label}</a>
                    `).join("")}
                </div>
            </div>
        `;
    }

    activateFirstItem() {
        const firstButton = $(".guide-item-btn", this.container);
        if (firstButton) {
            this.selectFeature(Number(firstButton.dataset.id));
        }
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <p class="muted">No hay categorias disponibles todavia.</p>
        `;
        this.detailPanel.innerHTML = `
            <div class="guide-detail__welcome">
                <h3>Guia sin datos</h3>
                <p>No se encontro <code>window.GUIDE_DATA</code>. Verifica que <code>guide-data.js</code> cargue antes de la app principal.</p>
            </div>
        `;
    }

    renderNoResultsState() {
        this.detailPanel.innerHTML = `
            <div class="guide-detail__welcome">
                <h3>Sin coincidencias en la guía</h3>
                <p>Prueba con otra palabra clave o usa los accesos rápidos para explorar funcionalidades relacionadas.</p>
            </div>
        `;
    }

    updateFilter(query) {
        const activeSearch = document.activeElement?.matches?.("[data-guide-search]") || false;
        const caretPosition = activeSearch ? document.activeElement.selectionStart : null;
        this.searchQuery = query.trim();
        const normalizedQuery = this.normalizeSearch(this.searchQuery);

        if (!normalizedQuery) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter((item) => {
                const haystack = this.normalizeSearch(`${item.id} ${item.name} ${item.category} ${item.description}`);
                return haystack.includes(normalizedQuery);
            });
        }

        this.renderSidebar();
        this.restoreSearchFocus(activeSearch, caretPosition);

        if (!this.filteredData.length) {
            this.selectedId = null;
            this.renderNoResultsState();
            return;
        }

        const stillVisible = this.selectedId && this.filteredData.some((item) => item.id === this.selectedId);
        if (stillVisible) {
            this.selectFeature(this.selectedId);
            return;
        }

        this.activateFirstItem();
    }

    normalizeSearch(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    buildCombinedSnippet(feat) {
        return [
            `${feat.id}. ${feat.name}`,
            "",
            "HTML",
            feat.html,
            "",
            "CSS",
            feat.css,
            "",
            "JS Modular",
            feat.jsModular,
            "",
            "JS Normal",
            feat.jsNormal
        ].join("\n");
    }

    restoreSearchFocus(shouldFocus, caretPosition) {
        if (!shouldFocus) return;
        const input = this.container.querySelector("[data-guide-search]");
        if (!input) return;
        input.focus({ preventScroll: true });
        const safePosition = typeof caretPosition === "number" ? caretPosition : input.value.length;
        input.setSelectionRange(safePosition, safePosition);
    }

    selectFeature(id, options = {}) {
        const { scrollToDetail = false } = options;
        let button = this.container.querySelector(`.guide-item-btn[data-id="${id}"]`);
        if (!button && this.data.some((item) => item.id === id)) {
            this.updateFilter("");
            button = this.container.querySelector(`.guide-item-btn[data-id="${id}"]`);
        }
        if (!button) return;
        this.selectedId = id;

        $$(".guide-item-btn", this.container).forEach((item) => item.classList.remove("is-active"));
        $$(".accordion__content", this.container).forEach((content) => content.classList.remove("is-open"));

        button.classList.add("is-active");
        button.closest(".accordion__content")?.classList.add("is-open");
        this.renderDetail(id);

        if (scrollToDetail) {
            button.scrollIntoView({ behavior: "smooth", block: "nearest" });
            this.detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
}

class UtilityBadgeToggle {
    constructor() {
        this.bar = document.getElementById("utilityBadgeBar");
        if (!this.bar) return;
        this.grid = document.querySelector("#utilidades .utilities-cards-grid");
        this.bootstrapCard = document.getElementById("bootstrapLearn");
        if (this.grid && this.bootstrapCard && this.bootstrapCard.parentElement !== this.grid) {
            this.grid.appendChild(this.bootstrapCard);
        }
        this.cards = document.querySelectorAll("#utilidades .utility-card");
        this.activeId = null;
        this.setInitialState();
        this.bindEvents();
    }

    setInitialState() {
        const activeBadge = this.bar.querySelector(".utility-badge.is-active");
        if (!activeBadge) {
            this.hideAllCards();
            return;
        }

        this.activeId = activeBadge.dataset.target;
        this.showCard(this.activeId);
    }

    bindEvents() {
        this.bar.addEventListener("click", (e) => {
            const badge = e.target.closest(".utility-badge");
            if (!badge) return;
            const targetId = badge.dataset.target;
            // Si clic en la misma badge activa, ocultar todo
            if (this.activeId === targetId) {
                this.hideAllCards();
                this.clearActiveBadge();
                this.activeId = null;
                return;
            }
            this.activeId = targetId;
            this.showCard(targetId);
            this.updateActiveBadge(badge);
        });
    }

    showCard(targetId) {
        this.cards.forEach((card) => {
            if (card.id === targetId || card.querySelector(`#${targetId}`)) {
                card.classList.remove("is-hidden");
            } else {
                card.classList.add("is-hidden");
            }
        });
    }

    hideAllCards() {
        this.cards.forEach((card) => card.classList.add("is-hidden"));
    }

    updateActiveBadge(activeBadge) {
        this.bar.querySelectorAll(".utility-badge").forEach((b) => b.classList.remove("is-active"));
        activeBadge.classList.add("is-active");
    }

    clearActiveBadge() {
        this.bar.querySelectorAll(".utility-badge").forEach((b) => b.classList.remove("is-active"));
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
    new ProfilePresentationActivity();
    new ShoppingCartActivity(toast);
    new CopyToClipboard(toast);
    new UtilityActions(toast);
    new UtilityBadgeToggle();
    new ImplementationGuide(toast);
}
