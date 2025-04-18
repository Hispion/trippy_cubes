import { config } from './config.js';

/*  preset color palette options (add your own!) */
export const colorPalettes = {
    neon: [
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#FF8800', // Orange
        '#00FF00', // Lime
        '#FF0088', // Hot Pink
        '#AAFF00'  // Acid Green
    ],
    sunset: [
        '#FF9E00', // Amber
        '#FF5A00', // Orange-Red
        '#FF0058', // Raspberry
        '#BC027F', // Magenta
        '#7400B8', // Purple
        '#4B0082'  // Indigo
    ],
    ocean: [
        '#0077B6', // Ocean Blue
        '#00B4D8', // Light Blue
        '#48CAE4', // Sky Blue
        '#90E0EF', // Pale Blue
        '#00FFFF', // Cyan
        '#06D6A0'  // Teal
    ],
    forest: [
        '#2D6A4F', // Forest Green
        '#52B788', // Mint
        '#76C893', // Light Green
        '#B5E48C', // Pale Green
        '#D9ED92', // Yellow-Green
        '#34A0A4'  // Teal
    ],
    candy: [
        '#FF5E78', // Pink
        '#FF97B7', // Light Pink
        '#FFACC7', // Pale Pink
        '#FF7DFF', // Magenta
        '#B892FF', // Lavender
        '#55C1FF'  // Sky Blue
    ]
};

/*  currently active color palette */
export let activePalette = 'neon';

export function getRandomColorFromPalette() {
    const palette = colorPalettes[activePalette];
    const hexColor = palette[Math.floor(Math.random() * palette.length)];
    return new THREE.Color(hexColor);
}

export function ensureColorful(color) {
    const hsl = {};
    color.getHSL(hsl);
    
    // Ensure minimum saturation and brightness
    hsl.s = Math.max(config.minSaturation, hsl.s);
    hsl.l = Math.max(config.minBrightness, hsl.l);
    
    return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
}

export function generateGodforceColor(dominantHue, colorMode, colorSpread) {
    let hue;
    switch (colorMode) {
        case 'harmony':
            hue = (dominantHue + (Math.random() * colorSpread * 2 - colorSpread)) % 1;
            break;
        case 'contrast':
            hue = (dominantHue + 0.5 + (Math.random() * colorSpread * 2 - colorSpread)) % 1;
            break;
        case 'triad':
            const triadOffset = Math.floor(Math.random() * 3) * (1/3);
            hue = (dominantHue + triadOffset + (Math.random() * 0.1 - 0.05)) % 1;
            break;
        case 'rainbow':
            hue = Math.random();
            break;
        default:
            hue = Math.random();
    }
    
    // Ensure colors are vibrant by using minimum saturation and brightness
    return new THREE.Color().setHSL(
        hue,
        Math.random() * (1 - config.godforceMaxSaturation) + config.godforceMaxSaturation,
        Math.random() * (1 - config.godforceMinBrightness) + config.godforceMinBrightness
    );
}

/*  blend two colors with customizable intensity */
export function blendColors(color1, color2, blendFactor = 1.5) {
    const result = color1.clone();
    // Apply global speed factor to make color transitions slower
    const adjustedBlendFactor = Math.min(1, blendFactor * config.colorTransitionSpeed * 0.5);
    return result.lerp(color2, adjustedBlendFactor);
}