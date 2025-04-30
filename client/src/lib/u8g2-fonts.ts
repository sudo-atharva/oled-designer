export interface U8g2Font {
  name: string;
  description: string;
  size: number;
}

// A subset of common U8g2 fonts
export const u8g2Fonts: U8g2Font[] = [
  {
    name: "u8g2_font_6x10_tf",
    description: "6x10 Pixels, Regular",
    size: 10
  },
  {
    name: "u8g2_font_5x8_tf",
    description: "5x8 Pixels, Regular",
    size: 8
  },
  {
    name: "u8g2_font_4x6_tf",
    description: "4x6 Pixels, Tiny",
    size: 6
  },
  {
    name: "u8g2_font_6x12_tf",
    description: "6x12 Pixels, Regular",
    size: 12
  },
  {
    name: "u8g2_font_7x13_tf",
    description: "7x13 Pixels, Regular",
    size: 13
  },
  {
    name: "u8g2_font_8x13_tf",
    description: "8x13 Pixels, Regular",
    size: 13
  },
  {
    name: "u8g2_font_9x15_tf",
    description: "9x15 Pixels, Regular",
    size: 15
  },
  {
    name: "u8g2_font_9x18_tf",
    description: "9x18 Pixels, Regular",
    size: 18
  },
  {
    name: "u8g2_font_10x20_tf",
    description: "10x20 Pixels, Regular",
    size: 20
  },
  {
    name: "u8g2_font_unifont_t_symbols",
    description: "Unifont Symbols, Regular",
    size: 16
  },
  {
    name: "u8g2_font_open_iconic_all_1x_t",
    description: "Open Iconic, 8x8 Icons",
    size: 8
  },
  {
    name: "u8g2_font_open_iconic_all_2x_t",
    description: "Open Iconic, 16x16 Icons",
    size: 16
  },
  {
    name: "u8g2_font_profont10_tf",
    description: "ProFont, 10px",
    size: 10
  },
  {
    name: "u8g2_font_profont11_tf",
    description: "ProFont, 11px",
    size: 11
  },
  {
    name: "u8g2_font_profont12_tf",
    description: "ProFont, 12px",
    size: 12
  },
  {
    name: "u8g2_font_tom_thumb_4x6_tf",
    description: "Tom Thumb, 4x6 Pixels",
    size: 6
  }
];

// Get a font by name
export function getFontByName(name: string): U8g2Font | undefined {
  return u8g2Fonts.find(font => font.name === name);
}

// Get default font
export function getDefaultFont(): U8g2Font {
  return u8g2Fonts[0];
}
