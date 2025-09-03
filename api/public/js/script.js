document.addEventListener("DOMContentLoaded", function () {
      const input = document.getElementById("deviceNameInput");
      const saveButton = document.getElementById("saveButton");
      const deleteButton = document.getElementById("deleteButton");
      const container = document.getElementById("device-container");
      const deviceId = container.getAttribute("data-device-id");

      if (input) {
            let updatedName = input.value;
            input.addEventListener("change", function (event) {
                  updatedName = event.target.value;
            });

            saveButton.addEventListener("click", function () {
                  fetch(`/api/v1/update/${deviceId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: updatedName }),
                  })
                        .then((response) => {
                              if (!response.ok) throw new Error("Network response was not ok");
                              return response.json();
                        })
                        .then((data) => {
                              alert("Device name saved!");
                        })
                        .catch((error) => {
                              console.error("Error:", error);
                              alert("Failed to save device name.");
                        });
            });
      }

      deleteButton.addEventListener("click", function () {
            fetch(`/api/v1/delete/${deviceId}`, {
                  method: "DELETE",
            })
                  .then((response) => {
                        if (!response.ok) throw new Error("Network response was not ok");
                        return response.json();
                  })
                  .then((data) => {
                        alert("Device deleted!");
                        window.location.href = "/";
                  })
                  .catch((error) => {
                        console.error("Error:", error);
                        alert("Failed to delete device.");
                  });
      });
});
