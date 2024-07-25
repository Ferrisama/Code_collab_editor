import React, { useEffect, useRef, useContext } from "react";
import * as THREE from "three";
import { ThemeContext } from "../contexts/ThemeContext";
import "./BackgroundWaves.css";

const BackgroundWaves = () => {
  const mountRef = useRef(null);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    let scene, camera, renderer;
    let particles, geometry, material;
    let count = 0;

    const SEPARATION = 100,
      AMOUNTX = 40,
      AMOUNTY = 60;

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.set(0, 355, 122);

      geometry = new THREE.BufferGeometry();
      const positions = [];
      const scales = [];

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions.push(ix * SEPARATION - (AMOUNTX * SEPARATION) / 2);
          positions.push(0);
          positions.push(iy * SEPARATION - (AMOUNTY * SEPARATION) / 2);
          scales.push(1);
        }
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "scale",
        new THREE.Float32BufferAttribute(scales, 1)
      );

      material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(darkMode ? 0xffffff : 0x000000) },
        },
        vertexShader: `
          attribute float scale;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = scale * (400.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(darkMode ? 0x000000 : 0xffffff, 1);
      mountRef.current.appendChild(renderer.domElement);

      window.addEventListener("resize", onWindowResize, false);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      const positions = particles.geometry.attributes.position.array;
      const scales = particles.geometry.attributes.scale.array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i + 1] =
            Math.sin((ix + count) * 0.5) * 90 +
            Math.sin((iy + count) * 0.5) * 90;
          scales[i / 3] =
            (Math.sin((ix + count) * 0.5) + 1) * 7 +
            (Math.sin((iy + count) * 0.5) + 1) * 7;
          i += 3;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.06;
    }

    init();
    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [darkMode]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: darkMode
          ? "black"
          : "linear-gradient(to right, red, #f06d06)",
      }}
    />
  );
};

export default BackgroundWaves;
