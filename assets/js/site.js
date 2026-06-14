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

    const formData = new FormData(contactEmailForm);
    const name = String(formData.get("name") || "").trim();
    const organisation = String(formData.get("organisation") || "").trim();
    const subjectLine = String(formData.get("subject") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = subjectLine || "Adaptiva AI consultation request";
    const body = [
      `Name: ${name}`,
      `Organization: ${organisation}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Message:",
      message
    ].join("\n");

    window.location.href = `mailto:info@adaptivaai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
