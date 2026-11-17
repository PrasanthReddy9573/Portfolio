(function () {
  var root = document.documentElement;

  /* Theme: saved choice, else the device setting */
  var theme = null;
  try { theme = localStorage.getItem('theme'); } catch (e) {}
  if (!theme) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = theme;
  document.getElementById('theme').addEventListener('click', function () {
    theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) {}
  });

  /* Metro line: mark the current station and the ones already passed */
  var line = document.querySelector('.line');
  var items = Array.prototype.slice.call(line.children);
  var sections = items.map(function (li) {
    return document.querySelector(li.firstElementChild.getAttribute('href'));
  });

  function update() {
    var current = 0, y = innerHeight * 0.35;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= y) current = i;
    });
    if (innerHeight + scrollY >= document.body.scrollHeight - 4) {
      current = sections.reduce(function (last, s, i) { return s ? i : last; }, 0);
    }
    items.forEach(function (li, i) {
      li.classList.toggle('on', i === current);
      li.classList.toggle('passed', i < current);
      li.firstElementChild[i === current ? 'setAttribute' : 'removeAttribute']('aria-current', 'true');
    });
    line.scrollLeft = items[current].offsetLeft - line.clientWidth / 2;
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
  /* Stats: count up once when they scroll into view */
  var stats = document.querySelector('.stats');
  if (stats && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var nums = stats.querySelectorAll('[data-count]');
    nums.forEach(function (n) { n.textContent = '0'; });
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var start = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / 1100, 1), e = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (n) {
          n.textContent = (n.dataset.count * e).toFixed(+n.dataset.dec || 0);
        });
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }, { threshold: 0.6 }).observe(stats);
  }
  /* Contact form: open the visitor's email app with the message filled in */
  var form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var subject = f.subject.value || 'Message from ' + f.name.value;
    var body = f.message.value + '\n\nFrom: ' + f.name.value + ' (' + f.email.value + ')';
    location.href = 'mailto:prasanthreddy792@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
