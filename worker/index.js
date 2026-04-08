/* Tap sulla notifica promemoria → focus finestra app (iniettato nello SW da next-pwa). */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    event.notification.data && typeof event.notification.data.url === "string"
      ? event.notification.data.url
      : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});

/** Notifiche inviate dal server (Web Push) quando l’app è chiusa. */
self.addEventListener("push", (event) => {
  const fallback = {
    title: "🥑 PocketDiet",
    body: "Prima di chiudere la giornata, segna i tuoi progressi di oggi! Così potrai generare un report completo ogni volta che vorrai.",
    tag: "pocketdiet-reminder",
    url: "/",
  };
  let payload = { ...fallback };
  if (event.data) {
    try {
      const data = event.data.json();
      if (typeof data.title === "string") payload.title = data.title;
      if (typeof data.body === "string") payload.body = data.body;
      if (typeof data.tag === "string") payload.tag = data.tag;
      if (typeof data.url === "string") payload.url = data.url;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: payload.tag,
      data: { url: payload.url },
    }),
  );
});
