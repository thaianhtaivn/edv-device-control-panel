document.addEventListener("DOMContentLoaded", function () {
      async function sendToggle(id, state) {
            try {
                  const res = await fetch("/api/v1/device/toggle", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, state }),
                  });

                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const data = await res.json().catch(() => ({}));
            } catch (e) {
                  console.error("Failed:", e);
            }
      }

      const container = document.getElementById("device-container");
      const deviceId = container?.getAttribute("data-device-id");
      const btn_container = document.querySelector(".container");

      if (btn_container) {
            btn_container.querySelectorAll(".toggle input").forEach(input => {
                  input.addEventListener("change", () => {
                        const states = Array.from(
                              btn_container.querySelectorAll(".toggle input")
                        ).map(el => (el.checked ? 1 : 0));

                        const state_number = parseInt(states.join(""), 2);
                        sendToggle(deviceId, state_number);
                  });
            });
      }
});
