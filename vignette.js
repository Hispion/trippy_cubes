import { config } from './config.js';

/* @tweakable how dark the vignette gets at its strongest point (0-1) */
const VIGNETTE_INTENSITY = 0.85;

/* @tweakable how far the vignette extends from the center (higher = larger bright area) */
const VIGNETTE_RADIUS = 1.2;

/* @tweakable how sharp the vignette falloff is (higher = sharper transition) */
const VIGNETTE_FALLOFF = 2.5;

/* @tweakable how much the vignette moves with the viewport center (0 = static, 1 = full follow) */
const VIGNETTE_FOLLOW = 0.8;

/* @tweakable scale factor for converting world space to UV space */
const WORLD_TO_UV_SCALE = 0.03;

/**
 * Creates and updates a vignette effect that follows the viewport center
 * @param {THREE.Scene} scene - The scene to add the vignette to
 * @returns {Object} - The vignette mesh and update function
 */
export function createVignette(scene) {
    // Create a full-screen quad for the vignette
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
            vignetteCenter: { value: new THREE.Vector2(0.5, 0.5) },
            intensity: { value: VIGNETTE_INTENSITY },
            radius: { value: VIGNETTE_RADIUS },
            falloff: { value: VIGNETTE_FALLOFF }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform vec2 vignetteCenter;
            uniform float intensity;
            uniform float radius;
            uniform float falloff;
            
            void main() {
                vec2 dist = vUv - vignetteCenter;
                float d = length(dist) / radius;
                float vignette = 1.0 - intensity * pow(smoothstep(0.0, 1.0, d), falloff);
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - vignette);
            }
        `
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1; // Ensure vignette renders on top
    scene.add(mesh);

    // Update function to move vignette with viewport
    function updateVignette(camera, viewportCenter) {
        const viewportPos = new THREE.Vector3();
        viewportPos.copy(viewportCenter);
        viewportPos.project(camera);
        
        // Convert to UV space (0 to 1) with configurable follow strength
        const centerX = (viewportPos.x * VIGNETTE_FOLLOW * WORLD_TO_UV_SCALE + 0.5);
        const centerY = (viewportPos.y * VIGNETTE_FOLLOW * WORLD_TO_UV_SCALE + 0.5);
        
        material.uniforms.vignetteCenter.value.set(centerX, centerY);
    }

    return {
        mesh,
        update: updateVignette
    };
}