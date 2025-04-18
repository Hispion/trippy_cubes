import { config } from './config.js';

/** 
 * Track mouse position in normalized device coordinates
 * @type {THREE.Vector2} 
 */
export const mouse = new THREE.Vector2();

/** 
 * Raycaster for mouse interactions
 * @type {THREE.Raycaster} 
 */
export const raycaster = new THREE.Raycaster();

/* how strongly the mouse affects the projection depth */
export const mouseDepthInfluence = 7;

/* how quickly the piercing effect follows the mouse */
export const mouseFollowSpeed = 0.2;

/* maximum radius of the mouse influence area */
export const mouseInfluenceRadius = 4.0;

/* how strongly the mouse pierces through layers */
export const piercingStrength = 0.8;

/* Current mouse projection position in the 3D space */
export let mouseProjection = { x: 0, y: 0, z: 0 };

/* Track if mouse is currently active over the canvas */
export let mouseActive = false;

/**
 * Update mouse position when it moves
 * @param {MouseEvent} event - Mouse move event
 */
export function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseActive = true;
}

/**
 * Handle mouse leaving the canvas
 */
export function onMouseLeave() {
    mouseActive = false;
}

/**
 * Calculate projected mouse position in 3D space
 * @param {THREE.Camera} camera - Current camera
 * @param {Object} viewportCenter - Current viewport center
 */
export function updateMouseProjection(camera, viewportCenter) {
    raycaster.setFromCamera(mouse, camera);
    
    // Project the mouse ray to the average Z depth
    const t = (-viewportCenter.z - camera.position.z) / raycaster.ray.direction.z;
    
    const targetX = camera.position.x + raycaster.ray.direction.x * t;
    const targetY = camera.position.y + raycaster.ray.direction.y * t;
    const targetZ = viewportCenter.z; // Start at the current viewport depth
    
    // Smooth the mouse movement with lerp
    mouseProjection.x = mouseProjection.x + (targetX - mouseProjection.x) * mouseFollowSpeed;
    mouseProjection.y = mouseProjection.y + (targetY - mouseProjection.y) * mouseFollowSpeed;
    mouseProjection.z = mouseProjection.z + (targetZ - mouseProjection.z) * mouseFollowSpeed;
}

/**
 * Apply mouse piercing effect to a shape
 * @param {THREE.Object3D} shape - Shape to modify
 * @param {Object} position - Original position
 * @returns {Object} Modified position
 */
export function applyMousePiercingEffect(shape, position) {
    if (!mouseActive) return position;
    
    // Calculate distance from mouse projection in XY plane
    const dx = position.x - mouseProjection.x;
    const dy = position.y - mouseProjection.y;
    const distanceSquared = dx * dx + dy * dy;
    
    if (distanceSquared < mouseInfluenceRadius * mouseInfluenceRadius) {
        // Calculate influence based on distance (closer = stronger)
        const distance = Math.sqrt(distanceSquared);
        const influence = 1 - Math.min(1, distance / mouseInfluenceRadius);
        
        // Push the Z position based on mouse influence
        const depthEffect = (influence * mouseDepthInfluence * piercingStrength);
        position.z -= depthEffect;
    }
    
    return position;
}

/**
 * Initialize mouse interaction events
 */
export function initMouseInteraction() {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
}