import math
from typing import List, Optional

THREAD_LIBRARY = [
    {"brand": "Janome", "number": "001", "name": "White", "hex": "#FFFFFF"},
    {"brand": "Janome", "number": "002", "name": "Black", "hex": "#000000"},
    {"brand": "Janome", "number": "003", "name": "Ivory", "hex": "#FFFFF0"},
    {"brand": "Janome", "number": "004", "name": "Cream", "hex": "#FFFDD0"},
    {"brand": "Janome", "number": "005", "name": "Light Yellow", "hex": "#FFFFE0"},
    {"brand": "Janome", "number": "006", "name": "Yellow", "hex": "#FFD700"},
    {"brand": "Janome", "number": "007", "name": "Gold", "hex": "#FFB300"},
    {"brand": "Janome", "number": "008", "name": "Orange", "hex": "#FF6600"},
    {"brand": "Janome", "number": "009", "name": "Deep Orange", "hex": "#E84C00"},
    {"brand": "Janome", "number": "010", "name": "Red", "hex": "#CC0000"},
    {"brand": "Janome", "number": "011", "name": "Crimson", "hex": "#DC143C"},
    {"brand": "Janome", "number": "012", "name": "Pink", "hex": "#FF69B4"},
    {"brand": "Janome", "number": "013", "name": "Hot Pink", "hex": "#FF1493"},
    {"brand": "Janome", "number": "014", "name": "Magenta", "hex": "#FF00FF"},
    {"brand": "Janome", "number": "015", "name": "Lavender", "hex": "#E6E6FA"},
    {"brand": "Janome", "number": "016", "name": "Violet", "hex": "#8B00FF"},
    {"brand": "Janome", "number": "017", "name": "Purple", "hex": "#800080"},
    {"brand": "Janome", "number": "018", "name": "Navy Blue", "hex": "#000080"},
    {"brand": "Janome", "number": "019", "name": "Royal Blue", "hex": "#4169E1"},
    {"brand": "Janome", "number": "020", "name": "Sky Blue", "hex": "#87CEEB"},
    {"brand": "Janome", "number": "021", "name": "Teal", "hex": "#008080"},
    {"brand": "Janome", "number": "022", "name": "Turquoise", "hex": "#40E0D0"},
    {"brand": "Janome", "number": "023", "name": "Light Green", "hex": "#90EE90"},
    {"brand": "Janome", "number": "024", "name": "Green", "hex": "#008000"},
    {"brand": "Janome", "number": "025", "name": "Forest Green", "hex": "#228B22"},
    {"brand": "Janome", "number": "026", "name": "Olive", "hex": "#808000"},
    {"brand": "Janome", "number": "027", "name": "Brown", "hex": "#A52A2A"},
    {"brand": "Janome", "number": "028", "name": "Tan", "hex": "#D2B48C"},
    {"brand": "Janome", "number": "029", "name": "Beige", "hex": "#F5F5DC"},
    {"brand": "Janome", "number": "030", "name": "Gray", "hex": "#808080"},
    {"brand": "Janome", "number": "031", "name": "Silver", "hex": "#C0C0C0"},
    {"brand": "Janome", "number": "032", "name": "Salmon", "hex": "#FA8072"},
    {"brand": "Madeira", "number": "1000", "name": "White", "hex": "#FFFFFF"},
    {"brand": "Madeira", "number": "1001", "name": "Eggshell", "hex": "#F0EAD6"},
    {"brand": "Madeira", "number": "1100", "name": "Yellow", "hex": "#FFFF00"},
    {"brand": "Madeira", "number": "1140", "name": "Gold", "hex": "#FFC200"},
    {"brand": "Madeira", "number": "1170", "name": "Orange", "hex": "#FF8C00"},
    {"brand": "Madeira", "number": "1200", "name": "Coral", "hex": "#FF6B6B"},
    {"brand": "Madeira", "number": "1350", "name": "Pink", "hex": "#FF69B4"},
    {"brand": "Madeira", "number": "1400", "name": "Hot Pink", "hex": "#FF1493"},
    {"brand": "Madeira", "number": "1500", "name": "Red", "hex": "#FF0000"},
    {"brand": "Madeira", "number": "1540", "name": "Deep Red", "hex": "#8B0000"},
    {"brand": "Madeira", "number": "1600", "name": "Magenta", "hex": "#FF00FF"},
    {"brand": "Madeira", "number": "1800", "name": "Violet", "hex": "#8B008B"},
    {"brand": "Madeira", "number": "1920", "name": "Navy", "hex": "#000080"},
    {"brand": "Madeira", "number": "1950", "name": "Royal Blue", "hex": "#4169E1"},
    {"brand": "Madeira", "number": "2000", "name": "Blue", "hex": "#0000FF"},
    {"brand": "Madeira", "number": "2060", "name": "Sky Blue", "hex": "#87CEEB"},
    {"brand": "Madeira", "number": "2100", "name": "Teal", "hex": "#008080"},
    {"brand": "Madeira", "number": "2400", "name": "Green", "hex": "#008000"},
    {"brand": "Madeira", "number": "2800", "name": "Brown", "hex": "#8B4513"},
    {"brand": "Madeira", "number": "3200", "name": "Silver", "hex": "#C0C0C0"},
    {"brand": "Madeira", "number": "3300", "name": "Gray", "hex": "#808080"},
    {"brand": "Madeira", "number": "3400", "name": "Black", "hex": "#000000"},
    {"brand": "Brother", "number": "B001", "name": "White", "hex": "#FFFFFF"},
    {"brand": "Brother", "number": "B010", "name": "Yellow", "hex": "#FFED00"},
    {"brand": "Brother", "number": "B020", "name": "Gold", "hex": "#FFD700"},
    {"brand": "Brother", "number": "B030", "name": "Orange", "hex": "#FF7700"},
    {"brand": "Brother", "number": "B050", "name": "Red", "hex": "#E02020"},
    {"brand": "Brother", "number": "B070", "name": "Pink", "hex": "#FF80AA"},
    {"brand": "Brother", "number": "B090", "name": "Hot Pink", "hex": "#FF0080"},
    {"brand": "Brother", "number": "B110", "name": "Purple", "hex": "#7B0099"},
    {"brand": "Brother", "number": "B120", "name": "Lavender", "hex": "#B090D0"},
    {"brand": "Brother", "number": "B140", "name": "Royal Blue", "hex": "#2860C0"},
    {"brand": "Brother", "number": "B150", "name": "Navy", "hex": "#002080"},
    {"brand": "Brother", "number": "B170", "name": "Sky Blue", "hex": "#60C0FF"},
    {"brand": "Brother", "number": "B190", "name": "Aqua", "hex": "#00B0B0"},
    {"brand": "Brother", "number": "B210", "name": "Green", "hex": "#00A000"},
    {"brand": "Brother", "number": "B230", "name": "Olive", "hex": "#808020"},
    {"brand": "Brother", "number": "B240", "name": "Brown", "hex": "#804020"},
    {"brand": "Brother", "number": "B270", "name": "Gray", "hex": "#909090"},
    {"brand": "Brother", "number": "B290", "name": "Black", "hex": "#000000"},
    {"brand": "Isacord", "number": "0010", "name": "White", "hex": "#FFFFFF"},
    {"brand": "Isacord", "number": "0220", "name": "Yellow", "hex": "#FFED00"},
    {"brand": "Isacord", "number": "0400", "name": "Golden Yellow", "hex": "#FFC200"},
    {"brand": "Isacord", "number": "0500", "name": "Orange", "hex": "#FF6600"},
    {"brand": "Isacord", "number": "0700", "name": "Tomato Red", "hex": "#FF2020"},
    {"brand": "Isacord", "number": "0800", "name": "Red", "hex": "#CC0000"},
    {"brand": "Isacord", "number": "1000", "name": "Rose", "hex": "#FF66AA"},
    {"brand": "Isacord", "number": "1100", "name": "Pink", "hex": "#FF99BB"},
    {"brand": "Isacord", "number": "1300", "name": "Magenta", "hex": "#CC0088"},
    {"brand": "Isacord", "number": "1400", "name": "Purple", "hex": "#880099"},
    {"brand": "Isacord", "number": "1600", "name": "Lavender", "hex": "#BB99DD"},
    {"brand": "Isacord", "number": "1800", "name": "Royal Blue", "hex": "#2244BB"},
    {"brand": "Isacord", "number": "1900", "name": "Navy", "hex": "#000055"},
    {"brand": "Isacord", "number": "2000", "name": "Blue", "hex": "#0044CC"},
    {"brand": "Isacord", "number": "2200", "name": "Sky Blue", "hex": "#77AAFF"},
    {"brand": "Isacord", "number": "2400", "name": "Turquoise", "hex": "#00BBDD"},
    {"brand": "Isacord", "number": "2500", "name": "Teal", "hex": "#007788"},
    {"brand": "Isacord", "number": "2900", "name": "Green", "hex": "#009900"},
    {"brand": "Isacord", "number": "3000", "name": "Forest Green", "hex": "#006600"},
    {"brand": "Isacord", "number": "3700", "name": "Brown", "hex": "#773311"},
    {"brand": "Isacord", "number": "4000", "name": "Gray", "hex": "#888888"},
    {"brand": "Isacord", "number": "4300", "name": "Black", "hex": "#000000"},
    {"brand": "Sulky", "number": "1001", "name": "White", "hex": "#FFFFFF"},
    {"brand": "Sulky", "number": "1030", "name": "Yellow", "hex": "#FFE000"},
    {"brand": "Sulky", "number": "1050", "name": "Gold", "hex": "#FFC000"},
    {"brand": "Sulky", "number": "1070", "name": "Orange", "hex": "#FF7F00"},
    {"brand": "Sulky", "number": "1110", "name": "Red", "hex": "#DD0000"},
    {"brand": "Sulky", "number": "1160", "name": "Pink", "hex": "#FF88AA"},
    {"brand": "Sulky", "number": "1170", "name": "Hot Pink", "hex": "#FF3388"},
    {"brand": "Sulky", "number": "1190", "name": "Magenta", "hex": "#CC0066"},
    {"brand": "Sulky", "number": "1230", "name": "Purple", "hex": "#770099"},
    {"brand": "Sulky", "number": "1260", "name": "Royal Blue", "hex": "#1144CC"},
    {"brand": "Sulky", "number": "1270", "name": "Navy Blue", "hex": "#000066"},
    {"brand": "Sulky", "number": "1310", "name": "Sky Blue", "hex": "#55AAFF"},
    {"brand": "Sulky", "number": "1330", "name": "Teal", "hex": "#008899"},
    {"brand": "Sulky", "number": "1400", "name": "Green", "hex": "#009900"},
    {"brand": "Sulky", "number": "1420", "name": "Forest", "hex": "#005500"},
    {"brand": "Sulky", "number": "1440", "name": "Olive", "hex": "#778800"},
    {"brand": "Sulky", "number": "1510", "name": "Brown", "hex": "#884422"},
    {"brand": "Sulky", "number": "1560", "name": "Gray", "hex": "#888888"},
    {"brand": "Sulky", "number": "1590", "name": "Black", "hex": "#000000"},
]


def _hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def _dist(a, b):
    r1, g1, b1 = _hex_to_rgb(a)
    r2, g2, b2 = _hex_to_rgb(b)
    return math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)


def search_threads(brand=None, query=None):
    r = THREAD_LIBRARY
    if brand:
        r = [t for t in r if t["brand"].lower() == brand.lower()]
    if query:
        q = query.lower()
        r = [t for t in r if q in t["name"].lower() or q in t["number"].lower()]
    return r


def find_nearest_thread(hex_color: str, brand=None, count: int = 5):
    c = THREAD_LIBRARY
    if brand:
        c = [t for t in c if t["brand"].lower() == brand.lower()]
    return sorted(c, key=lambda t: _dist(hex_color, t["hex"]))[:count]


def get_all_brands():
    return sorted(list({t["brand"] for t in THREAD_LIBRARY}))
