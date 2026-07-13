import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Timer } from "three";

export default function ThreeHeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a dynamic glowing dot texture programmatically (no asset load needed)
    const createCircleTexture = () => {
      const size = 64;
      const canvasEl = document.createElement("canvas");
      canvasEl.width = size;
      canvasEl.height = size;
      const ctx = canvasEl.getContext("2d");
      if (ctx) {
        // Create beautiful radial glow
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }
      const texture = new THREE.CanvasTexture(canvasEl);
      return texture;
    };

    const particleTexture = createCircleTexture();

    // --- Create Geometric Objects ---
    // A math sculpture with a main polyhedral structure and a constellation particle cloud
    const geometry = new THREE.IcosahedronGeometry(2, 2); // 2 units radius, 2 detail subdivisions
    
    // Save original vertices for morphing math distortions
    const originalPositions = geometry.attributes.position.clone();
    const count = originalPositions.count;

    // Materials
    // Subtle white wireframe
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(wireframeMesh);

    // Glowing points (particles) at the vertices of the same geometry
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      depthWrite: false,
    });
    const pointsMesh = new THREE.Points(geometry, pointsMaterial);
    scene.add(pointsMesh);

    // Dynamic surrounding orbital particles (stars/nodes constellation)
    const extraParticlesCount = 60;
    const extraPositions = new Float32Array(extraParticlesCount * 3);
    const extraVelocities: number[] = [];
    const extraRadii: number[] = [];

    for (let i = 0; i < extraParticlesCount; i++) {
      // Position around the center in a spherical cloud
      const r = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      extraPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      extraPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      extraPositions[i * 3 + 2] = r * Math.cos(phi);

      extraRadii.push(r);
      // Small speeds
      extraVelocities.push((Math.random() - 0.5) * 0.2); // x speed
      extraVelocities.push((Math.random() - 0.5) * 0.2); // y speed
      extraVelocities.push((Math.random() - 0.5) * 0.2); // z speed
    }

    const extraGeometry = new THREE.BufferGeometry();
    extraGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(extraPositions, 3)
    );

    const extraPointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.4,
      map: particleTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const extraPoints = new THREE.Points(extraGeometry, extraPointsMaterial);
    scene.add(extraPoints);

    // Mouse tracking variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalized coordinates from -1 to 1
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize handling using ResizeObserver on container element
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width: newWidth, height: newHeight } = entry.contentRect;

      width = newWidth || 300;
      height = newHeight || 300;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    resizeObserver.observe(container);
    setIsLoaded(true);

    // Animation variables
    const timer = new Timer();

    // Render loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      timer.update();
      const time = timer.getElapsed();

      // 1. Morphing calculation (Procedural Mathematical Distortion on Icosahedron vertices)
      const positions = geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        // Original coordinates
        const x = originalPositions.getX(i);
        const y = originalPositions.getY(i);
        const z = originalPositions.getZ(i);

        // Calculate offset based on trigonometry (sine waves flowing through space)
        // Creating an organic "pulsing" and "morphing" effect
        const wave = Math.sin(time * 1.2 + x * 1.5 + y * 1.2) * 0.15;
        const waveY = Math.cos(time * 0.9 + y * 1.5 + z * 1.2) * 0.15;
        const waveZ = Math.sin(time * 1.5 + z * 1.5 + x * 1.2) * 0.15;

        positions.setXYZ(i, x + wave, y + waveY, z + waveZ);
      }
      positions.needsUpdate = true;

      // 2. Continuous rotation
      wireframeMesh.rotation.y = time * 0.08;
      wireframeMesh.rotation.x = time * 0.04;
      pointsMesh.rotation.y = time * 0.08;
      pointsMesh.rotation.x = time * 0.04;

      extraPoints.rotation.y = -time * 0.04;
      extraPoints.rotation.z = time * 0.02;

      // 3. Mouse Interaction (Lerped rotation and camera tilt for extreme fluidity)
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Add camera tilt / movement
      camera.position.x = targetX * 1.2;
      camera.position.y = targetY * 1.2;
      camera.lookAt(0, 0, 0);

      // Rotate extra orbits slightly with mouse
      extraPoints.rotation.x = targetY * 0.3;
      extraPoints.rotation.y = targetX * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      
      // Dipose Resources
      geometry.dispose();
      extraGeometry.dispose();
      wireframeMaterial.dispose();
      pointsMaterial.dispose();
      extraPointsMaterial.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center min-h-[350px] md:min-h-[500px]"
      id="hero-canvas-container"
    >
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-zinc-800 border-t-white animate-spin" />
        </div>
      )}
      
      {/* Glowing atmospheric gradient behind the scene */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Actual WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 block select-none pointer-events-none sm:pointer-events-auto"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
