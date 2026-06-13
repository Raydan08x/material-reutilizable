from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "assets" / "js"
GUIDE_DATA_PATH = ASSETS_DIR / "guide-data.js"
GUIDE_DETAILS_PATH = ASSETS_DIR / "guide-details-data.js"


def run_node(code: str) -> str:
    result = subprocess.run(
        ["node", "--input-type=module", "-e", code],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def repair_text(value: str) -> str:
    text = str(value)

    for _ in range(2):
        if any(marker in text for marker in ("Ã", "â", "Â")):
            try:
                text = text.encode("latin-1").decode("utf-8")
            except (UnicodeEncodeError, UnicodeDecodeError):
                break

    replacements = {
        "Ã¡": "á",
        "Ã©": "é",
        "Ã­": "í",
        "Ã³": "ó",
        "Ãº": "ú",
        "Ã": "Á",
        "Ã‰": "É",
        "Ã": "Í",
        "Ã“": "Ó",
        "Ãš": "Ú",
        "Ã±": "ñ",
        "Ã‘": "Ñ",
        "Ã¼": "ü",
        "Ãœ": "Ü",
        "Â¿": "¿",
        "Â¡": "¡",
        "â€¢": "•",
        "â€“": "–",
        "â€”": "—",
        "â€œ": "“",
        "â€": "”",
        "â€˜": "‘",
        "â€™": "’",
        "â†‘": "↑",
        "â†’": "→",
        "â˜°": "☰",
        "â˜¾": "☾",
        "â˜€": "☀",
        "âŒ„": "⌄",
        "â–¾": "▾",
        "Ã¢–Â¾": "▾",
        "ÃƒÂ¢–Ã‚Â¾": "▾",
        "âœ…": "✅",
        "â¬œ": "⬜",
        "âœ•": "✕",
        "Ã—": "×",
        "Â°": "°",
        "Â©": "©",
        "\x7f": "•",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = re.sub(r"[\u00c3\u0192\u00c2\u00a2]+–[\u00c3\u201a\u20ac\u0161\u00c2\u00be]+", "▾", text)

    return text


def repair_json(value):
    if isinstance(value, str):
        return repair_text(value)
    if isinstance(value, list):
        return [repair_json(item) for item in value]
    if isinstance(value, dict):
        return {key: repair_json(item) for key, item in value.items()}
    return value


def load_functional_guide_data() -> list[dict]:
    node_code = f"""
import {{ readFileSync }} from 'node:fs';
import {{ buildFunctionalGuideData }} from 'file:///{(ASSETS_DIR / "funciones.js").as_posix()}';

const raw = readFileSync('{GUIDE_DATA_PATH.as_posix()}', 'utf8');
const start = raw.indexOf('[');
const end = raw.lastIndexOf(']');
const data = JSON.parse(raw.slice(start, end + 1));
process.stdout.write(JSON.stringify(buildFunctionalGuideData(data)));
"""
    return json.loads(run_node(node_code))


def load_js_json(path: Path, open_char: str, close_char: str):
    raw = path.read_text(encoding="utf-8")
    start = raw.index(open_char)
    end = raw.rindex(close_char)
    return json.loads(raw[start:end + 1])


def write_assignment(path: Path, variable: str, value) -> None:
    formatted = json.dumps(value, ensure_ascii=False, indent=4)
    path.write_text(f"window.{variable} = {formatted};\n", encoding="utf-8")


def main() -> None:
    functional_data = repair_json(load_functional_guide_data())
    for item in functional_data:
        if item.get("id") == 3:
            item["html"] = """<div class="side-group">
    <button class="side-group__button">Interfaz ▾</button>
    <div class="side-group__content">
        <button data-section="componentes">Componentes UI</button>
        <button data-section="formularios">Formularios</button>
    </div>
</div>"""
    write_assignment(GUIDE_DATA_PATH, "GUIDE_DATA", functional_data)

    details_data = repair_json(load_js_json(GUIDE_DETAILS_PATH, "{", "}"))
    write_assignment(GUIDE_DETAILS_PATH, "GUIDE_DETAILS", details_data)


if __name__ == "__main__":
    main()
