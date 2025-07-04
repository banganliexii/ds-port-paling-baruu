// Feather Icons & ARIA setup
window.addEventListener("DOMContentLoaded", () => {
  window.feather?.replace();
  updateAriaCurrent();
  showSection(location.hash || "#home");
});

// Section Show/Hide & Navigation
function showSection(hash) {
  document.querySelectorAll(".section").forEach((sec) => {
    sec.hidden = true;
  });
  const section = document.querySelector(hash);
  if (section) {
    section.hidden = false;
    section.focus();
    window.scrollTo(0, 0);
  }
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  const navLink = document.querySelector(`a[href="${hash}"]`);
  if (navLink) navLink.classList.add("active");
}

// Sidebar Nav: Keyboard and Click Navigation
const navLinks = Array.from(document.querySelectorAll(".sidebar nav a"));
navLinks.forEach((link, i) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      window.location.hash = href;
      showSection(href);
    }
  });
  link.addEventListener("keydown", (e) => {
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      let next = i + dir;
      if (next < 0) next = navLinks.length - 1;
      if (next >= navLinks.length) next = 0;
      navLinks[next].focus();
    }
    if (e.key === "Enter" || e.key === " ") {
      link.click();
    }
  });
});

// Hashchange = Section Show & ARIA
window.addEventListener("hashchange", () => {
  showSection(location.hash || "#home");
  updateAriaCurrent();
  const target = document.querySelector(location.hash || "#home");
  if (target) setTimeout(() => target.focus({ preventScroll: true }), 200);
});

// Aria-current & Sidebar State Helper
function setAriaCurrent(link, isActive) {
  if (typeof isActive === "undefined")
    isActive = link.classList.contains("active");
  if (isActive) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
}
function updateAriaCurrent() {
  const hash = location.hash || "#home";
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === hash;
    link.classList.toggle("active", isActive);
    setAriaCurrent(link, isActive);
  });
}

// Project Search & Accessibility
const searchInput = document.getElementById("project-search");
const projectCards = document.querySelectorAll(".project-cards .card");
const noResultMsg = document.getElementById("no-result-msg");

function updateCardsTabIndex() {
  projectCards.forEach((card) => {
    card.tabIndex = card.style.display !== "none" ? 0 : -1;
  });
}

// Debounced project search
let searchDebounce;
if (searchInput && projectCards.length) {
  searchInput.addEventListener("input", function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(handleProjectSearch, 80);
  });
}

function handleProjectSearch() {
  const q = searchInput.value.trim().toLowerCase();
  let anyVisible = false;
  projectCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
    const desc = card.querySelector("p")?.textContent.toLowerCase() || "";
    const show = title.includes(q) || desc.includes(q);
    card.style.display = show ? "" : "none";
    if (show) anyVisible = true;
  });
  updateCardsTabIndex();
  if (noResultMsg) {
    noResultMsg.style.display = anyVisible ? "none" : "block";
    if (!anyVisible) setTimeout(() => noResultMsg.focus(), 120);
  }
  if (anyVisible) {
    const visibleCard = Array.from(projectCards).find(
      (card) => card.style.display !== "none"
    );
    if (visibleCard) setTimeout(() => visibleCard.focus(), 120);
  }
}

// Fade-in Animation on Section Reveal
const fadeSections = Array.from(document.querySelectorAll(".fade-in"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  fadeSections.forEach((section) => observer.observe(section));
} else {
  fadeSections.forEach((section) => section.classList.add("visible"));
}

// Section Focus Style: Keyboard Only
const sections = Array.from(document.querySelectorAll("main .section"));
sections.forEach((section) => {
  section.addEventListener("focus", () => section.classList.add("focused"));
  section.addEventListener("blur", () => section.classList.remove("focused"));
});

// Quick search with slash "/"
window.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) &&
    !document.activeElement.isContentEditable &&
    searchInput &&
    window.innerWidth > 800
  ) {
    e.preventDefault();
    searchInput.focus();
  }
});

// Mobile: close sidebar if overlayed (future-proofing)
function closeSidebarOnMobile() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  if (window.innerWidth < 700 && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
}
navLinks.forEach((link) => {
  link.addEventListener("click", closeSidebarOnMobile);
});
window.addEventListener("resize", closeSidebarOnMobile);
