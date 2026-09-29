/* Dropdown menus for the Play / Host entries of the main navigation. */
(function () {
  'use strict'

  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-list .dropdown'))
  if (!dropdowns.length) return

  function closeAll (except) {
    dropdowns.forEach(function (dd) {
      if (dd === except) return
      dd.classList.remove('open')
      var caret = dd.querySelector('.split-caret')
      if (caret) caret.setAttribute('aria-expanded', 'false')
    })
  }

  dropdowns.forEach(function (dd) {
    var caret = dd.querySelector('.split-caret')
    if (!caret) return
    caret.addEventListener('click', function (e) {
      e.stopPropagation()
      var open = !dd.classList.contains('open')
      closeAll(dd)
      dd.classList.toggle('open', open)
      caret.setAttribute('aria-expanded', String(open))
    })
    // choosing an entry closes the menu (and the hamburger menu on small screens)
    dd.querySelectorAll('.dropdown-menu a[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        closeAll()
        var list = document.getElementById('navigation')
        var toggle = document.getElementById('navToggle')
        if (list) list.classList.remove('show')
        if (toggle) toggle.setAttribute('aria-expanded', 'false')
      })
    })
  })

  document.addEventListener('click', function () { closeAll() })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll() })
})()
