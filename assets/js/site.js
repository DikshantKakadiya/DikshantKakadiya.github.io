(() => {
  document.documentElement.classList.add('js');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (menuButton && nav) {
    const closeMenu = (restoreFocus = false) => {
      const wasOpen = nav.classList.contains('is-open');
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      if (wasOpen && restoreFocus) menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
  }

  const storyTabs = [...document.querySelectorAll('.story-choice[role="tab"]')];
  if (storyTabs.length) {
    const storyPanels = storyTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const activateStory = (index, focus = false) => {
      storyTabs.forEach((tab, position) => {
        const active = position === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        storyPanels[position].hidden = !active;
      });
      if (focus) storyTabs[index].focus();
    };
    activateStory(0);
    storyTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateStory(index));
      tab.addEventListener('keydown', event => {
        const keys = {ArrowRight: (index + 1) % storyTabs.length, ArrowDown: (index + 1) % storyTabs.length, ArrowLeft: (index - 1 + storyTabs.length) % storyTabs.length, ArrowUp: (index - 1 + storyTabs.length) % storyTabs.length, Home: 0, End: storyTabs.length - 1};
        if (Object.hasOwn(keys, event.key)) {
          event.preventDefault();
          activateStory(keys[event.key], true);
        }
      });
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const previewButton = document.querySelector('[data-preview="aarya"]');
  const dialog = document.getElementById('preview-dialog');
  if (previewButton && dialog) {
    const frame = dialog.querySelector('iframe');
    const loading = dialog.querySelector('.preview-loading');
    let loadTimer;
    previewButton.addEventListener('click', () => {
      if (typeof dialog.showModal !== 'function') {
        window.open('https://aaryabyte.com/', '_blank', 'noopener,noreferrer');
        return;
      }
      loading.hidden = false;
      loading.textContent = 'Loading the live website…';
      frame.src = 'https://aaryabyte.com/';
      dialog.showModal();
      loadTimer = window.setTimeout(() => {
        loading.textContent = 'The site is taking a little longer. You can open the full live site below.';
      }, 12000);
    });
    frame.addEventListener('load', () => {
      if (frame.hasAttribute('src')) {
        clearTimeout(loadTimer);
        loading.hidden = true;
      }
    });
    dialog.querySelector('#close-preview').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      clearTimeout(loadTimer);
      frame.removeAttribute('src');
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
  }

  const searchForm = document.querySelector('.project-search');
  if (searchForm) {
    const query = document.getElementById('project-query');
    const language = document.getElementById('project-language');
    const cards = [...document.querySelectorAll('#projects .project-card')];
    const count = document.getElementById('project-count');
    const empty = document.getElementById('project-empty');
    searchForm.hidden = false;
    count.hidden = false;
    const filter = () => {
      const term = query.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const matches = (!term || card.textContent.toLowerCase().includes(term)) && (language.value === 'all' || card.dataset.language === language.value);
        card.hidden = !matches;
        if (matches) shown++;
      });
      count.textContent = `${shown} of ${cards.length} projects`;
      empty.hidden = shown !== 0;
    };
    searchForm.addEventListener('submit', event => event.preventDefault());
    query.addEventListener('input', filter);
    language.addEventListener('change', filter);
    searchForm.addEventListener('reset', () => { setTimeout(filter, 0); });
  }
})();
