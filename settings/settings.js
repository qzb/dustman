'use strict'

function initializeMinInactiveMinutes (settings) {
  const input = document.getElementById('min-inactive-minutes')
  input.value = settings.minInactiveMilliseconds / (1000 * 60)
  input.addEventListener('change', () => {
    const s = parseFloat(input.value)
    if (isNaN(s) || s < 0) {
      input.setAttribute('aria-invalid', true)
    } else {
      input.setAttribute('aria-invalid', false)
      settings.minInactiveMilliseconds = s * 1000 * 60
      persistSettings(settings)
    }
  })
}

function initializeMinTabsCount (settings) {
  const input = document.getElementById('min-tabs-count')
  input.value = settings.minTabsCount
  input.addEventListener('change', () => {
    const c = parseInt(input.value)
    if (isNaN(c) || c <= 0) {
      input.setAttribute('aria-invalid', true)
    } else {
      input.setAttribute('aria-invalid', false)
      settings.minTabsCount = c
      persistSettings(settings)
    }
  })
}

function initializeMaxHistorySize (settings) {
  const input = document.getElementById('max-history-size')
  input.value = settings.maxHistorySize
  input.addEventListener('change', () => {
    const c = parseInt(input.value)
    if (isNaN(c) || c < 0) {
      input.setAttribute('aria-invalid', true)
    } else {
      input.setAttribute('aria-invalid', false)
      settings.maxHistorySize = c
      persistSettings(settings)
    }
  })
}

function initializeClearHistoryOnExit (settings) {
  const input = document.getElementById('clear-history-on-exit')
  input.checked = settings.clearHistoryOnExit
  input.addEventListener('change', () => {
    settings.clearHistoryOnExit = input.checked
    persistSettings(settings)
  })
}

function initializeSettingsUi (settings) {
  initializeMinInactiveMinutes(settings)
  initializeMinTabsCount(settings)
  initializeMaxHistorySize(settings)
  initializeClearHistoryOnExit(settings)
}

loadState().then(state => initializeSettingsUi(state.settings))
