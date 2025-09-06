import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const earthRef = useRef<THREE.Object3D>();
  const isMouseDownRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });

    renderer.setSize(600, 600);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/api/models/earth.glb',
      (gltf) => {
        const earthModel = gltf.scene;
        earthModel.scale.setScalar(1.8);
        earthModel.position.set(0, 0, 0);
        
        // Enable shadows
        earthModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(earthModel);
        earthRef.current = earthModel;
      },
      (progress) => {
        console.log('Loading progress:', progress.loaded / progress.total * 100 + '%');
      },
      (error) => {
        console.error('Error loading GLB model:', error);
        
        // Fallback: Create a basic Earth sphere
        const geometry = new THREE.SphereGeometry(1.2, 64, 32);
        const textureLoader = new THREE.TextureLoader();
        
        // Create a simple Earth-like texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        
        // Ocean blue background
        ctx.fillStyle = '#2173dc';
        ctx.fillRect(0, 0, 512, 256);
        
        // Simple continent shapes
        ctx.fillStyle = '#42a85f';
        ctx.fillRect(50, 80, 100, 60);
        ctx.fillRect(200, 70, 80, 80);
        ctx.fillRect(350, 90, 120, 50);
        ctx.fillRect(80, 180, 60, 40);
        ctx.fillRect(300, 160, 90, 60);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.MeshPhongMaterial({ 
          map: texture,
          bumpScale: 0.05,
          specular: new THREE.Color(0x333333),
          shininess: 100
        });
        
        const earth = new THREE.Mesh(geometry, material);
        earth.castShadow = true;
        earth.receiveShadow = true;
        scene.add(earth);
        earthRef.current = earth;
      }
    );

    // Atmosphere glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.25, 64, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    camera.position.z = 3;

    // Mouse interaction handlers
    const handleMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDownRef.current) {
        const deltaX = event.clientX - mouseRef.current.x;
        const deltaY = event.clientY - mouseRef.current.y;

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x += deltaY * 0.01;

        mouseRef.current.x = event.clientX;
        mouseRef.current.y = event.clientY;
      }
    };

    // Add event listeners
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation interpolation
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.05;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.05;

      // Idle rotation when not interacting
      if (!isMouseDownRef.current) {
        targetRotationRef.current.y += 0.005;
      }

      if (earthRef.current) {
        earthRef.current.rotation.x = currentRotationRef.current.x;
        earthRef.current.rotation.y = currentRotationRef.current.y;
      }

      atmosphere.rotation.x = currentRotationRef.current.x;
      atmosphere.rotation.y = currentRotationRef.current.y;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="rounded-full shadow-globe cursor-grab active:cursor-grabbing"
      data-testid="canvas-globe"
    />
  );
}
