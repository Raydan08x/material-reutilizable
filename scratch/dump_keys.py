import re
import sys

with open('assets/js/guide-details-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for keys of the form: "id" or 'id'
keys = re.findall(r'["\'](\d+)["\']\s*:', content)

with open('scratch/keys_content.txt', 'w', encoding='utf-8') as out:
    for k in [43, 48, 53, 54, 55, 56, 57]:
        pattern = rf'["\']{k}["\']\s*:\s*(["\'])(.*?)\1'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            val = match.group(2)
            unescaped = val.encode('utf-8').decode('unicode_escape', errors='ignore')
            out.write(f"=========================================\n")
            out.write(f"=== KEY {k} ===\n")
            out.write(f"=========================================\n")
            out.write(unescaped)
            out.write("\n\n")
