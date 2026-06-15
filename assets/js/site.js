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

document.querySelectorAll("[data-email-form]").forEach((contactEmailForm) => {
  const submitButton = contactEmailForm.querySelector('button[type="submit"]');
  const statusNode = contactEmailForm.querySelector("[data-form-status]");
  const defaultButtonLabel = submitButton ? submitButton.textContent.trim() : "Send";
  const createFormError = (code, message) => Object.assign(new Error(message), { code });
  const isComplimentaryForm = contactEmailForm.dataset.emailForm === "complimentary-session";

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
      const responseText = await response.text();
      let result = null;

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          console.error("Unable to parse contact form response.", {
            status: response.status,
            body: responseText,
            error
          });
        }
      }

      if (!response.ok) {
        throw createFormError("service_unavailable", result?.message || "The form service is unavailable right now.");
      }

      if (!result) {
        throw createFormError("unexpected_response", "The form service returned an unexpected response.");
      }

      if (!result.success) {
        throw createFormError("submission_failed", result.message || "Request failed");
      }

      contactEmailForm.reset();
      setStatus("Thanks — your request has been sent successfully.");

      if (isComplimentaryForm && complimentaryDialog) {
        setTimeout(() => {
          if (typeof complimentaryDialog.close === "function") {
            complimentaryDialog.close();
          } else {
            complimentaryDialog.removeAttribute("open");
            document.body.classList.remove("video-dialog-open");
          }
        }, 2000);
      }
    } catch (error) {
      const errorCode = typeof error === "object" && error ? error.code ?? "" : "";
      const errorMessage = error instanceof Error ? error.message : "";

      if (errorCode === "unexpected_response") {
        setStatus("Sorry, the form service returned an unexpected response. Please try again or email info@adaptivaai.com directly.");
      } else if (errorCode === "service_unavailable") {
        setStatus("Sorry, the form service is unavailable right now. Please try again or email info@adaptivaai.com directly.");
      } else if (errorMessage) {
        setStatus(`Sorry, ${errorMessage}. Please try again or email info@adaptivaai.com directly.`);
      } else {
        setStatus("Sorry, there was a problem sending your request. Please email info@adaptivaai.com directly.");
      }
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
