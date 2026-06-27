/* ============================================================
   Right Homes — interactions
   ============================================================ */
(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navLinks = document.getElementById("navLinks");
  var navToggle = document.getElementById("navToggle");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header background on scroll ---- */
  function onScroll() {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu toggle ---- */
  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  /* ---- Smooth anchor scrolling with header offset ---- */
  function headerOffset() {
    return header.offsetHeight || 78;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id === "#top") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        closeMenu();
        return;
      }
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset() + 1;
      window.scrollTo({ top: top, behavior: "smooth" });
      closeMenu();
      history.replaceState(null, "", id);
    });
  });

  /* ---- Close mobile menu when tapping outside ---- */
  document.addEventListener("click", function (e) {
    if (!navLinks.classList.contains("open")) return;
    if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
    closeMenu();
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Hero earnings-card chart: grow bars in ---- */
  function animateChart() {
    var bars = document.querySelectorAll(".card-chart rect");
    bars.forEach(function (r, i) {
      var h = parseFloat(r.getAttribute("data-h")) || 0;
      if (reduce) {
        r.style.height = h + "px";
        r.style.y = (90 - h) + "px";
        return;
      }
      window.setTimeout(function () {
        r.style.height = h + "px";
        r.style.y = (90 - h) + "px";
      }, 60 * i + 150);
    });
  }

  /* ---- Hero parallax (photo) + card tilt ---- */
  var heroVisual = document.querySelector(".hero-visual");
  var heroPhoto = document.querySelector(".hero-photo");
  var heroCard = document.getElementById("heroCard");

  if (!reduce && heroPhoto) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 1000) {
          heroPhoto.style.transform = "translateY(" + (y * 0.05).toFixed(1) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  if (!reduce && heroVisual && heroCard && window.matchMedia("(min-width: 761px)").matches) {
    heroVisual.addEventListener("pointermove", function (e) {
      var r = heroVisual.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      heroCard.style.transform =
        "translateY(" + (py * -6).toFixed(1) + "px) rotateX(" +
        (py * -5).toFixed(1) + "deg) rotateY(" + (px * 6).toFixed(1) + "deg)";
    });
    heroVisual.addEventListener("pointerleave", function () {
      heroCard.style.transform = "";
    });
  }

  /* ---- Intro logo animation + dissolve ---- */
  (function () {
    var intro = document.getElementById("intro");
    if (!intro) { animateChart(); return; }

    if (reduce) {
      intro.classList.add("hidden");
      animateChart();
      return;
    }

    document.body.classList.add("intro-active");

    function finish() {
      if (intro.classList.contains("done")) return;
      intro.classList.add("done");
      document.body.classList.remove("intro-active");
      animateChart();
      window.setTimeout(function () { intro.classList.add("hidden"); }, 1000);
    }

    var timer = window.setTimeout(finish, 3500);
    function skip() { window.clearTimeout(timer); finish(); }

    intro.addEventListener("click", skip);
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    });
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchmove", skip, { passive: true, once: true });
  })();

  /* ---- Current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Contact form: validate + compose a mailto ---- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var COMPANY_EMAIL = "hello@righthomes.ca"; // TODO: client to confirm

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var message = form.message.value.trim();

      note.className = "form-note";

      if (!name || !email) {
        note.textContent = "Please add your name and email so we can reach you.";
        note.classList.add("err");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = "That email doesn't look quite right — mind checking it?";
        note.classList.add("err");
        return;
      }

      var subject = "Estimate request — " + service;
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + (phone || "—") + "\n" +
        "Interested in: " + service + "\n\n" +
        "About the property:\n" + (message || "—");

      window.location.href =
        "mailto:" + COMPANY_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      note.textContent = "Thanks, " + name.split(" ")[0] +
        "! Your email app is opening — hit send and we'll be in touch shortly.";
      note.classList.add("ok");
      form.reset();
    });
  }
})();
