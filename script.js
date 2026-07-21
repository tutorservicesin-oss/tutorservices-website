document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.querySelector(".theme-toggle");
  const backToTop = document.querySelector(".back-to-top");
  const demoButtons = document.querySelectorAll("[data-demo-open]");
  const inquiry = document.querySelector(".floating-inquiry");
  const chat = document.querySelector(".live-chat");
  const exitPopup = document.querySelector(".exit-popup");
  const exitClose = document.querySelector(".exit-close");

  document.querySelectorAll(".navbar-toggler[data-bs-target]").forEach((button) => {
    const target = document.querySelector(button.dataset.bsTarget);
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      const isOpen = target?.classList.toggle("show") || false;
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.querySelectorAll(".accordion-button[data-bs-target]").forEach((button) => {
    const panel = document.querySelector(button.dataset.bsTarget);
    button.addEventListener("click", () => {
      const accordion = button.closest(".accordion");
      const willOpen = !panel?.classList.contains("show");

      accordion?.querySelectorAll(".accordion-collapse.show").forEach((openPanel) => {
        openPanel.classList.remove("show");
        const openButton = accordion.querySelector(`[data-bs-target="#${openPanel.id}"]`);
        openButton?.classList.add("collapsed");
        openButton?.setAttribute("aria-expanded", "false");
      });

      panel?.classList.toggle("show", willOpen);
      button.classList.toggle("collapsed", !willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.querySelectorAll(".carousel").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".carousel-item")];
    if (slides.length < 2) return;
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
    const showSlide = (nextIndex) => {
      slides[activeIndex].classList.remove("active");
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides[activeIndex].classList.add("active");
    };
    carousel.querySelector(".carousel-control-prev")?.addEventListener("click", () => showSlide(activeIndex - 1));
    carousel.querySelector(".carousel-control-next")?.addEventListener("click", () => showSlide(activeIndex + 1));
  });

  const openModal = (modal) => {
    if (!modal) return;
    modal.style.display = "block";
    modal.classList.add("show");
    modal.setAttribute("aria-modal", "true");
    modal.removeAttribute("aria-hidden");
    document.body.classList.add("modal-open");
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    document.body.classList.remove("modal-open");
  };

  if (localStorage.getItem("tutorservices-theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tutorservices-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  });

  if (backToTop) {
    let scrollUpdateQueued = false;
    window.addEventListener("scroll", () => {
      if (scrollUpdateQueued) return;
      scrollUpdateQueued = true;
      requestAnimationFrame(() => {
        backToTop.classList.toggle("show", window.scrollY > 500);
        scrollUpdateQueued = false;
      });
    }, { passive: true });
  }

  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  demoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openModal(document.getElementById("demoModal"));
    });
  });

  document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((button) => {
    button.addEventListener("click", () => closeModal(button.closest(".modal")));
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  inquiry?.querySelector(".inquiry-tab")?.addEventListener("click", () => {
    inquiry.classList.toggle("open");
  });

  chat?.querySelector(".chat-toggle")?.addEventListener("click", () => {
    chat.classList.toggle("open");
  });

  let exitShown = sessionStorage.getItem("tutorservices-exit") === "shown";
  document.addEventListener("mouseleave", (event) => {
    if (!exitShown && event.clientY <= 0 && exitPopup) {
      exitPopup.classList.add("show");
      sessionStorage.setItem("tutorservices-exit", "shown");
      exitShown = true;
    }
  });
  exitClose?.addEventListener("click", () => exitPopup?.classList.remove("show"));
  exitPopup?.addEventListener("click", (event) => {
    if (event.target === exitPopup) exitPopup.classList.remove("show");
  });

  document.querySelectorAll(".needs-validation").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");
      if (form.checkValidity()) {
        const submitButton = form.querySelector('[type="submit"]');
        const originalButtonText = submitButton?.textContent;
        const inquiryPackage = createInquiryPackage(form);

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Sending...";
        }

        try {
          await sendInquiryAutomatically(inquiryPackage);
          showInquiryResultPanel(inquiryPackage, true);
          maybeOpenSmsComposer(inquiryPackage);
          form.reset();
          form.classList.remove("was-validated");
          showToast("Enquiry sent. SMS draft opens on mobile.");
        } catch (error) {
          showInquiryResultPanel(inquiryPackage, false);
          maybeOpenSmsComposer(inquiryPackage);
          showToast("Automatic sending failed. Please use Gmail or SMS backup.");
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      }
    });
  });

  const counters = document.querySelectorAll(".counter");
  if (counters.length) {
    const runCounter = (counter) => {
      const target = Number(counter.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 80));
      const tick = () => {
        current = Math.min(target, current + step);
        counter.textContent = current.toLocaleString("en-IN");
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    counters.forEach((counter) => observer.observe(counter));
  }

  const courseSearch = document.getElementById("courseSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const courseItems = document.querySelectorAll(".course-item");

  const filterCourses = () => {
    const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
    const query = (courseSearch?.value || "").trim().toLowerCase();
    courseItems.forEach((item) => {
      const matchesFilter = activeFilter === "all" || item.dataset.category === activeFilter;
      const matchesSearch = !query || (item.dataset.name || "").includes(query);
      item.classList.toggle("is-hidden", !(matchesFilter && matchesSearch));
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filterCourses();
    });
  });
  courseSearch?.addEventListener("input", filterCourses);

  const blogSearch = document.getElementById("blogSearch");
  blogSearch?.addEventListener("input", () => {
    const query = blogSearch.value.trim().toLowerCase();
    document.querySelectorAll(".blog-item").forEach((item) => {
      item.classList.toggle("is-hidden", query && !(item.dataset.title || "").includes(query));
    });
  });
});

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = "position:fixed;left:50%;bottom:1.4rem;transform:translateX(-50%);z-index:2200;background:#0B2447;color:#fff;padding:.9rem 1.2rem;border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,.22);font-weight:700;max-width:calc(100% - 2rem);text-align:center;";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function createInquiryPackage(form) {
  const notificationEmail = "tutorservices.in@gmail.com";
  const notificationPhone = "+917011090796";
  const inquiryType = form.dataset.inquiryType || "tutorservices Inquiry";
  const details = collectInquiryDetails(form, inquiryType);
  const subject = `${inquiryType} - ${details.primaryName || "New Lead"}`;
  const body = formatInquiryMessage(details);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(notificationEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const smsUrl = createSmsUrl(notificationPhone, body);

  return { notificationEmail, notificationPhone, gmailUrl, smsUrl, subject, body, details };
}

function createSmsUrl(phone, message) {
  const separator = /iPad|iPhone|iPod/i.test(navigator.userAgent) ? "&" : "?";
  return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
}

function maybeOpenSmsComposer(inquiryPackage) {
  if (!/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return;

  window.setTimeout(() => {
    window.location.href = inquiryPackage.smsUrl;
  }, 900);
}

async function sendInquiryAutomatically(inquiryPackage) {
  const endpoint = "https://formsubmit.co/ajax/tutorservices.in@gmail.com";
  const payload = {
    _subject: inquiryPackage.subject,
    _template: "table",
    _captcha: "false",
    inquiry_type: inquiryPackage.details.inquiryType,
    submitted_at: inquiryPackage.details.submittedAt,
    page: inquiryPackage.details.page,
    page_url: inquiryPackage.details.url,
    full_message: inquiryPackage.body
  };

  inquiryPackage.details.fields.forEach((field) => {
    payload[toSafeFieldName(field.label)] = field.value;
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Automatic enquiry email failed.");
  }

  return response.json().catch(() => ({}));
}

function showInquiryResultPanel(inquiryPackage, wasSent) {
  document.querySelector(".inquiry-draft-popup")?.remove();

  const title = wasSent ? "Enquiry sent" : "Use Gmail backup";
  const description = wasSent
    ? `Your enquiry has been emailed to tutorservices. On mobile, an SMS draft to ${inquiryPackage.notificationPhone} will also open with the same details. Tap Send in your SMS app.`
    : `Automatic email could not complete. Open Gmail or SMS below; the message is already written with all form details for ${inquiryPackage.notificationPhone}.`;

  const popup = document.createElement("div");
  popup.className = "inquiry-draft-popup show";
  popup.innerHTML = `
    <div class="inquiry-draft-card" role="dialog" aria-modal="true" aria-labelledby="inquiryDraftTitle">
      <button class="inquiry-draft-close" type="button" aria-label="Close inquiry draft popup">&times;</button>
      <h2 id="inquiryDraftTitle">${title}</h2>
      <p>${description}</p>
      <div class="inquiry-draft-actions">
        <a class="btn btn-brand" href="${escapeHtml(inquiryPackage.gmailUrl)}" target="_blank" rel="noopener">Open Gmail Backup</a>
        <a class="btn btn-outline-brand" href="${escapeHtml(inquiryPackage.smsUrl)}">Open SMS Draft</a>
      </div>
      <textarea class="form-control mt-3" rows="7" readonly>${escapeHtml(inquiryPackage.body)}</textarea>
    </div>
  `;

  document.body.appendChild(popup);

  const closePopup = () => popup.remove();
  popup.querySelector(".inquiry-draft-close").addEventListener("click", closePopup);
  popup.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
  });
}

function toSafeFieldName(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "detail";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function collectInquiryDetails(form, inquiryType) {
  const fields = [];
  const controls = form.querySelectorAll("input, select, textarea");

  controls.forEach((control) => {
    if (["submit", "button", "reset"].includes(control.type)) return;

    const label = getControlLabel(control);
    let value = "";

    if (control.type === "file") {
      value = control.files?.length ? [...control.files].map((file) => file.name).join(", ") : "";
    } else if (control.tagName === "SELECT") {
      value = control.selectedOptions?.[0]?.textContent?.trim() || control.value.trim();
    } else {
      value = control.value.trim();
    }

    if (label && value) {
      fields.push({ label, value });
    }
  });

  return {
    inquiryType,
    primaryName: fields.find((field) => /name/i.test(field.label))?.value,
    fields,
    page: document.title,
    url: window.location.href,
    submittedAt: new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  };
}

function getControlLabel(control) {
  if (control.dataset.label) return control.dataset.label;
  if (control.id) {
    const explicitLabel = document.querySelector(`label[for="${control.id}"]`);
    if (explicitLabel) return explicitLabel.textContent.trim();
  }
  const wrapperLabel = control.closest("div")?.querySelector("label");
  if (wrapperLabel) return wrapperLabel.textContent.trim();
  if (control.placeholder) return control.placeholder.trim();
  if (control.name) {
    return control.name
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  return "Detail";
}

function formatInquiryMessage(details) {
  const lines = [
    "New tutorservices Inquiry",
    "",
    `Inquiry Type: ${details.inquiryType}`,
    `Submitted At: ${details.submittedAt}`,
    `Page: ${details.page}`,
    `URL: ${details.url}`,
    "",
    "Lead Details:"
  ];

  details.fields.forEach((field) => {
    lines.push(`${field.label}: ${field.value}`);
  });

  lines.push("", "Note: If a resume was selected, this static website can include the file name only. Ask the tutor to email the resume as an attachment.");

  return lines.join("\n");
}
