import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// Add to your global variables
let sceneTOI, cameraTOI, controlsTOI;
let starTOI, planetsTOI = [];
let animationIdTOI;
// Add to your global variables
let toiLabels = [];

// Global variables for the rendering engine
let renderer, canvas;
// Add to your global variables
let habitabilityCheckUI;
let selectedExoPlanet = null;

// Global variables for the Solar System
let sceneSolar, cameraSolar, controlsSolar;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars,
  planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let animationIdSolar;
let isPaused = false;
let planetMeshes; // For hover detection

// Global variables for the Exoplanet System
let sceneExo, cameraExo, controlsExo;
let starExo, planetsExo = [];
let animationIdExo;

let activeSystem = 'solar';

// Add to your global variables
let currentExoSystem = 'k2'; // 'k2' or 'toi'

// Planet data for info box and search (shared)
const planetData = {
  mercury: { name: "Mercury", type: "Terrestrial", diameter: "4,879 km", distance: "57.9 million km", orbit: "88 days", description: "The smallest and innermost planet in the Solar System.", texture: "../img/mercury_hd.jpg", size: 2, mass: "3.30 × 10²³ kg", radius: "2,439.7 km" },
  venus: { name: "Venus", type: "Terrestrial", diameter: "12,104 km", distance: "108.2 million km", orbit: "225 days", description: "Second planet from the Sun, similar in size to Earth.", texture: "../img/venus_hd.jpg", size: 3, mass: "4.87 × 10²⁴ kg", radius: "6,051.8 km" },
  earth: { name: "Earth", type: "Terrestrial", diameter: "12,742 km", distance: "149.6 million km", orbit: "365.25 days", description: "Our home planet.", texture: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg", size: 4, mass: "5.97 × 10²⁴ kg", radius: "6,371 km" },
  mars: { name: "Mars", type: "Terrestrial", diameter: "6,779 km", distance: "227.9 million km", orbit: "687 days", description: "The Red Planet.", texture: "../img/mars_hd.jpg", size: 3.5, mass: "6.42 × 10²³ kg", radius: "3,389.5 km" },
  jupiter: { name: "Jupiter", type: "Gas Giant", diameter: "139,820 km", distance: "778.5 million km", orbit: "12 years", description: "Largest planet.", texture: "../img/jupiter_hd.jpg", size: 10, mass: "1.90 × 10²⁷ kg", radius: "69,911 km" },
  saturn: { name: "Saturn", type: "Gas Giant", diameter: "116,460 km", distance: "1.4 billion km", orbit: "29 years", description: "Famous rings.", texture: "../img/saturn_hd.jpg", size: 8, mass: "5.68 × 10²⁶ kg", radius: "58,232 km" },
  uranus: { name: "Uranus", type: "Ice Giant", diameter: "50,724 km", distance: "2.9 billion km", orbit: "84 years", description: "Sideways rotation.", texture: "../img/uranus_hd.jpg", size: 6, mass: "8.68 × 10²⁵ kg", radius: "25,362 km" },
  neptune: { name: "Neptune", type: "Ice Giant", diameter: "49,244 km", distance: "4.5 billion km", orbit: "165 years", description: "Windiest planet.", texture: "../img/neptune_hd.jpg", size: 5, mass: "1.02 × 10²⁶ kg", radius: "24,622 km" },
  sun: { name: "Sun", type: "Star", diameter: "1,391,000 km", distance: "0 km", orbit: "25-35 days", description: "The star at the center.", texture: "../img/sun_hd.jpg", size: 20, mass: "1.989 × 10³⁰ kg", radius: "695,700 km" }
};

let mercury_orbit_radius = 50, venus_orbit_radius = 60, earth_orbit_radius = 70, mars_orbit_radius = 80, jupiter_orbit_radius = 100, saturn_orbit_radius = 120, uranus_orbit_radius = 140, neptune_orbit_radius = 160;
let mercury_revolution_speed = 2, venus_revolution_speed = 1.5, earth_revolution_speed = 1, mars_revolution_speed = 0.8, jupiter_revolution_speed = 0.7, saturn_revolution_speed = 0.6, uranus_revolution_speed = 0.5, neptune_revolution_speed = 0.4, rotation_speed = 0.005;

// Global popup variables - moved to global scope to prevent multiple instances
const popup = document.getElementById("planetPopup");
const closePopup = document.getElementById("closePopup");
const popup3D = document.getElementById("popup3D");
let popupRenderer, popupScene, popupCamera, popupControls, popupPlanet, popupAnimationId;
let popupEventListenersSetup = false; // Flag to prevent duplicate event listeners

// --- CORE SYSTEM SWITCHING LOGIC ---
function init() {
  canvas = document.getElementById('c');
  if (!canvas) {
    console.error("Canvas element with id 'c' not found.");
    return;
  }
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Initialize both scenes but don't add them to the renderer yet
  setupSolarScene();
  setupExoScene();

  // Start with the Solar System
  showSolarSystem();

  // Set up popup event listeners once
  setupPopupListeners();

  window.addEventListener("resize", onWindowResize, false);

  // Set up habitability UI
  setupHabitabilityUI();
  
  // Add event listener to the habitability button
  document.getElementById('habitabilityBtn').addEventListener('click', showHabitabilityCheck);

  setupTOIScene();
  
  // Add event listener to the TOI button
  document.getElementById('habitabilityBtnTOI').addEventListener('click', showHabitabilityCheckTOI);

  // REMOVE THESE EVENT LISTENERS FROM HERE - they're already at the bottom
  /*
  document.getElementById('k2SystemBtn').addEventListener('click', () => {
    if (activeSystem === 'exo' && currentExoSystem !== 'k2') {
      currentExoSystem = 'k2';
      loadK2System();
    }
  });

  document.getElementById('toiSystemBtn').addEventListener('click', () => {
    if (activeSystem === 'exo' && currentExoSystem !== 'toi') {
      currentExoSystem = 'toi';
      loadTOISystem();
    }
  });
  */

  document.addEventListener('DOMContentLoaded', () => {
    setupTOIHabitabilityListeners();
  });

  // ADD SYSTEM SWITCH EVENT LISTENERS HERE INSTEAD:
  // Replace the existing event listeners with these:
  document.getElementById('home').addEventListener('click', showHome);
  document.getElementById('solarBtn').addEventListener('click', showSolarSystem);
  document.getElementById('exoBtn').addEventListener('click', showExoSystem);
  document.getElementById('toiBtn').addEventListener('click', showTOISystem);

}

// Add this new function
function setupTOIHabitabilityListeners() {
  const habitabilityBtnTOI = document.getElementById('habitabilityBtnTOI');
  const closeHabitabilityTOI = document.getElementById('closeHabitabilityTOI');
  const checkHabitabilityTOI = document.getElementById('checkHabitabilityTOI');
  
  if (habitabilityBtnTOI) {
    habitabilityBtnTOI.addEventListener('click', showHabitabilityCheckTOI);
  }
  
  if (closeHabitabilityTOI) {
    closeHabitabilityTOI.addEventListener('click', closeHabitabilityCheckTOI);
  }
  
  if (checkHabitabilityTOI) {
    checkHabitabilityTOI.addEventListener('click', checkHabitabilityTOI);
  }
}

function stopAndClearScenes() {
  // Cancel any running animations
  if (animationIdSolar) {
    cancelAnimationFrame(animationIdSolar);
    animationIdSolar = null;
  }
  if (animationIdExo) {
    cancelAnimationFrame(animationIdExo);
    animationIdExo = null;
  }
  if (animationIdTOI) {
    cancelAnimationFrame(animationIdTOI);
    animationIdTOI = null;
  }

  // Clear children from all scenes
  if (sceneSolar) {
    while (sceneSolar.children.length > 0) {
      sceneSolar.remove(sceneSolar.children[0]);
    }
  }
  if (sceneExo) {
    while (sceneExo.children.length > 0) {
      sceneExo.remove(sceneExo.children[0]);
    }
  }
  if (sceneTOI) {
    while (sceneTOI.children.length > 0) {
      sceneTOI.remove(sceneTOI.children[0]);
    }
  }

  // Reset planet arrays
  planetsExo = [];
  planetsTOI = [];
}

function showHome() {
  document.querySelectorAll('#systemSwitch button').forEach(btn => {
      btn.classList.remove('active');
  });
  document.getElementById('home').classList.add('active');
  // Your home page logic...
  document.querySelectorAll('#systemSwitch button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('solarBtn').classList.add('active');
}

function showSolarSystem() {
  stopAndClearScenes();
  resetUI();
  activeSystem = 'solar';

  // Set up UI visibility
  document.getElementById('solarUI').style.display = 'block';
  document.getElementById('exoUI').style.display = 'none';
  document.getElementById('toiUI').style.display = 'none'; // Add this line
  document.body.className = '';

  // Re-create the solar system
  setupSolarScene();

  // Enable correct controls
  if (controlsExo) controlsExo.enabled = false;
  if (controlsSolar) controlsSolar.enabled = true;
  if (controlsTOI) controlsTOI.enabled = false; // Add this line

  // Render the correct scene
  renderer.setAnimationLoop(() => {
    animateSolarSystem();
  });
  // Replace with:
  removeAllLabels();

  // document.getElementById('solarBtn').classList.add('active');
  // document.getElementById('exoBtn').classList.remove('active');
  // document.getElementById('toiBtn').classList.remove('active');
  document.querySelectorAll('#systemSwitch button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('solarBtn').classList.add('active');
}

function showExoSystem() {
  console.log("showExoSystem called");
  
  stopAndClearScenes();
  removeAllLabels();
  resetUI();
  activeSystem = 'exo';

  // Set up UI visibility - ensure TOI UI is hidden
  document.getElementById('solarUI').style.display = 'none';
  document.getElementById('exoUI').style.display = 'block';
  document.getElementById('toiUI').style.display = 'none'; // Add this line
  document.body.className = 'exo-body';

  // Load the current exoplanet system
  loadK2System();
  
  // Enable correct controls
  if (controlsSolar) controlsSolar.enabled = false;
  if (controlsExo) controlsExo.enabled = true;
  if (controlsTOI) controlsTOI.enabled = false;

  // Update button states
  // document.getElementById('solarBtn').classList.remove('active');
  // document.getElementById('exoBtn').classList.add('active');
  // document.getElementById('toiBtn').classList.remove('active'); // Add this line
  document.querySelectorAll('#systemSwitch button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('solarBtn').classList.add('active');
}

function showTOISystem() {
  console.log("showTOISystem called");
  
  stopAndClearScenes();
  removeAllLabels();
  resetUI();
  activeSystem = 'toi';

  // Set up UI visibility
  document.getElementById('solarUI').style.display = 'none';
  document.getElementById('exoUI').style.display = 'none';
  document.getElementById('toiUI').style.display = 'block';
  document.body.className = 'exo-body';

  // Re-create the TOI system
  setupTOIScene();

  // Enable correct controls
  if (controlsSolar) controlsSolar.enabled = false;
  if (controlsExo) controlsExo.enabled = false;
  if (controlsTOI) controlsTOI.enabled = true;

  // Render the correct scene
  renderer.setAnimationLoop(() => {
    animateTOISystem();
  });
  
  // Initialize TOI labels
  initTOISystemLabels();

  // Update button states
  // document.getElementById('solarBtn').classList.remove('active');
  // document.getElementById('exoBtn').classList.remove('active');
  // document.getElementById('toiBtn').classList.add('active');
  document.querySelectorAll('#systemSwitch button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('solarBtn').classList.add('active');
  
  // Set up TOI habitability event listeners - ADD THIS LINE
  setupTOIEventListeners();
}


function loadK2System() {
  // Re-create the K2-239 system
  setupExoScene();
  
  // Enable correct controls
  if (controlsSolar) controlsSolar.enabled = false;
  if (controlsExo) controlsExo.enabled = true;
  if (controlsTOI) controlsTOI.enabled = false;

  // Render the correct scene
  renderer.setAnimationLoop(() => {
    animateExoSystem();
  });
  
  // Initialize labels
  initExoSystemLabels();
  
  // Update UI information
  updateExoUIInfo('K2-239 (Red Dwarf)', '3 Rocky Worlds', '101 light-years from Earth', '2018 (Kepler Space Telescope)');
  
  // Update system selector
  document.getElementById('k2SystemBtn').classList.add('active');
  document.getElementById('toiSystemBtn').classList.remove('active');
}

function updateExoUIInfo(star, planets, distance, discovery) {
  document.getElementById('starInfo').textContent = star;
  document.getElementById('planetInfo').textContent = planets;
  document.getElementById('distanceInfo').textContent = distance;
  document.getElementById('discoveryInfo').textContent = discovery;
  document.getElementById('distanceValue').textContent = distance;
}

// --- SETUP FUNCTIONS FOR EACH SYSTEM ---
function setupSolarScene() {
  sceneSolar = new THREE.Scene();
  cameraSolar = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
  //cameraSolar.position.z = 150;

  // Position camera higher up and further back for a top-down view
  cameraSolar.position.set(0, 100, 220); // x, y, z coordinates
  
  // Point the camera downward toward the center of the scene
  cameraSolar.lookAt(0, 0, 0);


  setSkyBoxSolar(sceneSolar);

  // Planet creation
  planet_earth = createPlanet('earth', 4, 100, 100, 'standard');
  planet_sun = createPlanet('sun', 20, 100, 100, 'basic');
  planet_mercury = createPlanet('mercury', 2, 100, 100, 'standard');
  planet_venus = createPlanet('venus', 3, 100, 100, 'standard');
  planet_mars = createPlanet('mars', 3.5, 100, 100, 'standard');
  planet_jupiter = createPlanet('jupiter', 10, 100, 100, 'standard');
  planet_saturn = createPlanet('saturn', 8, 100, 100, 'standard');
  planet_uranus = createPlanet('uranus', 6, 100, 100, 'standard');
  planet_neptune = createPlanet('neptune', 5, 100, 100, 'standard');

  sceneSolar.add(planet_earth, planet_sun, planet_mercury, planet_venus, planet_mars,
    planet_jupiter, planet_saturn, planet_uranus, planet_neptune);
  planetMeshes = [planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune];

  const sunLight = new THREE.PointLight(0xffffff, 1.5, 0);
  sunLight.position.copy(planet_sun.position);
  sceneSolar.add(sunLight);
  const ambientLight = new THREE.AmbientLight(0x333333);
  sceneSolar.add(ambientLight);

  createRing(mercury_orbit_radius, sceneSolar);
  createRing(venus_orbit_radius, sceneSolar);
  createRing(earth_orbit_radius, sceneSolar);
  createRing(mars_orbit_radius, sceneSolar);
  createRing(jupiter_orbit_radius, sceneSolar);
  createRing(saturn_orbit_radius, sceneSolar);
  createRing(uranus_orbit_radius, sceneSolar);
  createRing(neptune_orbit_radius, sceneSolar);

  controlsSolar = new OrbitControls(cameraSolar, renderer.domElement);
  controlsSolar.minDistance = 12;
  controlsSolar.maxDistance = 1000;

  setupSolarEventListeners();
}

function setupExoScene() {
  sceneExo = new THREE.Scene();
  cameraExo = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  //cameraExo.position.z = 25;

  // Position camera higher up and further back for a top-down view
  cameraExo.position.set(0, 25, 25); // x, y, z coordinates
  
  // Point the camera downward toward the center of the scene
  cameraExo.lookAt(0, 0, 0);

  controlsExo = new OrbitControls(cameraExo, renderer.domElement);
  controlsExo.enableDamping = true;
  controlsExo.dampingFactor = 0.05;
  controlsExo.rotateSpeed = 0.5;

  const ambientLight = new THREE.AmbientLight(0x333333);
  sceneExo.add(ambientLight);
  const light1 = new THREE.PointLight(0xff7f50, 1, 100);
  light1.position.set(5, 5, 5);
  sceneExo.add(light1);
  const light2 = new THREE.PointLight(0x87cefa, 1, 100);
  light2.position.set(-5, -5, -5);
  sceneExo.add(light2);

  const starGeometry = new THREE.SphereGeometry(2, 32, 32);
  const starMaterial = new THREE.MeshPhongMaterial({ color: 0xff5500, emissive: 0xff4500, specular: 0xff8844, shininess: 10 });
  starExo = new THREE.Mesh(starGeometry, starMaterial);
  sceneExo.add(starExo);
  const starGlowGeometry = new THREE.SphereGeometry(2.3, 32, 32);
  const starGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.3 });
  const starGlow = new THREE.Mesh(starGlowGeometry, starGlowMaterial);
  sceneExo.add(starGlow);

  createExoPlanet('K2-239 b', 0.5, 0x4a87c9, 6, 4);
  createExoPlanet('K2-239 c', 0.6, 0x5fa3bf, 10, 3);
  createExoPlanet('K2-239 d', 0.55, 0x7ab3c5, 14, 2.5);

  addBackgroundStarsExo();
}

function resetUI() {
  // Hide info box and popup
  hidePlanetInfo();
  if (popup) {
    popup.classList.add('hidden');
  }
  // Clean up any existing popup resources when switching systems
  disposePopupResources();

  // Reset search box
  const planetTypeInput = document.getElementById("planetTypeInput");
  const planetSelect = document.getElementById("planetSelect");
  if (planetTypeInput && planetSelect) {
    planetTypeInput.value = '';
    // Re-populate dropdown to reset it
    const populateDropdown = (type) => {
      planetSelect.innerHTML = '<option value="">-- Select Planet --</option>';
      Object.keys(planetData).forEach(key => {
        const pData = planetData[key];
        if (pData.type.toLowerCase().includes(type) || (key === "sun" && "star".includes(type)) || type === "") {
          const opt = document.createElement("option");
          opt.value = key;
          opt.textContent = pData.name;
          planetSelect.appendChild(opt);
        }
      });
    };
    populateDropdown('');
  }
}

// --- SHARED HELPER FUNCTIONS ---
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (renderer) {
    renderer.setSize(width, height);
  }

  if (activeSystem === 'solar' && cameraSolar) {
    cameraSolar.aspect = width / height;
    cameraSolar.updateProjectionMatrix();
  } else if (activeSystem === 'exo' && cameraExo) {
    cameraExo.aspect = width / height;
    cameraExo.updateProjectionMatrix();
  }
}

// --- SOLAR SYSTEM HELPER FUNCTIONS ---
function setSkyBoxSolar(scene) {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 10000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const radius = 800 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    const colorVariation = Math.random();
    colors[i3] = 0.7 + 0.3 * colorVariation;
    colors[i3 + 1] = 0.7 + 0.3 * colorVariation;
    colors[i3 + 2] = 0.8 + 0.2 * colorVariation;
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: true, vertexColors: true });
  const skybox = new THREE.Points(starGeometry, starMaterial);
  scene.add(skybox);
}

function createPlanet(name, radius, widthSegments, heightSegments, meshType) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  let material;
  try {
    const loader = new THREE.TextureLoader();
    const planetTexture = loader.load(planetData[name].texture);
    material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });
  } catch (e) {
    const color = meshType == 'standard' ? 0xaaaaaa : 0xffff00;
    material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ color: color }) : new THREE.MeshBasicMaterial({ color: color });
  }
  const planet = new THREE.Mesh(geometry, material);
  planet.name = name;
  return planet;
}

function createRing(innerRadius, scene) {
  const outerRadius = innerRadius + 0.5;
  const thetaSegments = 100;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function animateSolarSystem() {
  if (!isPaused) {
    planet_earth.rotation.y += rotation_speed;
    planet_sun.rotation.y += rotation_speed;
    planet_mercury.rotation.y += rotation_speed;
    planet_venus.rotation.y += rotation_speed;
    planet_mars.rotation.y += rotation_speed;
    planet_jupiter.rotation.y += rotation_speed;
    planet_saturn.rotation.y += rotation_speed;
    planet_uranus.rotation.y += rotation_speed;
    planet_neptune.rotation.y += rotation_speed;
    planetRevolver(Date.now(), mercury_revolution_speed, planet_mercury, mercury_orbit_radius, planet_sun);
    planetRevolver(Date.now(), venus_revolution_speed, planet_venus, venus_orbit_radius, planet_sun);
    planetRevolver(Date.now(), earth_revolution_speed, planet_earth, earth_orbit_radius, planet_sun);
    planetRevolver(Date.now(), mars_revolution_speed, planet_mars, mars_orbit_radius, planet_sun);
    planetRevolver(Date.now(), jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius, planet_sun);
    planetRevolver(Date.now(), saturn_revolution_speed, planet_saturn, saturn_orbit_radius, planet_sun);
    planetRevolver(Date.now(), uranus_revolution_speed, planet_uranus, uranus_orbit_radius, planet_sun);
    planetRevolver(Date.now(), neptune_revolution_speed, planet_neptune, neptune_orbit_radius, planet_sun);
  }
  if (controlsSolar) {
    controlsSolar.update();
  }
  renderer.render(sceneSolar, cameraSolar);
}

function planetRevolver(time, speed, planet, orbitRadius, sun) {
  if (isPaused) return;
  const orbitSpeedMultiplier = 0.001;
  const planetAngle = time * orbitSpeedMultiplier * speed;
  planet.position.x = sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = sun.position.z + orbitRadius * Math.sin(planetAngle);
}

function setupSolarEventListeners() {
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? 'Play' : 'Pause';
    });
  }
  setupHoverDetectionSolar();
  setupSearchBoxSolar();
}

function setupHoverDetectionSolar() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  if (canvas) {
    canvas.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraSolar);
      const intersects = raycaster.intersectObjects(planetMeshes);
      if (intersects.length > 0) {
        showPlanetInfo(intersects[0].object.name);
      } else {
        hidePlanetInfo();
      }
    });
  }
}

function showPlanetInfo(planetName) {
  const infoBox = document.getElementById('infoBox');
  const data = planetData[planetName];
  if (data) {
    document.getElementById('planetName').textContent = data.name;
    document.getElementById('planetType').textContent = `Type: ${data.type}`;
    document.getElementById('planetDiameter').textContent = `Diameter: ${data.diameter}`;
    document.getElementById('planetDistance').textContent = `Distance from Sun: ${data.distance}`;
    document.getElementById('planetOrbit').textContent = `Orbit Period: ${data.orbit}`;
    document.getElementById('planetDescription').textContent = data.description;
    infoBox.classList.remove('hidden');
  }
}

function hidePlanetInfo() {
  const infoBox = document.getElementById('infoBox');
  if (infoBox) {
    infoBox.classList.add('hidden');
  }
}

function setupSearchBoxSolar() {
  const planetTypeInput = document.getElementById("planetTypeInput");
  const planetSelect = document.getElementById("planetSelect");
  const goBtn = document.getElementById("goBtn");

  // Create a reusable function to populate the dropdown
  const populateDropdown = (type) => {
    planetSelect.innerHTML = '<option value="">-- Select Planet --</option>';
    Object.keys(planetData).forEach(key => {
      const pData = planetData[key];
      if (pData.type.toLowerCase().includes(type) || (key === "sun" && "star".includes(type)) || type === "") {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = pData.name;
        planetSelect.appendChild(opt);
      }
    });
  };

  // Add event listener for user input
  planetTypeInput.addEventListener("input", (event) => {
    const type = event.target.value.trim().toLowerCase();
    populateDropdown(type);
  });

  goBtn.addEventListener("click", () => {
    const selectedKey = planetSelect.value;
    if (!selectedKey) return;
    const data = planetData[selectedKey];
    if (!data) return;
    openPlanetPopup(data.name, data.texture, data.size);
  });

  // Call the populate function once on initialization to populate the dropdown with all planets initially
  populateDropdown('');
}

function createPopupPlanet(size, textureUrl, callback) {
  const geometry = new THREE.SphereGeometry(size, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(textureUrl, (texture) => {
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);
    if (callback) callback(planet);
  }, undefined, (err) => {
    console.error("Texture load error:", err);
    const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const planet = new THREE.Mesh(geometry, material);
    if (callback) callback(planet);
  });
}

function disposePopupResources() {
  // Stop animation first
  if (popupAnimationId) {
    cancelAnimationFrame(popupAnimationId);
    popupAnimationId = null;
  }

  // Dispose of controls
  if (popupControls) {
    popupControls.dispose();
    popupControls = null;
  }

  // Clean up scene objects
  if (popupScene) {
    while (popupScene.children.length > 0) {
      const child = popupScene.children[0];
      popupScene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }
    popupScene = null;
  }

  // Clean up renderer
  if (popupRenderer) {
    popupRenderer.dispose();
    popupRenderer.forceContextLoss();
    const canvas = popup3D.querySelector('canvas');
    if (canvas) {
      canvas.remove();
    }
    popupRenderer = null;
  }

  // Reset references
  popupPlanet = null;
  popupCamera = null;
}

function animatePopup() {
  if (!popupRenderer || !popupScene || !popupCamera || !popupPlanet) return;
  popupAnimationId = requestAnimationFrame(animatePopup);
  popupPlanet.rotation.y += 0.002;
  if (popupControls) {
    popupControls.update();
  }
  popupRenderer.render(popupScene, popupCamera);
}

function openPlanetPopup(name, textureUrl, size) {
  // Always dispose of previous resources for a clean slate
  disposePopupResources();

  // Wait a frame to ensure cleanup is complete
  requestAnimationFrame(() => {
    // Reset the state of the popup content
    const planetDetails = document.getElementById("planetDetails");
    const toggleInfoBtn = document.getElementById("toggleInfo");
    const popupContent = document.getElementById("popupContent");

    if (planetDetails) {
      planetDetails.classList.add("hiddenDetails");
      planetDetails.style.display = "none";
    }
    if (toggleInfoBtn) {
      toggleInfoBtn.textContent = "+";
    }
    if (popupContent) {
      popupContent.style.width = "380px";
    }

    popup.classList.remove("hidden");

    // Set up popup UI
    document.getElementById("popupPlanetName").textContent = name;
    const key = name.toLowerCase();
    document.getElementById("popupType").textContent = planetData[key].type;
    document.getElementById("popupMass").textContent = planetData[key].mass;
    document.getElementById("popupRadius").textContent = planetData[key].radius;
    document.getElementById("popupDiameter").textContent = planetData[key].diameter;
    document.getElementById("popupDistance").textContent = planetData[key].distance;
    document.getElementById("popupOrbit").textContent = planetData[key].orbit;
    document.getElementById("popupDescription").textContent = planetData[key].description;

    // Clear the popup3D container completely
    while (popup3D.firstChild) {
      popup3D.removeChild(popup3D.firstChild);
    }

    // Create new renderer and scene
    popupRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    popupRenderer.setSize(popup3D.clientWidth, popup3D.clientHeight);
    popup3D.appendChild(popupRenderer.domElement);

    popupScene = new THREE.Scene();
    popupCamera = new THREE.PerspectiveCamera(45, popup3D.clientWidth / popup3D.clientHeight, 0.1, 1000);
    popupCamera.position.z = size * 3;

    // Add lights
    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(5, 5, 5);
    popupScene.add(pointLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    popupScene.add(directionalLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    popupScene.add(hemisphereLight);

    // Create controls first
    popupControls = new OrbitControls(popupCamera, popupRenderer.domElement);
    popupControls.enableDamping = true;
    popupControls.dampingFactor = 0.05;
    popupControls.enableZoom = true;
    popupControls.autoRotate = false;
    popupControls.autoRotateSpeed = 2.0;

    // Create planet and add it to scene - wait for it to be fully loaded
    createPopupPlanet(size, textureUrl, (planet) => {
      // Ensure no previous planet exists
      if (popupPlanet) {
        popupScene.remove(popupPlanet);
        if (popupPlanet.geometry) popupPlanet.geometry.dispose();
        if (popupPlanet.material) {
          if (popupPlanet.material.map) popupPlanet.material.map.dispose();
          popupPlanet.material.dispose();
        }
      }

      popupPlanet = planet;
      popupScene.add(popupPlanet);

      // Start animation only after planet is created and added
      animatePopup();
    });
  });
}

function setupPopupListeners() {
  // Only set up listeners once to prevent duplicates
  if (popupEventListenersSetup) return;

  if (closePopup) {
    closePopup.addEventListener("click", () => {
      if (popup) popup.classList.add("hidden");
      disposePopupResources();
    });
  }

  const toggleInfoBtn = document.getElementById("toggleInfo");
  const planetDetails = document.getElementById("planetDetails");
  if (toggleInfoBtn && planetDetails) {
    toggleInfoBtn.addEventListener("click", () => {
      const popupContent = document.getElementById("popupContent");
      if (planetDetails.classList.contains("hiddenDetails")) {
        planetDetails.classList.remove("hiddenDetails");
        planetDetails.style.display = "block";
        if (popupContent) popupContent.style.width = "650px";
        toggleInfoBtn.textContent = "−";
      } else {
        planetDetails.classList.add("hiddenDetails");
        planetDetails.style.display = "none";
        if (popupContent) popupContent.style.width = "380px";
        toggleInfoBtn.textContent = "+";
      }
    });
  }

  popupEventListenersSetup = true;
}

// --- EXOPLANET SYSTEM HELPER FUNCTIONS ---
function createExoPlanet(name, size, color, distance, speed) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: color, specular: 0x777777, shininess: 20 });
  const planet = new THREE.Mesh(geometry, material);
  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(createCirclePoints(distance, 64)),
    new THREE.LineBasicMaterial({ color: 0x384c6e, transparent: true, opacity: 0.3 })
  );
  orbit.rotation.x = Math.PI / 2;
  sceneExo.add(orbit);
  planet.position.x = distance;
  sceneExo.add(planet);
  planetsExo.push({ mesh: planet, distance, speed, name });
  return planet;
}

function createCirclePoints(radius, segments) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
  }
  return points;
}

function addBackgroundStarsExo() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true });
  const starVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  sceneExo.add(stars);
}

function animateExoSystem() {
  if (starExo) starExo.rotation.y += 0.005;
  planetsExo.forEach(planet => {
    planet.mesh.position.x = Math.cos(planet.speed * Date.now() * 0.0001) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.speed * Date.now() * 0.0001) * planet.distance;
    planet.mesh.rotation.y += 0.01;
  });
  
  // Update label positions
  updateExoLabelPositions();
  
  if (controlsExo) {
    controlsExo.update();
  }
  renderer.render(sceneExo, cameraExo);
}

// Add to your global variables section
let exoLabels = [];

// Function to create exoplanet labels
function createExoLabel(name, mesh) {
  const label = document.createElement('div');
  label.className = 'exo-label';
  label.textContent = name;
  label.id = `label-${name.replace(/\s+/g, '-')}`;
  document.body.appendChild(label);
  
  return {
    element: label,
    mesh: mesh,
    name: name
  };
}

// Function to update exoplanet label positions
function updateExoLabelPositions() {
  if (activeSystem !== 'exo') return;
  
  exoLabels.forEach(labelData => {
    const label = labelData.element;
    const mesh = labelData.mesh;
    
    if (!mesh || !label) return;
    
    // Convert 3D position to 2D screen coordinates
    const vector = new THREE.Vector3();
    mesh.getWorldPosition(vector);
    vector.project(cameraExo);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
    
    // Update label position
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    
    // Show label if it's in front of the camera
    const isVisible = vector.z > -1 && vector.z < 1;
    label.classList.toggle('visible', isVisible);
  });
}

// Function to initialize exoplanet labels
function initExoSystemLabels() {
  // Clear existing labels
  exoLabels.forEach(label => {
    if (label.element && label.element.parentNode) {
      label.element.parentNode.removeChild(label.element);
    }
  });
  exoLabels = [];
  
  // Create label for the star
  exoLabels.push(createExoLabel('K2-239', starExo));
  
  // Create labels for planets
  planetsExo.forEach(planet => {
    exoLabels.push(createExoLabel(planet.name, planet.mesh));
  });
}

// Function to remove all labels from all systems
function removeAllLabels() {
  // Remove exoplanet labels
  exoLabels.forEach(label => {
    if (label.element && label.element.parentNode) {
      label.element.parentNode.removeChild(label.element);
    }
  });
  exoLabels = [];
  
  // Remove TOI labels
  toiLabels.forEach(label => {
    if (label.element && label.element.parentNode) {
      label.element.parentNode.removeChild(label.element);
    }
  });
  toiLabels = [];
}

// Add this function to set up the habitability UI
function setupHabitabilityUI() {
  // Create the habitability check UI
  habitabilityCheckUI = document.createElement('div');
  habitabilityCheckUI.id = 'habitabilityCheck';
  habitabilityCheckUI.className = 'hidden';
  habitabilityCheckUI.innerHTML = `
    <div class="habitability-container">
      <button id="closeHabitability">&times;</button>
      <div class="habitability-header">
        <h2>Exoplanet Habitability Check</h2>
        <p>Can humans survive on these distant worlds?</p>
      </div>
      
      <div class="planets-grid">
        <div class="planet-card" data-planet="k2-239b">
          <div class="planet-icon">🪐</div>
          <h3 class="planet-name">K2-239 b</h3>
          <p class="planet-details">Rocky Planet • 1.1 Earth Radii • 6.4 Day Orbit</p>
        </div>
        
        <div class="planet-card" data-planet="k2-239c">
          <div class="planet-icon">🪐</div>
          <h3 class="planet-name">K2-239 c</h3>
          <p class="planet-details">Rocky Planet • 1.0 Earth Radii • 10.4 Day Orbit</p>
        </div>
        
        <div class="planet-card" data-planet="k2-239d">
          <div class="planet-icon">🪐</div>
          <h3 class="planet-name">K2-239 d</h3>
          <p class="planet-details">Rocky Planet • 1.1 Earth Radii • 15.0 Day Orbit</p>
        </div>
      </div>
      
      <button id="checkHabitability">Check Habitability</button>
      
      <div class="habitability-result" id="habitabilityResult" style="display: none;">
        <div class="result-header">
          <div class="result-icon" id="resultIcon">🚫</div>
          <h2 class="result-title" id="resultTitle">Not Habitable</h2>
        </div>
        
        <div class="result-details">
          <p id="resultDescription">This planet does not meet the necessary conditions for human survival.</p>
          
          <div class="progress-bar">
            <div class="progress-fill" id="habitabilityScore" style="width: 20%; background: #F44336;"></div>
          </div>
          <div class="progress-labels">
            <span>Low</span>
            <span>Habitability Score</span>
            <span>High</span>
          </div>
          
          <h3>Key Factors:</h3>
          <ul class="factors-list" id="factorsList">
            <li class="negative">Extreme temperatures</li>
            <li class="negative">No atmosphere</li>
            <li class="negative">High radiation levels</li>
          </ul>
        </div>
      </div>
      
      <div class="habitability-footer">
        <p>Based on scientific data from the Kepler Space Telescope and habitability research</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(habitabilityCheckUI);
  
  // Add event listeners
  document.getElementById('closeHabitability').addEventListener('click', closeHabitabilityCheck);
  document.getElementById('checkHabitability').addEventListener('click', checkHabitability);
  
  // Add planet card selection
  const planetCards = habitabilityCheckUI.querySelectorAll('.planet-card');
  planetCards.forEach(card => {
    card.addEventListener('click', () => {
      planetCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedExoPlanet = card.dataset.planet;
    });
  });
  
  // Auto-select first planet
  planetCards[0].click();
}

// Add this function to show the habitability check
function showHabitabilityCheck() {
  habitabilityCheckUI.classList.remove('hidden');
}

// Add this function to close the habitability check
function closeHabitabilityCheck() {
  habitabilityCheckUI.classList.add('hidden');
}

// Add this function to check habitability
function checkHabitability() {
  if (!selectedExoPlanet) return;
  
  const resultElement = document.getElementById('habitabilityResult');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultDescription = document.getElementById('resultDescription');
  const habitabilityScore = document.getElementById('habitabilityScore');
  const factorsList = document.getElementById('factorsList');
  
  // Planet data
  const planetData = {
    'k2-239b': {
      name: 'K2-239 b',
      habitability: 0.25,
      description: 'This planet orbits very close to its red dwarf star, resulting in extreme temperatures.',
      factors: [
        {text: 'Extreme temperature variations', type: 'negative'},
        {text: 'Tidally locked to star', type: 'negative'},
        {text: 'Possible volcanic activity', type: 'neutral'},
        {text: 'Earth-like size', type: 'positive'}
      ]
    },
    'k2-239c': {
      name: 'K2-239 c',
      habitability: 0.45,
      description: 'The most promising candidate in the system, but still with significant challenges for human survival.',
      factors: [
        {text: 'Moderate temperature range', type: 'neutral'},
        {text: 'Possible thin atmosphere', type: 'neutral'},
        {text: 'Earth-sized planet', type: 'positive'},
        {text: 'High stellar radiation', type: 'negative'}
      ]
    },
    'k2-239d': {
      name: 'K2-239 d',
      habitability: 0.3,
      description: 'This planet experiences extreme conditions due to its orbital characteristics.',
      factors: [
        {text: 'Irregular orbit causes climate extremes', type: 'negative'},
        {text: 'Rocky composition similar to Earth', type: 'positive'},
        {text: 'No protective magnetic field', type: 'negative'},
        {text: 'Possible water ice in polar regions', type: 'positive'}
      ]
    }
  };
  
  const data = planetData[selectedExoPlanet];
  
  // Show result section
  resultElement.style.display = 'block';
  
  // Calculate score percentage
  const scorePercent = data.habitability * 100;
  
  // Update UI based on habitability score
  if (data.habitability < 0.3) {
    resultIcon.textContent = '🚫';
    resultIcon.className = 'result-icon not-habitable';
    resultTitle.textContent = 'Not Habitable';
    resultTitle.className = 'result-title not-habitable';
    habitabilityScore.style.background = '#F44336';
  } else if (data.habitability < 0.6) {
    resultIcon.textContent = '⚠️';
    resultIcon.className = 'result-icon marginally-habitable';
    resultTitle.textContent = 'Marginally Habitable';
    resultTitle.className = 'result-title marginally-habitable';
    habitabilityScore.style.background = '#FFC107';
  } else {
    resultIcon.textContent = '✅';
    resultIcon.className = 'result-icon habitable';
    resultTitle.textContent = 'Potentially Habitable';
    resultTitle.className = 'result-title habitable';
    habitabilityScore.style.background = '#4CAF50';
  }
  
  // Animate the progress bar
  habitabilityScore.style.width = '0%';
  setTimeout(() => {
    habitabilityScore.style.width = scorePercent + '%';
  }, 100);
  
  // Update description
  resultDescription.textContent = data.description;
  
  // Update factors list
  factorsList.innerHTML = '';
  data.factors.forEach(factor => {
    const li = document.createElement('li');
    li.textContent = factor.text;
    li.classList.add(factor.type);
    factorsList.appendChild(li);
  });
  
  // Scroll to results
  resultElement.scrollIntoView({ behavior: 'smooth' });
}

// Add TOI scene setup
function setupTOIScene() {
  sceneTOI = new THREE.Scene();
  cameraTOI = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  //cameraTOI.position.z = 25;

  // Position camera higher up and further back for a top-down view
  cameraTOI.position.set(0, 25, 25); // x, y, z coordinates
  
  // Point the camera downward toward the center of the scene
  cameraTOI.lookAt(0, 0, 0);

  controlsTOI = new OrbitControls(cameraTOI, renderer.domElement);
  controlsTOI.enableDamping = true;
  controlsTOI.dampingFactor = 0.05;
  controlsTOI.rotateSpeed = 0.5;

  const ambientLight = new THREE.AmbientLight(0x333333);
  sceneTOI.add(ambientLight);
  const light1 = new THREE.PointLight(0xffa050, 1, 100);
  light1.position.set(5, 5, 5);
  sceneTOI.add(light1);
  const light2 = new THREE.PointLight(0xcefa87, 1, 100);
  light2.position.set(-5, -5, -5);
  sceneTOI.add(light2);

  const starGeometry = new THREE.SphereGeometry(2.2, 32, 32);
  const starMaterial = new THREE.MeshPhongMaterial({ color: 0xff8844, emissive: 0xff7744, specular: 0xffaa88, shininess: 10 });
  starTOI = new THREE.Mesh(starGeometry, starMaterial);
  sceneTOI.add(starTOI);
  const starGlowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
  const starGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.3 });
  const starGlow = new THREE.Mesh(starGlowGeometry, starGlowMaterial);
  sceneTOI.add(starGlow);

  createTOIPlanet('TOI-1075 b', 1.2, 0xd9a679, 8, 3.5);

  addBackgroundStarsTOI();
}

// Create TOI planet
function createTOIPlanet(name, size, color, distance, speed) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: color, specular: 0x777777, shininess: 20 });
  const planet = new THREE.Mesh(geometry, material);
  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(createCirclePoints(distance, 64)),
    new THREE.LineBasicMaterial({ color: 0x6e5c38, transparent: true, opacity: 0.3 })
  );
  orbit.rotation.x = Math.PI / 2;
  sceneTOI.add(orbit);
  planet.position.x = distance;
  sceneTOI.add(planet);
  planetsTOI.push({ mesh: planet, distance, speed, name });
  return planet;
}

// Add background stars for TOI
function addBackgroundStarsTOI() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true });
  const starVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  sceneTOI.add(stars);
}

// Animate TOI system
function animateTOISystem() {
  if (starTOI) starTOI.rotation.y += 0.005;
  planetsTOI.forEach(planet => {
    planet.mesh.position.x = Math.cos(planet.speed * Date.now() * 0.0001) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.speed * Date.now() * 0.0001) * planet.distance;
    planet.mesh.rotation.y += 0.01;
  });
  
  // Update label positions
  updateTOILabelPositions();
  
  if (controlsTOI) {
    controlsTOI.update();
  }
  renderer.render(sceneTOI, cameraTOI);
}

// New dedicated function to set up TOI event listeners
function setupTOIEventListeners() {
  const habitabilityBtnTOI = document.getElementById('habitabilityBtnTOI');
  const closeHabitabilityTOI = document.getElementById('closeHabitabilityTOI');
  const checkHabitabilityTOI = document.getElementById('checkHabitabilityTOI');
  
  // Remove any existing event listeners to prevent duplicates
  if (habitabilityBtnTOI) {
    habitabilityBtnTOI.onclick = null; // Clear previous handlers
    habitabilityBtnTOI.addEventListener('click', showHabitabilityCheckTOI);
  }
  
  if (closeHabitabilityTOI) {
    closeHabitabilityTOI.onclick = null;
    closeHabitabilityTOI.addEventListener('click', closeHabitabilityCheckTOI);
  }
  
  // In setupTOIEventListeners() function:
  if (checkHabitabilityTOI) {
      checkHabitabilityTOI.onclick = null;
      checkHabitabilityTOI.addEventListener('click', performHabitabilityCheckTOI);
  }
}

// Habitability check for TOI
function showHabitabilityCheckTOI() {
  const habitabilityCheck = document.getElementById('habitabilityCheckTOI');
  if (habitabilityCheck) {
    habitabilityCheck.classList.remove('hidden');
    
    // Reset the result display
    const resultElement = document.getElementById('habitabilityResultTOI');
    if (resultElement) {
      resultElement.style.display = 'none';
    }
  }
}

// Function to close TOI habitability check
function closeHabitabilityCheckTOI() {
  const habitabilityCheck = document.getElementById('habitabilityCheckTOI');
  if (habitabilityCheck) {
    habitabilityCheck.classList.add('hidden');
  }
}

function performHabitabilityCheckTOI() {
  console.log('checkHabitabilityTOI called'); // Debug line
  
  const resultElement = document.getElementById('habitabilityResultTOI');
  const resultIcon = document.getElementById('resultIconTOI');
  const resultTitle = document.getElementById('resultTitleTOI');
  const resultDescription = document.getElementById('resultDescriptionTOI');
  const habitabilityScore = document.getElementById('habitabilityScoreTOI');
  const factorsList = document.getElementById('factorsListTOI');
  
  if (!resultElement) {
    console.error('habitabilityResultTOI element not found');
    return;
  }
  
  // Planet data for TOI-1075 b
  const planetData = {
    name: 'TOI-1075 b',
    habitability: 0.15,
    description: 'This super-Earth orbits extremely close to its star, resulting in surface temperatures hot enough to melt lead.',
    factors: [
      {text: 'Extreme temperatures (467°C / 872°F)', type: 'negative-TOI'},
      {text: 'High surface gravity (3x Earth)', type: 'negative-TOI'},
      {text: 'No protective atmosphere', type: 'negative-TOI'},
      {text: 'Intense stellar radiation', type: 'negative-TOI'},
      {text: 'Rocky composition similar to Earth', type: 'positive-TOI'}
    ]
  };
  
  // Show result section
  resultElement.style.display = 'block';
  
  // Calculate score percentage
  const scorePercent = planetData.habitability * 100;
  
  // Update UI based on habitability score
  if (planetData.habitability < 0.3) {
    if (resultIcon) resultIcon.textContent = '🚫';
    if (resultIcon) resultIcon.className = 'result-icon-TOI';
    if (resultTitle) resultTitle.textContent = 'Not Habitable';
    if (resultTitle) resultTitle.className = 'result-title-TOI';
    if (habitabilityScore) habitabilityScore.style.background = '#F44336';
  } else if (planetData.habitability < 0.6) {
    if (resultIcon) resultIcon.textContent = '⚠️';
    if (resultIcon) resultIcon.className = 'result-icon-TOI';
    if (resultTitle) resultTitle.textContent = 'Marginally Habitable';
    if (resultTitle) resultTitle.className = 'result-title-TOI';
    if (habitabilityScore) habitabilityScore.style.background = '#FFC107';
  } else {
    if (resultIcon) resultIcon.textContent = '✅';
    if (resultIcon) resultIcon.className = 'result-icon-TOI';
    if (resultTitle) resultTitle.textContent = 'Potentially Habitable';
    if (resultTitle) resultTitle.className = 'result-title-TOI';
    if (habitabilityScore) habitabilityScore.style.background = '#4CAF50';
  }
  
  // Animate the progress bar
  if (habitabilityScore) {
    habitabilityScore.style.width = '0%';
    setTimeout(() => {
      habitabilityScore.style.width = scorePercent + '%';
    }, 100);
  }
  
  // Update description
  if (resultDescription) {
    resultDescription.textContent = planetData.description;
  }
  
  // Update factors list
  if (factorsList) {
    factorsList.innerHTML = '';
    planetData.factors.forEach(factor => {
      const li = document.createElement('li');
      li.textContent = factor.text;
      li.classList.add(factor.type);
      factorsList.appendChild(li);
    });
  }
  
  // Scroll to results
  resultElement.scrollIntoView({ behavior: 'smooth' });
}

// Function to create TOI labels
function createTOILabel(name, mesh) {
  const label = document.createElement('div');
  label.className = 'exo-label';
  label.textContent = name;
  label.id = `label-${name.replace(/\s+/g, '-')}`;
  document.body.appendChild(label);
  
  return {
    element: label,
    mesh: mesh,
    name: name
  };
}

// Function to update TOI label positions
function updateTOILabelPositions() {
  if (activeSystem !== 'toi') return;
  
  toiLabels.forEach(labelData => {
    const label = labelData.element;
    const mesh = labelData.mesh;
    
    if (!mesh || !label) return;
    
    // Convert 3D position to 2D screen coordinates
    const vector = new THREE.Vector3();
    mesh.getWorldPosition(vector);
    vector.project(cameraTOI);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = -(vector.y * 0.5 - 0.5) * window.innerHeight;
    
    // Update label position
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    
    // Show label if it's in front of the camera
    const isVisible = vector.z > -1 && vector.z < 1;
    label.classList.toggle('visible', isVisible);
  });
}

// Function to initialize TOI labels
function initTOISystemLabels() {
  // Clear existing labels
  toiLabels.forEach(label => {
    if (label.element && label.element.parentNode) {
      label.element.parentNode.removeChild(label.element);
    }
  });
  toiLabels = [];
  
  // Create label for the star
  toiLabels.push(createTOILabel('TOI-1075', starTOI));
  
  // Create labels for planets
  planetsTOI.forEach(planet => {
    toiLabels.push(createTOILabel(planet.name, planet.mesh));
  });
}

// Initial load
init();