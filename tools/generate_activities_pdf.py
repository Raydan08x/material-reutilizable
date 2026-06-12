from pathlib import Path


OUTPUT = Path("actividades_guiadas_componentes_web_2026.pdf")


PAGES = [
    [
        "Actividades Guiadas - Componentes Web 2026",
        "",
        "Este documento agrega tres actividades guiadas al banco de componentes",
        "sin modificar las guias anteriores. Se penso como complemento practico",
        "para aprender haciendo dentro de la misma pagina del proyecto.",
        "",
        "Contenido",
        "1. Conversor de temperatura en JavaScript",
        "2. Tarjeta de presentacion Bootstrap",
        "3. Carrito de compras DOM",
        "",
        "Cada actividad incluye:",
        "- objetivo",
        "- explicacion conceptual",
        "- pasos de implementacion",
        "- puntos de validacion",
    ],
    [
        "Actividad 1 - Conversor de temperatura en JavaScript",
        "",
        "Objetivo",
        "Recibir un valor en grados Celsius, validarlo y convertirlo a",
        "Fahrenheit y Kelvin usando JavaScript.",
        "",
        "Condiciones de la actividad",
        "- pedir Celsius con prompt o input",
        "- validar que el dato sea numerico",
        "- mostrar Kelvin y Fahrenheit",
        "- repetir o mostrar error si el dato no es valido",
        "- probar con 45 y 14",
        "- subir el resultado al repo logica-programacion-2",
        "",
        "Paso a paso",
        "1. Lee el valor escrito por el usuario.",
        "2. Convierte el texto con Number(valor).",
        "3. Valida con Number.isFinite.",
        "4. Si falla, muestra un mensaje de error.",
        "5. Si pasa, calcula Kelvin = C + 273.15.",
        "6. Calcula Fahrenheit = (C * 9 / 5) + 32.",
        "7. Imprime ambos resultados en DOM o consola.",
        "8. Verifica 45 => 318.15 K y 113 F.",
        "9. Verifica 14 => 287.15 K y 57.2 F.",
    ],
    [
        "Actividad 2 - Tarjeta de presentacion Bootstrap",
        "",
        "Objetivo",
        "Construir una card personal inspirada en Bootstrap y adaptarla al",
        "estilo visual de este proyecto.",
        "",
        "Que se practica",
        "- estructura tipo card",
        "- jerarquia visual con avatar, nombre, rol y enlaces",
        "- badges para tecnologias",
        "- composicion responsiva",
        "- interaccion extra con flip frontal y trasero",
        "",
        "Paso a paso",
        "1. Crea un contenedor principal para la actividad.",
        "2. Agrega un bloque interno que girara con transform 3D.",
        "3. Disena la cara frontal con avatar, nombre y descripcion.",
        "4. Disena la cara trasera con tecnologias y herramientas.",
        "5. Agrega botones para ver tecnologias y volver.",
        "6. En CSS usa perspective, preserve-3d y backface-visibility.",
        "7. En JS agrega o quita la clase is-flipped.",
        "8. Prueba contraste, espaciado y responsive en ambos temas.",
    ],
    [
        "Actividad 3 - Carrito de compras DOM",
        "",
        "Objetivo",
        "Practicar manipulacion del DOM creando una mini tienda con carrito,",
        "contador, total acumulado y borrado de items.",
        "",
        "Que se practica",
        "- querySelectorAll y addEventListener",
        "- dataset para leer nombre y precio",
        "- createElement y appendChild",
        "- actualizacion del badge",
        "- calculo del total",
        "- eliminacion individual y vaciado completo",
        "",
        "Paso a paso",
        "1. Crea varios productos con boton Agregar.",
        "2. Guarda nombre y precio en data-name y data-price.",
        "3. Crea la lista del carrito y el badge del contador.",
        "4. Al agregar, crea un li dinamico con boton Eliminar.",
        "5. Suma el precio al total y actualiza la interfaz.",
        "6. Cuando se elimina un item, resta el valor y borra la fila.",
        "7. El boton Vaciar debe reiniciar lista, badge y total.",
        "8. Verifica que todo siga correcto al mezclar varias acciones.",
    ],
]


def escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def make_stream(lines: list[str]) -> bytes:
    content = ["BT", "/F1 18 Tf", "50 790 Td", f"({escape_pdf_text(lines[0])}) Tj"]
    for line in lines[1:]:
        content.append(f"0 -22 Td ({escape_pdf_text(line)}) Tj")
    content.append("ET")
    return "\n".join(content).encode("latin-1", errors="replace")


def build_pdf(pages: list[list[str]]) -> bytes:
    objects: list[bytes] = []

    def add_object(body: bytes) -> int:
        objects.append(body)
        return len(objects)

    font_id = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    page_ids: list[int] = []
    content_ids: list[int] = []

    for page_lines in pages:
        stream = make_stream(page_lines)
        content_id = add_object(
            f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1") + stream + b"\nendstream"
        )
        content_ids.append(content_id)
        page_ids.append(0)

    pages_id = add_object(b"")

    for index, content_id in enumerate(content_ids):
        body = (
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        ).encode("latin-1")
        page_ids[index] = add_object(body)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")
    catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode("latin-1"))

    output = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("latin-1"))
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    output.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF"
        ).encode("latin-1")
    )
    return bytes(output)


def main() -> None:
    OUTPUT.write_bytes(build_pdf(PAGES))


if __name__ == "__main__":
    main()
