// ========================= 3D INSTRUMENT MODELS =========================

// 3D model URLs from Sketchfab
export const MODEL_URLS = {
  ney: 'https://sketchfab.com/3d-models/ney-0661b44e756c49abb5bde6991b084de0',
  sax: 'https://sketchfab.com/3d-models/sax-f137c64c274d46ba8a7157450541ed0b',
  flute: 'https://sketchfab.com/3d-models/concert-flute-3a9cd128f61f4d9090eb76e43462aa4c',
  recorder: 'https://sketchfab.com/3d-models/recorder-70091cb4e22244b78919ecc6843a1d4b',
  trumpet: 'https://sketchfab.com/3d-models/trumpet-3f2d4f5b962340b2933012e1bc634d88'
};

// 3D scene management
export const threeScenes = {};
export const threeRenderers = {};
export const threeCameras = {};
export const threeModels = {};

// Fingering positions for 3D models (normalized coordinates)
export const FINGERING_POSITIONS = {
  flute: {
    C: [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.8, y: 0.3, z: 0.1}, {x: 0.9, y: 0.3, z: 0.1}, {x: 0.95, y: 0.3, z: 0.1}],
    'C#': [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    D: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    'D#': [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.8, y: 0.3, z: 0.1}, {x: 0.9, y: 0.3, z: 0.1}, {x: 0.95, y: 0.3, z: 0.1}],
    E: [{x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    F: [{x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    'F#': [{x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    G: [{x: 0.92, y: 0.3, z: 0.1}],
    'G#': [],
    A: [{x: 0.3, y: 0.3, z: 0.1}],
    'A#': [{x: 0.2, y: 0.3, z: 0.1}],
    B: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}]
  },
  recorder: {
    C: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.8, y: 0.3, z: 0.1}],
    'C#': [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    D: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}],
    'D#': [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.8, y: 0.3, z: 0.1}],
    E: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}],
    F: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}],
    'F#': [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}],
    G: [{x: 0.1, y: 0.3, z: 0.1}],
    'G#': [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}],
    A: [{x: 0.2, y: 0.3, z: 0.1}],
    'A#': [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}],
    B: [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}]
  },
  trumpet: {
    C: [],
    'C#': [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    D: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    'D#': [{x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    E: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}],
    F: [{x: 0.3, y: 0.3, z: 0.1}],
    'F#': [{x: 0.5, y: 0.3, z: 0.1}],
    G: [],
    'G#': [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    A: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}],
    'A#': [{x: 0.3, y: 0.3, z: 0.1}],
    B: [{x: 0.5, y: 0.3, z: 0.1}]
  },
  saxophone: {
    C: [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.8, y: 0.3, z: 0.1}, {x: 0.9, y: 0.3, z: 0.1}, {x: 0.95, y: 0.3, z: 0.1}],
    'C#': [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    D: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    'D#': [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.8, y: 0.3, z: 0.1}, {x: 0.9, y: 0.3, z: 0.1}, {x: 0.95, y: 0.3, z: 0.1}],
    E: [{x: 0.5, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    F: [{x: 0.7, y: 0.3, z: 0.1}, {x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    'F#': [{x: 0.85, y: 0.3, z: 0.1}, {x: 0.92, y: 0.3, z: 0.1}],
    G: [{x: 0.92, y: 0.3, z: 0.1}],
    'G#': [],
    A: [{x: 0.3, y: 0.3, z: 0.1}],
    'A#': [{x: 0.2, y: 0.3, z: 0.1}],
    B: [{x: 0.3, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}]
  },
  ney: {
    C: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    'C#': [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    D: [{x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}],
    'D#': [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}, {x: 0.7, y: 0.3, z: 0.1}],
    E: [{x: 0.4, y: 0.3, z: 0.1}, {x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}],
    F: [{x: 0.5, y: 0.3, z: 0.1}, {x: 0.6, y: 0.3, z: 0.1}],
    'F#': [{x: 0.6, y: 0.3, z: 0.1}],
    G: [],
    'G#': [{x: 0.1, y: 0.3, z: 0.1}],
    A: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}],
    'A#': [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}],
    B: [{x: 0.1, y: 0.3, z: 0.1}, {x: 0.2, y: 0.3, z: 0.1}, {x: 0.3, y: 0.3, z: 0.1}, {x: 0.4, y: 0.3, z: 0.1}]
  }
};

// Initialize 3D scene for an instrument
export function init3DScene(instrumentType, canvasId) {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found for ${instrumentType}`);
      return null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    // Create instrument-specific geometry
    let geometry, material;
    
    switch (instrumentType) {
      case 'flute':
        // Flute: long cylindrical body with head joint
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 8);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xe2e8f0, 
          shininess: 100,
          specular: 0x444444
        });
        break;
        
      case 'recorder':
        // Recorder: wooden cylindrical body
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 3.5, 8);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xd97706, 
          shininess: 30,
          specular: 0x222222
        });
        break;
        
      case 'trumpet':
        // Trumpet: complex curved shape (simplified as curved cylinder)
        geometry = new THREE.TorusGeometry(1.5, 0.2, 8, 16, Math.PI);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xffd700, 
          shininess: 120,
          specular: 0x666666
        });
        break;
        
      case 'saxophone':
        // Saxophone: curved conical shape
        geometry = new THREE.CylinderGeometry(0.5, 0.8, 3, 8);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xffd700, 
          shininess: 100,
          specular: 0x555555
        });
        break;
        
      case 'ney':
        // Ney: simple cylindrical reed flute
        geometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
        material = new THREE.MeshPhongMaterial({ 
          color: 0x8b4513, 
          shininess: 20,
          specular: 0x111111
        });
        break;
        
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshPhongMaterial({ color: 0x888888 });
    }
    
    const instrument = new THREE.Mesh(geometry, material);
    scene.add(instrument);
    
    // Position camera based on instrument type
    switch (instrumentType) {
      case 'flute':
        camera.position.set(0, 2, 6);
        break;
      case 'recorder':
        camera.position.set(0, 1.5, 5);
        break;
      case 'trumpet':
        camera.position.set(0, 0, 4);
        break;
      case 'saxophone':
        camera.position.set(0, 1, 5);
        break;
      case 'ney':
        camera.position.set(0, 1.5, 4);
        break;
      default:
        camera.position.set(0, 0, 5);
    }
    camera.lookAt(0, 0, 0);
    
    // Store references
    threeScenes[instrumentType] = scene;
    threeRenderers[instrumentType] = renderer;
    threeCameras[instrumentType] = camera;
    threeModels[instrumentType] = instrument;
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Slow rotation for better viewing
      if (instrument) {
        instrument.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    }
    animate();
    
    return { scene, camera, renderer, instrument };
    
  } catch (error) {
    console.error(`Failed to initialize 3D scene for ${instrumentType}:`, error);
    return null;
  }
}

// Update fingering indicators on 3D model
export function update3DFingering(instrumentType, note, computeSelected, pcName) {
  try {
    const scene = threeScenes[instrumentType];
    if (!scene) {
      console.warn(`3D scene not found for ${instrumentType}`);
      return;
    }
    
    // Remove existing fingering indicators (keep lights and main instrument)
    scene.children = scene.children.filter(child => 
      child.type === 'DirectionalLight' || 
      child.type === 'AmbientLight' || 
      child.type === 'PointLight' ||
      (child.type === 'Mesh' && child === threeModels[instrumentType])
    );
    
    const positions = FINGERING_POSITIONS[instrumentType]?.[note];
    if (!positions) {
      console.warn(`No fingering positions found for ${instrumentType} note ${note}`);
      return;
    }
    
    const { rootPc } = computeSelected();
    const notePc = pcName(rootPc);
    
    positions.forEach((pos, index) => {
      const geometry = new THREE.SphereGeometry(0.08, 12, 12);
      const material = new THREE.MeshPhongMaterial({ 
        color: notePc === rootPc ? 0xff4444 : 0x44ff44,
        transparent: true,
        opacity: 0.9,
        shininess: 50
      });
      const indicator = new THREE.Mesh(geometry, material);
      
      // Position the indicator relative to the instrument
      const scale = instrumentType === 'trumpet' ? 2 : 3;
      indicator.position.set(
        (pos.x - 0.5) * scale,
        (pos.y - 0.5) * 2,
        (pos.z - 0.5) * 1
      );
      
      // Add a subtle glow effect
      const glowGeometry = new THREE.SphereGeometry(0.12, 12, 12);
      const glowMaterial = new THREE.MeshPhongMaterial({ 
        color: notePc === rootPc ? 0xff6666 : 0x66ff66,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(indicator.position);
      scene.add(glow);
      
      scene.add(indicator);
    });
    
  } catch (error) {
    console.error(`Failed to update 3D fingering for ${instrumentType}:`, error);
  }
}

// Clean up 3D scene
export function cleanup3DScene(instrumentType) {
  try {
    const renderer = threeRenderers[instrumentType];
    if (renderer) {
      renderer.dispose();
      delete threeRenderers[instrumentType];
    }
    
    const scene = threeScenes[instrumentType];
    if (scene) {
      // Dispose of all geometries and materials
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      delete threeScenes[instrumentType];
    }
    
    delete threeCameras[instrumentType];
    delete threeModels[instrumentType];
    
  } catch (error) {
    console.error(`Failed to cleanup 3D scene for ${instrumentType}:`, error);
  }
}
