from __future__ import annotations

import json
import re
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
        "appendix_ids": [],
        "base": PDF_DIR / "guia_reciclaje_componentes_web_01_10_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_01_10_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_01_10_appendix.pdf",
    },
    {
        "label": "11 a 25",
        "start": 11,
        "end": 25,
        "appendix_ids": [],
        "base": PDF_DIR / "guia_reciclaje_componentes_web_10_25_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_10_25_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_10_25_appendix.pdf",
    },
    {
        "label": "26 a 40",
        "start": 26,
        "end": 40,
        "appendix_ids": [],
        "base": PDF_DIR / "guia_reciclaje_componentes_web_26_40_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_26_40_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_26_40_appendix.pdf",
    },
    {
        "label": "41 a 57",
        "start": 41,
        "end": 57,
        "appendix_ids": [43, 48, 53, 54, 55, 56, 57],
        "base": PDF_DIR / "guia_reciclaje_componentes_web_41_50_orden_correcto.pdf",
        "output": PDF_DIR / "guia_reciclaje_componentes_web_41_57_actualizada_2026.pdf",
        "tmp": PDF_DIR / ".tmp_guia_41_57_appendix.pdf",
    },
]

UNIFIED_OUTPUT = PDF_DIR / "guia_reciclaje_completa_2026.pdf"


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
        self.y = 720
        self.width = 92

    def new_page(self) -> None:
        if self.current:
            self.pages.append(self.current)
        self.current = []
        self.y = 720

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
                self.line(f"    {chunk}", size=9, font="F3", leading=12)
        self.y -= 4

    def render(self, path: Path, start_page_num: int = 1, show_header_footer: bool = True) -> None:
        if self.current:
            self.pages.append(self.current)

        objects: list[str] = []

        def add(body: str) -> int:
            objects.append(body)
            return len(objects)

        f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
        f3 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

        content_ids: list[int] = []
        page_ids: list[int] = []

        for idx, page in enumerate(self.pages):
            abs_page = start_page_num + idx
            commands = []
            
            if show_header_footer:
                # Draw header line: Gray stroke
                commands.append("q")
                commands.append("0.7 0.7 0.7 RG")
                commands.append("0.5 w")
                commands.append("46 744 m 566 744 l S")
                commands.append("Q")
                
                # Print page header text
                commands.append("BT")
                commands.append("/F2 8 Tf")
                commands.append("0.4 0.4 0.4 rg")
                commands.append("1 0 0 1 46 752 Tm")
                commands.append(f"({esc('Guia de reciclaje de componentes web - funcionalidades 51 a 57')}) Tj")
                
                page_text = f"Pagina {abs_page}"
                commands.append(f"1 0 0 1 520 752 Tm")
                commands.append(f"({esc(page_text)}) Tj")
                commands.append("ET")
            
            # Page Content
            commands.append("BT")
            for x, y, size, font, text in page:
                commands.append(f"/{font} {size} Tf")
                commands.append(f"1 0 0 1 {x} {y} Tm")
                commands.append("0 0 0 rg")
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
                    f"/Resources << /Font << /F1 {f1} 0 R /F2 {f2} 0 R /F3 {f3} 0 R >> >> "
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


def load_guide_details() -> dict[int, str]:
    details_file = ROOT / "assets" / "js" / "guide-details-data.js"
    if not details_file.exists():
        return {}
    
    text = details_file.read_text(encoding="utf-8").strip()
    text = re.sub(r'^window\.GUIDE_DETAILS\s*=\s*', '', text)
    text = text.rstrip(';')
    try:
        data = json.loads(text)
        return {int(k): v for k, v in data.items()}
    except Exception as e:
        print("Error al cargar detalles:", e)
        return {}


def render_feature_detail_text(pdf: Pdf, text: str) -> None:
    lines = text.split('\n')
    in_code = False
    code_lines = []

    CLEAN_HEADERS = {
        "que hace", "cuando usarlo", "paso a paso para reciclarlo en otro proyecto", "donde se usa mejor",
        "errores comunes", "puntos clave", "objetivo de la actividad", "estructura general del ejercicio",
        "html minimo que debes copiar", "css del componente", "javascript modular con export/import",
        "javascript normal sin modulos", "variables clases ids y atributos que debes cambiar",
        "implementacion paso a paso", "errores comunes y como solucionarlos",
        "checklist de prueba antes de reutilizar", "mejoras opcionales",
        "paso a paso detallado para construirlo desde cero", "donde se usa en industria",
        "como se personaliza", "mapa rapido de reciclaje", "html funcional base", "css funcional base",
        "js funcional base", "aspecto", "explicacion", "implementacion conceptual",
        "javascript", "javascript modular con export/import", "javascript normal sin modulos"
    }

    def clean_header(t: str) -> str:
        t = t.lower()
        t = t.replace("¿", "").replace("?", "").replace(":", "").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")
        return t.strip()

    for idx, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            if in_code:
                code_lines.append(line)
            else:
                pdf.y -= 4
            continue

        is_code_start = stripped in {
            "index.html", "styles.css", "funciones.js", "script.js", "script-normal.js",
            "funciones.js + script.js"
        }
        is_header = clean_header(stripped) in CLEAN_HEADERS

        if idx == 0:
            # Skip title line
            continue

        if is_code_start:
            if in_code:
                if code_lines:
                    pdf.code("\n".join(code_lines))
                in_code = False
                code_lines = []
            in_code = True
            pdf.y -= 4
            pdf.h3(stripped)
            continue

        if is_header:
            if in_code:
                if code_lines:
                    pdf.code("\n".join(code_lines))
                in_code = False
                code_lines = []
            
            # Skip Aspecto and Explicacion headings to match table format
            if clean_header(stripped) in {"aspecto", "explicacion"}:
                continue
                
            pdf.y -= 6
            pdf.h3(stripped)
            continue

        if in_code:
            code_lines.append(line)
            continue

        # Convert multi-column table rows separated by double spaces into clean bullets
        parts = [p.strip() for p in re.split(r'\s{2,}', stripped) if p.strip()]
        if len(parts) >= 2:
            if len(parts) == 3:
                pdf.bullet(f"**{parts[0]}** ({parts[1]}): {parts[2]}")
            else:
                pdf.bullet(f"**{parts[0]}**: {parts[1]}")
            continue

        if re.match(r'^\d+\.', stripped):
            lines_wrap = wrap(plain(stripped), width=86)
            for index, chunk in enumerate(lines_wrap):
                pdf.line(("  " if index > 0 else "") + chunk, leading=14)
            pdf.y -= 2
        elif stripped.startswith('•') or stripped.startswith('-'):
            text_part = stripped.lstrip('•- ')
            pdf.bullet(text_part)
        else:
            pdf.p(stripped)

    if in_code and code_lines:
        pdf.code("\n".join(code_lines))


def build_appendix(features: list[dict], label: str, output: Path, start_page_num: int) -> dict[int, int]:
    pdf = Pdf()
    pdf.h1(f"Actualizacion funcional del bloque {label}")
    pdf.p(
        "Este anexo actualiza los codigos de copiar y pegar para que queden alineados con la pagina actual y funcionen como referencia implementable."
    )
    pdf.bullet("Usa estos bloques como fuente de consulta y copiar/pegar para HTML, CSS y JavaScript.")
    pdf.bullet("El contenido anterior del PDF base se conserva, pero este anexo manda para implementacion.")

    details = load_guide_details()

    feature_pages = {}
    pdf_number_mapping = {
        43: 51,
        48: 52,
        53: 53,
        54: 54,
        55: 55,
        56: 56,
        57: 57
    }

    for feature in features:
        pdf.new_page()
        fid = feature["id"]
        feature_pages[fid] = len(pdf.pages) + 1
        
        pdf_num = pdf_number_mapping[fid]
        pdf.h2(f'{pdf_num}. {feature["name"]}')
        
        if fid in details:
            detail_text = details[fid]
            has_code_blocks = "index.html" in detail_text or "styles.css" in detail_text
            
            render_feature_detail_text(pdf, detail_text)
            
            if not has_code_blocks:
                # Append base code blocks from catalog
                pdf.y -= 8
                pdf.h3("HTML copiar y pegar")
                pdf.code(feature["html"])

                pdf.y -= 8
                pdf.h3("CSS copiar y pegar")
                pdf.code(feature["css"])

                pdf.y -= 8
                pdf.h3("JS modular copiar y pegar")
                pdf.code(feature["jsModular"])

                pdf.y -= 8
                pdf.h3("JS normal copiar y pegar")
                pdf.code(feature["jsNormal"])
        else:
            pdf.p(feature["description"])

            pdf.h3("HTML copiar y pegar")
            pdf.code(feature["html"])

            pdf.h3("CSS copiar y pegar")
            pdf.code(feature["css"])

            pdf.h3("JS modular copiar y pegar")
            pdf.code(feature["jsModular"])

            pdf.h3("JS normal copiar y pegar")
            pdf.code(feature["jsNormal"])

    pdf.render(output, start_page_num=start_page_num, show_header_footer=True)
    return feature_pages


def merge_pdf(base: Path, appendix: Path, output: Path) -> None:
    writer = PdfWriter()
    for page in PdfReader(str(base)).pages:
        writer.add_page(page)
    for page in PdfReader(str(appendix)).pages:
        writer.add_page(page)
    with output.open("wb") as file:
        writer.write(file)


def build_cover_toc_pdf(
    output_path: Path,
    data: list[dict],
    base_pages_list: list[int],
    feature_appendix_pages: dict[int, int],
    block_pages_list: list[int],
    toc_page_count: int
) -> None:
    # 1. Calculate block starting pages
    block_start_pages = []
    current_page = toc_page_count + 1
    for i in range(len(RANGES)):
        block_start_pages.append(current_page)
        current_page += block_pages_list[i]

    pdf = Pdf()

    # --- Cover Page ---
    pdf.y = 520
    pdf.line("GUIA DE RECICLAJE COMPLETA", size=24, font="F2", leading=32)
    pdf.y -= 10
    pdf.line("Kit Web Reutilizable - 57 Funcionalidades", size=14, font="F1", leading=20)
    pdf.y -= 24
    pdf.p(
        "Banco completo de componentes, layouts e interfaces interactivas para "
        "copiar, pegar e implementar directamente en tus proyectos profesionales.",
        size=10,
        leading=14,
        width=80
    )
    pdf.y -= 140
    pdf.line("Edicion Especial 2026", size=11, font="F2", leading=16)
    pdf.line("Autor: Carlos Madero", size=10, font="F1", leading=14)
    pdf.line("Todos los codigos vigentes y unificados en un solo documento.", size=9, font="F1", leading=14)

    # --- Table of Contents Page(s) ---
    pdf.new_page()
    pdf.h1("TABLA DE CONTENIDO UNIFICADA")
    pdf.p(
        "Este indice detalla la ubicacion de cada bloque teorico base (PDF original) y de "
        "cada anexo de codigo fuente listo para ser reciclado.",
        size=9,
        leading=13
    )
    pdf.y -= 8

    range_titles = [
        "Bloque 1: Navegacion y Animaciones (IDs 1 a 10)",
        "Bloque 2: Autenticacion, Formularios y UI (IDs 11 a 25)",
        "Bloque 3: Datos Dinamicos y Estado Local (IDs 26 a 40)",
        "Bloque 4: Utilidades, Actividades y Scrollbar (IDs 41 a 57)",
    ]

    BASE_OFFSETS = {
        # Block 1
        1: 3, 2: 7, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 31, 9: 35, 10: 39,
        # Block 2
        11: 4, 12: 11, 13: 14, 14: 17, 15: 20, 16: 24, 17: 27, 18: 30, 19: 33, 20: 36, 21: 39, 22: 43, 23: 46, 24: 51, 25: 55,
        # Block 3
        26: 4, 27: 9, 28: 12, 29: 17, 30: 21, 31: 24, 32: 27, 33: 30, 34: 33, 35: 36, 36: 39, 37: 43, 38: 46, 39: 49, 40: 53,
    }

    PDF_LABELS = {
        # Block 4 base
        41: 41,
        42: 42,
        44: 43,
        45: 44,
        46: 45,
        47: 46,
        49: 47,
        50: 48,
        51: 49,
        52: 50,
        # Block 4 appendix
        43: 51,
        48: 52,
        53: 53,
        54: 54,
        55: 55,
        56: 56,
        57: 57
    }

    for i, item in enumerate(RANGES):
        block_start = block_start_pages[i]
        base_p = base_pages_list[i]
        appendix_start = block_start + base_p

        pdf.ensure(34)
        pdf.y -= 6
        pdf.line(range_titles[i], size=10, font="F2", leading=14)
        pdf.line(f"  - Guia conceptual y teorica (PDF Base) ........................................ Pagina {block_start}", size=8, font="F1", leading=11)
        if item["appendix_ids"]:
            pdf.line(f"  - Anexo de codigos listos para copiar/pegar .................................. Pagina {appendix_start}", size=8, font="F1", leading=11)

        block_features = [f for f in data if item["start"] <= f["id"] <= item["end"]]
        
        if i == 3:  # Block 4
            # Sort block_features by their physical print order
            physical_order = [41, 42, 44, 45, 46, 47, 49, 50, 51, 52, 43, 48, 53, 54, 55, 56, 57]
            block_features.sort(key=lambda f: physical_order.index(f["id"]))

        for f in block_features:
            fid = f["id"]
            if i == 3:  # Bloque 4
                BASE_41_50_OFFSETS = {
                    41: 5,   # Todo list
                    42: 10,  # Drag and drop
                    44: 14,  # Conversor C/F/K
                    45: 19,  # Cambio fondo
                    46: 22,  # Print page
                    47: 25,  # Reset demo
                    49: 28,  # Helpers DOM y storage
                    50: 31,  # Version modular
                    51: 34,  # Version normal
                    52: 37,  # Responsive design
                }
                pdf_num = PDF_LABELS[fid]
                if fid in BASE_41_50_OFFSETS:
                    fpage = block_start + BASE_41_50_OFFSETS[fid] - 1
                    line_text = f"    * {pdf_num}. {f['name']} (Teoria y Codigo)"
                else:
                    fpage = block_start + base_p + feature_appendix_pages[fid] - 1
                    line_text = f"    * {pdf_num}. {f['name']} (Codigo y Guia)"
            else:
                fpage = block_start + BASE_OFFSETS[fid] - 1
                line_text = f"    * {fid}. {f['name']} (Teoria y Codigo)"

            dots = "." * max(2, 74 - len(line_text))
            pdf.line(f"{line_text} {dots} Pagina {fpage}", size=8, font="F1", leading=10)

    pdf.render(output_path, show_header_footer=False)


def build_unified_complete(toc_path: Path) -> None:
    writer = PdfWriter()
    for page in PdfReader(str(toc_path)).pages:
        writer.add_page(page)
    for item in RANGES:
        for page in PdfReader(str(item["output"])).pages:
            writer.add_page(page)
    with UNIFIED_OUTPUT.open("wb") as file:
        writer.write(file)


def cleanup_temp_files(toc_path: Path) -> None:
    for item in RANGES:
        item["tmp"].unlink(missing_ok=True)
    toc_path.unlink(missing_ok=True)

    # Clean legacy temporaries
    (PDF_DIR / ".tmp_guia_41_54_appendix.pdf").unlink(missing_ok=True)
    (PDF_DIR / ".tmp_guia_41_55_appendix.pdf").unlink(missing_ok=True)
    (PDF_DIR / "recurso_unificado_40_componentes_web.pdf").unlink(missing_ok=True)


def main() -> None:
    print("Obteniendo datos del catálogo de guías...")
    data = get_functional_guide_data()

    base_pages_list = []
    block_pages_list = []
    feature_appendix_pages = {}

    print("Generando anexos y mezclando con PDFs base (Paso 1: estimar tamaño TOC)...")
    T = 3
    for item in RANGES:
        if not item["appendix_ids"]:
            item["output"].write_bytes(item["base"].read_bytes())
            base_pages = len(PdfReader(str(item["base"])).pages)
            base_pages_list.append(base_pages)
            block_pages_list.append(base_pages)
        else:
            block_4_app_start = T + sum(block_pages_list[:3]) + len(PdfReader(str(item["base"])).pages) + 1
            features = [feature for feature in data if feature["id"] in item["appendix_ids"]]
            local_pages = build_appendix(features, item["label"], item["tmp"], block_4_app_start)
            feature_appendix_pages.update(local_pages)

            base_pages = len(PdfReader(str(item["base"])).pages)
            base_pages_list.append(base_pages)

            merge_pdf(item["base"], item["tmp"], item["output"])
            
            block_pages = len(PdfReader(str(item["output"])).pages)
            block_pages_list.append(block_pages)

    print("Generando portada e índice (Tabla de Contenidos)...")
    toc_path = PDF_DIR / ".tmp_cover_toc.pdf"
    
    for iteration in range(3):
        build_cover_toc_pdf(
            toc_path,
            data,
            base_pages_list,
            feature_appendix_pages,
            block_pages_list,
            toc_page_count=T
        )
        actual_T = len(PdfReader(str(toc_path)).pages)
        if actual_T == T:
            break
        T = actual_T

    print(f"Re-compilando con el total de páginas final del TOC: {T}")
    feature_appendix_pages = {}
    block_pages_list = []
    base_pages_list = []
    
    for item in RANGES:
        if not item["appendix_ids"]:
            item["output"].write_bytes(item["base"].read_bytes())
            base_pages = len(PdfReader(str(item["base"])).pages)
            base_pages_list.append(base_pages)
            block_pages_list.append(base_pages)
        else:
            block_4_app_start = T + sum(block_pages_list[:3]) + len(PdfReader(str(item["base"])).pages) + 1
            features = [feature for feature in data if feature["id"] in item["appendix_ids"]]
            local_pages = build_appendix(features, item["label"], item["tmp"], block_4_app_start)
            feature_appendix_pages.update(local_pages)

            base_pages = len(PdfReader(str(item["base"])).pages)
            base_pages_list.append(base_pages)

            merge_pdf(item["base"], item["tmp"], item["output"])
            
            block_pages = len(PdfReader(str(item["output"])).pages)
            block_pages_list.append(block_pages)

    build_cover_toc_pdf(
        toc_path,
        data,
        base_pages_list,
        feature_appendix_pages,
        block_pages_list,
        toc_page_count=T
    )

    print(f"Portada e índice finalizados con {T} páginas.")
    print("Unificando todas las guías en el archivo completo...")
    build_unified_complete(toc_path)

    print("Limpiando archivos temporales...")
    cleanup_temp_files(toc_path)

    print(f"¡Guía completa generada con éxito en: {UNIFIED_OUTPUT.name}!")


if __name__ == "__main__":
    main()
