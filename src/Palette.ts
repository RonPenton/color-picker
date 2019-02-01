import * as R from 'ramda';
import pick from 'ramda/es/pick';

export interface Color {
    r: number;
    g: number;
    b: number;
}

export function hexToRGB(hex: string): Color {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result)
        throw new Error("Invalid color");

    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

function componentToHex(c: number): string {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(color: Color) {
    return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
}

export interface PaletteEntry {
    color: Color;
    name: string;
}

export const KnownColors = {
    yellow: { color: hexToRGB("#FFED00"), name: "yellow" },
    red: { color: hexToRGB("#FF0000"), name: "red" },
    magenta: { color: hexToRGB("#FF00AB"), name: "magenta" },
    blue: { color: hexToRGB("#0047ab"), name: "blue" },
    cyan: { color: hexToRGB("#00EDFF"), name: "cyan" },
    green: { color: hexToRGB("#00B500"), name: "green" },
    white: { color: hexToRGB("#FFFFFF"), name: "white" },
    black: { color: hexToRGB("#000000"), name: "black" }

}

export type Palette = PaletteEntry[];

export const BasicPalette: Palette = [
    KnownColors.yellow,
    KnownColors.red,
    KnownColors.magenta,
    KnownColors.blue,
    KnownColors.cyan,
    KnownColors.green,
    KnownColors.white,
    KnownColors.black
];

type colorPicker = (c: Color) => number;

export function calculateColor(pickedColor: PickedColor): Color {
    const keys = Object.keys(pickedColor);
    const n = R.sum(keys.map(c => pickedColor[c]));

    if (n == 0)
        return KnownColors.white.color;

    const f = (p: colorPicker) => Math.round(R.sum(keys.map(c => pickedColor[c] * p(hexToRGB(c)))) / n);
    const r = f(c => c.r);
    const g = f(c => c.g);
    const b = f(c => c.b);
    return { r, g, b };
}

export type PickedColor = { [color: string]: number };


export function addPickedColor(existing: PickedColor, picked: Color, value: number = 1): PickedColor {
    const clone = { ...existing };
    const hex = rgbToHex(picked);
    const number = (existing[hex] || 0) + value;
    clone[hex] = number;
    return clone;
}

export function removePickedColor(existing: PickedColor, picked: Color): PickedColor {
    const clone = { ...existing };
    const hex = rgbToHex(picked);
    let number = (existing[hex] || 0) - 1;
    if (number < 0) number = 0;
    clone[hex] = number;
    return clone;
}


export interface LabColor {
    l: number;
    a: number;
    b: number;
}

export function lab2rgb(lab: LabColor): Color {
    var y = (lab.l + 16) / 116,
        x = lab.a / 500 + y,
        z = y - lab.b / 200,
        r, g, b;

    x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
    y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
    z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);

    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r;
    g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g;
    b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b;

    return {
        r: Math.max(0, Math.min(1, r)) * 255,
        g: Math.max(0, Math.min(1, g)) * 255,
        b: Math.max(0, Math.min(1, b)) * 255
    }
}


export function rgb2lab(rgb: Color): LabColor {
    var r = rgb.r / 255,
        g = rgb.g / 255,
        b = rgb.b / 255,
        x, y, z;

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

    return {
        l: (116 * y) - 16,
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

export function deltaE(labA: LabColor, labB: LabColor): number {
    var deltaL = labA.l - labB.l;
    var deltaA = labA.a - labB.a;
    var deltaB = labA.b - labB.b;
    var c1 = Math.sqrt(labA.a * labA.a + labA.b * labA.b);
    var c2 = Math.sqrt(labB.a * labB.a + labB.b * labB.b);
    var deltaC = c1 - c2;
    var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    var sc = 1.0 + 0.045 * c1;
    var sh = 1.0 + 0.015 * c1;
    var deltaLKlsl = deltaL / (1.0);
    var deltaCkcsc = deltaC / (sc);
    var deltaHkhsh = deltaH / (sh);
    var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}


export interface HSLColor {
    h: number;
    s: number;
    l: number;
}

export interface HSVColor {
    h: number;
    s: number;
    v: number;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
export function rgbToHsl(color: Color): HSLColor {
    let { r, g, b } = color;
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h, s, l };
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
export function hslToRgb(hsl: HSLColor): Color {
    var r, g, b;
    let { h, s, l } = hsl;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
export function rgbToHsv(color: Color): HSVColor {
    let { r, g, b } = color;
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h, s, v };
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
export function hsvToRgb(hsv: HSVColor): Color {
    var r = 0, g = 0, b = 0;
    let { h, s, v } = hsv;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}


export function getTextColor(color: Color) {
    return rgbToHsl(color).l > 0.40 ?
        "rgba(0,0,0,0.5)" :
        "rgba(255,255,255,0.5)";
}