from pathlib import Path
import struct
import zlib


def write_png(path, width=1, height=1, color=(0, 97, 255, 255)):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b''.join(b'\x00' + bytes(color) for _ in range(width * height))
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw))
    png += chunk(b'IEND', b'')
    Path(path).write_bytes(png)


root = Path(__file__).resolve().parent.parent
(root / 'public' / 'icons').mkdir(exist_ok=True)
write_png(root / 'public' / 'icons' / 'icon-192.png', width=192, height=192, color=(0, 97, 255, 255))
write_png(root / 'public' / 'icons' / 'icon-512.png', width=512, height=512, color=(0, 97, 255, 255))
