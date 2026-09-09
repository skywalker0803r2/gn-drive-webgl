# GN Drive WebGL Experience

A Vite + Three.js + GSAP project that recreates a GN Drive particle jet and interactive neon core inspired by the GN Drive aesthetic.

## Overview

This project aims to provide a visual experience that blends:

- 3D core geometry and shell form
- GPU-style particle emission
- vortex and turbulence motion
- UnrealBloom post-processing
- a smooth Trans-AM mode toggle
- explanation panels for the mathematics and system design

## Features

- Three.js scene with OrbitControls
- custom GLSL shader particles
- animated engine core and orbital rings
- bloom glow and high-energy lighting
- responsive layout for desktop and mobile
- GitHub Pages deployment workflow

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages on pushes to the `main` branch.

## Notes

The current implementation is a polished interactive prototype aligned with the project plan: it emphasizes visual fidelity, educational UI, and a clean GitHub Pages-ready structure.
