// Feather Icons & ARIA setup
document.addEventListener("DOMContentLoaded", () => {
  window.feather?.replace();
  updateAriaCurrent();
  showSection(getCurrentHash());
  setupKeyboardFocusOutline();
  setupMobileSidebarToggle();
});

// Helper: Get current hash or #home (fallback if not found)
function getCurrentHash() {
  // only accept valid section hash
  if (location.hash && document.querySelector(location.hash)) {
    return location.hash;
  }
  // fallback: first visible section, or #home
  const firstSection = document.querySelector(".section:not([hidden])");
  return firstSection ? "#" + firstSection.id : "#home";
}

// Section Show/Hide & Navigation
function showSection(hash) {
  document.querySelectorAll(".section").forEach((sec) => {
    sec.hidden = true;
  });
  const section = document.querySelector(hash);
  if (section) {
    section.hidden = false;
    section.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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
      if (location.hash !== href) window.location.hash = href;
      showSection(href);
    }
  });
  link.addEventListener("keydown", (e) => {
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      let next = (i + dir + navLinks.length) % navLinks.length;
      navLinks[next].focus();
    }
    if (e.key === "Enter" || e.key === " ") {
      link.click();
    }
  });
});

// Hashchange = Section Show & ARIA
window.addEventListener("hashchange", () => {
  showSection(getCurrentHash());
  updateAriaCurrent();
  const target = document.querySelector(getCurrentHash());
  if (target) setTimeout(() => target.focus({ preventScroll: true }), 100);
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
  const hash = getCurrentHash();
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === hash;
    link.classList.toggle("active", isActive);
    setAriaCurrent(link, isActive);
  });
}

// Project Search & Accessibility
const searchInput = document.getElementById("project-search");
const projectCards = Array.from(
  document.querySelectorAll(".project-cards .card")
);
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
    if (!anyVisible) setTimeout(() => noResultMsg.focus(), 100);
  }
  if (anyVisible) {
    const visibleCard = projectCards.find(
      (card) => card.style.display !== "none"
    );
    if (visibleCard) setTimeout(() => visibleCard.focus(), 100);
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
function setupKeyboardFocusOutline() {
  let keyboardMode = false;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") keyboardMode = true;
  });
  document.addEventListener("mousedown", () => {
    keyboardMode = false;
  });
  document.querySelectorAll("main .section").forEach((section) => {
    section.addEventListener("focus", () => {
      if (keyboardMode) section.classList.add("focused");
    });
    section.addEventListener("blur", () => section.classList.remove("focused"));
  });
}

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

// Mobile Sidebar Toggle (future-proof, for better UX)
function setupMobileSidebarToggle() {
  // Basic logic: automatically close sidebar on navigation or resize for mobile
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

  // Optionally: add burger menu for mobile if needed (HTML & CSS required)
  // Uncomment below if you add a burger menu element
  /*
  const burger = document.querySelector('.sidebar-burger');
  if(burger){
    burger.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
    });
  }
  */
}

// Accessibility: trap focus in sidebar when open (future-proof, optional)
function trapSidebarFocus() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || !sidebar.classList.contains("open")) return;
  const focusable = sidebar.querySelectorAll(
    'a, button, input, [tabindex="0"]'
  );
  let first = focusable[0],
    last = focusable[focusable.length - 1];
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Optionally, close sidebar when clicking outside (future-proof, optional)
document.addEventListener("click", (e) => {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || !sidebar.classList.contains("open")) return;
  if (!sidebar.contains(e.target)) {
    sidebar.classList.remove("open");
  }
});
