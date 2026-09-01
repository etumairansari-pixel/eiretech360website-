const startApp = () => {
  void import("./main");
};

const scheduleAppStart = () => {
  let started = false;
  let timer: number | undefined;

  const startOnce = () => {
    if (started) return;
    started = true;
    if (timer) window.clearTimeout(timer);
    window.removeEventListener("pointerdown", startOnce);
    window.removeEventListener("keydown", startOnce);
    startApp();
  };

  window.addEventListener("pointerdown", startOnce, { once: true, passive: true });
  window.addEventListener("keydown", startOnce, { once: true });

  const queueStart = () => {
    timer = window.setTimeout(startOnce, 4200);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(queueStart, { timeout: 2200 });
  } else {
    queueStart();
  }
};

if (document.readyState === "complete") {
  scheduleAppStart();
} else {
  window.addEventListener("load", scheduleAppStart, { once: true });
}
