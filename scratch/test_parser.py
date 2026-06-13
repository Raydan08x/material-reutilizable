import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

# Read details
details = {}
with open('assets/js/guide-details-data.js', 'r', encoding='utf-8') as f:
    for line in f:
        line_str = line.strip()
        if not line_str.startswith('"'):
            continue
        colon_idx = line_str.find(':')
        if colon_idx == -1:
            continue
        key = line_str[:colon_idx].strip('"\' ')
        val_part = line_str[colon_idx+1:].strip()
        if val_part.endswith(','):
            val_part = val_part[:-1].strip()
        if val_part.startswith('"') or val_part.startswith("'"):
            val_part = val_part[1:-1]
        try:
            unescaped = json.loads('"' + val_part + '"')
            details[int(key)] = unescaped
        except:
            unescaped = val_part.encode('utf-8').decode('unicode_escape', errors='ignore')
            details[int(key)] = unescaped

CLEAN_HEADERS = {
    "que hace", "cuando usarlo", "paso a paso para reciclarlo en otro proyecto", "donde se usa mejor",
    "errores comunes", "puntos clave", "objetivo de la actividad", "estructura general del ejercicio",
    "html minimo que debes copiar", "css del componente", "javascript modular con export/import",
    "javascript normal sin modulos", "variables clases ids y atributos que debes cambiar",
    "implementacion paso a paso", "errores comunes y como solucionarlos",
    "checklist de prueba antes de reutilizar", "mejoras opcionales",
    "paso a paso detallado para construirlo desde cero", "donde se usa en industria",
    "como se personaliza", "mapa rapido de reciclaje", "html funcional base", "css funcional base",
    "js funcional base", "aspecto", "explicacion", "implementacion conceptual"
}

def clean_header(text):
    text = text.lower()
    text = text.replace("¿", "").replace("?", "").replace(":", "").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ñ", "n")
    return text.strip()

for fid in [43, 48, 53, 54, 55, 56, 57]:
    text = details[fid]
    lines = text.split('\n')
    print(f"\n=========================================")
    print(f"=== PARSING FEATURE {fid} ===")
    print(f"=========================================")
    
    in_code = False
    code_lines = []
    code_filename = ""
    
    for idx, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            if in_code:
                code_lines.append(line)
            continue
            
        is_code_start = stripped in {"index.html", "styles.css", "funciones.js", "script.js", "script-normal.js", "funciones.js + script.js"} or stripped.endswith(".js") or stripped.endswith(".css") or stripped.endswith(".html")
        is_header = clean_header(stripped) in CLEAN_HEADERS
        
        # Title of the feature is always the first line
        if idx == 0:
            print(f"[TITLE]: {stripped}")
            continue
            
        if is_code_start:
            if in_code:
                print(f"[CODE BLOCK {code_filename}]: {len(code_lines)} lines")
                in_code = False
                code_lines = []
            in_code = True
            code_filename = stripped
            print(f"-> START OF CODE: {code_filename}")
            continue
            
        if is_header and not in_code:
            print(f"[HEADER]: {stripped}")
            continue
            
        if in_code:
            if is_header:
                print(f"[CODE BLOCK {code_filename}]: {len(code_lines)} lines")
                in_code = False
                code_lines = []
                print(f"[HEADER]: {stripped}")
            else:
                code_lines.append(line)
                continue
                
        if stripped.startswith('•') or stripped.startswith('-') or (len(stripped) > 2 and stripped[0].isdigit() and stripped[1] == '.'):
            print(f"[BULLET]: {stripped[:80]}")
        else:
            print(f"[PARAGRAPH]: {stripped[:80]}")
            
    if in_code:
        print(f"[CODE BLOCK {code_filename}]: {len(code_lines)} lines")
