import * as THREE from 'three';

(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  var prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var accent = 0x22d3ee;
  var group = new THREE.Group();
  scene.add(group);

  function makeSolidMaterial() {
    return new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.12,
      metalness: 0.35,
      roughness: 0.45,
      transparent: true,
      opacity: 0.9,
    });
  }

  var wireMat = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });

  var g1 = new THREE.IcosahedronGeometry(0.52, 0);
  var m1 = new THREE.Mesh(g1, makeSolidMaterial());
  m1.position.set(-2.1, 0.35, 0.2);
  var w1 = new THREE.Mesh(g1.clone(), wireMat);
  w1.scale.setScalar(1.12);
  m1.add(w1);

  var g2 = new THREE.TorusGeometry(0.38, 0.11, 16, 40);
  var m2 = new THREE.Mesh(g2, makeSolidMaterial());
  m2.position.set(1.85, -0.15, -0.4);
  var w2 = new THREE.Mesh(g2.clone(), wireMat);
  w2.scale.setScalar(1.08);
  m2.add(w2);

  var g3 = new THREE.OctahedronGeometry(0.42, 0);
  var m3 = new THREE.Mesh(g3, makeSolidMaterial());
  m3.position.set(0.15, 1.05, -0.8);
  var w3 = new THREE.Mesh(g3.clone(), wireMat);
  w3.scale.setScalar(1.1);
  m3.add(w3);

  var g4 = new THREE.TorusKnotGeometry(0.22, 0.07, 100, 12);
  var m4 = new THREE.Mesh(g4, makeSolidMaterial());
  m4.position.set(0.6, -1.0, 0.5);
  m4.rotation.x = Math.PI / 4;
  var w4 = new THREE.Mesh(g4.clone(), wireMat);
  w4.scale.setScalar(1.06);
  m4.add(w4);

  group.add(m1, m2, m3, m4);

  var particleCount = 320;
  var positions = new Float32Array(particleCount * 3);
  for (var i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var pMat = new THREE.PointsMaterial({
    color: accent,
    size: 0.045,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    sizeAttenuation: true,
  });
  var points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  var dir = new THREE.DirectionalLight(0xe0f7ff, 0.75);
  dir.position.set(5, 6, 6);
  scene.add(dir);
  var fill = new THREE.DirectionalLight(0x22d3ee, 0.25);
  fill.position.set(-4, -2, 4);
  scene.add(fill);

  var mouseX = 0;
  var mouseY = 0;
  var targetRotX = 0;
  var targetRotY = 0;

  function resize() {
    var parent = canvas.parentElement;
    if (!parent) return;
    var w = parent.clientWidth;
    var h = parent.clientHeight;
    if (w < 1 || h < 1) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener(
    'mousemove',
    function (e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1;
      var ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = nx * 0.22;
      targetRotX = ny * 0.16;
    },
    { passive: true }
  );

  var clock = new THREE.Clock();
  var rafId = 0;

  function tick() {
    var t = clock.getElapsedTime();

    mouseX += (targetRotY - mouseX) * 0.04;
    mouseY += (targetRotX - mouseY) * 0.04;

    if (!prefersReduced) {
      group.rotation.y = t * 0.11 + mouseX;
      group.rotation.x = Math.sin(t * 0.14) * 0.07 + mouseY;
      points.rotation.y = t * 0.02;

      m1.rotation.x = t * 0.38;
      m1.rotation.y = t * 0.32;
      m2.rotation.x = t * 0.48;
      m2.rotation.z = t * 0.22;
      m3.rotation.y = t * 0.42;
      m3.rotation.x = t * -0.28;
      m4.rotation.y = t * 0.55;
      m4.rotation.x = Math.PI / 4 + Math.sin(t * 0.3) * 0.15;
    }

    renderer.render(scene, camera);

    if (!prefersReduced && !document.hidden) {
      rafId = requestAnimationFrame(tick);
    }
  }

  if (prefersReduced) {
    renderer.render(scene, camera);
  } else {
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', function () {
    if (prefersReduced) return;
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      clock.getDelta();
      rafId = requestAnimationFrame(tick);
    }
  });
})();
