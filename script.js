/* ========================================
   CONFIGURACIÓN PERSONAL (edita aquí tus datos)
   ======================================== */
const PROFILE = {
  name: "Pablo Morilla Cabello",
  slogan: "Automation Engineer · AI · Full Stack",
  initials: "PM",
  email: "pablo.morilla@ejemplo.com",
  github: "https://github.com/PabloMorillaCabello",
  linkedin: "https://www.linkedin.com/in/pablomorillacabello/",
  cv: "#",            // URL a tu CV en PDF
  whatsapp: "https://wa.me/34600123456",
  calendly: "https://calendly.com/pablomorilla"
};

/* ========================================
   INICIALIZACIÓN: Actualiza elementos HTML con datos del perfil
   ======================================== */
function initializeProfile() {
  // Actualiza nombre y slogan en sidebar
  document.getElementById("heroName").textContent = PROFILE.name;
  document.getElementById("heroSlogan").textContent = PROFILE.slogan;
  
  // Actualiza enlaces
  document.getElementById("cvBtn").href = PROFILE.cv;
  document.getElementById("linkGit").href = PROFILE.github;
  document.getElementById("linkLinkedin").href = PROFILE.linkedin;
  document.getElementById("linkMail").href = `mailto:${PROFILE.email}`;
  document.getElementById("mailLink").href = `mailto:${PROFILE.email}`;
  
  // Actualiza footer
  document.getElementById("footName").textContent = PROFILE.name;
  document.getElementById("year").textContent = new Date().getFullYear();
}

/* ========================================
   LOADER: Oculta pantalla de carga tras inicializar
   ======================================== */
window.addEventListener('DOMContentLoaded', () => {
  initializeProfile();
  
  // Oculta el loader después de 600ms
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
  }, 600);
});

/* ========================================
   INTERSECTION OBSERVER: Animaciones al hacer scroll
   Detecta cuando los elementos entran en el viewport y añade clase 'visible'
   ======================================== */
function setupScrollAnimations() {
  // Selecciona todos los elementos con clase 'animate-on-scroll'
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  // Configuración del observer
  const observerOptions = {
    root: null,           // Usa el viewport como contenedor
    rootMargin: '0px',    // Sin margen adicional
    threshold: 0.15       // Activa cuando el 15% del elemento es visible
  };
  
  // Callback que se ejecuta cuando un elemento intersecta
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      // Si el elemento está visible, añade clase 'visible'
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Opcional: dejar de observar el elemento después de animarlo
        // observer.unobserve(entry.target);
      }
    });
  };
  
  // Crea el observer
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  // Observa cada elemento animado
  animatedElements.forEach(el => observer.observe(el));
}

// Inicializa las animaciones cuando el DOM está listo
setupScrollAnimations();

/* ========================================
   API GITHUB: Carga repositorios públicos
   ======================================== */
async function loadGitHubRepos(limit = 6) {
  const container = document.getElementById("reposGrid");
  
  // Extrae el nombre de usuario desde la URL de GitHub
  const githubUser = extractGitHubUsername(PROFILE.github);
  
  // Muestra mensaje de carga
  container.innerHTML = createLoadingCard("Cargando repositorios...");
  
  try {
    // Fetch a la API de GitHub (sin autenticación, limitado a 60 req/hora)
    const response = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=updated&per_page=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const repos = await response.json();
    
    // Filtra el repo de GitHub Pages y limita resultados
    const filteredRepos = repos
      .filter(r => r.name.toLowerCase() !== `${githubUser.toLowerCase()}.github.io`)
      .slice(0, limit);
    
    // Renderiza las tarjetas de proyectos
    container.innerHTML = "";
    filteredRepos.forEach(repo => {
      container.appendChild(createRepoCard(repo));
    });
    
  } catch (error) {
    console.error("Error cargando repos:", error);
    container.innerHTML = createErrorCard(`No se pudieron cargar los repositorios: ${error.message}`);
  }
}

/* ========================================
   HELPER: Extrae username de URL de GitHub
   ======================================== */
function extractGitHubUsername(githubUrl) {
  try {
    const url = new URL(githubUrl);
    const username = url.pathname.replace(/\//g, "");
    return username || "PabloMorillaCabello";
  } catch (e) {
    return "PabloMorillaCabello";
  }
}

/* ========================================
   HELPER: Crea tarjeta de proyecto desde datos de repo
   ======================================== */
function createRepoCard(repo) {
  const card = document.createElement("div");
  card.className = "card animate-on-scroll";
  
  card.innerHTML = `
    <div class="card-content">
      <div class="card-title">${repo.name}</div>
      <p class="card-description">${repo.description || "Sin descripción disponible."}</p>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <a class="btn btn-sm" href="${repo.html_url}" target="_blank">Ver código</a>
      ${repo.homepage ? `<a class="btn btn-secondary btn-sm" href="${repo.homepage}" target="_blank">Demo</a>` : ''}
    </div>
  `;
  
  return card;
}

/* ========================================
   HELPER: Tarjetas de carga y error
   ======================================== */
function createLoadingCard(message) {
  return `<div class="card"><div class="card-content"><div class="card-title">Cargando...</div><p class="card-description">${message}</p></div></div>`;
}

function createErrorCard(message) {
  return `<div class="card"><div class="card-content"><div class="card-title">Error</div><p class="card-description">${message}</p></div></div>`;
}

// Carga repos al cargar la página
loadGitHubRepos(6);

/* ========================================
   API GITHUB: Estadísticas y gráfico de lenguajes
   ======================================== */
async function loadGitHubStats() {
  const githubUser = extractGitHubUsername(PROFILE.github);
  
  try {
    // Obtiene todos los repos (máximo 100)
    const response = await fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100`);
    
    if (!response.ok) throw new Error("Error al obtener estadísticas");
    
    const repos = await response.json();
    
    // Cuenta repos públicos
    document.getElementById('repoCount').textContent = repos.length;
    
    // Cuenta lenguajes usados
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    // Ordena por frecuencia descendente
    const sortedLanguages = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    
    // Muestra lista de lenguajes
    const langList = document.getElementById('langList');
    langList.innerHTML = sortedLanguages
      .slice(0, 5)  // Solo top 5
      .map(([lang, count]) => `<li>${lang} (${count} repos)</li>`)
      .join('');
    
    // Crea gráfico de donut con Chart.js
    createLanguageChart(sortedLanguages);
    
    document.getElementById('statsDisplay').textContent = 'Estadísticas actualizadas';
    
  } catch (error) {
    console.error("Error cargando stats:", error);
    document.getElementById('statsDisplay').textContent = 'Error al cargar estadísticas';
  }
}

/* ========================================
   HELPER: Crea gráfico de lenguajes con Chart.js
   ======================================== */
function createLanguageChart(languagesData) {
  const ctx = document.getElementById('langChart').getContext('2d');
  
  // Colores profesionales para el gráfico
  const colors = [
    '#4A90E2',  // Azul
    '#50C878',  // Verde
    '#F39C12',  // Naranja
    '#9B59B6',  // Púrpura
    '#E74C3C',  // Rojo
    '#34495E'   // Gris oscuro
  ];
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: languagesData.slice(0, 6).map(([lang]) => lang),
      datasets: [{
        data: languagesData.slice(0, 6).map(([_, count]) => count),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false  // Ocultamos leyenda para mantener diseño limpio
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed} repos`;
            }
          }
        }
      }
    }
  });
}

// Carga estadísticas al iniciar
loadGitHubStats();

/* ========================================
   FORMULARIO DEMO: Rellena campos con datos de ejemplo
   ======================================== */
function fillDemo() {
  document.getElementById("name").value = "María García";
  document.getElementById("email").value = "maria.garcia@empresa.com";
  document.getElementById("message").value = "Hola Pablo,\n\nEstoy interesada en discutir un proyecto de automatización industrial que requiere integración con sistemas web modernos. ¿Podríamos agendar una llamada?\n\nSaludos,\nMaría";
}

/* ========================================
   ATAJOS DE TECLADO (opcional)
   ======================================== */
window.addEventListener("keydown", (e) => {
  // Presiona 't' para ir a sección de contacto
  if (e.key === "t") {
    document.getElementById("contactBtn").click();
  }
  // Presiona 'g' para abrir GitHub
  if (e.key === "g") {
    window.open(PROFILE.github, "_blank");
  }
});
