from pathlib import Path
from textwrap import wrap


PDF_GENERAL = Path("explicacion_codigo_conversor_temperatura.pdf")
PDF_JS = Path("paso_a_paso_javascript_conversor.pdf")


def ascii_text(text):
    replacements = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ñ": "n", "Ñ": "N", "°": " grados ", "→": "->",
        "“": '"', "”": '"', "‘": "'", "’": "'", "—": "-", "–": "-",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def escape_pdf(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class SimplePdf:
    def __init__(self):
        self.pages = []
        self.current = []
        self.x = 52
        self.y = 742
        self.width = 88

    def new_page(self):
        if self.current:
            self.pages.append(self.current)
        self.current = []
        self.y = 742

    def ensure(self, height):
        if self.y - height < 52:
            self.new_page()

    def line(self, text="", size=10, font="F1", leading=14):
        self.ensure(leading)
        self.current.append((self.x, self.y, size, font, ascii_text(text)))
        self.y -= leading

    def paragraph(self, text, size=10, leading=14, width=None):
        for line in wrap(ascii_text(text), width=width or self.width):
            self.line(line, size=size, leading=leading)
        self.y -= 5

    def heading(self, text, level=1):
        self.y -= 8
        self.line(text, size=16 if level == 1 else 13, font="F2", leading=20)

    def bullet(self, text):
        lines = wrap(ascii_text(text), width=84)
        for index, line in enumerate(lines):
            self.line(("- " if index == 0 else "  ") + line, leading=14)
        self.y -= 2

    def step(self, number, title, text):
        self.heading(f"Paso {number}: {title}", level=2)
        self.paragraph(text)

    def code(self, text):
        self.y -= 4
        for raw in ascii_text(text).splitlines():
            chunks = wrap(raw, width=94, replace_whitespace=False, drop_whitespace=False) or [""]
            for chunk in chunks:
                self.line("    " + chunk, size=8, font="F3", leading=11)
        self.y -= 6

    def render(self, path):
        if self.current:
            self.pages.append(self.current)

        objects = []

        def add(body):
            objects.append(body)
            return len(objects)

        font_regular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        font_bold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        font_mono = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

        page_ids = []
        content_ids = []

        for page in self.pages:
            commands = ["BT"]
            for x, y, size, font, text in page:
                commands.append(f"/{font} {size} Tf")
                commands.append(f"1 0 0 1 {x} {y} Tm")
                commands.append(f"({escape_pdf(text)}) Tj")
            commands.append("ET")
            stream = "\n".join(commands).encode("latin-1", errors="replace")
            content_id = add(
                f"<< /Length {len(stream)} >>\nstream\n"
                + stream.decode("latin-1")
                + "\nendstream"
            )
            content_ids.append(content_id)

        pages_id = len(objects) + len(content_ids) + 1
        for content_id in content_ids:
            page_ids.append(
                add(
                    f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 612 792] "
                    f"/Resources << /Font << /F1 {font_regular} 0 R "
                    f"/F2 {font_bold} 0 R /F3 {font_mono} 0 R >> >> "
                    f"/Contents {content_id} 0 R >>"
                )
            )

        kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
        add(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog_id = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

        data = bytearray(b"%PDF-1.4\n")
        offsets = [0]
        for number, body in enumerate(objects, start=1):
            offsets.append(len(data))
            data.extend(f"{number} 0 obj\n".encode("latin-1"))
            data.extend(body.encode("latin-1", errors="replace"))
            data.extend(b"\nendobj\n")

        xref = len(data)
        data.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
        data.extend(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            data.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
        data.extend(
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n".encode("latin-1")
        )
        path.write_bytes(data)


def build_general():
    pdf = SimplePdf()
    pdf.line("Explicacion general del codigo: Conversor de Temperatura", size=18, font="F2", leading=24)
    pdf.paragraph(
        "Documento corregido despues de revisar nuevamente el proyecto. Los textos con tildes "
        "no se consideran error: si en esta consola se ven como caracteres raros, es por la forma "
        "en que la terminal muestra la codificacion, no por la logica del programa."
    )

    pdf.heading("1. Estado actual del proyecto")
    pdf.paragraph(
        "La app esta formada por index.html, styles.css, funciones.js y script.js. El flujo general "
        "ya esta bien encaminado: el HTML tiene un input de temperatura, un select de unidad, un boton "
        "y un parrafo para mostrar resultados. script.js importa la clase de funciones.js y usa esos IDs."
    )
    pdf.bullet("Los labels ya apuntan a los IDs correctos: temperatura y unidad-medida.")
    pdf.bullet("script.js ya usa los IDs correctos: temperatura, unidad-medida, mensaje, resultado y convertir.")
    pdf.bullet("La conversion de Fahrenheit a Kelvin ya usa conversor.fahrenheitToKelvin(), que es correcto.")
    pdf.bullet("La carga del modulo en index.html esta limpia: solo queda script.js con type=\"module\".")

    pdf.heading("2. index.html")
    pdf.paragraph(
        "index.html define la interfaz. Lo mas importante para JavaScript son los atributos id, porque "
        "script.js los usa con document.getElementById."
    )
    pdf.code(
        """<input type="number" id="temperatura" placeholder="Ingrese la temperatura">
<p id="mensaje" class="mensaje"></p>
<select id="unidad-medida">
<button id="convertir">Convertir</button>
<p id="resultado"></p>"""
    )
    pdf.paragraph(
        "La carga correcta de modulos es esta:"
    )
    pdf.code('<script type="module" src="script.js"></script>')
    pdf.paragraph(
        "En el HTML actual ya no aparece una carga directa de funciones.js ni texto suelto antes del script. "
        "Debe mantenerse solamente el script type=\"module\" para que import/export funcionen."
    )

    pdf.heading("3. styles.css")
    pdf.paragraph(
        "styles.css aplica estilos basicos: fondo, padding, fuente, centrado y tamano de inputs, select "
        "y boton. No afecta la logica de conversion; solo la presentacion visual."
    )

    pdf.heading("4. funciones.js")
    pdf.paragraph(
        "funciones.js contiene la logica reutilizable. La clase principal es ConversorTemperatura. "
        "Su trabajo es guardar valores y convertir entre Celsius, Fahrenheit y Kelvin."
    )
    pdf.code(
        """export class ConversorTemperatura {
    constructor() {
        this.celsius = 0;
        this.fahrenheit = 0;
        this.kelvin = 0;
    }
}"""
    )
    pdf.paragraph(
        "Cada metodo usa una formula. Por ejemplo, celsiusToFahrenheit toma this.celsius, calcula "
        "Fahrenheit, guarda el resultado en this.fahrenheit y lo devuelve con return."
    )
    pdf.code(
        """celsiusToFahrenheit() {
    this.fahrenheit = (this.celsius * 9 / 5) + 32;
    return this.fahrenheit;
}"""
    )
    pdf.paragraph(
        "La clase validador tambien existe en funciones.js. Actualmente no se usa desde script.js, "
        "asi que no es necesaria para que la app convierta. Puede servir despues si quieres validar "
        "mientras el usuario escribe."
    )

    pdf.heading("5. script.js")
    pdf.paragraph(
        "script.js conecta la pagina con la logica matematica. Primero importa la clase, crea el "
        "objeto conversor y guarda referencias a los elementos del DOM."
    )
    pdf.code(
        """import { ConversorTemperatura } from './funciones.js';

const conversor = new ConversorTemperatura();
const inputTemperatura = document.getElementById('temperatura');
const selectUnidad = document.getElementById('unidad-medida');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');
const botonConvertir = document.getElementById('convertir');"""
    )
    pdf.paragraph(
        "Luego escucha el click del boton. Dentro del evento lee el valor escrito, revisa la unidad "
        "seleccionada, valida el dato y decide que conversion ejecutar."
    )
    pdf.code(
        """botonConvertir.addEventListener('click', () => {
    const valor = inputTemperatura.value.trim();
    const unidad = selectUnidad.value;
    // validaciones y conversiones
});"""
    )

    pdf.heading("6. Flujo completo")
    pdf.bullet("1. El navegador carga index.html.")
    pdf.bullet("2. index.html carga script.js como modulo.")
    pdf.bullet("3. script.js importa ConversorTemperatura desde funciones.js.")
    pdf.bullet("4. Se crea el objeto conversor.")
    pdf.bullet("5. El usuario escribe una temperatura y elige una unidad.")
    pdf.bullet("6. Al hacer click, script.js valida el dato.")
    pdf.bullet("7. Segun la unidad, script.js asigna celsius, fahrenheit o kelvin.")
    pdf.bullet("8. Se llama el metodo correcto de funciones.js.")
    pdf.bullet("9. El resultado se muestra dentro del parrafo resultado.")

    pdf.heading("7. Correcciones reales despues de la revision")
    pdf.bullet("Corregido: los labels ya tienen for=\"temperatura\" y for=\"unidad-medida\".")
    pdf.bullet("Corregido: ya no se carga funciones.js como script normal; se usa script.js como modulo.")
    pdf.bullet("Corregido: Fahrenheit a Kelvin usa la variable conversor correctamente.")
    pdf.bullet("Bien: el HTML ya no tiene carga directa de funciones.js ni texto suelto antes del script.")
    pdf.bullet("No marcar como error: los textos con tilde son validos; la consola puede mostrarlos mal.")

    pdf.render(PDF_GENERAL)


def build_js_steps():
    pdf = SimplePdf()
    pdf.line("Paso a paso corregido de los archivos JavaScript", size=18, font="F2", leading=24)
    pdf.paragraph(
        "Este documento se centra en funciones.js y script.js. Esta version corrige las notas anteriores: "
        "los textos con tildes no se tratan como error y el codigo revisado ya tiene varias correcciones aplicadas."
    )

    pdf.heading("Parte A: funciones.js")
    pdf.step(
        1,
        "Exportar ConversorTemperatura",
        "La palabra export permite que script.js pueda importar esta clase. Como se usa export/import, "
        "el HTML debe cargar script.js con type=\"module\"."
    )
    pdf.code("export class ConversorTemperatura {")

    pdf.step(
        2,
        "Inicializar valores",
        "El constructor prepara tres propiedades en cero. Son los espacios donde el objeto guarda la temperatura actual."
    )
    pdf.code(
        """constructor() {
    this.celsius = 0;
    this.fahrenheit = 0;
    this.kelvin = 0;
}"""
    )
    pdf.bullet("this.celsius guarda el valor en Celsius.")
    pdf.bullet("this.fahrenheit guarda el valor en Fahrenheit.")
    pdf.bullet("this.kelvin guarda el valor en Kelvin.")

    pdf.step(
        3,
        "Metodo celsiusToFahrenheit",
        "Lee this.celsius, aplica la formula, guarda el resultado en this.fahrenheit y lo devuelve."
    )
    pdf.code(
        """celsiusToFahrenheit() {
    this.fahrenheit = (this.celsius * 9 / 5) + 32;
    return this.fahrenheit;
}"""
    )

    pdf.step(
        4,
        "Metodo celsiusToKelvin",
        "Lee this.celsius, suma 273.15, guarda el resultado en this.kelvin y lo devuelve."
    )
    pdf.code(
        """celsiusToKelvin() {
    this.kelvin = this.celsius + 273.15;
    return this.kelvin;
}"""
    )

    pdf.step(
        5,
        "Metodos desde Fahrenheit",
        "Cuando el usuario elige Fahrenheit, script.js llena conversor.fahrenheit. Luego estos metodos calculan "
        "Celsius y Kelvin."
    )
    pdf.code(
        """fahrenheitToCelsius() {
    this.celsius = (this.fahrenheit - 32) * 5 / 9;
    return this.celsius;
}

fahrenheitToKelvin() {
    this.kelvin = (this.fahrenheit - 32) * 5 / 9 + 273.15;
    return this.kelvin;
}"""
    )

    pdf.step(
        6,
        "Metodos desde Kelvin",
        "Cuando el usuario elige Kelvin, script.js llena conversor.kelvin. Luego estos metodos calculan "
        "Celsius y Fahrenheit."
    )
    pdf.code(
        """kelvinToCelsius() {
    this.celsius = this.kelvin - 273.15;
    return this.celsius;
}

kelvinToFahrenheit() {
    this.fahrenheit = (this.kelvin - 273.15) * 9 / 5 + 32;
    return this.fahrenheit;
}"""
    )

    pdf.step(
        7,
        "Clase validador",
        "La clase validador permite validar un input por separado. En el flujo actual no se importa ni se instancia, "
        "asi que no participa en la conversion."
    )
    pdf.bullet("Puede quedarse en funciones.js sin afectar la app.")
    pdf.bullet("Si luego decides usarla, los IDs que reciba deben existir en index.html.")

    pdf.heading("Parte B: script.js")
    pdf.step(
        8,
        "Importar la clase",
        "script.js trae ConversorTemperatura desde funciones.js. Esto permite usar los metodos de conversion."
    )
    pdf.code("import { ConversorTemperatura } from './funciones.js';")

    pdf.step(
        9,
        "Crear una instancia",
        "new ConversorTemperatura() ejecuta el constructor y crea un objeto listo para guardar temperaturas."
    )
    pdf.code("const conversor = new ConversorTemperatura();")

    pdf.step(
        10,
        "Conectar con el HTML",
        "document.getElementById busca cada elemento por su id. Esta parte ya coincide con tu HTML actual."
    )
    pdf.code(
        """const inputTemperatura = document.getElementById('temperatura');
const selectUnidad = document.getElementById('unidad-medida');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');
const botonConvertir = document.getElementById('convertir');"""
    )

    pdf.step(
        11,
        "Esperar el click",
        "El programa no convierte apenas carga la pagina. Espera a que el usuario presione el boton Convertir."
    )
    pdf.code(
        """botonConvertir.addEventListener('click', () => {
    // codigo que se ejecuta al hacer click
});"""
    )

    pdf.step(
        12,
        "Leer valor y unidad",
        "value toma el contenido actual. trim() elimina espacios al inicio o al final del input."
    )
    pdf.code(
        """const valor = inputTemperatura.value.trim();
const unidad = selectUnidad.value;"""
    )

    pdf.step(
        13,
        "Validar si esta vacio",
        "Si valor esta vacio, se muestra un mensaje, se limpia el resultado y return detiene la funcion."
    )
    pdf.code(
        """if (valor === '') {
    mensaje.textContent = 'El campo no puede estar vacio.';
    mensaje.style.color = 'red';
    resultado.textContent = '';
    return;
}"""
    )
    pdf.paragraph(
        "Nota: en tu archivo el texto puede tener tilde. Eso esta bien; aqui se muestra sin tilde solo por "
        "compatibilidad del generador simple de PDF."
    )

    pdf.step(
        14,
        "Convertir texto a numero",
        "Aunque el input sea type=\"number\", JavaScript lee su valor como texto. Por eso se usa Number(valor)."
    )
    pdf.code("const temperatura = Number(valor);")

    pdf.step(
        15,
        "Validar numero",
        "Number.isFinite confirma que el valor convertido sea un numero valido. Si no lo es, se detiene."
    )
    pdf.code(
        """if (!Number.isFinite(temperatura)) {
    mensaje.textContent = 'Por favor, ingresa un numero valido.';
    mensaje.style.color = 'red';
    resultado.textContent = '';
    return;
}"""
    )

    pdf.step(
        16,
        "Mostrar validacion positiva",
        "Si pasa las validaciones, el mensaje cambia a verde."
    )
    pdf.code(
        """mensaje.textContent = 'Valor valido.';
mensaje.style.color = 'green';"""
    )

    pdf.step(
        17,
        "Convertir desde Celsius",
        "Si unidad es celsius, se guarda la temperatura en conversor.celsius y se calculan Fahrenheit y Kelvin."
    )
    pdf.code(
        """if (unidad === 'celsius') {
    conversor.celsius = temperatura;

    resultado.innerHTML = `
        Fahrenheit: ${conversor.celsiusToFahrenheit().toFixed(2)} grados F<br>
        Kelvin: ${conversor.celsiusToKelvin().toFixed(2)} K
    `;
}"""
    )

    pdf.step(
        18,
        "Convertir desde Fahrenheit",
        "Si unidad es fahrenheit, se guarda la temperatura en conversor.fahrenheit. El llamado a "
        "conversor.fahrenheitToKelvin() esta correcto en tu codigo actual."
    )
    pdf.code(
        """if (unidad === 'fahrenheit') {
    conversor.fahrenheit = temperatura;

    resultado.innerHTML = `
        Celsius: ${conversor.fahrenheitToCelsius().toFixed(2)} grados C<br>
        Kelvin: ${conversor.fahrenheitToKelvin().toFixed(2)} K
    `;
}"""
    )

    pdf.step(
        19,
        "Convertir desde Kelvin",
        "Si unidad es kelvin, se guarda la temperatura en conversor.kelvin y se calculan Celsius y Fahrenheit."
    )
    pdf.code(
        """if (unidad === 'kelvin') {
    conversor.kelvin = temperatura;

    resultado.innerHTML = `
        Celsius: ${conversor.kelvinToCelsius().toFixed(2)} grados C<br>
        Fahrenheit: ${conversor.kelvinToFahrenheit().toFixed(2)} grados F
    `;
}"""
    )

    pdf.heading("Revision final del codigo actual")
    pdf.bullet("Bien: import/export estan alineados con script type=\"module\".")
    pdf.bullet("Bien: los IDs usados en script.js existen en index.html.")
    pdf.bullet("Bien: la variable conversor esta escrita correctamente en las conversiones.")
    pdf.bullet("Bien: los labels for ya coinciden con sus inputs/select.")
    pdf.bullet("Bien: no queda texto suelto antes del script type=\"module\" en index.html.")
    pdf.bullet("No pendiente: no cambiar los textos con tilde solo porque esta terminal los muestre raro.")

    pdf.heading("Idea central")
    pdf.paragraph(
        "funciones.js se encarga de calcular. script.js se encarga de hablar con la pagina: leer el input, "
        "validar, llamar los metodos y escribir el resultado."
    )

    pdf.render(PDF_JS)


if __name__ == "__main__":
    build_general()
    build_js_steps()
