const PROFILE = {
  name: "Pablo Morilla Cabello",
  slogan: "Automation Engineer · AI · Full Stack",
  email: "pablo.morilla@ejemplo.com",
  github: "https://github.com/PabloMorillaCabello",
  linkedin: "https://www.linkedin.com/in/pablomorillacabello/",
  cv: "#"
};

let sidebarOpen = false;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 600);
  setupSidebarToggle();
  setupScrollAnimations();
  loadGitHubRepos(6);
  renderTimeline();
});

function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const observerOptions = { threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

function setupSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const close = document.getElementById('sidebarClose');

  // BURBUJA: toggle
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
      sidebar.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  });

  // BOTÓN X
  close.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeSidebar();
  });

  // CLICK FUERA
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 980 && sidebarOpen) {
      const isInSidebar = sidebar.contains(e.target);
      const isToggle = toggle.contains(e.target);

      if (!isInSidebar && !isToggle) {
        closeSidebar();
      }
    }
  });

  // LINKS EN SIDEBAR
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        closeSidebar();
      }
    });
  });

  // REDIMENSIONAR
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && sidebarOpen) {
      closeSidebar();
    }
  });
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('open');
  document.body.style.overflow = 'auto';
  sidebarOpen = false;
}

function extractGitHubUsername(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(p => p);
    return parts[0] || "PabloMorillaCabello";
  } catch { 
    return "PabloMorillaCabello"; 
  }
}

async function loadGitHubRepos(limit = 6) {
  const container = document.getElementById("reposGrid");
  const user = extractGitHubUsername(PROFILE.github);

  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=${limit}`);
    if (!res.ok) throw new Error("Error");

    const repos = await res.json();
    const filtered = repos.filter(r => !r.name.includes('.github.io')).slice(0, limit);

    container.innerHTML = filtered.map((repo) => `
      <div class="card" onclick="window.open('${repo.html_url}', '_blank')" title="Clickea para abrir en GitHub">
        <div class="card-title">${repo.name} →</div>
        <p class="card-description">${repo.description || "Sin descripción disponible."}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderTimeline() {
  const timeline = [
    {
      years: "2023 – Presente",
      role: "Senior Full Stack Developer",
      company: "InnovateTech Solutions",
      location: "Remote",
      description: "Desarrollo de aplicaciones web escalables con React y Node.js",
      link: "https://www.innovatetech.com",
      type: "work"
    },
    {
      years: "2021 – 2023",
      role: "Automation Engineer",
      company: "Industrial Dynamics Corp",
      location: "Madrid, España",
      description: "Diseño e implementación de sistemas SCADA para plantas industriales",
      link: "https://www.industrialdynamics.com",
      type: "work"
    },
    {
      years: "2019 – 2021",
      role: "Junior Software Developer",
      company: "StartupLab Inc",
      location: "Barcelona, España",
      description: "Desarrollo frontend con React y Vue.js",
      link: "https://www.startuplab.com",
      type: "work"
    },
    {
      years: "2015 – 2019",
      role: "Grado en Ingeniería Técnica en Informática",
      company: "Universidad Autónoma de Madrid",
      location: "Madrid, España",
      description: "Especialidad en Sistemas Computacionales",
      link: "https://www.uam.es",
      type: "education"
    }
  ];

  const container = document.getElementById("timelineContainer");
  container.innerHTML = timeline.map(item => `
    <div class="timeline-item" onclick="window.open('${item.link}', '_blank')" title="Clickea para abrir sitio web">
      <div class="timeline-dot" style="background: ${item.type === 'education' ? 'linear-gradient(135deg, #F39C12, #E67E22)' : 'linear-gradient(135deg, #4A90E2, #50C878)'}"></div>
      <div class="timeline-content">
        <h3 class="timeline-title">${item.role} →</h3>
        <p class="timeline-company">${item.company}</p>
        <p class="timeline-date">${item.years}</p>
        <p class="timeline-location">📍 ${item.location}</p>
        <p class="timeline-description">${item.description}</p>
      </div>
    </div>
  `).join('');
}

function handleContactSubmit() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("contactStatus");

  if (!name || !email || !message) {
    status.textContent = "❌ Completa todos los campos.";
    status.style.color = "#E74C3C";
    return;
  }

  status.textContent = "✓ Mensaje enviado correctamente.";
  status.style.color = "#50C878";

  setTimeout(() => {
    document.getElementById("contactForm").reset();
    status.textContent = "";
  }, 3000);
}