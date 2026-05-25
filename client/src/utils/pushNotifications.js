export const isPushSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
};

export const showBrowserNotification = (payload) => {
  if (!isPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  if (!payload?.title) {
    return false;
  }

  new Notification(payload.title, {
    body: payload.body || "",
    icon: "/favicon.ico",
    tag: "factify-analysis",
  });

  return true;
};
