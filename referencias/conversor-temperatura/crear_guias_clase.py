from pathlib import Path
from textwrap import wrap


FILES = {
    "general": Path("guia_general_como_estudiar_y_hacer_la_tarea.pdf"),
    "html": Path("guia_clase_html_conversor_temperatura.pdf"),
    "css": Path("guia_clase_css_responsive_conversor_temperatura.pdf"),
    "js": Path("guia_clase_javascript_conversor_temperatura.pdf"),
}


def plain(text):
    replacements = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
        "°": " grados ", "→": "->", "←": "<-", "=>": "=>",
        "“": '"', "”": '"', "‘": "'", "’": "'", "—": "-", "–": "-",
        "•": "-", "✅": "[ok]", "❌": "[x]",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def esc(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Pdf:
    def __init__(self):
        self.pages = []
        self.current = []
        self.x = 50
        self.y = 744
        self.width = 90

    def new_page(self):
        if self.current:
            self.pages.append(self.current)
        self.current = []
        self.y = 744

    def ensure(self, height):
        if self.y - height < 50:
            self.new_page()

    def line(self, text="", size=10, font="F1", leading=14):
        self.ensure(leading)
        self.current.append((self.x, self.y, size, font, plain(text)))
        self.y -= leading

    def p(self, text, size=10, leading=14, width=None):
        for line in wrap(plain(text), width=width or self.width):
            self.line(line, size=size, leading=leading)
        self.y -= 5

    def h1(self, text):
        self.y -= 8
        self.line(text, size=18, font="F2", leading=24)

    def h2(self, text):
        self.y -= 8
        self.line(text, size=14, font="F2", leading=20)

    def h3(self, text):
        self.y -= 5
        self.line(text, size=12, font="F2", leading=17)

    def bullet(self, text):
        lines = wrap(plain(text), width=86)
        for i, line in enumerate(lines):
            self.line(("- " if i == 0 else "  ") + line, leading=14)
        self.y -= 2

    def step(self, n, title, text):
        self.h2(f"Paso {n}: {title}")
        self.p(text)

    def code(self, text):
        self.y -= 4
        for raw in plain(text).splitlines():
            chunks = wrap(raw, width=96, replace_whitespace=False, drop_whitespace=False) or [""]
            for chunk in chunks:
                self.line("    " + chunk, size=8, font="F3", leading=11)
        self.y -= 7

    def render(self, path):
        if self.current:
            self.pages.append(self.current)

        objects = []

        def add(body):
            objects.append(body)
            return len(objects)

        f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        f3 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")
        content_ids = []
        page_ids = []

        for page in self.pages:
            commands = ["BT"]
            for x, y, size, font, text in page:
                commands.append(f"/{font} {size} Tf")
                commands.append(f"1 0 0 1 {x} {y} Tm")
                commands.append(f"({esc(text)}) Tj")
            commands.append("ET")
            stream = "\n".join(commands).encode("latin-1", errors="replace")
            cid = add(
                f"<< /Length {len(stream)} >>\nstream\n"
                + stream.decode("latin-1")
                + "\nendstream"
            )
            content_ids.append(cid)

        pages_id = len(objects) + len(content_ids) + 1
        for cid in content_ids:
            page_ids.append(
                add(
                    f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 612 792] "
                    f"/Resources << /Font << /F1 {f1} 0 R /F2 {f2} 0 R /F3 {f3} 0 R >> >> "
                    f"/Contents {cid} 0 R >>"
                )
            )

        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        add(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

        data = bytearray(b"%PDF-1.4\n")
        offsets = [0]
        for i, obj in enumerate(objects, start=1):
            offsets.append(len(data))
            data.extend(f"{i} 0 obj\n".encode("latin-1"))
            data.extend(obj.encode("latin-1", errors="replace"))
            data.extend(b"\nendobj\n")
        xref = len(data)
        data.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
        data.extend(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            data.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
        data.extend(
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog} 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n".encode("latin-1")
        )
        path.write_bytes(data)


def build_general():
    pdf = Pdf()
    pdf.h1("Guia general: como estudiar y hacer la tarea")
    pdf.p(
        "Esta guia te explica como estudiar el proyecto completo del conversor de temperatura. "
        "La idea no es memorizar codigo: la idea es entender que papel cumple cada archivo, como se conectan "
        "entre si y como construir una tarea web de forma ordenada."
    )

    pdf.h2("1. Que significa cada extension")
    pdf.bullet(".html significa HyperText Markup Language. Sirve para crear la estructura de la pagina.")
    pdf.bullet(".css significa Cascading Style Sheets. Sirve para disenar la apariencia: colores, espacios, tamanos y responsive.")
    pdf.bullet(".js significa JavaScript. Sirve para dar comportamiento: eventos, validaciones, calculos y cambios en pantalla.")
    pdf.bullet(".pdf es Portable Document Format. Sirve para entregar una guia o documento que se vea igual en distintos equipos.")

    pdf.h2("2. Orden recomendado para estudiar")
    pdf.bullet("Primero mira index.html. Preguntate: que elementos existen en la pagina?")
    pdf.bullet("Despues mira styles.css. Preguntate: como se ven esos elementos?")
    pdf.bullet("Luego mira funciones.js. Preguntate: que logica reutilizable existe?")
    pdf.bullet("Por ultimo mira script.js. Preguntate: como se conecta el usuario con la logica?")

    pdf.h2("3. El modelo mental mas importante")
    pdf.p(
        "Piensa en el proyecto como una casa. HTML es la estructura: paredes, puertas y ventanas. "
        "CSS es la decoracion y organizacion visual: pintura, muebles, iluminacion y distribucion. "
        "JavaScript es la electricidad y los interruptores: cuando haces algo, la pagina responde."
    )

    pdf.h2("4. Como hacer la tarea desde cero")
    pdf.step(1, "Crear la estructura de archivos", "Crea una carpeta del proyecto y dentro agrega index.html, styles.css, funciones.js y script.js.")
    pdf.step(2, "Escribir el HTML", "Agrega titulo, input, selector, boton, mensajes y resultado. Cada elemento que JavaScript necesite debe tener id.")
    pdf.step(3, "Conectar CSS", "En head agrega link rel=\"stylesheet\" href=\"styles.css\" para que el HTML cargue los estilos.")
    pdf.step(4, "Conectar JavaScript", "Al final del body agrega script type=\"module\" src=\"script.js\". type=\"module\" permite usar import y export.")
    pdf.step(5, "Crear funciones.js", "Define una clase con los metodos de conversion. Esa clase no debe depender del HTML.")
    pdf.step(6, "Crear script.js", "Importa la clase, busca elementos con getElementById, escucha el click del boton, valida y muestra resultados.")
    pdf.step(7, "Probar casos", "Prueba Celsius, Fahrenheit, Kelvin, campo vacio, numeros negativos y decimales.")
    pdf.step(8, "Mejorar diseno", "Despues de funcionar, mejora CSS: layout, colores, sombras, responsive y estados visuales.")

    pdf.h2("5. Preguntas que debes hacerte mientras estudias")
    pdf.bullet("Que archivo estoy leyendo?")
    pdf.bullet("Ese archivo crea estructura, estilo o comportamiento?")
    pdf.bullet("Que nombres son IDs y cuales son clases CSS?")
    pdf.bullet("Que datos entran al programa?")
    pdf.bullet("Que datos salen como resultado?")
    pdf.bullet("Que funcion se ejecuta cuando hago click?")
    pdf.bullet("Que formula matematica usa cada conversion?")

    pdf.h2("6. Ruta de aprendizaje sugerida")
    pdf.bullet("Dia 1: entiende HTML y copia a mano la estructura.")
    pdf.bullet("Dia 2: entiende CSS basico y cambia colores, espacios y tamanos.")
    pdf.bullet("Dia 3: entiende funciones.js y prueba formulas con ejemplos.")
    pdf.bullet("Dia 4: entiende script.js y explica cada linea en voz alta.")
    pdf.bullet("Dia 5: mejora responsive y prueba en pantalla pequena.")

    pdf.h2("7. Checklist final de entrega")
    pdf.bullet("El HTML tiene title claro, lang correcto y meta viewport.")
    pdf.bullet("Los labels usan for que coincide con el id del input o select.")
    pdf.bullet("El CSS se ve bien en escritorio y celular.")
    pdf.bullet("El JS no busca IDs inexistentes.")
    pdf.bullet("El boton convierte desde las tres unidades.")
    pdf.bullet("El programa valida campo vacio.")
    pdf.bullet("El resultado se muestra con claridad.")
    pdf.bullet("El codigo esta indentado y ordenado.")
    pdf.render(FILES["general"])


def build_html():
    pdf = Pdf()
    pdf.h1("Guia de clase: index.html")
    pdf.p(
        "HTML es el archivo que define que existe en la pagina. En este proyecto, index.html crea "
        "el formulario del conversor: titulo, input, selector de unidad, boton y zona de resultados."
    )

    pdf.h2("1. Que es .html")
    pdf.p(
        "La extension .html indica que el archivo contiene etiquetas HTML. Una etiqueta normalmente "
        "abre y cierra: <main> abre y </main> cierra. Algunas etiquetas, como meta, no necesitan cierre."
    )

    pdf.h2("2. Estructura base")
    pdf.code(
        """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ...
</body>
</html>"""
    )
    pdf.bullet("<!DOCTYPE html> le dice al navegador que use HTML moderno.")
    pdf.bullet("<html> envuelve toda la pagina.")
    pdf.bullet("lang=\"en\" indica idioma ingles. Para tu proyecto en espanol puede ser lang=\"es\".")
    pdf.bullet("<head> guarda configuracion invisible: codificacion, viewport, titulo y CSS.")
    pdf.bullet("<body> guarda lo visible para el usuario.")

    pdf.h2("3. Meta charset")
    pdf.code('<meta charset="UTF-8">')
    pdf.p(
        "UTF-8 permite representar letras, tildes, simbolos y caracteres especiales. Es importante "
        "para textos en espanol."
    )

    pdf.h2("4. Meta viewport")
    pdf.code('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    pdf.p(
        "Esta linea es clave para responsive. width=device-width hace que la pagina use el ancho real "
        "del celular. initial-scale=1.0 evita que cargue con zoom raro."
    )

    pdf.h2("5. Conectar CSS")
    pdf.code('<link rel="stylesheet" href="styles.css">')
    pdf.bullet("link conecta un archivo externo.")
    pdf.bullet("rel=\"stylesheet\" dice que ese archivo es una hoja de estilos.")
    pdf.bullet("href=\"styles.css\" indica la ruta del archivo CSS.")

    pdf.h2("6. main")
    pdf.code(
        """<main>
    <h1> Conversor de Temperatura </h1>
    ...
</main>"""
    )
    pdf.p(
        "main representa el contenido principal de la pagina. Es bueno usarlo porque mejora la semantica "
        "y ayuda a navegadores, lectores de pantalla y buscadores."
    )

    pdf.h2("7. h1 y h2")
    pdf.bullet("<h1> es el titulo principal. Debe haber normalmente uno por pagina.")
    pdf.bullet("<h2> es un subtitulo de seccion. En tu caso se usa para Resultados.")

    pdf.h2("8. section")
    pdf.code(
        """<section class="input-section">
    ...
</section>"""
    )
    pdf.p(
        "section agrupa contenido relacionado. class=\"input-section\" no es para JavaScript en este caso; "
        "sirve principalmente para que CSS pueda seleccionar y disenar esa seccion."
    )

    pdf.h2("9. label e input")
    pdf.code(
        """<label for="temperatura">Temperatura:</label>
<input type="number" id="temperatura" placeholder="Ingrese la temperatura">"""
    )
    pdf.bullet("label muestra el texto que explica que se debe escribir.")
    pdf.bullet("for=\"temperatura\" conecta el label con el input que tiene id=\"temperatura\".")
    pdf.bullet("input crea una caja donde el usuario escribe.")
    pdf.bullet("type=\"number\" indica que se espera un numero.")
    pdf.bullet("id=\"temperatura\" permite que JavaScript encuentre ese input.")
    pdf.bullet("placeholder muestra una pista cuando el campo esta vacio.")

    pdf.h2("10. p para mensajes")
    pdf.code('<p id="mensaje" class="mensaje"></p>')
    pdf.p(
        "Este parrafo empieza vacio. JavaScript lo llena cuando necesita decir si el campo esta vacio, "
        "si el numero es valido o si hay algun error."
    )

    pdf.h2("11. select y option")
    pdf.code(
        """<select id="unidad-medida">
    <option value="celsius">Celsius</option>
    <option value="fahrenheit">Fahrenheit</option>
    <option value="kelvin">Kelvin</option>
</select>"""
    )
    pdf.bullet("select crea una lista desplegable.")
    pdf.bullet("id=\"unidad-medida\" permite que JS lea la unidad elegida.")
    pdf.bullet("option crea cada opcion.")
    pdf.bullet("value es el dato real que recibe JavaScript.")
    pdf.bullet("El texto entre etiquetas es lo que ve el usuario.")

    pdf.h2("12. button")
    pdf.code('<button id="convertir">Convertir</button>')
    pdf.p(
        "button crea el boton. id=\"convertir\" permite que script.js agregue un evento click. "
        "Sin ese id, el boton existe visualmente, pero JavaScript no podria encontrarlo con el codigo actual."
    )

    pdf.h2("13. Resultado")
    pdf.code(
        """<section class="result-section">
    <h2>Resultados:</h2>
    <p id="resultado"></p>
</section>"""
    )
    pdf.p(
        "resultado es otro parrafo vacio. JavaScript usa innerHTML para escribir ahi las conversiones."
    )

    pdf.h2("14. Conectar JavaScript como modulo")
    pdf.code('<script type="module" src="script.js"></script>')
    pdf.bullet("script carga JavaScript.")
    pdf.bullet("src=\"script.js\" indica el archivo.")
    pdf.bullet("type=\"module\" permite usar import y export.")
    pdf.bullet("Se coloca al final del body para que el HTML exista antes de que JS lo busque.")

    pdf.h2("15. Version HTML recomendada")
    pdf.code(
        """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conversor de Temperatura</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main class="app">
        <section class="converter-card">
            <h1>Conversor de Temperatura</h1>

            <div class="field-group">
                <label for="temperatura">Temperatura</label>
                <input type="number" id="temperatura" placeholder="Ej: 25">
                <p id="mensaje" class="mensaje"></p>
            </div>

            <div class="field-group">
                <label for="unidad-medida">Unidad de medida</label>
                <select id="unidad-medida">
                    <option value="celsius">Celsius</option>
                    <option value="fahrenheit">Fahrenheit</option>
                    <option value="kelvin">Kelvin</option>
                </select>
            </div>

            <button id="convertir">Convertir</button>

            <section class="result-section">
                <h2>Resultados</h2>
                <p id="resultado"></p>
            </section>
        </section>
    </main>

    <script type="module" src="script.js"></script>
</body>
</html>"""
    )
    pdf.h2("16. Como estudiar este HTML")
    pdf.bullet("Subraya todos los id. Esos son puentes hacia JavaScript.")
    pdf.bullet("Subraya todas las class. Esas son puentes hacia CSS.")
    pdf.bullet("Lee de arriba hacia abajo y pregunta: que vera el usuario?")
    pdf.bullet("Despues pregunta: que elemento necesita usar JavaScript?")
    pdf.render(FILES["html"])


def build_css():
    pdf = Pdf()
    pdf.h1("Guia de clase: styles.css y responsive")
    pdf.p(
        "CSS controla como se ve la pagina. Tu CSS actual funciona, pero es muy basico. Esta guia explica "
        "lo que tienes, que falta mejorar y como crear una version mas bonita, clara y responsive para celular."
    )

    pdf.h2("1. Que es .css")
    pdf.p(
        "La extension .css significa Cascading Style Sheets. CSS no crea elementos; CSS toma elementos "
        "que ya existen en HTML y les da apariencia: color, tamano, posicion, espacios, bordes y animaciones."
    )

    pdf.h2("2. Anatomia de una regla CSS")
    pdf.code(
        """selector {
    propiedad: valor;
}"""
    )
    pdf.bullet("selector: indica que elemento quieres modificar.")
    pdf.bullet("propiedad: indica que aspecto quieres cambiar.")
    pdf.bullet("valor: indica como quieres cambiarlo.")
    pdf.bullet("Cada declaracion termina con punto y coma.")

    pdf.h2("3. Tipos de selectores")
    pdf.bullet("body selecciona todas las etiquetas body.")
    pdf.bullet(".input-section selecciona elementos con class=\"input-section\".")
    pdf.bullet("#temperatura selecciona el elemento con id=\"temperatura\".")
    pdf.bullet("input, select, button selecciona tres tipos de etiqueta a la vez.")
    pdf.bullet("button:hover aplica estilos cuando el mouse pasa por encima.")

    pdf.h2("4. Tu CSS actual")
    pdf.code(
        """head{
    background-color: #f0f0f0;
    padding: 20px;
    font-family: Arial, sans-serif;
    text-align: center;
}

body{
    background-color: #ffffff;
    padding: 20px;
    font-family: Arial, sans-serif;
    text-align: center;
}

input, select, button{
    padding: 10px;
    margin: 10px;
    font-size: 16px;
}"""
    )
    pdf.bullet("head no se disena normalmente porque head no se ve en pantalla.")
    pdf.bullet("body tiene fondo blanco, padding, fuente y texto centrado.")
    pdf.bullet("input, select y button tienen espacio interno, margen y tamano de texto.")
    pdf.bullet("Falta estructura visual: tarjeta, max-width, estados, contraste, responsive y jerarquia.")

    pdf.h2("5. Conceptos para mejorarlo")
    pdf.bullet("Reset: quitar margenes por defecto y usar box-sizing para medir mejor.")
    pdf.bullet("Layout: centrar el contenido y limitar ancho para que no se estire demasiado.")
    pdf.bullet("Card: crear una caja principal con fondo, borde, sombra y radio.")
    pdf.bullet("Responsive: usar media queries para cambiar estilos en pantallas pequenas.")
    pdf.bullet("Estados: hover, focus, validacion verde/roja, resultado destacado.")

    pdf.h2("6. CSS recomendado completo")
    pdf.code(
        """* {
    box-sizing: border-box;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    background: #edf2f7;
    color: #1f2937;
}

.app {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

.converter-card {
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    border: 1px solid #d9e2ec;
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

h1 {
    margin: 0 0 24px;
    font-size: 28px;
    line-height: 1.2;
    text-align: center;
}

.field-group {
    margin-bottom: 18px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 700;
}

input,
select {
    width: 100%;
    min-height: 44px;
    border: 1px solid #b8c4d6;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 16px;
    background: #ffffff;
}

input:focus,
select:focus {
    outline: 3px solid rgba(37, 99, 235, 0.22);
    border-color: #2563eb;
}

button {
    width: 100%;
    min-height: 46px;
    border: 0;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    background: #2563eb;
    cursor: pointer;
}

button:hover {
    background: #1d4ed8;
}

.mensaje {
    min-height: 20px;
    margin: 8px 0 0;
    font-size: 14px;
}

.result-section {
    margin-top: 22px;
    padding: 16px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.result-section h2 {
    margin: 0 0 8px;
    font-size: 18px;
}

#resultado {
    margin: 0;
    line-height: 1.6;
}

@media (max-width: 480px) {
    .app {
        align-items: flex-start;
        padding: 16px;
    }

    .converter-card {
        padding: 20px;
        border-radius: 10px;
    }

    h1 {
        font-size: 24px;
    }
}"""
    )

    pdf.h2("7. Explicacion propiedad por propiedad")
    pdf.bullet("box-sizing: border-box hace que padding y border se incluyan dentro del ancho total.")
    pdf.bullet("margin: 0 quita margenes por defecto del navegador.")
    pdf.bullet("min-height: 100vh hace que el body o app ocupen minimo toda la pantalla.")
    pdf.bullet("font-family define la tipografia.")
    pdf.bullet("background define el color de fondo.")
    pdf.bullet("color define el color del texto.")
    pdf.bullet("display: flex activa Flexbox.")
    pdf.bullet("align-items: center centra verticalmente cuando se usa flex.")
    pdf.bullet("justify-content: center centra horizontalmente cuando se usa flex.")
    pdf.bullet("padding agrega espacio interno.")
    pdf.bullet("width: 100% hace que el elemento ocupe el ancho disponible.")
    pdf.bullet("max-width evita que la tarjeta sea demasiado ancha en escritorio.")
    pdf.bullet("border crea linea alrededor.")
    pdf.bullet("border-radius redondea esquinas.")
    pdf.bullet("box-shadow crea sombra.")
    pdf.bullet("line-height mejora lectura entre lineas.")
    pdf.bullet("cursor: pointer muestra mano al pasar por el boton.")
    pdf.bullet("outline en focus ayuda accesibilidad: muestra donde esta el teclado.")

    pdf.h2("8. Como hacer responsive")
    pdf.p(
        "Responsive significa que la pagina se adapta a distintos tamanos de pantalla. Para celular, "
        "debes evitar anchos fijos grandes. Usa width: 100%, max-width y media queries."
    )
    pdf.code(
        """@media (max-width: 480px) {
    .converter-card {
        padding: 20px;
    }

    h1 {
        font-size: 24px;
    }
}"""
    )
    pdf.bullet("@media aplica reglas solo cuando se cumple una condicion.")
    pdf.bullet("max-width: 480px significa: desde 480px hacia abajo.")
    pdf.bullet("En celular bajamos padding y tamano de titulo para que todo respire.")

    pdf.h2("9. Como estudiar CSS")
    pdf.bullet("Primero identifica el selector.")
    pdf.bullet("Luego lee cada propiedad.")
    pdf.bullet("Cambia un valor y observa que pasa.")
    pdf.bullet("Prueba escritorio y celular.")
    pdf.bullet("No metas muchas decoraciones: prioriza lectura, orden y contraste.")
    pdf.render(FILES["css"])


def build_js():
    pdf = Pdf()
    pdf.h1("Guia de clase: JavaScript del conversor")
    pdf.p(
        "JavaScript es la parte que hace que el proyecto responda. En este proyecto hay dos archivos JS: "
        "funciones.js, que guarda la logica de conversion, y script.js, que conecta esa logica con el HTML."
    )

    pdf.h2("1. Que es .js")
    pdf.p(
        ".js significa JavaScript. Sirve para programar comportamiento: leer datos, validar, calcular, "
        "escuchar clicks, cambiar texto y modificar estilos en pantalla."
    )

    pdf.h2("2. Import y export")
    pdf.code(
        """// funciones.js
export class ConversorTemperatura {}

// script.js
import { ConversorTemperatura } from './funciones.js';"""
    )
    pdf.bullet("export permite sacar una clase, funcion o variable desde un archivo.")
    pdf.bullet("import permite traerla en otro archivo.")
    pdf.bullet("Para usar import/export en navegador, el script debe tener type=\"module\".")

    pdf.h2("3. Que es class")
    pdf.p(
        "class es una plantilla para crear objetos. En vez de tener muchas funciones sueltas, puedes "
        "agrupar datos y metodos relacionados. En tu caso, ConversorTemperatura agrupa los valores "
        "celsius, fahrenheit, kelvin y los metodos de conversion."
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
    pdf.bullet("class define la plantilla.")
    pdf.bullet("constructor se ejecuta al crear el objeto.")
    pdf.bullet("this significa este objeto.")
    pdf.bullet("this.celsius crea o usa la propiedad celsius dentro del objeto.")

    pdf.h2("4. Como se usa una clase")
    pdf.code("const conversor = new ConversorTemperatura();")
    pdf.bullet("new crea un objeto nuevo usando la clase.")
    pdf.bullet("conversor es la variable que guarda ese objeto.")
    pdf.bullet("conversor.celsius = 25 asigna un valor.")
    pdf.bullet("conversor.celsiusToKelvin() ejecuta un metodo.")

    pdf.h2("5. Que es una funcion o metodo")
    pdf.p(
        "Una funcion es un bloque de codigo reutilizable. Un metodo es una funcion que vive dentro de "
        "un objeto o clase. celsiusToFahrenheit es un metodo porque esta dentro de la clase."
    )
    pdf.code(
        """celsiusToFahrenheit() {
    this.fahrenheit = (this.celsius * 9 / 5) + 32;
    return this.fahrenheit;
}"""
    )
    pdf.bullet("El nombre del metodo es celsiusToFahrenheit.")
    pdf.bullet("Las llaves contienen lo que hace.")
    pdf.bullet("return devuelve el resultado.")

    pdf.h2("6. Funciones de conversion")
    pdf.bullet("celsiusToFahrenheit: convierte Celsius a Fahrenheit.")
    pdf.bullet("celsiusToKelvin: convierte Celsius a Kelvin.")
    pdf.bullet("fahrenheitToCelsius: convierte Fahrenheit a Celsius.")
    pdf.bullet("fahrenheitToKelvin: convierte Fahrenheit a Kelvin.")
    pdf.bullet("kelvinToCelsius: convierte Kelvin a Celsius.")
    pdf.bullet("kelvinToFahrenheit: convierte Kelvin a Fahrenheit.")

    pdf.h2("7. Clase validador")
    pdf.p(
        "validador es otra clase. Busca un input y un parrafo de mensaje por ID. Luego escucha cuando "
        "el usuario escribe y valida si el dato esta vacio o si es un numero. En tu version actual, "
        "script.js no la usa, porque valida directamente dentro del click."
    )
    pdf.code(
        """export class validador {
    constructor(inputId, mensajeId) {
        this.input = document.getElementById(inputId);
        this.mensaje = document.getElementById(mensajeId);
        this.iniciarEvento();
    }
}"""
    )
    pdf.bullet("inputId es el id del input que quieres validar.")
    pdf.bullet("mensajeId es el id del elemento donde se muestra el mensaje.")
    pdf.bullet("iniciarEvento agrega el evento input.")
    pdf.bullet("validar revisa el valor.")
    pdf.bullet("mostrarMensaje cambia texto, color y borde.")

    pdf.h2("8. script.js paso a paso")
    pdf.step(1, "Importar la clase", "script.js empieza trayendo ConversorTemperatura desde funciones.js.")
    pdf.code("import { ConversorTemperatura } from './funciones.js';")
    pdf.step(2, "Crear el objeto", "Se crea un conversor para poder guardar valores y usar metodos.")
    pdf.code("const conversor = new ConversorTemperatura();")
    pdf.step(3, "Buscar elementos HTML", "JavaScript busca los elementos que va a leer o modificar.")
    pdf.code(
        """const inputTemperatura = document.getElementById('temperatura');
const selectUnidad = document.getElementById('unidad-medida');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');
const botonConvertir = document.getElementById('convertir');"""
    )
    pdf.step(4, "Escuchar el click", "El programa espera que el usuario haga click en Convertir.")
    pdf.code("botonConvertir.addEventListener('click', () => { ... });")
    pdf.step(5, "Leer datos", "Toma lo escrito en el input y la unidad elegida en el select.")
    pdf.code(
        """const valor = inputTemperatura.value.trim();
const unidad = selectUnidad.value;"""
    )
    pdf.step(6, "Validar vacio", "Si no hay texto, muestra mensaje de error y se detiene.")
    pdf.code(
        """if (valor === '') {
    mensaje.textContent = 'El campo no puede estar vacio.';
    mensaje.style.color = 'red';
    resultado.textContent = '';
    return;
}"""
    )
    pdf.step(7, "Convertir a numero", "Number transforma el texto del input en numero.")
    pdf.code("const temperatura = Number(valor);")
    pdf.step(8, "Validar numero", "Number.isFinite revisa que sea un numero usable.")
    pdf.code(
        """if (!Number.isFinite(temperatura)) {
    mensaje.textContent = 'Por favor, ingresa un numero valido.';
    mensaje.style.color = 'red';
    resultado.textContent = '';
    return;
}"""
    )
    pdf.step(9, "Elegir conversion", "Con if se revisa que unidad eligio el usuario.")
    pdf.code(
        """if (unidad === 'celsius') {
    conversor.celsius = temperatura;
    resultado.innerHTML = `
        Fahrenheit: ${conversor.celsiusToFahrenheit().toFixed(2)} grados F<br>
        Kelvin: ${conversor.celsiusToKelvin().toFixed(2)} K
    `;
}"""
    )
    pdf.step(10, "Mostrar resultado", "innerHTML escribe texto en el parrafo resultado. toFixed(2) limita a dos decimales.")

    pdf.h2("9. Conceptos importantes")
    pdf.bullet("const crea una variable que no se reasigna.")
    pdf.bullet("document representa la pagina HTML cargada.")
    pdf.bullet("getElementById busca un elemento por id.")
    pdf.bullet("addEventListener escucha eventos como click o input.")
    pdf.bullet("value obtiene el valor de input o select.")
    pdf.bullet("textContent cambia texto plano.")
    pdf.bullet("innerHTML permite insertar HTML como <br>.")
    pdf.bullet("return detiene la funcion actual.")
    pdf.bullet("if ejecuta codigo solo si una condicion es verdadera.")
    pdf.bullet("=== compara valor y tipo.")
    pdf.bullet("! niega una condicion.")
    pdf.bullet("Number.isFinite revisa numeros validos.")

    pdf.h2("10. Como estudiar JavaScript")
    pdf.bullet("Lee primero los nombres de variables.")
    pdf.bullet("Identifica que datos entran: temperatura y unidad.")
    pdf.bullet("Identifica que proceso ocurre: validar y convertir.")
    pdf.bullet("Identifica que datos salen: resultados en pantalla.")
    pdf.bullet("Explica cada if en voz alta.")
    pdf.bullet("Prueba un ejemplo: 0 Celsius debe dar 32 Fahrenheit y 273.15 Kelvin.")
    pdf.render(FILES["js"])


if __name__ == "__main__":
    build_general()
    build_html()
    build_css()
    build_js()
