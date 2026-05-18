// ============================================================
//  main.js — EGA Portfolio — JavaScript Boilerplate
//  Link this in index.html just before </body>:
//  <script src="main.js"></script>
// ============================================================


// ─────────────────────────────────────────────
//  1. WAIT FOR THE PAGE TO FULLY LOAD
//  Everything lives inside this listener so your
//  JS only runs after all HTML elements exist.
//  If you run JS before this, querySelector() returns null.
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {


  // ───────────────────────────────────────────
  //  2. GRAB ELEMENTS YOU'LL USE A LOT
  //  Store references once at the top so you
  //  don't query the DOM repeatedly — faster &
  //  easier to read.
  // ───────────────────────────────────────────
  const nav        = document.querySelector('nav');
  const navLinks   = document.querySelectorAll('.nav-links a'); // NodeList (like an array)
  const sections   = document.querySelectorAll('section');      // all <section> tags
  const skillTags  = document.querySelectorAll('.skill-tag');
  const projectCards = document.querySelectorAll('.project-card');


  // ═══════════════════════════════════════════
  //  ★ FEATURE 1 — ACTIVE NAV LINK ON SCROLL
  //  As you scroll, whichever section is visible
  //  gets its matching nav link highlighted.
  // ═══════════════════════════════════════════

  // IntersectionObserver watches elements and fires a callback
  // when they enter or leave the viewport.
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // entry.target is the <section> that just became visible
          const id = entry.target.getAttribute('id'); // e.g. "about"

          // Remove 'active' from every nav link first
          navLinks.forEach((link) => link.classList.remove('active'));

          // Then add 'active' only to the matching link
          // The href "#about" ends with the id, so we use $= (ends-with selector)
          const matchingLink = document.querySelector(`.nav-links a[href="#${id}"]`);
          if (matchingLink) matchingLink.classList.add('active');
        }
      });
    },
    {
      // Fire when 40% of a section is visible — tweak this (0–1) to your taste
      threshold: 0.4,
    }
  );

  // Tell the observer to watch every <section>
  sections.forEach((section) => sectionObserver.observe(section));


  // ═══════════════════════════════════════════
  //  ★ FEATURE 2 — NAV SHADOW ON SCROLL
  //  Adds a box-shadow to the nav once the user
  //  scrolls past the top. Gives depth.
  // ═══════════════════════════════════════════

  // window.scrollY = how many pixels you've scrolled down
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      // classList.add / remove toggle CSS classes on the fly
      nav.style.boxShadow = '0 4px 32px rgba(0,0,0,0.4)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });


  // ═══════════════════════════════════════════
  //  ★ FEATURE 3 — SCROLL-IN ANIMATIONS
  //  Elements fade + slide up when they scroll
  //  into view.  CSS does the animation;
  //  JS just adds the trigger class.
  // ═══════════════════════════════════════════

  // First, inject the keyframe + utility class into the page.
  // We do this in JS so the CSS file stays clean.
  const style = document.createElement('style');
  style.textContent = `
    /* Elements start invisible + shifted down */
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    /* Adding .visible triggers the animation */
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Apply .reveal to every skill tag and project card
  skillTags.forEach((tag)   => tag.classList.add('reveal'));
  projectCards.forEach((card) => card.classList.add('reveal'));

  // A second observer that watches .reveal elements
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // triggers the CSS transition
          revealObserver.unobserve(entry.target); // stop watching — animation only plays once
        }
      });
    },
    { threshold: 0.15 } // fire when 15% of the element is visible
  );

  // Attach observer to every element that has the .reveal class
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


  // ═══════════════════════════════════════════
  //  ★ FEATURE 4 — STAGGERED SKILL TAGS
  //  Each skill tag gets a tiny extra delay so
  //  they animate in one-by-one instead of all
  //  at once.  Feels way more polished.
  // ═══════════════════════════════════════════

  skillTags.forEach((tag, index) => {
    // index = 0, 1, 2 … — multiply by 60ms to stagger them
    tag.style.transitionDelay = `${index * 60}ms`;
  });


  // ═══════════════════════════════════════════
  //  ★ FEATURE 5 — SMOOTH SCROLL FOR NAV LINKS
  //  Clicking a nav link scrolls smoothly to the
  //  section instead of jumping instantly.
  //  (CSS scroll-behavior:smooth handles most of
  //  it, but this adds an offset so the sticky
  //  nav doesn't cover the section heading.)
  // ═══════════════════════════════════════════

  const NAV_HEIGHT = 68; // px — adjust if you change nav height in CSS

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href'); // e.g. "#about"

      // Only intercept internal anchor links (start with #)
      if (href && href.startsWith('#') && href.length > 1) {
        event.preventDefault(); // stop the browser's default jump

        const target = document.querySelector(href); // find the section
        if (!target) return;

        // Calculate where to scroll:  top of element  minus nav height
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;

        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ═══════════════════════════════════════════
  //  ★ FEATURE 6 — TYPING EFFECT IN THE HERO
  //  Cycles through a list of taglines and types
  //  them letter-by-letter in the hero bio.
  //  ─ HOW TO CUSTOMIZE ─
  //  • Edit the `lines` array with your own text.
  //  • Change TYPING_SPEED / ERASE_SPEED for pace.
  //  • Change PAUSE_AFTER for how long it holds.
  // ═══════════════════════════════════════════

  // The element we'll type into — targets the LAST <p> inside .hero-bio
  const heroBioParagraphs = document.querySelectorAll('.hero-bio p');
  const typingTarget = heroBioParagraphs[heroBioParagraphs.length - 1];

  // ── Config ──────────────────────────────────
  const lines         = [
    'First iteration of this portfolio, built from scratch with vanilla JS/CSS/HTML and hella vibecoding',
    'Hopefully this will be a fun, interactive way to show off my projects and skills',
    'Built with ❤️, Gabaga 2026',
  ];
  const TYPING_SPEED  = 30;   // ms per character (lower = faster)
  const ERASE_SPEED   = 30;   // ms per character when erasing
  const PAUSE_AFTER   = 2200; // ms to wait before erasing

  let lineIndex  = 0;   // which line we're currently on
  let charIndex  = 0;   // how many characters have been typed
  let isErasing  = false;

  function tick() {
    const currentLine = lines[lineIndex];

    if (isErasing) {
      // Remove one character
      charIndex--;
      typingTarget.textContent = currentLine.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished erasing — move to next line
        isErasing = false;
        lineIndex = (lineIndex + 1) % lines.length; // loop back to 0
        setTimeout(tick, 400); // short pause before typing starts
      } else {
        setTimeout(tick, ERASE_SPEED);
      }
    } else {
      // Add one character
      charIndex++;
      typingTarget.textContent = currentLine.slice(0, charIndex);

      if (charIndex === currentLine.length) {
        // Finished typing — pause then erase
        isErasing = true;
        setTimeout(tick, PAUSE_AFTER);
      } else {
        setTimeout(tick, TYPING_SPEED);
      }
    }
  }

  // Kick it off after a short delay so the page loads first
  setTimeout(tick, 1200);


  // ═══════════════════════════════════════════
  //  ★ FEATURE 7 — CONTACT BUTTON → MAILTO
  //  "Send a message →" opens the user's mail
  //  client.  Swap the email below for your own.
  // ═══════════════════════════════════════════

  const contactBtn = document.querySelector('.contact-box .btn-primary');

  if (contactBtn) {
    contactBtn.addEventListener('click', (event) => {
      event.preventDefault();
      // mailto: opens the default mail app with a pre-filled address
      window.location.href = 'mailto:gabaga1926@gmail.com?subject=Hey%20Erwin!&body=Hi%20Erwin%2C';
    });
  }


  // ═══════════════════════════════════════════
  //  ★ FEATURE 8 — PROJECT CARD RIPPLE EFFECT
  //  Clicking a card shows a ripple from where
  //  you clicked — a tactile, material-style cue.
  //  ─ HOW IT WORKS ─
  //  A <span> is injected at click coordinates,
  //  expands via CSS animation, then is removed.
  // ═══════════════════════════════════════════

  // Inject the ripple CSS once
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .project-card { overflow: hidden; position: relative; } /* needed for ripple to clip */

    @keyframes ripple-expand {
      to { transform: scale(30); opacity: 0; }
    }
    .ripple-dot {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(167, 139, 250, 0.35); /* --accent2 at low opacity */
      transform: scale(1);
      pointer-events: none;
      animation: ripple-expand 0.6s ease-out forwards;
    }
  `;
  document.head.appendChild(rippleStyle);

  projectCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      // getBoundingClientRect() gives the card's position relative to the viewport
      const rect = card.getBoundingClientRect();

      const dot = document.createElement('span');
      dot.classList.add('ripple-dot');

      // Position the dot where the mouse clicked, relative to the card
      dot.style.left = `${event.clientX - rect.left - 6}px`;
      dot.style.top  = `${event.clientY - rect.top  - 6}px`;

      card.appendChild(dot);

      // Remove the element after the animation finishes (600ms)
      setTimeout(() => dot.remove(), 620);
    });
  });


  // ═══════════════════════════════════════════
  //  ★ FEATURE 9 — CONSOLE EASTER EGG
  //  A friendly message for anyone who opens
  //  DevTools and peeks at the console.
  //  A nice personal touch on dev portfolios.
  // ═══════════════════════════════════════════

  console.log(
    '%c EGA Portfolio ',
    'background:#7b6ef6;color:#fff;font-size:16px;font-family:monospace;padding:6px 12px;border-radius:6px;',
  );
  console.log(
    '%c Hey, you found the source code! Feel free to reach out → gabaga1926@gmail.com',
    'color:#a78bfa;font-size:13px;',
  );


  // ───────────────────────────────────────────
  //  END OF DOMContentLoaded
  // ───────────────────────────────────────────
});


// ============================================================
//  ✦ QUICK REFERENCE — things you'll commonly want to change
//
//  • Typing lines    → Feature 6, `lines` array
//  • Contact email   → Feature 7, the mailto: string
//  • Scroll offset   → Feature 5, NAV_HEIGHT constant
//  • Animation speed → Feature 6, TYPING_SPEED / ERASE_SPEED
//  • Ripple color    → Feature 8, the rgba() in rippleStyle
// ============================================================
