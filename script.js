// Mobile nav toggle + footer year. Nothing here overrides the real logo or
// the real mission-system screenshots -- those are first-class assets and
// stay exactly as authored in index.html.
const t = document.querySelector('.nav-toggle'), n = document.querySelector('.nav');
if (t && n) {
  t.addEventListener('click', () => {
    const o = n.classList.toggle('open');
    t.setAttribute('aria-expanded', o);
  });
  n.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    n.classList.remove('open');
    t.setAttribute('aria-expanded', 'false');
  }));
}
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
