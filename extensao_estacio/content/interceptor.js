// Estácio Suite AI - Main World Interceptor (MV3)
(() => {
  // src/interceptor.js
  (function() {
    "use strict";
    function saveToken(token) {
      if (!token || typeof token !== "string" || token.length < 20) return;
      const clean = token.replace(/^Bearer\s+/i, "").trim();
      if (!clean) return;
      window.__estacio_bearer = clean;
      try {
        sessionStorage.setItem("estacio_bearer", clean);
      } catch (e) {
      }
      try {
        localStorage.setItem("estacio_bearer", clean);
      } catch (e) {
      }
      try {
        window.dispatchEvent(new CustomEvent("estacio_token_captured", {
          detail: { token: clean }
        }));
      } catch (e) {
      }
    }
    const origFetch = window.fetch;
    if (typeof origFetch === "function") {
      window.fetch = async function(...args) {
        try {
          const headers = args[1]?.headers;
          if (headers) {
            let auth = null;
            if (typeof headers.get === "function") {
              auth = headers.get("Authorization") || headers.get("authorization");
            } else if (Array.isArray(headers)) {
              const entry = headers.find(([k]) => k.toLowerCase() === "authorization");
              if (entry) auth = entry[1];
            } else if (typeof headers === "object") {
              auth = headers["Authorization"] || headers["authorization"];
            }
            if (auth && auth.startsWith("Bearer ")) {
              saveToken(auth);
            }
          }
        } catch (e) {
        }
        return origFetch.apply(this, args);
      };
    }
    if (typeof window.XMLHttpRequest !== "undefined" && window.XMLHttpRequest.prototype) {
      const origSetRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
      window.XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header && header.toLowerCase() === "authorization" && value && value.startsWith("Bearer ")) {
          saveToken(value);
        }
        return origSetRequestHeader.apply(this, arguments);
      };
    }
    try {
      const candidateKeys = ["token", "accessToken", "access_token", "bearer", "estacio_bearer", "auth_token"];
      for (const k of candidateKeys) {
        const val = sessionStorage.getItem(k) || localStorage.getItem(k);
        if (val && val.length > 20) {
          saveToken(val);
          break;
        }
      }
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("oidc.user") || key.includes("authority") || key.includes("token") || key.includes("auth"))) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (item && item.access_token) {
              saveToken(item.access_token);
              break;
            }
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  })();
})();
