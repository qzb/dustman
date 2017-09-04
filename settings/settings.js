"use strict";

const bp = browser.extension.getBackgroundPage();

function initializeMinInactiveMinutes(state) {
  const input = document.getElementById("min-inactive-minutes");
  input.value = state.settings.minInactiveMilliseconds / (1000 * 60);
  input.addEventListener("change", () => {
    const s = parseFloat(input.value);
    if (isNaN(s) || s < 0) {
      input.classList.add("error");
      input.classList.remove("success");
    } else {
      input.classList.remove("error");
      input.classList.add("success");
      state.settings.minInactiveMilliseconds = s * 1000 * 60;
      bp.saveSettings(state.settings);
    }
  });
}

function initializeMinTabsCount(state) {
  const input = document.getElementById("min-tabs-count");
  input.value = state.settings.minTabsCount;
  input.addEventListener("change", () => {
    const c = parseInt(input.value);
    if (isNaN(c) || c <= 0) {
      input.classList.add("error");
      input.classList.remove("success");
    } else {
      input.classList.remove("error");
      input.classList.add("success");
      state.settings.minTabsCount = c;
      bp.saveSettings(state.settings);
    }
  });
}

function initializeMaxHistorySize(state) {
  const input = document.getElementById("max-history-size");
  input.value = state.settings.maxHistorySize;
  input.addEventListener("change", () => {
    const c = parseInt(input.value);
    if (isNaN(c) || c < 0) {
      input.classList.add("error");
      input.classList.remove("success");
    } else {
      input.classList.remove("error");
      input.classList.add("success");
      state.settings.maxHistorySize = c;
      bp.saveSettings(state.settings);
    }
  });
}

function initializeSettingsUi(state) {
  initializeMinInactiveMinutes(state); 
  initializeMinTabsCount(state); 
  initializeMaxHistorySize(state); 
}

initializeSettingsUi(bp.state);
