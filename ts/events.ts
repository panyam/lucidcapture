// EventBus event types for cross-component communication

export const Events = {
  // Step selection
  STEP_SELECTED: 'step-selected',
  STEP_UPDATED: 'step-updated',

  // Hotspot
  HOTSPOT_MOVED: 'hotspot-moved',

  // Playback
  PLAYBACK_TOGGLED: 'playback-toggled',
  STEP_ADVANCED: 'step-advanced',

  // Edit mode
  EDIT_MODE_TOGGLED: 'edit-mode-toggled',

  // Controls visibility (player)
  CONTROLS_VISIBILITY: 'controls-visibility',

  // Project data loaded
  PROJECT_LOADED: 'project-loaded',
  PROJECT_CREATED: 'project-created',
  PROJECT_DELETED: 'project-deleted',
} as const
