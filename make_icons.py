"""Generate PWA icons for Surge Coaching app without external dependencies."""
import struct, zlib, math

def make_png(size):
    """Create an orange square PNG with white 'S' using pure Python."""
    w = h = size
    orange = (249, 115, 22)   # #f97316
    white  = (255, 255, 255)
    dark   = (30, 41, 59)     # #1e293b for subtle depth

    # Pixel grid: RGBA
    img = [[(0, 0, 0)] * w for _ in range(h)]

    # Fill orange with rounded corners
    corner_r = int(size * 0.18)
    for y in range(h):
        for x in range(w):
            # Rounded corner check
            def in_corner(cx, cy):
                dx, dy = x - cx, y - cy
                return dx * dx + dy * dy > corner_r * corner_r

            in_tl = x < corner_r and y < corner_r and in_corner(corner_r, corner_r)
            in_tr = x >= w - corner_r and y < corner_r and in_corner(w - corner_r - 1, corner_r)
            in_bl = x < corner_r and y >= h - corner_r and in_corner(corner_r, h - corner_r - 1)
            in_br = x >= w - corner_r and y >= h - corner_r and in_corner(w - corner_r - 1, h - corner_r - 1)

            if in_tl or in_tr or in_bl or in_br:
                img[y][x] = (0, 0, 0)  # transparent (we'll treat as bg skip)
            else:
                img[y][x] = orange

    # Draw a simple bold 'S' in the centre using a bitmap
    # Scale the S strokes relative to icon size
    sw = int(size * 0.55)  # S width
    sh = int(size * 0.65)  # S height
    ox = (w - sw) // 2     # origin x
    oy = (h - sh) // 2     # origin y
    t = max(int(size * 0.1), 4)   # stroke thickness

    def fill_rect(x0, y0, x1, y1, colour):
        for yy in range(max(0, y0), min(h, y1)):
            for xx in range(max(0, x0), min(w, x1)):
                if img[yy][xx] != (0, 0, 0):
                    img[yy][xx] = colour

    # S segments (approximate)
    mid_y = oy + sh // 2
    # Top bar
    fill_rect(ox, oy, ox + sw, oy + t, white)
    # Middle bar
    fill_rect(ox, mid_y - t // 2, ox + sw, mid_y + t // 2 + 1, white)
    # Bottom bar
    fill_rect(ox, oy + sh - t, ox + sw, oy + sh, white)
    # Top-left vertical
    fill_rect(ox, oy, ox + t, mid_y, white)
    # Bottom-right vertical
    fill_rect(ox + sw - t, mid_y, ox + sw, oy + sh, white)

    # Build raw PNG data
    def make_chunk(tag, data):
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', crc)

    # IHDR
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)  # 8-bit RGB

    # IDAT — filter byte 0 + RGB rows
    raw_rows = b''
    for y in range(h):
        raw_rows += b'\x00'
        for x in range(w):
            r, g, b = img[y][x]
            raw_rows += bytes([r, g, b])

    compressed = zlib.compress(raw_rows, 9)

    png = (
        b'\x89PNG\r\n\x1a\n'
        + make_chunk(b'IHDR', ihdr)
        + make_chunk(b'IDAT', compressed)
        + make_chunk(b'IEND', b'')
    )
    return png


if __name__ == '__main__':
    import os
    os.makedirs('public/icons', exist_ok=True)
    for size in (192, 512):
        data = make_png(size)
        path = f'public/icons/icon-{size}.png'
        with open(path, 'wb') as f:
            f.write(data)
        print(f'Created {path} ({len(data):,} bytes)')
    print('Done.')
