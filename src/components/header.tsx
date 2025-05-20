"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Image from "next/image";

export default function Header() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const aspect = width / height;
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    camera.position.set(0.6400214197326408, 0.7693951656368593, 0.4358921539792491);
    camera.rotation.set(-0.9155418670268607, 0.49688956026228526, 0.5551890427460977);
    camera.zoom = 12.95096578940797;
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const aspect = width / height;
      const frustumSize = 10;
      camera.left = (-frustumSize * aspect) / 2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Store for object animations
    interface AnimatedObject {
      object: THREE.Object3D;
      originalY: number;
      targetY: number;
      hovering: boolean;
    }

    const animatedObjects = new Map<string, AnimatedObject>();
    // Track home group hover state
    let homeGroupHovering = false;

    // Animation settings
    const HOVER_HEIGHT = 0.03;
    const ANIMATION_SPEED = 0.1;

    // Load GLTF model
    const loader = new GLTFLoader();
    let mainCollection: THREE.Group | null = null;
    let homeGroup: THREE.Group | null = null;
    loader.load(
      "/models/website-header.glb",
      (gltf: any) => {
        console.log("Model loaded:", gltf.scene);
        scene.add(gltf.scene);

        // Enable casting/receiving shadows on all meshes
        gltf.scene.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        mainCollection = gltf.scene.getObjectByName("main");
        homeGroup = gltf.scene.getObjectByName("home");
        console.log("Found main group:", mainCollection);
        console.log("Found home group:", homeGroup);

        // Store original positions of all objects for animation
        const storeObjectsForAnimation = (group: THREE.Group | null) => {
          if (!group) return;

          group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              const uuid = object.uuid;
              animatedObjects.set(uuid, {
                object: object,
                originalY: object.position.y,
                targetY: object.position.y,
                hovering: false,
              });
            }
          });
        };

        // Store all objects from both groups
        storeObjectsForAnimation(mainCollection);
        storeObjectsForAnimation(homeGroup);

        console.log(`Stored ${animatedObjects.size} objects for animation`);
      },
      undefined,
      (error: any) => {
        console.error("Error loading GLTF model:", error);
      }
    );

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5.0);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    // Shadow map
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.radius = 3;
    directionalLight.shadow.bias = -0.0001;

    const d = 5;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // Raycasting setup
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Raycast on pointer move (hover)
    const onPointerMove = (event: PointerEvent) => {
      if (!containerRef.current) return;

      // Get the bounding rectangle of the container
      const rect = containerRef.current.getBoundingClientRect();

      // Convert pointer to normalized device coordinates (-1 to +1)
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // Reset hover states
      homeGroupHovering = false;
      animatedObjects.forEach((animObj) => {
        animObj.hovering = false;
      });

      let foundHit = false;

      // Check if we're hovering over any object in the home group
      if (homeGroup) {
        const homeHits = raycaster.intersectObjects(homeGroup.children, true);
        if (homeHits.length > 0) {
          // If we hit any object in the home group, set all home group objects to hover
          homeGroupHovering = true;
          foundHit = true;
        }
      }

      // Check main collection if no homeGroup hit
      if (!foundHit && mainCollection) {
        const mainHits = raycaster.intersectObjects(mainCollection.children, true);
        if (mainHits.length > 0) {
          const intersected = mainHits[0].object;
          setObjectHovering(intersected);
          foundHit = true;
        }
      }

      // Update home group objects if they're hovering
      if (homeGroupHovering && homeGroup) {
        homeGroup.traverse((object) => {
          const animObj = animatedObjects.get(object.uuid);
          if (animObj) {
            animObj.hovering = true;
            animObj.targetY = animObj.originalY + HOVER_HEIGHT;
          }
        });
      }
    };

    // Helper function to set an object as hovering
    const setObjectHovering = (object: THREE.Object3D) => {
      // Find the object or its parent in our animated objects map
      let animObj = animatedObjects.get(object.uuid);

      if (!animObj) {
        // Try to find parent that is in the map
        let parent = object.parent;
        while (parent && !animObj) {
          animObj = animatedObjects.get(parent.uuid);
          parent = parent.parent;
        }
      }

      if (animObj) {
        animObj.hovering = true;
        animObj.targetY = animObj.originalY + HOVER_HEIGHT;
      }
    };

    window.addEventListener("pointermove", onPointerMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update object positions with smooth animation
      animatedObjects.forEach((animObj) => {
        if (animObj.hovering) {
          // Move up toward target
          animObj.object.position.y += (animObj.targetY - animObj.object.position.y) * ANIMATION_SPEED;
        } else {
          // Move down toward original position
          animObj.object.position.y += (animObj.originalY - animObj.object.position.y) * ANIMATION_SPEED;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
    };
  }, []);

  return (
    <section id="header" className="relative flex flex-row h-[650px] bg-light items-center justify-center">
      <div ref={containerRef} className="absolute inset-0 z-0 top-0 right-0 h-full min-w-full cursor-default" />
      <div className="md:mr-[40%] lg:mr-[50%] ml-8 flex flex-col justify-start z-10">
        <p className="text-7xl font-bold text-dark tracking-tight">Holmes</p>
        <p className="text-4xl mt-[-10px] text-dark tracking-tight">Nawat Suangburanakul</p>
        <div className="flex flex-row gap-3 mt-2">
          <a href="https://github.com/homns" target="_blank">
            <Image
              src="/icons/github-logo.svg"
              alt="github-icon"
              width={28}
              height={28}
              className="transition-transform duration-200 hover:scale-110"
            />
          </a>
          <a href="https://discord.com/users/520760336908025866" target="_blank">
            <Image
              src="/icons/discord-logo.svg"
              alt="discord-icon"
              width={28}
              height={28}
              className="transition-transform duration-200 hover:scale-110"
            />
          </a>
          <a href="https://www.instagram.com/_homns_/" target="_blank">
            <Image
              src="/icons/instagram-logo.svg"
              alt="instagram-icon"
              width={28}
              height={28}
              className="transition-transform duration-200 hover:scale-110"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
