// ===== CONFIGURACIÓN: cambia aquí =====
const CONFIG = {
  email: "tucorreo@email.com", // correo que recibe los mensajes del formulario
  roles: ["Frontend", "Full Stack", "Creativo"], // palabras del efecto de escritura
};

// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Navegación: fondo al hacer scroll + menú móvil =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");

window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 20), { passive: true });

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Resalta el enlace de la sección visible
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.querySelectorAll("a").forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`)
        );
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

// ===== Aparición progresiva al hacer scroll =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

// ===== Contadores animados =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1500, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  });
});
document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

// ===== Efecto de escritura =====
const typedEl = document.getElementById("typed");
let roleIndex = 0, charIndex = 0, deleting = false;
function type() {
  const word = CONFIG.roles[roleIndex];
  typedEl.textContent = word.slice(0, charIndex);
  if (!deleting && charIndex < word.length) charIndex++;
  else if (deleting && charIndex > 0) charIndex--;
  else if (!deleting) { deleting = true; return setTimeout(type, 1600); }
  else { deleting = false; roleIndex = (roleIndex + 1) % CONFIG.roles.length; }
  setTimeout(type, deleting ? 50 : 100);
}
type();

// ===== Brillo que sigue al cursor en tarjetas =====
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - r.left}px`);
    card.style.setProperty("--y", `${e.clientY - r.top}px`);
  });
});

// ===== Formulario de contacto (abre el correo del visitante) =====
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const { name, email, message } = Object.fromEntries(new FormData(form));
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    status.textContent = "Por favor completa todos los campos con un correo válido.";
    status.className = "form__status error";
    return;
  }
  const subject = encodeURIComponent(`Nuevo mensaje de ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  status.textContent = "¡Gracias! Se abrirá tu aplicación de correo.";
  status.className = "form__status";
  form.reset();
});

// ===== Fondo de partículas conectadas (sutil) =====
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const count = Math.min(70, Math.floor(innerWidth / 20));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  }));
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.fillStyle = "rgba(34, 211, 238, 0.5)";
    ctx.fillRect(p.x, p.y, 1.5, 1.5);
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 120) {
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - d / 120)})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
}
addEventListener("resize", resize);
resize();
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) draw();
