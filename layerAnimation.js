import { config } from './config.js';

/* how much layers can move horizontally */
const LAYER_X_RANGE = 0.4;

/* how much layers can move vertically */
const LAYER_Y_RANGE = 0.2;

/* base speed of layer movement */
const LAYER_MOVEMENT_SPEED = 0.3;

/* how different each layer's movement timing is */
const LAYER_PHASE_OFFSET = 40;

/* how much wobble to add to movement */
const WOBBLE_INTENSITY = 0.8;

/* how fast the wobble oscillates */
const WOBBLE_FREQUENCY = 18;

/**
 * Calculates position offset for a specific layer
 */
export function getLayerOffset(layer, time) {
    const layerPhase = layer * LAYER_PHASE_OFFSET;
    
    // Basic sinusoidal movement
    const baseX = Math.sin(time * LAYER_MOVEMENT_SPEED + layerPhase) * LAYER_X_RANGE;
    const baseY = Math.cos(time * LAYER_MOVEMENT_SPEED * 0.7 + layerPhase) * LAYER_Y_RANGE;
    
    // Add wobble
    const wobbleX = Math.sin(time * WOBBLE_FREQUENCY + layer) * WOBBLE_INTENSITY;
    const wobbleY = Math.cos(time * WOBBLE_FREQUENCY * 1.3 + layer) * WOBBLE_INTENSITY;
    
    return {
        x: baseX + wobbleX,
        y: baseY + wobbleY
    };
}