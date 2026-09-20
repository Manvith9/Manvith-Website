import "./main.css";
import WebGL from "./webgl";

WebGL();

const root = document.documentElement;

function onScroll() {
  if (window.scrollY > 10) root.dataset.scroll = "true";
  else root.dataset.scroll = "false";
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
// Retro cursor for the reading/content section
const cursor = document.createElement("div");
cursor.className = "retro-cursor";
document.body.appendChild(cursor);

const cursorGlow = document.createElement("div");
cursorGlow.className = "retro-cursor-glow";
document.body.appendChild(cursorGlow);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let glowX = mouseX;
let glowY = mouseY;

window.addEventListener(
  "pointermove",
  (event) => {
    if (event.pointerType !== "mouse") return;

    mouseX = event.clientX;
    mouseY = event.clientY;

    cursor.style.transform =
      `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  },
  { passive: true }
);

function animateCursor() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;

  cursorGlow.style.transform =
    `translate3d(${glowX}px, ${glowY}px, 0)`;

  requestAnimationFrame(animateCursor);
}

animateCursor();

/* ============================================================
   PROJECT EXPLORER
   ============================================================ */

const projectItems = Array.from(
  document.querySelectorAll<HTMLElement>(".project-item")
);

const projectTriggers = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".project-trigger")
);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let activeProjectIndex = -1;


/* ------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------ */

function getProjectPanel(
  item: HTMLElement
): HTMLElement | null {
  return item.querySelector<HTMLElement>(".project-panel");
}

function getProjectTrigger(
  item: HTMLElement
): HTMLButtonElement | null {
  return item.querySelector<HTMLButtonElement>(".project-trigger");
}

function getProjectStatus(
  item: HTMLElement
): HTMLElement | null {
  return item.querySelector<HTMLElement>(".project-status");
}

function getProjectNumber(item: HTMLElement): string {
  return item.dataset.project ?? "--";
}


/* ------------------------------------------------------------
   CLOSE PROJECT
   ------------------------------------------------------------ */

function closeProject(
  item: HTMLElement,
  returnFocus = false
) {
  const panel = getProjectPanel(item);
  const trigger = getProjectTrigger(item);
  const status = getProjectStatus(item);
  const number = getProjectNumber(item);

  if (!panel || !trigger) return;

  item.classList.remove("is-open");

  trigger.setAttribute("aria-expanded", "false");

  if (status) {
    status.textContent = `[ CLOSING PROJECT ${number}... ]`;
  }

  /*
   * Keep the close transition quick.
   * Reduced-motion users skip the delay.
   */
  const delay = prefersReducedMotion.matches ? 0 : 120;

  window.setTimeout(() => {
    panel.hidden = true;

    if (status) {
      status.textContent = `[ OPENING PROJECT ${number}... ]`;
    }
  }, delay);

  if (returnFocus) {
    trigger.focus({
      preventScroll: true
    });
  }
}


/* ------------------------------------------------------------
   CLOSE EVERY OTHER PROJECT
   ------------------------------------------------------------ */

function closeOtherProjects(currentItem: HTMLElement) {
  projectItems.forEach((item) => {
    if (item === currentItem) return;

    const panel = getProjectPanel(item);

    if (panel && !panel.hidden) {
      closeProject(item);
    }
  });
}


/* ------------------------------------------------------------
   OPEN PROJECT
   ------------------------------------------------------------ */

function openProject(
  item: HTMLElement,
  shouldScroll = true
) {
  const panel = getProjectPanel(item);
  const trigger = getProjectTrigger(item);
  const status = getProjectStatus(item);
  const number = getProjectNumber(item);

  if (!panel || !trigger) return;

  closeOtherProjects(item);

  panel.hidden = false;

  item.classList.add("is-open");

  trigger.setAttribute("aria-expanded", "true");

  if (status) {
    status.textContent = `[ OPENING PROJECT ${number}... ]`;
  }

  const index = projectItems.indexOf(item);

  if (index !== -1) {
    activeProjectIndex = index;
  }

  /*
   * Change the status after the quick terminal-style
   * opening transition.
   */
  const delay = prefersReducedMotion.matches ? 0 : 150;

  window.setTimeout(() => {
    if (!item.classList.contains("is-open")) return;

    if (status) {
      status.textContent = `[ PROJECT ${number} LOADED ]`;
    }
  }, delay);

  /*
   * Keep the selected project visible without aggressively
   * jumping the page.
   */
  if (shouldScroll) {
    window.setTimeout(() => {
      trigger.scrollIntoView({
        behavior: prefersReducedMotion.matches
          ? "auto"
          : "smooth",
        block: "nearest"
      });
    }, delay);
  }
}


/* ------------------------------------------------------------
   TOGGLE PROJECT
   ------------------------------------------------------------ */

function toggleProject(item: HTMLElement) {
  const panel = getProjectPanel(item);

  if (!panel) return;

  if (panel.hidden) {
    openProject(item);
  } else {
    closeProject(item, true);
  }
}


/* ------------------------------------------------------------
   CLICK BEHAVIOR
   ------------------------------------------------------------ */

projectItems.forEach((item, index) => {
  const trigger = getProjectTrigger(item);
  const collapseButton =
    item.querySelector<HTMLButtonElement>(".project-collapse");

  if (!trigger) return;

  trigger.addEventListener("click", () => {
    activeProjectIndex = index;
    toggleProject(item);
  });

  collapseButton?.addEventListener("click", () => {
    closeProject(item, true);
  });

  /*
   * Remember whichever project row currently has focus.
   */
  trigger.addEventListener("focus", () => {
    activeProjectIndex = index;
  });
});


/* ------------------------------------------------------------
   KEYBOARD NAVIGATION
   ------------------------------------------------------------ */

function focusProject(index: number) {
  if (projectTriggers.length === 0) return;

  /*
   * Wrap around:
   * pressing Down on the final project goes to Project 01,
   * and Up on Project 01 goes to Project 11.
   */
  const normalizedIndex =
    (index + projectTriggers.length) %
    projectTriggers.length;

  activeProjectIndex = normalizedIndex;

  const trigger = projectTriggers[normalizedIndex];

  trigger.focus({
    preventScroll: true
  });

  trigger.scrollIntoView({
    behavior: prefersReducedMotion.matches
      ? "auto"
      : "smooth",
    block: "nearest"
  });
}


document.addEventListener("keydown", (event) => {
  /*
   * Don't hijack keyboard controls while someone is typing
   * inside an input, textarea, select, or editable element.
   */
  const target = event.target as HTMLElement | null;

  if (
    target?.matches(
      "input, textarea, select, [contenteditable='true']"
    )
  ) {
    return;
  }

  /*
   * Only use project-navigation keys when a project trigger
   * or collapse button is currently focused.
   */
  const insideProjectExplorer =
    target?.closest(".project-item");

  if (!insideProjectExplorer) {
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();

      focusProject(
        activeProjectIndex < 0
          ? 0
          : activeProjectIndex + 1
      );

      break;

    case "ArrowUp":
      event.preventDefault();

      focusProject(
        activeProjectIndex < 0
          ? projectTriggers.length - 1
          : activeProjectIndex - 1
      );

      break;

    case "Home":
      event.preventDefault();
      focusProject(0);
      break;

    case "End":
      event.preventDefault();
      focusProject(projectTriggers.length - 1);
      break;

    case "Escape": {
      const openItem =
        document.querySelector<HTMLElement>(
          ".project-item.is-open"
        );

      if (openItem) {
        event.preventDefault();
        closeProject(openItem, true);
      }

      break;
    }
  }
});


/* ------------------------------------------------------------
   GLOBAL ESCAPE SUPPORT

   Escape also closes an expanded project even if focus moved
   somewhere inside its content.
   ------------------------------------------------------------ */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const openItem =
    document.querySelector<HTMLElement>(
      ".project-item.is-open"
    );

  if (!openItem) return;

  const target = event.target as HTMLElement | null;

  if (
    target?.matches(
      "input, textarea, select, [contenteditable='true']"
    )
  ) {
    return;
  }

  event.preventDefault();

  closeProject(openItem, true);
});
/* ============================================================
   PROJECT CURSOR INTERACTION
   ============================================================ */

projectTriggers.forEach((trigger) => {
  trigger.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;

    cursor.classList.add("is-project-hover");
    cursorGlow.classList.add("is-project-hover");
  });

  trigger.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;

    cursor.classList.remove("is-project-hover");
    cursorGlow.classList.remove("is-project-hover");
  });
});

/* ============================================================
   EXPERIENCE EXPLORER
   ============================================================ */

const experienceItems = Array.from(
  document.querySelectorAll<HTMLElement>(".experience-item")
);

const experienceTriggers = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".experience-trigger")
);

let activeExperienceIndex = -1;


/* ------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------ */

function getExperiencePanel(
  item: HTMLElement
): HTMLElement | null {
  return item.querySelector<HTMLElement>(".experience-panel");
}

function getExperienceTrigger(
  item: HTMLElement
): HTMLButtonElement | null {
  return item.querySelector<HTMLButtonElement>(".experience-trigger");
}

function getExperienceStatus(
  item: HTMLElement
): HTMLElement | null {
  return item.querySelector<HTMLElement>(".experience-status");
}

function getExperienceNumber(item: HTMLElement): string {
  return item.dataset.experience ?? "--";
}


/* ------------------------------------------------------------
   CLOSE EXPERIENCE
   ------------------------------------------------------------ */

function closeExperience(
  item: HTMLElement,
  returnFocus = false
) {
  const panel = getExperiencePanel(item);
  const trigger = getExperienceTrigger(item);
  const status = getExperienceStatus(item);
  const number = getExperienceNumber(item);

  if (!panel || !trigger) return;

  item.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");

  if (status) {
    status.textContent = `[ CLOSING EXPERIENCE ${number}... ]`;
  }

  const delay = prefersReducedMotion.matches ? 0 : 120;

  window.setTimeout(() => {
    panel.hidden = true;

    if (status) {
      status.textContent = `[ OPENING EXPERIENCE ${number}... ]`;
    }
  }, delay);

  if (returnFocus) {
    trigger.focus({
      preventScroll: true
    });
  }
}


/* ------------------------------------------------------------
   CLOSE OTHER EXPERIENCES
   ------------------------------------------------------------ */

function closeOtherExperiences(currentItem: HTMLElement) {
  experienceItems.forEach((item) => {
    if (item === currentItem) return;

    const panel = getExperiencePanel(item);

    if (panel && !panel.hidden) {
      closeExperience(item);
    }
  });
}


/* ------------------------------------------------------------
   OPEN EXPERIENCE
   ------------------------------------------------------------ */

function openExperience(
  item: HTMLElement,
  shouldScroll = true
) {
  const panel = getExperiencePanel(item);
  const trigger = getExperienceTrigger(item);
  const status = getExperienceStatus(item);
  const number = getExperienceNumber(item);

  if (!panel || !trigger) return;

  closeOtherExperiences(item);

  panel.hidden = false;

  item.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");

  if (status) {
    status.textContent = `[ OPENING EXPERIENCE ${number}... ]`;
  }

  const index = experienceItems.indexOf(item);

  if (index !== -1) {
    activeExperienceIndex = index;
  }

  const delay = prefersReducedMotion.matches ? 0 : 150;

  window.setTimeout(() => {
    if (!item.classList.contains("is-open")) return;

    if (status) {
      status.textContent = `[ EXPERIENCE ${number} LOADED ]`;
    }
  }, delay);

  if (shouldScroll) {
    window.setTimeout(() => {
      trigger.scrollIntoView({
        behavior: prefersReducedMotion.matches
          ? "auto"
          : "smooth",
        block: "nearest"
      });
    }, delay);
  }
}


/* ------------------------------------------------------------
   TOGGLE EXPERIENCE
   ------------------------------------------------------------ */

function toggleExperience(item: HTMLElement) {
  const panel = getExperiencePanel(item);

  if (!panel) return;

  if (panel.hidden) {
    openExperience(item);
  } else {
    closeExperience(item, true);
  }
}


/* ------------------------------------------------------------
   CLICK / FOCUS BEHAVIOR
   ------------------------------------------------------------ */

experienceItems.forEach((item, index) => {
  const trigger = getExperienceTrigger(item);

  const collapseButton =
    item.querySelector<HTMLButtonElement>(
      ".experience-collapse"
    );

  if (!trigger) return;

  trigger.addEventListener("click", () => {
    activeExperienceIndex = index;
    toggleExperience(item);
  });

  collapseButton?.addEventListener("click", () => {
    closeExperience(item, true);
  });

  trigger.addEventListener("focus", () => {
    activeExperienceIndex = index;
  });
});


/* ------------------------------------------------------------
   KEYBOARD NAVIGATION
   ------------------------------------------------------------ */

function focusExperience(index: number) {
  if (experienceTriggers.length === 0) return;

  const normalizedIndex =
    (index + experienceTriggers.length) %
    experienceTriggers.length;

  activeExperienceIndex = normalizedIndex;

  const trigger = experienceTriggers[normalizedIndex];

  trigger.focus({
    preventScroll: true
  });

  trigger.scrollIntoView({
    behavior: prefersReducedMotion.matches
      ? "auto"
      : "smooth",
    block: "nearest"
  });
}


document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;

  if (
    target?.matches(
      "input, textarea, select, [contenteditable='true']"
    )
  ) {
    return;
  }

  const insideExperience =
    target?.closest(".experience-item");

  if (!insideExperience) return;

  switch (event.key) {

    case "ArrowDown":
      event.preventDefault();

      focusExperience(
        activeExperienceIndex < 0
          ? 0
          : activeExperienceIndex + 1
      );

      break;


    case "ArrowUp":
      event.preventDefault();

      focusExperience(
        activeExperienceIndex < 0
          ? experienceTriggers.length - 1
          : activeExperienceIndex - 1
      );

      break;


    case "Home":
      event.preventDefault();
      focusExperience(0);
      break;


    case "End":
      event.preventDefault();
      focusExperience(
        experienceTriggers.length - 1
      );
      break;


    case "Escape": {
      const openItem =
        document.querySelector<HTMLElement>(
          ".experience-item.is-open"
        );

      if (openItem) {
        event.preventDefault();
        closeExperience(openItem, true);
      }

      break;
    }
  }
});


/* ============================================================
   EXPERIENCE CURSOR INTERACTION
   ============================================================ */

experienceTriggers.forEach((trigger) => {

  trigger.addEventListener(
    "pointerenter",
    (event) => {
      if (event.pointerType !== "mouse") return;

      cursor.classList.add("is-project-hover");
      cursorGlow.classList.add("is-project-hover");
    }
  );


  trigger.addEventListener(
    "pointerleave",
    (event) => {
      if (event.pointerType !== "mouse") return;

      cursor.classList.remove("is-project-hover");
      cursorGlow.classList.remove("is-project-hover");
    }
  );

});