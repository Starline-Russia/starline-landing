(function () {
  const menuButton = document.querySelector('[data-od-id="mobile-menu-button"]');
  const nav = document.querySelector('[data-od-id="main-navigation"]');
  const revealSections = document.querySelectorAll('.rebuild-reveal');
  const orbitMain = document.querySelector('.orbit__bubble--main');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      const nextOpen = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', nextOpen);
      menuButton.setAttribute('aria-expanded', String(nextOpen));
      menuButton.setAttribute('aria-label', nextOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Открыть меню');
      }
    });
  }

  revealSections.forEach(function (section) {
    const logoStack = section.querySelector('.rebuild-logo-stack');

    section.addEventListener('pointermove', function (event) {
      const rect = section.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      section.classList.add('is-pointer-active');
      section.style.setProperty('--parallax-x', (x * 34).toFixed(2) + 'px');
      section.style.setProperty('--parallax-y', (y * 26).toFixed(2) + 'px');

      if (!logoStack) return;

      const logoRect = logoStack.getBoundingClientRect();
      const spotX = Math.max(0, Math.min(event.clientX - logoRect.left, logoRect.width));
      const spotY = Math.max(0, Math.min(event.clientY - logoRect.top, logoRect.height));
      section.style.setProperty('--spot-x', spotX.toFixed(2) + 'px');
      section.style.setProperty('--spot-y', spotY.toFixed(2) + 'px');
    });

    section.addEventListener('pointerleave', function () {
      section.classList.remove('is-pointer-active');
      section.style.setProperty('--parallax-x', '0px');
      section.style.setProperty('--parallax-y', '0px');
      section.style.setProperty('--spot-x', '50%');
      section.style.setProperty('--spot-y', '50%');
    });
  });

  if (orbitMain) {
    orbitMain.addEventListener('pointermove', function (event) {
      const rect = orbitMain.getBoundingClientRect();
      const spotX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      const spotY = Math.max(0, Math.min(event.clientY - rect.top, rect.height));

      orbitMain.classList.add('is-pointer-active');
      orbitMain.style.setProperty('--orbit-spot-x', spotX.toFixed(2) + 'px');
      orbitMain.style.setProperty('--orbit-spot-y', spotY.toFixed(2) + 'px');
    });

    orbitMain.addEventListener('pointerleave', function () {
      orbitMain.classList.remove('is-pointer-active');
      orbitMain.style.setProperty('--orbit-spot-x', '50%');
      orbitMain.style.setProperty('--orbit-spot-y', '50%');
    });
  }
})();
