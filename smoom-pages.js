/*
 * Behaviour for the Play, Host and FAQ pages, ported from smoo.it (MPL-2.0):
 * accordion cards (deep-linkable via #id), tooltips and the data modals
 * used by the "Interactive commands" and "settings.json" cards.
 */
(function () {
  'use strict'

  var ICONS = {"globe": "<svg class=\"bi bi-globe\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z\"/>\n</svg>", "house-door": "<svg class=\"bi bi-house-door\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z\"/>\n</svg>", "snow": "<svg class=\"bi bi-snow\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M8 16a.5.5 0 0 1-.5-.5v-1.293l-.646.647a.5.5 0 0 1-.707-.708L7.5 12.793V8.866l-3.4 1.963-.496 1.85a.5.5 0 1 1-.966-.26l.237-.882-1.12.646a.5.5 0 0 1-.5-.866l1.12-.646-.884-.237a.5.5 0 1 1 .26-.966l1.848.495L7 8 3.6 6.037l-1.85.495a.5.5 0 0 1-.258-.966l.883-.237-1.12-.646a.5.5 0 1 1 .5-.866l1.12.646-.237-.883a.5.5 0 1 1 .966-.258l.495 1.849L7.5 7.134V3.207L6.147 1.854a.5.5 0 1 1 .707-.708l.646.647V.5a.5.5 0 1 1 1 0v1.293l.647-.647a.5.5 0 1 1 .707.708L8.5 3.207v3.927l3.4-1.963.496-1.85a.5.5 0 1 1 .966.26l-.236.882 1.12-.646a.5.5 0 0 1 .5.866l-1.12.646.883.237a.5.5 0 1 1-.26.966l-1.848-.495L9 8l3.4 1.963 1.849-.495a.5.5 0 0 1 .259.966l-.883.237 1.12.646a.5.5 0 0 1-.5.866l-1.12-.646.236.883a.5.5 0 1 1-.966.258l-.495-1.849-3.4-1.963v3.927l1.353 1.353a.5.5 0 0 1-.707.708l-.647-.647V15.5a.5.5 0 0 1-.5.5z\"/>\n</svg>", "tree-fill": "<svg class=\"bi bi-tree-fill\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777z\"/>\n</svg>", "arrow-up": "<svg class=\"bi bi-arrow-up\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path fill-rule=\"evenodd\" d=\"M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5\"/>\n</svg>", "arrow-down": "<svg class=\"bi bi-arrow-down\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path fill-rule=\"evenodd\" d=\"M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1\"/>\n</svg>", "arrow-left": "<svg class=\"bi bi-arrow-left\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path fill-rule=\"evenodd\" d=\"M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8\"/>\n</svg>", "arrow-right": "<svg class=\"bi bi-arrow-right\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/>\n</svg>", "chat-left-text": "<svg class=\"bi bi-chat-left-text\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z\"/>\n  <path d=\"M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5\"/>\n</svg>", "cloud-upload": "<svg class=\"bi bi-cloud-upload\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path fill-rule=\"evenodd\" d=\"M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383\"/>\n  <path fill-rule=\"evenodd\" d=\"M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708z\"/>\n</svg>", "box": "<svg class=\"bi bi-box\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z\"/>\n</svg>", "star": "<svg class=\"bi bi-star\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z\"/>\n</svg>", "question-circle-fill": "<svg class=\"bi bi-question-circle-fill\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z\"/>\n</svg>", "exclamation-triangle": "<svg class=\"bi bi-exclamation-triangle\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path d=\"M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z\"/>\n  <path d=\"M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z\"/>\n</svg>", "arrow-counterclockwise": "<svg class=\"bi bi-arrow-counterclockwise\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\"  viewBox=\"0 0 16 16\">\n  <path fill-rule=\"evenodd\" d=\"M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z\"/>\n  <path d=\"M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466\"/>\n</svg>", "skull": "<svg class=\"fa fa-skull\" fill=\"currentColor\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M416 398.9c58.5-41.1 96-104.1 96-174.9C512 100.3 397.4 0 256 0S0 100.3 0 224c0 70.7 37.5 133.8 96 174.9c0 .4 0 .7 0 1.1v64c0 26.5 21.5 48 48 48h48V464c0-8.8 7.2-16 16-16s16 7.2 16 16v48h64V464c0-8.8 7.2-16 16-16s16 7.2 16 16v48h48c26.5 0 48-21.5 48-48V400c0-.4 0-.7 0-1.1zM96 256a64 64 0 1 1 128 0A64 64 0 1 1 96 256zm256-64a64 64 0 1 1 0 128 64 64 0 1 1 0-128z\"/></svg>"}
  var KINGDOMS = {"cap": "Cap Kingdom", "cascade": "Cascade Kingdom", "sand": "Sand Kingdom", "lake": "Lake Kingdom", "wooded": "Wooded Kingdom", "cloud": "Cloud Kingdom", "lost": "Lost Kingdom", "metro": "Metro Kingdom", "sea": "Seaside Kingdom", "snow": "Snow Kingdom", "lunch": "Luncheon Kingdom", "ruined": "Ruined Kingdom", "bowser": "Bowser's Kingdom", "moon": "Moon Kingdom", "mush": "Mushroom Kingdom", "dark": "Dark Side", "darker": "Darker Side"}
  var SCENARIOS = {"cap": ["First Visit", "Revisit/Peace", "Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning", "Trailer"], "cascade": ["First Visit", "Revisit/Peace", "Post-game", "Moon Rock", "Koopa Freerunning", "Balloon World", null, "E3/Trailer"], "sand": ["First Visit", "Night", "Peace", "Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning", "Kiosk Demo"], "lake": ["First Visit", "Peace", "Post-game", "Moon Rock", "Koopa Freerunning", "Balloon World"], "wooded": ["First Visit", "Post-Spewart", "Peace", "Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning"], "cloud": ["First Visit", "Revisit/Peace", "Post-game", "Moon Rock"], "lost": ["First Visit", "Revisit/Peace", "Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning"], "metro": ["Night", "Day", "Festival", "Peace", "Post-game", "Balloon World", "Festival Revisit?", "Moon Rock", "Koopa Freerunning", "Morning Metro", "8-Bit Festival", null, "E3 Day Metro", "E3 Festial", "Normal Night Metro"], "sea": ["First Visit", "Peace", "Post-game", "Moon Rock", "Koopa Freerunning", "Balloon World"], "snow": ["First Visit", "Peace", "Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning"], "lunch": ["First Visit", "Post-Meat", "Peace", "Post-game", "Volcano-less", "Volcano-less", "Koopa Freerunning", "Moon Rock", "Balloon World", "Bruncheon"], "ruined": ["First Visit", "Peace", "Post-game", "Moon Rock"], "bowser": ["First Visit", "Peace", "Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning"], "moon": ["First Visit", "Peace/Post-game", "Moon Rock", "Balloon World", "Koopa Freerunning"], "mush": ["Rushroom", "Post-game", "World Peace?", "Koopa Freerunning", "Balloon World"], "dark": ["First Visit", "Peace"], "darker": ["First Visit", "Peace"]}

  // ------------------------------------------------------------------ helpers

  function esc (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  function el (tag, attrs, children) {
    var n = document.createElement(tag)
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k]
      else if (k === 'html') n.innerHTML = attrs[k]
      else if (k === 'text') n.textContent = attrs[k]
      else n.setAttribute(k, attrs[k])
    })
    ;(children || []).forEach(function (c) { if (c) n.appendChild(c) })
    return n
  }

  function tipAttrs (node, html) {
    node.setAttribute('data-tip', html)
    node.setAttribute('tabindex', '0')
    return node
  }

  // ------------------------------------------------------------------ tooltips

  var tipNode = null
  var tipTarget = null

  function showTip (target) {
    hideTip()
    tipTarget = target
    tipNode = el('div', { class: 'smoom-tip', role: 'tooltip', html: target.getAttribute('data-tip') })
    document.body.appendChild(tipNode)
    var r = target.getBoundingClientRect()
    var w = tipNode.offsetWidth
    var h = tipNode.offsetHeight
    var top = r.top + window.pageYOffset - h - 6
    if (r.top - h - 6 < 0) top = r.bottom + window.pageYOffset + 6
    var left = r.left + window.pageXOffset + r.width / 2 - w / 2
    var max = window.pageXOffset + document.documentElement.clientWidth - w - 4
    left = Math.max(window.pageXOffset + 4, Math.min(left, max))
    tipNode.style.top = top + 'px'
    tipNode.style.left = left + 'px'
  }

  function hideTip () {
    if (tipNode && tipNode.parentNode) tipNode.parentNode.removeChild(tipNode)
    tipNode = null
    tipTarget = null
  }

  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('[data-tip]')
    if (t && t !== tipTarget) showTip(t)
  })
  document.addEventListener('mouseout', function (e) {
    var t = e.target.closest && e.target.closest('[data-tip]')
    if (t && !t.contains(e.relatedTarget)) hideTip()
  })
  document.addEventListener('focusin', function (e) {
    var t = e.target.closest && e.target.closest('[data-tip]')
    if (t) showTip(t)
  })
  document.addEventListener('focusout', hideTip)
  document.addEventListener('click', function (e) {
    // touch devices: tap toggles, tapping elsewhere hides
    var t = e.target.closest && e.target.closest('[data-tip]')
    if (t && t === tipTarget && e.detail === 0) return
    if (!t) hideTip()
  })
  window.addEventListener('scroll', hideTip, { passive: true })

  // ------------------------------------------------------------------ cards

  function setOpen (card, open) {
    var head = card.querySelector(':scope > .card-header')
    var body = card.querySelector(':scope > .collapse')
    body.classList.toggle('show', open)
    head.classList.toggle('collapsed', !open)
    head.classList.toggle('not-collapsed', open)
    head.setAttribute('aria-expanded', String(open))
  }

  function isOpen (card) {
    return card.querySelector(':scope > .collapse').classList.contains('show')
  }

  function initGroup (group, onChange) {
    var cards = Array.prototype.slice.call(group.querySelectorAll(':scope > .smoo-card'))
    cards.forEach(function (card) {
      var head = card.querySelector(':scope > .card-header')
      function toggle () {
        var open = !isOpen(card)
        if (open) cards.forEach(function (c) { if (c !== card) setOpen(c, false) })
        setOpen(card, open)
        if (onChange) onChange(card, open)
      }
      head.addEventListener('click', toggle)
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
      })
    })
    return cards
  }

  function makeCard (headerText, bodyNode) {
    var card = el('section', { class: 'card smoo-card' })
    var head = el('header', { class: 'card-header collapsed', role: 'button', tabindex: '0', 'aria-expanded': 'false', text: headerText })
    var wrap = el('div', { class: 'collapse' }, [el('div', { class: 'card-body' }, [bodyNode])])
    card.appendChild(head)
    card.appendChild(wrap)
    return card
  }

  function makeAccordion () {
    var g = el('div', { class: 'smoo-accordion accordion' })
    g.finish = function () { initGroup(g) }
    return g
  }

  // page level accordion, routed through the URL hash (/faq/#103, /host/#docker, ...)
  var routed = document.querySelector('[data-route]')
  if (routed) {
    var cards = initGroup(routed, function (card, open) {
      var key = card.getAttribute('data-key')
      var base = location.pathname + location.search
      if (open) history.replaceState(null, '', base + '#' + key)
      else if (currentId() === key) history.replaceState(null, '', base)
    })

    var firstCall = true
    var applyHash = function () {
      var id = currentId()
      var target = null
      cards.forEach(function (c) { if (c.getAttribute('data-key') === id) target = c })
      if (!target && firstCall && routed.getAttribute('data-accordion') === 'faq') target = cards[0]
      if (!target) return
      cards.forEach(function (c) { setOpen(c, c === target) })
      if (id !== target.getAttribute('data-key')) {
        history.replaceState(null, '', location.pathname + location.search + '#' + target.getAttribute('data-key'))
      }
      setTimeout(function () {
        var head = target.querySelector(':scope > .card-header').getBoundingClientRect()
        var visible = head.top >= 0 && head.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        if (!visible) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    var currentId = function () {
      // also understands the old smoo.it style "#/faq/103"
      var h = location.hash.replace(/^#\/?/, '')
      return h.split('/').pop()
    }
    applyHash()
    firstCall = false
    window.addEventListener('hashchange', applyHash)
  }

  // ------------------------------------------------------------------ modals

  var dataCache = {}
  function fetchJson (url) {
    if (!dataCache[url]) {
      dataCache[url] = fetch(url).then(function (r) {
        if (!r.ok) throw new Error(url + ': ' + r.status + ' ' + r.statusText)
        return r.json()
      }).catch(function (err) { delete dataCache[url]; throw err })
    }
    return dataCache[url]
  }

  var lastFocus = null
  function openModal (titleHtml, large, fill) {
    lastFocus = document.activeElement
    var body = el('div', { class: 'smoo-modal-body' })
    var close = el('button', { type: 'button', class: 'smoo-modal-close', 'aria-label': 'Close', html: '&times;' })
    var content = el('div', { class: 'smoo-modal-content' }, [
      el('header', { class: 'smoo-modal-header' }, [el('h5', { class: 'smoo-modal-title', html: titleHtml }), close]),
      body
    ])
    var dialog = el('div', { class: 'smoo-modal-dialog' + (large ? ' lg' : ''), role: 'dialog', 'aria-modal': 'true' }, [content])
    var backdrop = el('div', { class: 'smoo-modal-backdrop' }, [dialog])

    function closeModal () {
      hideTip()
      document.removeEventListener('keydown', onKey)
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop)
      document.body.classList.remove('smoo-modal-open')
      if (lastFocus && lastFocus.focus) lastFocus.focus()
    }
    function onKey (e) { if (e.key === 'Escape') closeModal() }

    close.addEventListener('click', closeModal)
    backdrop.addEventListener('mousedown', function (e) { if (e.target === backdrop) closeModal() })
    document.addEventListener('keydown', onKey)
    document.body.appendChild(backdrop)
    document.body.classList.add('smoo-modal-open')
    close.focus()
    fill(body)
  }

  function loadInto (body, urls, render) {
    body.appendChild(el('div', { class: 'smoo-modal-loading', text: 'Loading…' }))
    Promise.all(urls.map(fetchJson)).then(function (results) {
      body.innerHTML = ''
      render.apply(null, [body].concat(results))
    }).catch(function (err) {
      body.innerHTML = ''
      var retry = el('button', { type: 'button', class: 'btn btn-secondary btn-sm float-right', title: 'retry', html: ICONS['arrow-counterclockwise'] })
      retry.addEventListener('click', function () { body.innerHTML = ''; loadInto(body, urls, render) })
      body.appendChild(el('div', { class: 'alert alert-danger', role: 'alert' }, [
        retry,
        el('span', { html: ICONS['exclamation-triangle'] + ' ' }),
        el('b', { text: 'Error:' }),
        el('div', { text: String(err.message || err) })
      ]))
    })
  }

  function kingdomName (k) { return KINGDOMS[k] || 'Unknown' }

  function table (headers, rows, cls) {
    var thead = '<thead><tr>' + headers.map(function (h) {
      return '<th' + (h.style ? ' style="' + h.style + '"' : '') + '>' + h.text + '</th>'
    }).join('') + '</tr></thead>'
    var t = el('table', { class: 'table table-striped table-sm ' + (cls || '') })
    t.innerHTML = thead
    var tb = el('tbody')
    rows.forEach(function (r) { tb.appendChild(r) })
    t.appendChild(tb)
    return t
  }

  function hintBtn (icon, title, text) {
    var b = el('button', { type: 'button', class: 'btn btn-secondary btn-sm', html: icon || '' })
    if (text) b.appendChild(document.createTextNode(text))
    tipAttrs(b, title)
    return b
  }

  // ---- <stage> alias values
  function stageAliasModal () {
    openModal('<kbd>&lt;stage&gt;</kbd> alias values for <kbd>send</kbd> and <kbd>sendall</kbd>', false, function (body) {
      body.appendChild(el('p', { html: 'These are short memorable alias values known by the server to quickly reference the overworld stage of a kingdom for the <kbd>send</kbd> and <kbd>sendall</kbd> commands.' }))
      var rows = Object.keys(KINGDOMS).map(function (k) {
        var tr = el('tr')
        tr.appendChild(el('th', { html: '<kbd>' + esc(k) + '</kbd>' }))
        tr.appendChild(el('td', { text: KINGDOMS[k] }))
        return tr
      })
      body.appendChild(table([{ text: 'Alias' }, { text: 'Kingdom' }], rows))
    })
  }

  // ---- <scenario> values
  function scenariosModal () {
    openModal('<kbd>&lt;scenario&gt;</kbd> values for <kbd>send</kbd>', false, function (body) {
      var acc = makeAccordion()
      Object.keys(SCENARIOS).forEach(function (k) {
        var rows = SCENARIOS[k].map(function (v, i) {
          var tr = el('tr')
          tr.appendChild(el('td', { html: '<kbd>' + (i + 1) + '</kbd>' }))
          tr.appendChild(el('td', { text: v || '?' }))
          return tr
        })
        acc.appendChild(makeCard(kingdomName(k), table([{ text: 'Scenario' }, { text: 'Name' }], rows)))
      })
      body.appendChild(acc)
      acc.finish()
    })
  }

  // ---- known <stage> values
  function stagesKnownModal () {
    openModal('<kbd>&lt;stage&gt;</kbd> values for <kbd>send</kbd> and <kbd>sendall</kbd>', true, function (body) {
      loadInto(body, ['/data/stages.json'], function (b, stages) {
        var acc = makeAccordion()
        Object.keys(stages).forEach(function (k) {
          var rows = Object.keys(stages[k]).map(function (s) {
            var st = stages[k][s]
            var tr = el('tr')
            tr.appendChild(el('td', { html: '<kbd>' + esc(s) + '</kbd>' }))
            var name = el('td', { text: (st.name || '?') + ' ' })
            if (st.extra) name.appendChild(tipAttrs(el('span', { style: 'color:#b79800', html: ICONS.box }), 'Moon Rock'))
            tr.appendChild(name)
            var group = el('div', { class: 'btn-group' })
            var sub = st.subarea || false
            if (sub === false) group.appendChild(hintBtn(ICONS.globe, 'Overworld'))
            if (sub === true) group.appendChild(hintBtn(ICONS['house-door'], 'Subarea'))
            if (sub === 'shiveria') group.appendChild(hintBtn(ICONS.snow, 'Shiveria'))
            if (sub === 'deep') group.appendChild(hintBtn(ICONS['tree-fill'], '<b>Deep Woods</b><br/>Considered its own Kingdom in Hide &amp; Seek!'))
            if (sub === 'boss') group.appendChild(hintBtn(ICONS.skull, '<b>Boss Fight</b><br/>Forbidden in Hide &amp; Seek!'))
            if (st.top === true) group.appendChild(hintBtn(ICONS['arrow-up'], 'Top'))
            if (st.top === false) group.appendChild(hintBtn(ICONS['arrow-down'], 'Bottom'))
            if (st.left === true) group.appendChild(hintBtn(ICONS['arrow-left'], 'Left'))
            if (st.left === false) group.appendChild(hintBtn(ICONS['arrow-right'], 'Right'))
            if (st.cell) group.appendChild(hintBtn('', 'Section ' + esc(st.cell), st.cell))
            tr.appendChild(el('td', {}, [group]))
            return tr
          })
          var tbl = table([{ text: 'Stage' }, { text: 'Name', style: 'min-width:150px' }, { text: 'Hints' }], rows)
          acc.appendChild(makeCard(k === 'all' ? 'All' : kingdomName(k), el('div', { class: 'table-responsive' }, [tbl])))
        })
        b.appendChild(acc)
        acc.finish()
      })
    })
  }

  // ---- <shine-id> values
  function stage2kingdom (kingdom, stage, stages) {
    if (stages[kingdom] && stage in stages[kingdom]) return kingdom
    var keys = Object.keys(stages)
    for (var i = 0; i < keys.length; i++) if (stage in stages[keys[i]]) return keys[i]
    return null
  }

  function moonStageIcon (stage) {
    var sub = stage.subarea || false
    if (sub === false) return ICONS.globe
    if (sub === true || sub === 'boss') return ICONS['house-door']
    if (sub === 'shiveria') return ICONS.snow
    if (sub === 'deep') return ICONS['tree-fill']
    return ''
  }

  function shineModal () {
    openModal('<kbd>&lt;shine-id&gt;</kbd> values for <kbd>shine send</kbd>', true, function (body) {
      loadInto(body, ['/data/moons.json', '/data/stages.json'], function (b, moons, stages) {
        var acc = makeAccordion()
        Object.keys(moons).forEach(function (k) {
          var rows = Object.keys(moons[k]).map(function (nr) {
            var moon = moons[k][nr]
            var tr = el('tr')
            tr.appendChild(el('td', { text: Number(nr) < 10 ? '0' + nr : nr }))

            var idCell = el('td')
            if (moon.id && !moon.hintart) {
              idCell.appendChild(el('kbd', { text: moon.id }))
            } else if (moon.id && moon.hintart) {
              idCell.appendChild(tipAttrs(el('kbd', { class: 'text-warning', text: moon.id }),
                'Hint art moons are not automatically synced between players yet. But they can be send with the <kbd>shine send</kbd> server command.'))
            } else if (moon.toadette) {
              idCell.appendChild(tipAttrs(el('kbd', { class: 'text-danger', text: moon.toadette }),
                'Toadette moons are not synced between players yet.'))
            } else {
              idCell.appendChild(tipAttrs(el('span', { class: 'text-warning', html: ICONS['question-circle-fill'] }),
                'The ID of this moon is currently unknown. It is not synced between players.'))
            }
            tr.appendChild(idCell)

            var nameCell = el('td', { text: (moon.name || '?') + ' ' })
            if (moon.extra) nameCell.appendChild(tipAttrs(el('span', { style: 'color:#b79800', html: ICONS.box }), 'Moon Rock'))
            if (moon.toadette) nameCell.appendChild(tipAttrs(el('span', { style: 'color:purple', html: ICONS.star }), 'Toadette Moon'))
            tr.appendChild(nameCell)

            var details = el('td')
            var mk = stage2kingdom(k, moon.stage, stages)
            var stage = mk && stages[mk] ? stages[mk][moon.stage] : null
            if (stage) {
              var g = el('div', { class: 'btn-group' })
              var sname = moon.subStage || stage.name
              var kname = (k !== mk ? KINGDOMS[mk] || null : null)
              g.appendChild(hintBtn(moonStageIcon(stage),
                '<b>Location</b><br/>Can be found in <code>' + esc(sname) + '</code>' +
                (moon.subStage ? ' (inside of <code>' + esc(stage.name) + '</code>)' : '') +
                (kname ? ' of <code>' + esc(kname) + '</code>' : '') + '.'))
              if (moon.story) g.appendChild(hintBtn(ICONS['chat-left-text'], '<b>Story moon</b><br/>This moon progresses the story and comes with a cut-scene.'))
              if (moon.boss) g.appendChild(hintBtn(ICONS.skull, '<b>Boss moon</b><br/>This moon is the reward for beating a boss.'))
              if (moon.multi) g.appendChild(hintBtn('', '<b>Multi moon</b><br/>Counting as 3 moons instead of 1 moon.', '3x'))
              if (moon.changeStageTo) {
                g.appendChild(hintBtn(ICONS['cloud-upload'],
                  '<b>Change scenario</b><br/><p>Picking up this moon changes the scenario of <code>' + esc(KINGDOMS[mk] || '') +
                  '</code> to <code>' + esc(moon.changeStageTo) + '</code>.</p><p>When <code>ShineSync</code> is enabled, other players need to reload the stage for it to change.</p>'))
              }
              details.appendChild(g)
            }
            tr.appendChild(details)
            return tr
          })
          var tbl = table([{ text: '#' }, { text: 'Shine-ID' }, { text: 'Name', style: 'min-width:150px' }, { text: 'Details' }], rows)
          acc.appendChild(makeCard(kingdomName(k), el('div', { class: 'table-responsive' }, [tbl])))
        })
        b.appendChild(acc)
        acc.finish()
      })
    })
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-modal]')
    if (!btn) return
    var id = btn.getAttribute('data-modal')
    if (/stage-alias$/.test(id)) stageAliasModal()
    else if (/stage-known$/.test(id)) stagesKnownModal()
    else if (/scenarios$/.test(id)) scenariosModal()
    else if (/shine-id$/.test(id)) shineModal()
  })
})()
