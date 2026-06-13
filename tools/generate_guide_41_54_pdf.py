from pathlib import Path
from textwrap import wrap

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "docs" / "pdf"
BASE_PDF = PDF_DIR / "guia_reciclaje_componentes_web_41_50_orden_correcto.pdf"
APPENDIX_PDF = PDF_DIR / ".tmp_guia_41_54_appendix.pdf"
OUTPUT = PDF_DIR / "guia_reciclaje_componentes_web_41_54_actualizada_2026.pdf"


def plain(text: str) -> str:
    replacements = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
        "°": " grados ", "•": "-", "—": "-", "–": "-",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def esc(text: str) -> str:
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

    def bullet(self, text):
        lines = wrap(plain(text), width=86)
        for index, line in enumerate(lines):
            self.line(("- " if index == 0 else "  ") + line, leading=14)
        self.y -= 2

    def code(self, text):
        for raw_line in text.splitlines():
            chunks = wrap(plain(raw_line) or " ", width=82, replace_whitespace=False, drop_whitespace=False) or [" "]
            for chunk in chunks:
                self.line(f"    {chunk}", size=9, font="F1", leading=12)
        self.y -= 4

    def render(self, path: Path):
        if self.current:
            self.pages.append(self.current)

        objects = []

        def add(body):
            objects.append(body)
            return len(objects)

        f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

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
                    f"/Resources << /Font << /F1 {f1} 0 R /F2 {f2} 0 R >> >> "
                    f"/Contents {cid} 0 R >>"
                )
            )

        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        add(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

        data = bytearray(b"%PDF-1.4\n")
        offsets = [0]
        for index, obj in enumerate(objects, start=1):
            offsets.append(len(data))
            data.extend(f"{index} 0 obj\n".encode("latin-1"))
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


def build_appendix() -> None:
    pdf = Pdf()

    sections = [
        (
            "51. Version normal sin modulos",
            [
                "Permite usar JavaScript en un solo archivo sin import y export. Sirve en ejercicios academicos, demos sencillas y entregas rapidas donde no necesitas modularizar.",
                "Para reutilizarlo: crea script-normal.js, pega helpers y clases en el orden correcto, cargalo al final del body y evita mezclarlo con imports.",
                "Checklist rapido:",
                "- No dejes export o import en el archivo.",
                "- Carga primero helpers y luego inicializacion.",
                "- Verifica que los IDs del HTML existan antes de ejecutar el script.",
            ],
        ),
        (
            "52. Responsive design reutilizable",
            [
                "Hace que la pagina se adapte a movil, tablet y escritorio. Ajusta grid, padding, radios y tipografia segun el ancho disponible.",
                "Para reutilizarlo: usa contenedores con width min(...), convierte layouts de varias columnas a una sola en tablet y movil, y prueba en menos de 520px.",
                "Checklist rapido:",
                "- No debe aparecer scroll horizontal.",
                "- Las cards deben pasar a una columna en pantallas pequenas.",
                "- Navbar, tablas y formularios deben seguir legibles.",
            ],
        ),
        (
            "53. Tarjeta de presentacion Bootstrap",
            [
                "Actividad guiada basada en LAB1. La meta es construir una card personal con avatar, nombre, rol, badges y enlaces, manteniendo la logica de Bootstrap pero con el estilo de este proyecto.",
                "Paso a paso: crea el contenedor principal, arma la card frontal, agrega la vista de tecnologias, aplica estilos tipo card y conecta un boton para alternar el estado visual.",
                "HTML funcional base:",
                "CODE::PROFILE_HTML",
                "CSS funcional base:",
                "CODE::PROFILE_CSS",
                "JS funcional base:",
                "CODE::PROFILE_JS",
                "Puntos clave:",
                "- Reutiliza ideas como card, badge, btn y grid.",
                "- Separa estructura HTML, look visual y cambio de estado.",
                "- Verifica legibilidad en tema claro y oscuro.",
            ],
        ),
        (
            "54. Carrito de compras DOM",
            [
                "Actividad guiada para practicar DOM: agregar productos, actualizar badge, calcular total, eliminar items y vaciar el carrito sin recargar la pagina.",
                "Paso a paso: selecciona los botones de producto, lee data-name y data-price, crea items dinamicos con createElement, recalcula total y conecta vaciado general.",
                "HTML funcional base:",
                "CODE::CART_HTML",
                "CSS funcional base:",
                "CODE::CART_CSS",
                "JS funcional base:",
                "CODE::CART_JS",
                "Puntos clave:",
                "- Convierte precios a numero antes de sumarlos.",
                "- Actualiza badge y total despues de cada accion.",
                "- Prueba agregar, eliminar y vaciar para validar consistencia.",
            ],
        ),
    ]

    code_map = {
        "CODE::PROFILE_HTML": """<article class="profile-lab">
  <div class="profile-lab__flip" id="profileLabFlip">
    <section class="profile-lab__face profile-lab__face--front">
      <div class="profile-lab__avatar">CM</div>
      <h4>Carlos Madero</h4>
      <button id="showProfileTech" type="button">Ver tecnologias</button>
    </section>
    <section class="profile-lab__face profile-lab__face--back">
      <h4>Tecnologias</h4>
      <button id="hideProfileTech" type="button">Volver</button>
    </section>
  </div>
</article>""",
        "CODE::PROFILE_CSS": """.profile-lab { max-width: 340px; perspective: 1200px; }
.profile-lab__flip {
  position: relative; min-height: 320px;
  transform-style: preserve-3d; transition: transform 0.8s ease;
}
.profile-lab__flip.is-flipped { transform: rotateY(180deg); }
.profile-lab__face {
  position: absolute; inset: 0; padding: 24px;
  border: 1px solid #cbd5e1; border-radius: 20px;
  background: #ffffff; backface-visibility: hidden;
}
.profile-lab__face--back { transform: rotateY(180deg); }""",
        "CODE::PROFILE_JS": """document.addEventListener('DOMContentLoaded', () => {
  const flip = document.getElementById('profileLabFlip');
  document.getElementById('showProfileTech')?.addEventListener('click', () => {
    flip?.classList.add('is-flipped');
  });
  document.getElementById('hideProfileTech')?.addEventListener('click', () => {
    flip?.classList.remove('is-flipped');
  });
});""",
        "CODE::CART_HTML": """<div class="shop-lab">
  <button class="shop-add-button" data-name="Pack IPA" data-price="18000">Agregar</button>
  <span id="shopBadge">0</span>
  <p id="shopEmptyMessage">Tu carrito esta vacio.</p>
  <ul id="shopCartList"></ul>
  <strong id="shopCartTotal">$0</strong>
  <button id="clearShopCart" type="button">Vaciar</button>
</div>""",
        "CODE::CART_CSS": """.shop-lab { display: grid; gap: 18px; }
.shop-cart__item {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #e2e8f0;
}""",
        "CODE::CART_JS": """class ShoppingCartActivity {
  constructor() {
    this.buttons = [...document.querySelectorAll('.shop-add-button')];
    this.list = document.getElementById('shopCartList');
    this.badge = document.getElementById('shopBadge');
    this.total = document.getElementById('shopCartTotal');
    this.emptyMessage = document.getElementById('shopEmptyMessage');
    this.clearButton = document.getElementById('clearShopCart');
    this.itemsCount = 0;
    this.totalAmount = 0;
    this.init();
  }
  init() {
    this.buttons.forEach((button) => button.addEventListener('click', () => {
      this.addItem(button.dataset.name, Number(button.dataset.price));
    }));
    this.clearButton?.addEventListener('click', () => this.clear());
    this.renderSummary();
  }
}""",
    }

    pdf.h1("Actualizacion del bloque 41 a 54")
    pdf.p(
        "Este anexo conserva el PDF original 41 a 50 y agrega solo las cuatro funcionalidades nuevas o ajustadas para que la numeracion del proyecto quede alineada hasta la 54."
    )

    for index, (title, paragraphs) in enumerate(sections):
        if index == 2:
            pdf.new_page()
        pdf.h2(title)
        for paragraph in paragraphs:
            if paragraph == "Checklist rapido:" or paragraph == "Puntos clave:":
                pdf.line(paragraph, size=11, font="F2", leading=16)
            elif paragraph in code_map:
                pdf.code(code_map[paragraph])
            elif paragraph.startswith("- "):
                pdf.bullet(paragraph[2:])
            else:
                pdf.p(paragraph)

    pdf.render(APPENDIX_PDF)


def merge_pdf() -> None:
    writer = PdfWriter()
    for page in PdfReader(str(BASE_PDF)).pages:
        writer.add_page(page)
    for page in PdfReader(str(APPENDIX_PDF)).pages:
        writer.add_page(page)
    with OUTPUT.open("wb") as file:
        writer.write(file)


def main() -> None:
    build_appendix()
    merge_pdf()


if __name__ == "__main__":
    main()
