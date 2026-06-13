import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

details = {}
with open('assets/js/guide-details-data.js', 'r', encoding='utf-8') as f:
    for line in f:
        line_str = line.strip()
        if not line_str.startswith('"'):
            continue
        # Find the first ":"
        colon_idx = line_str.find(':')
        if colon_idx == -1:
            continue
        key = line_str[:colon_idx].strip('"\' ')
        val_part = line_str[colon_idx+1:].strip()
        # The value starts with " or '
        if val_part.startswith('"') or val_part.startswith("'"):
            # Strip the leading quote and trailing quote/comma
            # Usually it ends with ", or "
            if val_part.endswith(','):
                val_part = val_part[:-1].strip()
            val_part = val_part[1:-1]
        
        # Now unescape the string
        try:
            # We can use codecs or json.loads to decode it
            # Since it is a double-quoted JSON string (with escaped chars),
            # wrapping it in double quotes and using json.loads is extremely safe!
            unescaped = json.loads('"' + val_part + '"')
            details[int(key)] = unescaped
        except Exception as e:
            # Fallback to unicode_escape
            try:
                unescaped = val_part.encode('utf-8').decode('unicode_escape', errors='ignore')
                details[int(key)] = unescaped
            except Exception as e2:
                print(f"Error decoding key {key}: {e2}")

print(f"Parsed keys: {sorted(list(details.keys()))}")
print(f"Key 57 length: {len(details[57])} characters")
print("=== END OF KEY 57 ===")
print(details[57][-600:])
