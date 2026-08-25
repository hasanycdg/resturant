/*
 * Hagis Pizza & Döner – DSGVO Consent-Manager
 * Lädt nicht-notwendige Dienste (Google Analytics, Curator.io, Elfsight,
 * Google Maps) erst NACH ausdrücklicher Zustimmung. Ablehnen ist
 * gleichwertig möglich. Auswahl wird lokal gespeichert.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hagis-consent"; // Werte: "accepted" | "rejected"
  var GA_ID = "G-CBM5F1KNLP";

  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  // Google Analytics laden + Signal für seitenspezifische Widgets senden
  function loadServices() {
    window.hagisConsent = "accepted";

    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(ga);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);

    // Curator, Elfsight und Google Maps hören auf dieses Event
    document.dispatchEvent(new CustomEvent("hagis-consent-granted"));
  }

  function removeBanner() {
    var el = document.getElementById("consent-banner");
    if (el && el.parentNode) { el.parentNode.removeChild(el); }
  }

  function decide(value) {
    saveChoice(value);
    removeBanner();
    if (value === "accepted") { loadServices(); }
  }

  function buildBanner() {
    var banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Hinweis zu Cookies und Diensten");

    banner.innerHTML =
      '<div class="consent-inner">' +
        '<div class="consent-text">' +
          '<strong>Wir respektieren Deine Privatsphäre.</strong> ' +
          'Wir setzen nur notwendige Cookies. Zusätzlich möchten wir ' +
          'Statistik (Google Analytics) sowie externe Inhalte (Google Maps, ' +
          'Bewertungen, Social-Feed) laden – diese übertragen Daten an ' +
          'Dritte. Das passiert nur mit Deiner Zustimmung. Mehr dazu in der ' +
          '<a href="datenschutz.html">Datenschutzerklärung</a>.' +
        '</div>' +
        '<div class="consent-actions">' +
          '<button type="button" id="consent-reject" class="consent-btn consent-btn--ghost">Ablehnen</button>' +
          '<button type="button" id="consent-accept" class="consent-btn consent-btn--primary">Alle akzeptieren</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById("consent-accept")
      .addEventListener("click", function () { decide("accepted"); });
    document.getElementById("consent-reject")
      .addEventListener("click", function () { decide("rejected"); });
  }

  function showBanner() {
    if (document.body) { buildBanner(); }
    else { document.addEventListener("DOMContentLoaded", buildBanner); }
  }

  // Erlaubt das erneute Öffnen der Auswahl (z. B. Link im Footer)
  window.openConsentSettings = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  };

  // Footer-Links mit Klasse "js-consent-settings" verdrahten
  function wireSettingsLinks() {
    var links = document.querySelectorAll(".js-consent-settings");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (e) {
        e.preventDefault();
        window.openConsentSettings();
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireSettingsLinks);
  } else {
    wireSettingsLinks();
  }

  // Ablauf
  var choice = getChoice();
  if (choice === "accepted") {
    loadServices();
  } else if (choice === "rejected") {
    window.hagisConsent = "rejected";
  } else {
    showBanner();
  }
})();
