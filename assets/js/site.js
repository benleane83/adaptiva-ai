const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav]");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const contactEmailForm = document.querySelector("[data-email-form]");

if (contactEmailForm) {
  contactEmailForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactEmailForm.checkValidity()) {
      contactEmailForm.reportValidity();
      return;
    }

    const formData = new FormData(contactEmailForm);
    const name = String(formData.get("name") || "").trim();
    const organization = String(formData.get("organization") || "").trim();
    const subjectLine = String(formData.get("subject") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = subjectLine || "Adaptiva AI consultation request";
    const body = [
      `Name: ${name}`,
      `Organization: ${organization}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Message:",
      message
    ].join("\n");

    window.location.href = `mailto:info@adaptivaai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const videoTrigger = document.querySelector("[data-video-trigger]");
const videoDialog = document.querySelector("[data-video-dialog]");
const videoPlayer = document.querySelector("[data-video-player]");
const videoCloseButtons = document.querySelectorAll("[data-video-close]");

if (videoTrigger && videoDialog && videoPlayer) {
  const closeVideoDialog = () => {
    if (videoDialog.open) {
      videoDialog.close();
    }
  };

  videoTrigger.addEventListener("click", (event) => {
    if (typeof videoDialog.showModal !== "function") {
      return;
    }

    event.preventDefault();
    videoDialog.showModal();
    document.body.classList.add("video-dialog-open");
  });

  videoCloseButtons.forEach((button) => {
    button.addEventListener("click", closeVideoDialog);
  });

  videoDialog.addEventListener("click", (event) => {
    if (event.target === videoDialog) {
      closeVideoDialog();
    }
  });

  videoDialog.addEventListener("close", () => {
    videoPlayer.pause();
    document.body.classList.remove("video-dialog-open");
  });
}
