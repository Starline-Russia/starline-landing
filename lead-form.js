(function initLeadFormModule(globalScope) {
  const SUCCESS_MESSAGE = "Спасибо! Заявка отправлена. Мы свяжемся с вами.";
  const NETWORK_ERROR = "Не удалось отправить заявку. Попробуйте ещё раз или напишите на hi@starlinerussia.ru.";

  function createLeadFormController(options) {
    const document = options.document;
    const fetchImpl = options.fetchImpl;
    const createFormData = options.createFormData;
    const pendingForms = new WeakSet();
    const boundForms = new WeakSet();

    function control(form, name) {
      return form.elements?.namedItem?.(name) || null;
    }

    function clearInvalid(form) {
      for (const name of ["name", "contact", "personal_data_consent"]) {
        control(form, name)?.removeAttribute?.("aria-invalid");
      }
    }

    function setStatus(form, message, state) {
      const status = form.querySelector("[data-form-status]");
      if (!status) return;
      status.textContent = message;
      if (state) status.dataset.state = state;
      else delete status.dataset.state;
    }

    function validate(form) {
      clearInvalid(form);
      const name = control(form, "name");
      const contact = control(form, "contact");
      const consent = control(form, "personal_data_consent");
      const missing = [];

      if (!String(name?.value || "").trim()) missing.push(name);
      if (!String(contact?.value || "").trim()) missing.push(contact);
      if (missing.length) {
        for (const field of missing) field?.setAttribute?.("aria-invalid", "true");
        setStatus(form, "Укажите имя и телефон или email.", "error");
        missing[0]?.focus?.();
        return false;
      }

      if (!consent?.checked) {
        consent?.setAttribute?.("aria-invalid", "true");
        setStatus(form, "Подтвердите согласие на обработку персональных данных.", "error");
        consent?.focus?.();
        return false;
      }

      return true;
    }

    async function submitForm(form, event) {
      event?.preventDefault?.();
      if (pendingForms.has(form) || !validate(form)) return;

      const submitButton = form.querySelector('button[type="submit"]');
      pendingForms.add(form);
      form.setAttribute("aria-busy", "true");
      if (submitButton) submitButton.disabled = true;
      setStatus(form, "Отправляем заявку…", "pending");

      try {
        const response = await fetchImpl(form.getAttribute("action"), {
          method: "POST",
          headers: { Accept: "application/json" },
          body: createFormData(form),
        });
        const payload = await response.json();

        if (!response.ok || payload?.ok !== true) {
          setStatus(form, payload?.message || NETWORK_ERROR, "error");
          return;
        }

        setStatus(form, payload.message || SUCCESS_MESSAGE, "success");
        form.reset();
      } catch (error) {
        setStatus(form, NETWORK_ERROR, "error");
      } finally {
        pendingForms.delete(form);
        form.removeAttribute("aria-busy");
        if (submitButton) submitButton.disabled = false;
      }
    }

    function init() {
      for (const form of document.querySelectorAll("[data-lead-form]")) {
        if (boundForms.has(form)) continue;
        boundForms.add(form);
        form.setAttribute("novalidate", "");
        form.addEventListener("submit", (event) => submitForm(form, event));
      }
    }

    return { init, submitForm };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createLeadFormController, NETWORK_ERROR, SUCCESS_MESSAGE };
  }

  if (globalScope && globalScope.document && globalScope.fetch && globalScope.FormData) {
    createLeadFormController({
      document: globalScope.document,
      fetchImpl: globalScope.fetch.bind(globalScope),
      createFormData: (form) => new globalScope.FormData(form),
    }).init();
  }
})(typeof window !== "undefined" ? window : globalThis);
