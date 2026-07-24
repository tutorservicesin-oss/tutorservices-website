document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".registration-form").forEach((form) => {
    const feeStructureSelect = form.querySelector("[data-fee-structure]");
    const hourlyFeeWrapper = form.querySelector("[data-hourly-fee-field]");
    const hourlyFeeInput = hourlyFeeWrapper?.querySelector("input");

    if (!feeStructureSelect || !hourlyFeeWrapper || !hourlyFeeInput) {
      return;
    }

    const syncHourlyFeeField = () => {
      const isHourly = feeStructureSelect.value === "Hourly";

      hourlyFeeWrapper.classList.toggle("d-none", !isHourly);
      hourlyFeeInput.required = isHourly;

      if (!isHourly) {
        hourlyFeeInput.value = "";
      }
    };

    feeStructureSelect.addEventListener("change", syncHourlyFeeField);
    syncHourlyFeeField();
  });
});
