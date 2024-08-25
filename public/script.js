document.addEventListener("DOMContentLoaded", () => {
  const timezoneSelect = document.getElementById("timezone");
  const availabilityForm = document.getElementById("availability-form");
  const resultDiv = document.getElementById("result");

  // Populate timezone select
  moment.tz.names().forEach((tz) => {
    const option = document.createElement("option");
    option.value = tz;
    option.textContent = tz;
    timezoneSelect.appendChild(option);
  });

  availabilityForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      timezone: document.getElementById("timezone").value,
      startTime: document.getElementById("start-time").value,
      endTime: document.getElementById("end-time").value,
    };

    try {
      const response = await fetch("/submit-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        resultDiv.textContent = `Availability submitted. Meeting ID: ${result.meetingId}`;
      } else {
        resultDiv.textContent = "Error submitting availability";
      }
    } catch (error) {
      console.error("Error:", error);
      resultDiv.textContent = "Error submitting availability";
    }
  });
});

availabilityForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    timezone: document.getElementById("timezone").value,
    startTime: document.getElementById("start-time").value,
    endTime: document.getElementById("end-time").value,
  };

  try {
    const response = await fetch("/submit-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const result = await response.json();
      window.location.href = `/meeting/${result.meetingId}`;
    } else {
      resultDiv.textContent = "Error submitting availability";
    }
  } catch (error) {
    console.error("Error:", error);
    resultDiv.textContent = "Error submitting availability";
  }
});
