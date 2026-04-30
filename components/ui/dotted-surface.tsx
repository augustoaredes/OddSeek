'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

// OddSeek lime palette: #CCFF00 ≈ rgb(0.8, 1.0, 0.0)
const DOT_R = 0.8;
const DOT_G = 1.0;
const DOT_B = 0.0;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const SEPARATION = 140;
    const AMOUNTX = 42;
    const AMOUNTY = 58;

    const getSize = () => ({ w: el.offsetWidth, h: el.offsetHeight });
    const { w, h } = getSize();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080a, 0.00014);

    const camera = new THREE.PerspectiveCamera(58, w / h, 1, 10000);
    camera.position.set(0, 380, 1300);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Geometry
    const total = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(total * 3);
    const colors    = new Float32Array(total * 3);

    let idx = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[idx * 3]     = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        colors[idx * 3]        = DOT_R;
        colors[idx * 3 + 1]    = DOT_G;
        colors[idx * 3 + 2]    = DOT_B;
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const material = new THREE.PointsMaterial({
      size: 6,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const pos = geometry.attributes.position.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          pos[i * 3 + 1] =
            Math.sin((ix + count) * 0.28) * 55 +
            Math.sin((iy + count) * 0.45) * 55;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.07;
    };

    const onResize = () => {
      const { w: nw, h: nh } = getSize();
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0', className)}
      {...props}
    />
  );
}
