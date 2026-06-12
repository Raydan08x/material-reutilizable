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

export class FeatureList {
    constructor() {
        this.features = (window.GUIDE_DATA || []).map((feature) => feature.name);
        this.data = window.GUIDE_DATA || [];
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
        this.details = window.GUIDE_DETAILS || {};
        this.pdfGroups = [
            { label: "Guia 1 a 10", file: "docs/pdf/guia_reciclaje_componentes_web_01_10_actualizada_2026.pdf" },
            { label: "Guia 10 a 25", file: "docs/pdf/guia_reciclaje_componentes_web_10_25_actualizada_2026.pdf" },
            { label: "Guia 26 a 40", file: "docs/pdf/guia_reciclaje_componentes_web_26_40_actualizada_2026.pdf" },
            { label: "Guia 41 a 54", file: "docs/pdf/guia_reciclaje_componentes_web_41_54_actualizada_2026.pdf" },
            { label: "Actividades guiadas", file: "docs/pdf/actividades_guiadas_componentes_web_2026.pdf" },
            { label: "Recurso unificado", file: "docs/pdf/recurso_unificado_40_componentes_web.pdf" }
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
        this.data.forEach((item) => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        let html = "";
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

        this.container.innerHTML = html;
        this.container.insertAdjacentHTML("beforeend", this.renderDownloadsPanel());
        new Accordion("#guideCategories");
    }

    bindSidebarEvents() {
        this.container.addEventListener("click", (e) => {
            const btn = e.target.closest(".guide-item-btn");
            if (!btn) return;
            this.selectFeature(parseInt(btn.dataset.id, 10));
        });
    }

    bindExternalSelection() {
        document.addEventListener("guide:select-feature", (event) => {
            this.selectFeature(event.detail.id, { scrollToDetail: true });
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
                <button type="button" class="secondary-button guide-more-toggle" aria-expanded="false">
                    Saber más
                </button>
                <span class="muted">Detalle ampliado extraído de la guía PDF de esta funcionalidad.</span>
            </div>

            <div class="guide-downloads">
                <a class="secondary-button" href="${pdfInfo.file}" download>Descargar PDF del bloque</a>
                <span class="muted">${pdfInfo.label}</span>
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
        if (id <= 10) return this.pdfGroups[0];
        if (id <= 25) return this.pdfGroups[1];
        if (id <= 40) return this.pdfGroups[2];
        if (id <= 54) return this.pdfGroups[3];
        return this.pdfGroups[4];
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

    selectFeature(id, options = {}) {
        const { scrollToDetail = false } = options;
        const button = this.container.querySelector(`.guide-item-btn[data-id="${id}"]`);
        if (!button) return;

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
    new ImplementationGuide(toast);
}
