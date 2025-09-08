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


      // Open SSE connection
      const evtSource = new EventSource("/events");
      const checkboxes = document.querySelectorAll(".button-container input[type='checkbox']");

      evtSource.onmessage = (event) => {
            const { deviceId: id, state } = JSON.parse(event.data);

            // Only update if this message is for my device
            if (id !== deviceId) return;

            const binary = state.toString(2).padStart(3, "0");
            checkboxes[0].checked = binary[0] === "1"; // Light
            checkboxes[1].checked = binary[1] === "1"; // Fan
            checkboxes[2].checked = binary[2] === "1"; // Heater
      };
});

