/* ============================================================
   PlumeX — Home v3 — comportements partagés
   Chargé UNE seule fois (layout/theme.liquid). Idempotent + délégation
   d'événements sur document, pour survivre aux ré-ordonnancements /
   remplacements de sections par l'éditeur de thème Shopify (AJAX).
   ============================================================ */
(function(){
  if(window.__plumexHomeInit) return;
  window.__plumexHomeInit = true;

  var io = null;
  if('IntersectionObserver' in window){
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.14});
  }

  function scanReveal(root){
    root = (root && root.querySelectorAll) ? root : document;
    var els = root.querySelectorAll('.plumex-home .reveal:not(.in)');
    if(!els.length) return;
    if(io){
      els.forEach(function(el){ io.observe(el); });
    } else {
      els.forEach(function(el){ el.classList.add('in'); });
    }
  }

  // Délégation : accordéon FAQ
  document.addEventListener('click', function(e){
    var qBtn = e.target.closest && e.target.closest('.plumex-home .q > button');
    if(qBtn){
      var q = qBtn.parentElement;
      var a = q.querySelector('.a');
      var open = q.classList.toggle('open');
      if(a) a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
      return;
    }

    // Délégation : toggle matin / soir
    var toggleBtn = e.target.closest && e.target.closest('.plumex-home .toggle button[data-set]');
    if(toggleBtn){
      var duo = toggleBtn.closest('.duo');
      if(!duo) return;
      var mode = toggleBtn.dataset.set;
      duo.dataset.mode = mode;
      var toggleBtns = duo.querySelectorAll('.toggle button[data-set]');
      toggleBtns.forEach(function(b){ b.classList.remove('on'); b.setAttribute('aria-selected','false'); });
      toggleBtn.classList.add('on');
      toggleBtn.setAttribute('aria-selected','true');
      var panels = duo.querySelectorAll('.duo-panel');
      panels.forEach(function(p){ p.classList.toggle('show', p.dataset.panel === mode); });
      var visualLabel = duo.querySelector('[data-visual]');
      if(visualLabel) visualLabel.textContent = mode === 'matin' ? 'Matin' : 'Soir';
      return;
    }
  });

  document.addEventListener('DOMContentLoaded', function(){ scanReveal(document); });
  document.addEventListener('shopify:section:load', function(e){ scanReveal((e && e.target) || document); });

  // Si le script s'exécute après DOMContentLoaded (chargement différé), on scanne quand même.
  if(document.readyState === 'interactive' || document.readyState === 'complete'){
    scanReveal(document);
  }
})();
