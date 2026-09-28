(function () {
  'use strict'

  var body = document.body

  // ---- Dark mode (defaults to ON, same as smoo.it) -------------------------
  var KEY = 'smoom-dark-mode'
  var toggle = document.getElementById('darkToggle')

  function applyDark (on) {
    body.classList.toggle('smoo-dark-mode', on)
    toggle.checked = on
  }

  var saved = null
  try { saved = localStorage.getItem(KEY) } catch (e) { /* storage blocked */ }
  applyDark(saved === null ? true : saved === 'true')

  toggle.addEventListener('change', function () {
    applyDark(toggle.checked)
    try { localStorage.setItem(KEY, String(toggle.checked)) } catch (e) { /* ignore */ }
  })

  // ---- Play / Host dropdowns ----------------------------------------------
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.dropdown'))

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
    caret.addEventListener('click', function (e) {
      e.stopPropagation()
      var open = !dd.classList.contains('open')
      closeAll(dd)
      dd.classList.toggle('open', open)
      caret.setAttribute('aria-expanded', String(open))
    })
  })

  document.addEventListener('click', function () { closeAll() })
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll() })

  // ---- Hamburger menu (small screens) -------------------------------------
  var navToggle = document.getElementById('navToggle')
  var navList = document.getElementById('navigation')

  navToggle.addEventListener('click', function () {
    var show = navList.classList.toggle('show')
    navToggle.setAttribute('aria-expanded', String(show))
  })

  // ---- Highlight the current page in the nav ------------------------------
  // Home is only "active" on exactly "/"; other links match by path prefix.
  var path = location.pathname.replace(/\/index\.html$/, '/') || '/'
  Array.prototype.forEach.call(document.querySelectorAll('.nav-list a.nav-link'), function (a) {
    var href = a.getAttribute('href')
    var active = href === '/' ? path === '/' : path.indexOf(href) === 0
    a.classList.toggle('active', active)
    if (active) a.setAttribute('aria-current', 'page')
    else a.removeAttribute('aria-current')
  })
})()
