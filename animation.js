/**
 * Animation utilities for controlling animation timing and speeds
 */

import { config } from './config.js';

/*  overall animation speed multiplier (lower = slower) */
export const globalSpeedFactor = 0.5;

/**
 * Creates a time-scaled value that can be used for smooth animations
 * @param {number} baseSpeed - The base speed to scale
 * @returns {number} - Scaled speed value
 */
export function getScaledSpeed(baseSpeed) {
    return baseSpeed * globalSpeedFactor;
}

/**
 * Smoothly interpolates between two values based on a time factor
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
export function easeTransition(start, end, factor) {
    // Ease the transition with a cubic function
    const easedFactor = factor * factor * (3 - 2 * factor);
    return start + (end - start) * easedFactor;
}

/**
 * Creates a pulsing value based on current time
 * @param {number} time - Current time value
 * @param {number} frequency - How frequently the value pulses
 * @param {number} amplitude - How dramatically the value changes
 * @returns {number} - A value that oscillates between -amplitude and +amplitude
 */
export function createPulse(time, frequency, amplitude) {
    return Math.sin(time * frequency * globalSpeedFactor) * amplitude;
}