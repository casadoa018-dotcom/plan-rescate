"use strict";

const CACHE_PREFIX = "plan-rescate-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./site.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./social-preview.png",
  "./guia.css",
  "./guias.html",
  "./resolver-ejercicios-paso-a-paso.html",
  "./crear-plan-de-estudio.html",
  "./estudiar-apuntes.html",
  "./privacidad.html",
  "./condiciones.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (
          await caches.match(request)
          || await caches.match("./index.html")
          || await caches.match("./")
        ))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const refreshed = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || refreshed;
    })
  );
});
