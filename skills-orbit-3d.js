import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  var canvas = document.getElementById('skills-canvas');
  var stage = document.querySelector('.skills-orbit-stage');
  if (!canvas || !stage) return;

  var prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var accent = 0x22d3ee;
  var loader = new THREE.TextureLoader();
  var BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';

  var ORBITS = [
    {
      radius: 2.05,
      tilt: 1.12,
      items: [
        { key: 'Py', file: 'python/python-original.png', phase: 0 },
        { key: 'JS', file: 'javascript/javascript-original.png', phase: 2.09 },
        { key: 'C++', file: 'cplusplus/cplusplus-original.png', phase: 4.18 },
      ],
    },
    {
      radius: 3.15,
      tilt: 0.38,
      items: [
        { key: 'Re', file: 'react/react-original.png', phase: 0 },
        { key: 'No', file: 'nodejs/nodejs-original.png', phase: 1.26 },
        { key: 'Dk', file: 'docker/docker-original.png', phase: 2.51 },
        { key: 'Pg', file: 'postgresql/postgresql-original.png', phase: 3.77 },
        { key: 'Mg', file: 'mongodb/mongodb-original.png', phase: 5.03 },
      ],
    },
    {
      radius: 4.25,
      tilt: -0.52,
      items: [
        { key: 'AWS', file: 'amazonwebservices/amazonwebservices-original.png', phase: 0.4 },
        { key: 'K8s', file: 'kubernetes/kubernetes-plain.png', phase: 1.65 },
        { key: 'Dj', file: 'django/django-plain.png', phase: 2.9 },
        { key: 'Fl', file: 'flask/flask-original.png', phase: 4.15 },
        { key: 'Git', file: 'git/git-original.png', phase: 5.4 },
      ],
    },
  ];

  var ORBIT_SPEED = 0.38;

  function loadTexture(url, onFallback) {
    return new Promise(function (resolve) {
      loader.load(
        url,
        function (tex) {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          resolve(tex);
        },
        undefined,
        function () {
          if (onFallback) resolve(onFallback());
          else resolve(null);
        }
      );
    });
  }

  function fallbackTexture(label, hue) {
    var c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    var ctx = c.getContext('2d');
    if (!ctx) return null;
    var grd = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    grd.addColorStop(0, 'hsl(' + hue + ',70%,42%)');
    grd.addColorStop(1, 'hsl(' + hue + ',45%,16%)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(34,211,238,0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 116, 116);
    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 26px Outfit, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.slice(0, 3).toUpperCase(), 64, 66);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function billboardTowardCamera(mesh, camera) {
    mesh.quaternion.copy(camera.quaternion);
  }

  function createOrbitLine(radius) {
    var pts = [];
    var segs = 96;
    for (var i = 0; i <= segs; i++) {
      var t = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
    }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var mat = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.24,
    });
    return new THREE.Line(geo, mat);
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 1.1, 11.5);

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = 22;
  controls.autoRotate = !prefersReduced;
  controls.autoRotateSpeed = 0.28;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var key = new THREE.DirectionalLight(0xe8fbff, 0.45);
  key.position.set(6, 8, 10);
  scene.add(key);

  var root = new THREE.Group();
  scene.add(root);

  var profileGroup = new THREE.Group();
  root.add(profileGroup);

  var satellites = [];

  function resize() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (w < 2 || h < 2) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  window.addEventListener('resize', resize, { passive: true });

  var rafId = 0;
  var sectionEl = document.getElementById('skills');
  var isVisible = true;
  var clock = new THREE.Clock();

  function startLoop() {
    if (rafId || document.hidden) return;
    clock.start();
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    clock.stop();
  }

  function tick() {
    if (!isVisible || document.hidden) {
      rafId = 0;
      return;
    }

    var dt = clock.getDelta();

    if (!prefersReduced) {
      satellites.forEach(function (sat) {
        sat.angle += sat.dir * ORBIT_SPEED * dt;
        sat.mesh.position.set(
          Math.cos(sat.angle) * sat.radius,
          0,
          Math.sin(sat.angle) * sat.radius
        );
        billboardTowardCamera(sat.mesh, camera);
      });
    } else {
      satellites.forEach(function (sat) {
        billboardTowardCamera(sat.mesh, camera);
      });
    }

    for (var p = 0; p < profileGroup.children.length; p++) {
      billboardTowardCamera(profileGroup.children[p], camera);
    }

    controls.update();
    renderer.render(scene, camera);

    rafId = requestAnimationFrame(tick);
  }

  function attachVisibilityObserver() {
    if (!sectionEl || typeof IntersectionObserver !== 'function') return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          isVisible = e.isIntersecting;
          if (isVisible && !document.hidden) {
            startLoop();
          } else {
            stopLoop();
          }
        });
      },
      { rootMargin: '100px', threshold: 0 }
    );
    io.observe(sectionEl);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopLoop();
    } else if (isVisible) {
      clock.getDelta();
      startLoop();
    }
  });

  async function build() {
    var profileTex = await loadTexture('profile.jpg', function () {
      return fallbackTexture('LS', 195);
    });

    var discR = 1.05;
    var discGeo = new THREE.CircleGeometry(discR, 72);
    var discMat = new THREE.MeshBasicMaterial({
      map: profileTex || undefined,
      color: profileTex ? 0xffffff : 0x334155,
      side: THREE.DoubleSide,
    });
    var disc = new THREE.Mesh(discGeo, discMat);

    var ringGeo = new THREE.RingGeometry(discR + 0.02, discR + 0.14, 72);
    var ringMat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    var ringMesh = new THREE.Mesh(ringGeo, ringMat);

    profileGroup.add(ringMesh);
    profileGroup.add(disc);

    var planeGeo = new THREE.PlaneGeometry(0.52, 0.52);
    var satIndex = 0;

    for (var o = 0; o < ORBITS.length; o++) {
      var orbit = ORBITS[o];
      var g = new THREE.Group();
      g.rotation.x = orbit.tilt;
      root.add(g);

      g.add(createOrbitLine(orbit.radius));

      for (var j = 0; j < orbit.items.length; j++) {
        var item = orbit.items[j];
        var url = BASE + item.file;
        var hue = (satIndex * 53 + 140) % 360;
        satIndex += 1;
        var tex = await loadTexture(url, function () {
          return fallbackTexture(item.key, hue);
        });
        var mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: true,
        });
        var mesh = new THREE.Mesh(planeGeo, mat);
        var ang = item.phase;
        mesh.position.set(
          Math.cos(ang) * orbit.radius,
          0,
          Math.sin(ang) * orbit.radius
        );
        g.add(mesh);

        satellites.push({
          mesh: mesh,
          radius: orbit.radius,
          angle: ang,
          dir: o % 2 === 0 ? 1 : -1,
        });
      }
    }

    resize();
    attachVisibilityObserver();
    syncVisibilityAndLoop();
  }

  function syncVisibilityAndLoop() {
    if (sectionEl && typeof sectionEl.getBoundingClientRect === 'function') {
      var br = sectionEl.getBoundingClientRect();
      var vh = window.innerHeight || 600;
      isVisible = br.top < vh && br.bottom > 48;
    }
    if (isVisible && !document.hidden) {
      startLoop();
    }
  }

  build().catch(function () {
    resize();
    attachVisibilityObserver();
    syncVisibilityAndLoop();
  });
})();
