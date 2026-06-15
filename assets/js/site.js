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

const complimentaryDialogTrigger = document.querySelector("[data-complimentary-trigger]");
const complimentaryDialog = document.querySelector("[data-complimentary-dialog]");
const complimentaryDialogCloseButtons = document.querySelectorAll("[data-complimentary-close]");

if (complimentaryDialogTrigger && complimentaryDialog) {
  const openComplimentaryDialog = () => {
    if (typeof complimentaryDialog.showModal === "function") {
      complimentaryDialog.showModal();
    } else {
      complimentaryDialog.setAttribute("open", "open");
    }

    document.body.classList.add("video-dialog-open");
  };

  const closeComplimentaryDialog = () => {
    if (typeof complimentaryDialog.close === "function") {
      complimentaryDialog.close();
    } else {
      complimentaryDialog.removeAttribute("open");
      document.body.classList.remove("video-dialog-open");
    }
  };

  complimentaryDialogTrigger.addEventListener("click", openComplimentaryDialog);

  complimentaryDialogCloseButtons.forEach((button) => {
    button.addEventListener("click", closeComplimentaryDialog);
  });

  complimentaryDialog.addEventListener("click", (event) => {
    if (event.target === complimentaryDialog) {
      closeComplimentaryDialog();
    }
  });

  complimentaryDialog.addEventListener("close", () => {
    document.body.classList.remove("video-dialog-open");
  });
}

document.querySelectorAll("[data-email-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const formType = form.dataset.emailForm;
    let subject = "Adaptiva AI consultation request";
    let body = "";

    if (formType === "complimentary-session") {
      const name = String(formData.get("name") || "").trim();
      const jobTitle = String(formData.get("jobTitle") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const aiTools = String(formData.get("aiTools") || "").trim();
      const skillLevel = String(formData.get("skillLevel") || "").trim();
      const language = String(formData.get("language") || "").trim();

      subject = "Complimentary Copilot Session Registration";
      body = [
        `Name: ${name}`,
        `Job Title: ${jobTitle}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `What AI tools have you used before?: ${aiTools}`,
        `AI Skill Level: ${skillLevel}`,
        `Language: ${language}`
      ].join("\n");
    } else if (formType === "consultation" || formType === "") {
      const name = String(formData.get("name") || "").trim();
      const organization = String(formData.get("organization") || "").trim();
      const subjectLine = String(formData.get("subject") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const message = String(formData.get("message") || "").trim();

      subject = subjectLine || subject;
      body = [
        `Name: ${name}`,
        `Organization: ${organization}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        "",
        "Message:",
        message
      ].join("\n");
    } else {
      return;
    }

    window.location.href = `mailto:info@adaptivaai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formType === "complimentary-session" && complimentaryDialog) {
      if (typeof complimentaryDialog.close === "function") {
        complimentaryDialog.close();
      } else {
        complimentaryDialog.removeAttribute("open");
        document.body.classList.remove("video-dialog-open");
      }
    }
  });
});

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
