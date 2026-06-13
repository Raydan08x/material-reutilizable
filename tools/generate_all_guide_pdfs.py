from __future__ import annotations

import json
import subprocess
from pathlib import Path
from textwrap import wrap

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "docs" / "pdf"
ASSETS_DIR = ROOT / "assets" / "js"

RANGES = [
    {
        "label": "1 a 10",
        "start": 1,
        "end": 10,
        "base": PDF_DIR / "guia_reciclaje_componentes_web_01_10_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_01_10_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_01_10_appendix.pdf",
    },
    {
        "label": "11 a 25",
        "start": 11,
        "end": 25,
        "base": PDF_DIR / "guia_reciclaje_componentes_web_10_25_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_10_25_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_10_25_appendix.pdf",
    },
    {
        "label": "26 a 40",
        "start": 26,
        "end": 40,
        "base": PDF_DIR / "guia_reciclaje_componentes_web_26_40_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_26_40_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_26_40_appendix.pdf",
    },
    {
        "label": "41 a 55",
        "start": 41,
        "end": 55,
        "base": PDF_DIR / "guia_reciclaje_componentes_web_41_50_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_41_54_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_41_55_appendix.pdf",
    },
]

UNIFIED_OUTPUT = PDF_DIR / "recurso_unificado_40_componentes_web.pdf"


def plain(text: str) -> str:
    replacements = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
        "°": " grados ", "•": "-", "—": "-", "–": "-",
        "★": "*", "✅": "[ok]", "⬜": "[ ]", "☾": "(luna)", "☀": "(sol)",
        "→": "->", "©": "(c)", "×": "x",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Pdf:
    def __init__(self) -> None:
        self.pages: list[list[tuple[int, int, int, str, str]]] = []
        self.current: list[tuple[int, int, int, str, str]] = []
        self.x = 46
        self.y = 744
        self.width = 92

    def new_page(self) -> None:
        if self.current:
            self.pages.append(self.current)
        self.current = []
        self.y = 744

    def ensure(self, height: int) -> None:
        if self.y - height < 50:
            self.new_page()

    def line(self, text: str = "", size: int = 10, font: str = "F1", leading: int = 14) -> None:
        self.ensure(leading)
        self.current.append((self.x, self.y, size, font, plain(text)))
        self.y -= leading

    def p(self, text: str, size: int = 10, leading: int = 14, width: int | None = None) -> None:
        for chunk in wrap(plain(text), width=width or self.width):
            self.line(chunk, size=size, leading=leading)
        self.y -= 4

    def h1(self, text: str) -> None:
        self.y -= 6
        self.line(text, size=18, font="F2", leading=24)

    def h2(self, text: str) -> None:
        self.y -= 4
        self.line(text, size=14, font="F2", leading=20)

    def h3(self, text: str) -> None:
        self.line(text, size=11, font="F2", leading=16)

    def bullet(self, text: str) -> None:
        lines = wrap(plain(text), width=86)
        for index, chunk in enumerate(lines):
            self.line(("- " if index == 0 else "  ") + chunk, leading=14)
        self.y -= 2

    def code(self, text: str) -> None:
        for raw_line in text.splitlines():
            wrapped = wrap(plain(raw_line) or " ", width=84, replace_whitespace=False, drop_whitespace=False) or [" "]
            for chunk in wrapped:
                self.line(f"    {chunk}", size=9, font="F1", leading=12)
        self.y -= 4

    def render(self, path: Path) -> None:
        if self.current:
            self.pages.append(self.current)

        objects: list[str] = []

        def add(body: str) -> int:
            objects.append(body)
            return len(objects)

        f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

        content_ids: list[int] = []
        page_ids: list[int] = []

        for page in self.pages:
            commands = ["BT"]
            for x, y, size, font, text in page:
                commands.append(f"/{font} {size} Tf")
                commands.append(f"1 0 0 1 {x} {y} Tm")
                commands.append(f"({esc(text)}) Tj")
            commands.append("ET")
            stream = "\n".join(commands).encode("latin-1", errors="replace")
            content_ids.append(
                add(
                    f"<< /Length {len(stream)} >>\nstream\n"
                    + stream.decode("latin-1")
                    + "\nendstream"
                )
            )

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


def get_functional_guide_data() -> list[dict]:
    node_code = f"""
import {{ readFileSync }} from 'node:fs';
import {{ buildFunctionalGuideData }} from 'file:///{(ASSETS_DIR / "funciones.js").as_posix()}';

const raw = readFileSync('{(ASSETS_DIR / "guide-data.js").as_posix()}', 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf(']');
const data = JSON.parse(raw.slice(start, end + 1));
process.stdout.write(JSON.stringify(buildFunctionalGuideData(data)));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", node_code],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def build_appendix(features: list[dict], label: str, output: Path) -> None:
    pdf = Pdf()
    pdf.h1(f"Actualizacion funcional del bloque {label}")
    pdf.p(
        "Este anexo actualiza los codigos de copiar y pegar para que queden alineados con la pagina actual y funcionen como referencia implementable."
    )
    pdf.bullet("Usa estos bloques como fuente vigente para HTML, CSS y JavaScript.")
    pdf.bullet("El contenido anterior del PDF base se conserva, pero este anexo manda para implementacion.")

    for feature in features:
        pdf.new_page()
        pdf.h2(f'{feature["id"]}. {feature["name"]}')
        pdf.p(feature["description"])

        pdf.h3("HTML copiar y pegar")
        pdf.code(feature["html"])

        pdf.h3("CSS copiar y pegar")
        pdf.code(feature["css"])

        pdf.h3("JS modular copiar y pegar")
        pdf.code(feature["jsModular"])

        pdf.h3("JS normal copiar y pegar")
        pdf.code(feature["jsNormal"])

    pdf.render(output)


def merge_pdf(base: Path, appendix: Path, output: Path) -> None:
    writer = PdfWriter()
    for page in PdfReader(str(base)).pages:
        writer.add_page(page)
    for page in PdfReader(str(appendix)).pages:
        writer.add_page(page)
    with output.open("wb") as file:
        writer.write(file)


def build_unified_40() -> None:
    writer = PdfWriter()
    for path in [
        PDF_DIR / "guia_reciclaje_componentes_web_01_10_actualizada_2026.pdf",
        PDF_DIR / "guia_reciclaje_componentes_web_10_25_actualizada_2026.pdf",
        PDF_DIR / "guia_reciclaje_componentes_web_26_40_actualizada_2026.pdf",
    ]:
        for page in PdfReader(str(path)).pages:
            writer.add_page(page)
    with UNIFIED_OUTPUT.open("wb") as file:
        writer.write(file)


def cleanup_temp_files() -> None:
    for item in RANGES:
        item["tmp"].unlink(missing_ok=True)

    # Limpia anexos heredados de generadores anteriores.
    (PDF_DIR / ".tmp_guia_41_54_appendix.pdf").unlink(missing_ok=True)


def main() -> None:
    data = get_functional_guide_data()

    for item in RANGES:
        features = [feature for feature in data if item["start"] <= feature["id"] <= item["end"]]
        build_appendix(features, item["label"], item["tmp"])
        merge_pdf(item["base"], item["tmp"], item["output"])

    build_unified_40()
    cleanup_temp_files()


if __name__ == "__main__":
    main()
