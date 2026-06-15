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

document.querySelectorAll("[data-email-form]").forEach((contactEmailForm) => {
  const submitButton = contactEmailForm.querySelector('button[type="submit"]');
  const statusNode = contactEmailForm.querySelector("[data-form-status]");
  const defaultButtonLabel = submitButton ? submitButton.textContent.trim() : "Send";

  const setStatus = (message) => {
    if (statusNode) {
      statusNode.textContent = message;
    }
  };

  contactEmailForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactEmailForm.checkValidity()) {
      contactEmailForm.reportValidity();
      return;
    }

    const formData = new FormData(contactEmailForm);
    const accessKey = String(formData.get("access_key") || "").trim();

    if (!accessKey) {
      setStatus("This form is temporarily unavailable. Please email info@adaptivaai.com directly.");
      return;
    }

    setStatus("");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(contactEmailForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });
      let result = null;

      try {
        result = await response.json();
      } catch (error) {
        console.error("Unable to parse contact form response.", error);
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Request failed");
      }

      contactEmailForm.reset();
      setStatus("Thanks — your request has been sent successfully.");
    } catch (error) {
      setStatus("Sorry, there was a problem sending your request. Please email info@adaptivaai.com directly.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
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
