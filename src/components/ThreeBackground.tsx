import React, { useEffect, useRef } from 'react';


declare global {
  interface Window {
    THREE: any;
  }
}

export const ThreeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    
    script.onload = () => {
      if (!canvasRef.current || !window.THREE) return;

      const THREE = window.THREE;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0d0a15);
      scene.fog = new THREE.Fog(0x0d0a15, 50, 200);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 25, 35); // Top-down view, smaller distance
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      renderer.shadowMap.enabled = true;
      
      // Clear any existing canvas
      while (canvasRef.current.firstChild) {
        canvasRef.current.removeChild(canvasRef.current.firstChild);
      }
      canvasRef.current.appendChild(renderer.domElement);

      // Colors matching our theme
      const colors = {
        purple: 0x8b5cf6,
        purpleLight: 0xa78bfa,
        neonPink: 0xf472b6,
        neonGreen: 0x4ade80,
        neonYellow: 0xfbbf24,
        neonOrange: 0xfb923c,
        road: 0x1a1230
      };

      // Minimal lighting
      const ambientLight = new THREE.AmbientLight(0x6b46c1, 0.2);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
      mainLight.position.set(20, 50, 20);
      scene.add(mainLight);

      // Ground
      const roadGeometry = new THREE.PlaneGeometry(200, 200);
      const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: colors.road,
        roughness: 0.8,
        metalness: 0.2
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      scene.add(road);

      // Smaller buildings
      const buildings: any[] = [];
      const buildingTypes = [
            { name: 'office', color: colors.purpleLight },
            { name: 'hospital', color: colors.neonGreen },
            { name: 'school', color: colors.neonYellow },
            { name: 'residential', color: colors.neonPink }
        ];

      function createBuilding(x: number, z: number, type: any) {
        // Smaller buildings
        const width = 2 + Math.random() * 2;
        const height = 5 + Math.random() * 8;
        const depth = 2 + Math.random() * 2;

        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2a5f,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0x2d1a4f,
            emissiveIntensity: 0.15
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height / 2, z);

        // Building outline
        const edges = new THREE.EdgesGeometry(buildingGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: colors.purple, opacity: 0.5, transparent: true });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        building.add(wireframe);

        // Top indicator light (smaller)
        const topGeometry = new THREE.BoxGeometry(width, 0.2, depth);
        const topMaterial = new THREE.MeshBasicMaterial({ color: type.color, transparent: true, opacity: 0.6 });
        const topLight = new THREE.Mesh(topGeometry, topMaterial);
        topLight.position.y = height / 2;
        building.add(topLight);

        scene.add(building);
        buildings.push(building);
        return building;
      }

      // Generate smaller city
      for (let x = -40; x < 40; x += 8) {
        for (let z = -40; z < 40; z += 8) {
            if (Math.abs(x) > 6 || Math.abs(z) > 6) {
                const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
                createBuilding(x + (Math.random() - 0.5) * 2, z + (Math.random() - 0.5) * 2, type);
            }
        }
      }

      // Simple vehicles (fewer, smaller)
      const vehicles: any[] = [];
      
      class Vehicle {
        mesh: any;
        lane: number;
        speed: number;
        
        constructor() {
            const lanes = [-4, -1.5, 1.5, 4];
            this.lane = lanes[Math.floor(Math.random() * lanes.length)];
            
            const geometry = new THREE.BoxGeometry(0.6, 0.3, 1.2);
            const neonColors = [colors.purple, colors.neonPink, colors.neonGreen];
            const color = neonColors[Math.floor(Math.random() * neonColors.length)];
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.3,
                roughness: 0.3,
                metalness: 0.8
            });
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(this.lane, 0.2, -60);
            this.speed = 0.2 + Math.random() * 0.2;
            scene.add(this.mesh);
        }

        update() {
            this.mesh.position.z += this.speed;
        }

        remove() {
            scene.remove(this.mesh);
        }
      }

      // Mouse controls (hover + click based)
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let cameraRotation = { x: 0, y: 0 };

      const handleMouseDown = (e: MouseEvent) => {
          isDragging = true;
          previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const handleMouseMove = (e: MouseEvent) => {
          if (isDragging) {
              const deltaX = e.clientX - previousMousePosition.x;
              const deltaY = e.clientY - previousMousePosition.y;
              
              cameraRotation.y += deltaX * 0.003; // Slower rotation
              cameraRotation.x += deltaY * 0.003;
              cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
              
              const radius = 35; // Smaller radius
              camera.position.x = Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x) * radius;
              camera.position.y = Math.sin(cameraRotation.x) * radius + 25;
              camera.position.z = Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x) * radius;
              camera.lookAt(0, 0, 0);
              
              previousMousePosition = { x: e.clientX, y: e.clientY };
          }
      };

      const handleMouseUp = () => {
          isDragging = false;
      };

      const handleWheel = (e: WheelEvent) => {
          e.preventDefault();
          const zoomSpeed = 0.05;
          const direction = e.deltaY > 0 ? 1 : -1;
          const length = camera.position.length();
          const newLength = Math.max(20, Math.min(60, length + direction * zoomSpeed * 5));
          camera.position.multiplyScalar(newLength / length);
      };

      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      renderer.domElement.addEventListener('wheel', handleWheel);

      // Hover effect on vehicles
      renderer.domElement.style.pointerEvents = 'auto';
      renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';

      // Window resize
      const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      // Optimized animation loop
      let frame = 0;
      
      function animate() {
          requestAnimationFrame(animate);

          // Spawn vehicles less frequently
          if (frame % 120 === 0 && vehicles.length < 6) {
              vehicles.push(new Vehicle());
          }

          // Update vehicles
          for (let i = vehicles.length - 1; i >= 0; i--) {
              vehicles[i].update();
              if (vehicles[i].mesh.position.z > 60) {
                  vehicles[i].remove();
                  vehicles.splice(i, 1);
              }
          }

          // Very subtle building glow animation
          if (frame % 60 === 0) {
              buildings.forEach((b, i) => {
                  const opacity = 0.1 + Math.sin(frame * 0.01 + i) * 0.05;
                  if (b.children) {
                      b.children.forEach((child: any) => {
                          if (child.material && child.material.opacity !== undefined) {
                              child.material.opacity = opacity;
                          }
                      });
                  }
              });
          }

          frame++;
          renderer.render(scene, camera);
      }

      animate();

      // Cleanup
      return () => {
          window.removeEventListener('resize', handleResize);
          renderer.domElement.removeEventListener('mousedown', handleMouseDown);
          renderer.domElement.removeEventListener('mousemove', handleMouseMove);
          renderer.domElement.removeEventListener('mouseup', handleMouseUp);
          renderer.domElement.removeEventListener('wheel', handleWheel);
          renderer.dispose();
          if (canvasRef.current && renderer.domElement.parentNode) {
              renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
      };
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 0,
        opacity: 0.3 // Subtle background
      }}
    />
  );
};

export default ThreeBackground;

