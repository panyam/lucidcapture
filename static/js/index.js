// ../../../../newstack/goapplib/main/tsappkit/dist/index.mjs
var FunctionSubscriber = class {
  constructor(handler) {
    this.handler = handler;
  }
  handleBusEvent(eventType, data, subject, emitter) {
    this.handler(data);
  }
};
var EventBus = class {
  constructor(debugMode = false) {
    this.subscribers = /* @__PURE__ */ new Map();
    this.functionSubscribers = /* @__PURE__ */ new Map();
    this.onceHandlers = /* @__PURE__ */ new Map();
    this.debugMode = false;
    this.debugMode = debugMode;
  }
  // ============== Simple Function-Based API ==============
  /**
   * Subscribe to an event with a simple handler function
   */
  on(eventType, handler) {
    if (!this.functionSubscribers.has(eventType)) {
      this.functionSubscribers.set(eventType, /* @__PURE__ */ new Map());
    }
    const handlersMap = this.functionSubscribers.get(eventType);
    if (handlersMap.has(handler)) {
      if (this.debugMode) {
        console.log(`[EventBus] Handler already registered for '${eventType}'`);
      }
      return;
    }
    const subscriber = new FunctionSubscriber(handler);
    handlersMap.set(handler, subscriber);
    this.addSubscription(eventType, null, subscriber);
  }
  /**
   * Unsubscribe a handler function from an event
   */
  off(eventType, handler) {
    const handlersMap = this.functionSubscribers.get(eventType);
    if (!handlersMap) return;
    const subscriber = handlersMap.get(handler);
    if (subscriber) {
      handlersMap.delete(handler);
      this.removeSubscription(eventType, null, subscriber);
      if (handlersMap.size === 0) {
        this.functionSubscribers.delete(eventType);
      }
    }
  }
  /**
   * Subscribe to an event for one-time execution
   */
  once(eventType, handler) {
    if (!this.onceHandlers.has(eventType)) {
      this.onceHandlers.set(eventType, /* @__PURE__ */ new Set());
    }
    const subscriber = new FunctionSubscriber(handler);
    this.onceHandlers.get(eventType).add(subscriber);
    if (this.debugMode) {
      console.log(`[EventBus] Added once handler for '${eventType}'`);
    }
  }
  // ============== EventSubscriber-Based API ==============
  /**
   * Add a subscription using the EventSubscriber pattern
   * Provides automatic idempotency - same subscriber object won't be added twice
   */
  addSubscription(eventType, subject, subscriber) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, /* @__PURE__ */ new Set());
    }
    const subscribers = this.subscribers.get(eventType);
    const wasAdded = !subscribers.has(subscriber);
    if (wasAdded) {
      subscribers.add(subscriber);
      if (this.debugMode) {
        console.log(`[EventBus] Added subscription to '${eventType}' for ${subscriber.constructor.name}`);
      }
    } else if (this.debugMode) {
      console.log(`[EventBus] Subscription already exists for '${eventType}' and ${subscriber.constructor.name}`);
    }
  }
  /**
   * Remove a subscription using the EventSubscriber pattern
   */
  removeSubscription(eventType, subject, subscriber) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      const wasRemoved = subscribers.delete(subscriber);
      if (this.debugMode && wasRemoved) {
        console.log(`[EventBus] Removed subscription from '${eventType}' for ${subscriber.constructor.name}`);
      }
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
      }
    }
  }
  /**
   * Emit an event to all subscribers
   * @param eventType - The event type to emit
   * @param data - The event data payload
   * @param subject - The subject/subject entity that this event relates to (optional for simple API)
   * @param emitter - The entity that emitted the event (optional for simple API)
   */
  emit(eventType, data, subject, emitter) {
    const subscribers = this.subscribers.get(eventType);
    const onceHandlers = this.onceHandlers.get(eventType);
    const subscriberCount = (subscribers?.size || 0) + (onceHandlers?.size || 0);
    if (subscriberCount === 0) {
      return;
    }
    if (this.debugMode) {
      console.log(`[EventBus] Emitting '${eventType}' to ${subscriberCount} subscribers`);
    }
    let successCount = 0;
    let errorCount = 0;
    if (subscribers) {
      subscribers.forEach((subscriber) => {
        try {
          subscriber.handleBusEvent(eventType, data, subject, emitter);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `[EventBus] Error in EventSubscriber handler for '${eventType}' in subscriber '${subscriber.constructor.name}':`,
            error
          );
        }
      });
    }
    if (onceHandlers && onceHandlers.size > 0) {
      onceHandlers.forEach((subscriber) => {
        try {
          subscriber.handleBusEvent(eventType, data, subject, emitter);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `[EventBus] Error in once handler for '${eventType}':`,
            error
          );
        }
      });
      this.onceHandlers.delete(eventType);
    }
    if (this.debugMode) {
      console.log(
        `[EventBus] Event '${eventType}' completed: ${successCount} success, ${errorCount} errors`
      );
    }
  }
  /**
   * Get all event types that have subscribers
   */
  getEventTypes() {
    return Array.from(this.subscribers.keys());
  }
  /**
   * Get subscriber count for an event type
   */
  getSubscriberCount(eventType) {
    return this.subscribers.get(eventType)?.size || 0;
  }
  /**
   * Clear all subscriptions (useful for cleanup)
   */
  clear() {
    this.subscribers.clear();
    this.functionSubscribers.clear();
    this.onceHandlers.clear();
    if (this.debugMode) {
      console.log("[EventBus] All subscriptions cleared");
    }
  }
  /**
   * Enable or disable debug logging
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }
};
var LifecycleEventTypes = {
  LOCAL_INIT_STARTED: "lifecycle-local-init-started",
  LOCAL_INIT_FINISHED: "lifecycle-local-init-finished",
  DEPENDENCIES_INJECTED: "lifecycle-dependencies-injected",
  ACTIVATION_STARTED: "lifecycle-activation-started",
  ACTIVATION_FINISHED: "lifecycle-activation-finished",
  DEACTIVATION_STARTED: "lifecycle-deactivation-started",
  DEACTIVATION_FINISHED: "lifecycle-deactivation-finished"
};
var LifecycleController = class {
  constructor(eventBus2, config = {}) {
    this.eventBus = eventBus2;
    this.config = {
      phaseTimeoutMs: config.phaseTimeoutMs ?? 1e4,
      continueOnError: config.continueOnError ?? false,
      validateDependencies: false,
      enableDebugLogging: config.enableDebugLogging ?? false
    };
    this.allComponents = [];
    this.componentsByLevel = [];
  }
  /**
   * Initialize component tree starting from root component
   *
   * @param rootComponent The root component to start initialization from
   * @param rootName Optional name for the root component (for debugging)
   * @returns Promise that resolves when all components are fully initialized
   */
  async initializeFromRoot(rootComponent) {
    await this.performLocalInit(rootComponent);
    await this.injectDependencies();
    await this.activate();
  }
  /**
   * Phase 0: Discover all components via breadth-first traversal
   */
  async performLocalInit(rootComponent) {
    const visited = /* @__PURE__ */ new Set();
    let queue = [rootComponent];
    this.allComponents = [rootComponent];
    if (this.componentsByLevel.length > 0) {
      throw new Error("Already done");
    }
    for (let level = 0; queue.length > 0; level++) {
      const newqueue = [];
      const promises = new Array();
      this.componentsByLevel.push(queue);
      for (let i = 0; i < queue.length; i++) {
        const component = queue[i];
        if (visited.has(component)) {
          throw new Error(
            `Component hierarchy integrity violation: Component '${component.constructor.name}' discovered as child of multiple parents at level ${level}. Component hierarchies must form a tree structure where each component has exactly one parent.`
          );
        }
        this.emitEvent(LifecycleEventTypes.LOCAL_INIT_STARTED, component, level);
        const result = component.performLocalInit();
        promises.push(Promise.resolve(result).then((children) => {
          for (const ch of children) {
            this.allComponents.push(ch);
            newqueue.push(ch);
          }
          return children;
        }));
        await Promise.all(promises);
        this.emitEvent(LifecycleEventTypes.LOCAL_INIT_FINISHED, component, level);
      }
      queue = newqueue;
    }
  }
  /**
   * Phase 1: Dependency injection.
   * Here all our components are already discovered so we can call directly
   */
  injectDependencies() {
    for (const comp of this.allComponents) {
      comp.setupDependencies();
    }
  }
  /**
   * Phase 2: Activate all components
   *
   * Here all our components are already discovered and their dependencies setup
   * so we can call directly
   */
  async activate() {
    const visited = /* @__PURE__ */ new Set();
    for (let level = 0; level < this.componentsByLevel.length; level++) {
      const promises = new Array();
      const levelComps = this.componentsByLevel[level];
      for (const comp of levelComps) {
        if (visited.has(comp)) {
          throw new Error("Comp already visited");
        }
        visited.add(comp);
        this.emitEvent(LifecycleEventTypes.ACTIVATION_STARTED, comp, 0);
        const result = comp.activate();
        promises.push(Promise.resolve(result).then(() => {
          this.emitEvent(LifecycleEventTypes.ACTIVATION_FINISHED, comp, 0);
        }));
      }
      await Promise.all(promises);
    }
  }
  /**
   * Deactivate all components in reverse order.  This is usually called when a page quits or a component is
   * deactivated
   */
  async deactivateAll() {
    for (let level = this.componentsByLevel.length - 1; level >= 0; level--) {
      const promises = new Array();
      const levelComps = this.componentsByLevel[level];
      for (const comp of levelComps) {
        this.emitEvent(LifecycleEventTypes.DEACTIVATION_STARTED, comp, level);
        const result = comp.deactivate();
        promises.push(Promise.resolve(result).then(() => {
          this.emitEvent(LifecycleEventTypes.DEACTIVATION_FINISHED, comp, level);
        }));
      }
      await Promise.all(promises);
    }
  }
  /**
   * Emit lifecycle event to registered callbacks
   */
  emitEvent(event, component, level, error = null) {
    this.eventBus.emit(
      event,
      { error, success: error == null },
      this,
      component
    );
  }
  /**
   * Log message if debug logging is enabled
   */
  log(message, ...args) {
    if (this.config.enableDebugLogging) {
      console.log(`[LifecycleController] ${message}`, ...args);
    }
  }
  /**
   * Log error message
   */
  logError(message, error) {
    console.error(`[LifecycleController] ${message}`, error);
  }
  /**
   * Get current status of all components
   */
  /*
  public getComponentStatus(): Array<{ name: string; phase: ComponentPhase }> {
      return Array.from(this.allComponents).map(component => ({
          name: this.getComponentName(component),
          phase: this.componentPhases.get(component) || 'created'
      }));
  }
  */
};
LifecycleController.DefaultConfig = {
  enableDebugLogging: true,
  phaseTimeoutMs: 15e3,
  // Increased timeout for component loading
  continueOnError: false
  // Fail fast for debugging
};
var _ThemeManager = class _ThemeManager2 {
  // Computer icon
  /**
   * Initialize theme based on saved preference or system default
   */
  static initialize() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === _ThemeManager2.DARK || !savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
  /**
   * Set theme and save preference
   */
  static setTheme(theme) {
    if (theme === _ThemeManager2.SYSTEM) {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (theme === _ThemeManager2.DARK) {
      localStorage.setItem("theme", _ThemeManager2.DARK);
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", _ThemeManager2.LIGHT);
      document.documentElement.classList.remove("dark");
    }
  }
  /**
   * Get current theme setting (light, dark, or system)
   */
  static getCurrentThemeSetting() {
    return localStorage.getItem("theme") || _ThemeManager2.SYSTEM;
  }
  /**
   * Gets the *next* theme in the cycle: Light -> Dark -> System -> Light ...
   */
  static getNextTheme(currentSetting) {
    if (currentSetting === _ThemeManager2.LIGHT) {
      return _ThemeManager2.DARK;
    } else if (currentSetting === _ThemeManager2.DARK) {
      return _ThemeManager2.SYSTEM;
    } else {
      return _ThemeManager2.LIGHT;
    }
  }
  /**
   * Gets the appropriate SVG icon string for a given theme setting.
   */
  static getIconSVG(themeSetting) {
    switch (themeSetting) {
      case _ThemeManager2.LIGHT:
        return _ThemeManager2.LIGHT_ICON_SVG;
      case _ThemeManager2.DARK:
        return _ThemeManager2.DARK_ICON_SVG;
      case _ThemeManager2.SYSTEM:
      default:
        return _ThemeManager2.SYSTEM_ICON_SVG;
    }
  }
  /**
   * Gets a user-friendly label for the theme setting.
   */
  static getThemeLabel(themeSetting) {
    switch (themeSetting) {
      case _ThemeManager2.LIGHT:
        return "Light Mode";
      case _ThemeManager2.DARK:
        return "Dark Mode";
      case _ThemeManager2.SYSTEM:
      default:
        return "System Default";
    }
  }
  /**
   * Initialize the ThemeManager (no instance needed for static methods)
   */
  static init() {
    _ThemeManager2.initialize();
  }
};
_ThemeManager.LIGHT = "light";
_ThemeManager.DARK = "dark";
_ThemeManager.SYSTEM = "system";
_ThemeManager.LIGHT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
_ThemeManager.DARK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
_ThemeManager.SYSTEM_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>`;
var TemplateLoader = class {
  constructor(registryName = "template-registry") {
    this.registryName = registryName;
  }
  /**
   * Finds the specified template wrapper element in the registry.
   * @param templateId The data-template-id of the wrapper element.
   * @returns The wrapper HTMLElement or null if not found.
   */
  _findTemplateWrapper(templateId) {
    const templateRegistry = document.getElementById(this.registryName);
    if (!templateRegistry) {
      console.error(`Template registry '#${this.registryName}' not found!`);
      return null;
    }
    const templateWrapper = templateRegistry.querySelector(`[data-template-id="${templateId}"]`);
    if (!templateWrapper) {
      console.error(`Template with ID "${templateId}" not found in registry '#${this.registryName}'.`);
      return null;
    }
    return templateWrapper;
  }
  /**
   * Loads and returns the inner HTML of a template definition.
   * @param templateId The data-template-id of the wrapper element.
   * @returns The innerHTML content as string if it exists otherwise null.
   */
  loadHtml(templateId) {
    const templateWrapper = this._findTemplateWrapper(templateId);
    if (!templateWrapper) {
      return null;
    }
    return templateWrapper.innerHTML;
  }
  /**
   * Loads and clones the child elements of a template definition.
   * @param templateId The data-template-id of the wrapper element.
   * @returns An array of cloned HTMLElement children, or an empty array if not found or has no children.
   */
  load(templateId) {
    const templateWrapper = this._findTemplateWrapper(templateId);
    if (!templateWrapper) {
      return [];
    }
    const templateRootElement = templateWrapper.cloneNode(true);
    if (!templateRootElement) {
      console.error(`Template content is empty for: ${templateId}`);
      return [];
    }
    return Array.from(templateRootElement.children);
  }
  /**
  * Loads a template's content, clears the target element, and appends the cloned content into it.
  * @param templateId The data-template-id of the wrapper element to load.
  * @param targetElement The HTMLElement where the cloned content should be placed.
  * @returns True if the operation was successful (template found and content appended, even if content was empty), false otherwise.
  */
  loadInto(templateId, targetElement) {
    if (!targetElement) {
      console.error(`Cannot load template "${templateId}": Target element is null.`);
      return false;
    }
    const templateWrapper = this._findTemplateWrapper(templateId);
    if (!templateWrapper) {
      targetElement.innerHTML = `<div class="p-4 text-red-500">Error loading template '${templateId}' (Not Found)</div>`;
      return false;
    }
    targetElement.innerHTML = "";
    const childElements = Array.from(templateWrapper.children);
    if (childElements.length === 0) {
      console.warn(`Template "${templateId}" has no child elements to load.`);
    } else {
      childElements.forEach((child) => {
        targetElement.appendChild(child.cloneNode(true));
      });
    }
    return true;
  }
};
var _Modal = class _Modal2 {
  // Store the Apply callback
  /**
   * Private constructor for singleton pattern
   */
  constructor() {
    this.currentTemplateId = null;
    this.currentData = null;
    this.onSubmitCallback = null;
    this.onApplyCallback = null;
    this.modalContainer = document.getElementById("modal-container");
    this.modalBackdrop = document.getElementById("modal-backdrop");
    this.modalPanel = document.getElementById("modal-panel");
    this.modalContent = document.getElementById("modal-content");
    this.closeButton = document.getElementById("modal-close");
    this.templateLoader = new TemplateLoader();
    this.bindEvents();
  }
  /**
   * Get the Modal instance (singleton)
   */
  static getInstance() {
    if (!_Modal2.instance) {
      _Modal2.instance = new _Modal2();
    }
    return _Modal2.instance;
  }
  /**
   * Bind event listeners for modal interactions
   */
  bindEvents() {
    if (this.closeButton) {
      this.closeButton.addEventListener("click", () => this.hide());
    }
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener("click", (e) => {
        if (e.target === this.modalBackdrop) {
          this.hide();
        }
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible()) {
        this.hide();
      }
    });
    if (this.modalPanel) {
      this.modalPanel.addEventListener("click", (e) => {
        const target = e.target;
        const closeButton = target.closest('button[id$="-cancel"], button[id$="-close"]');
        if (closeButton) {
          this.hide();
          return;
        }
        const actionButton = target.closest("button[data-modal-action]");
        if (actionButton) {
          const action = actionButton.getAttribute("data-modal-action");
          if (action === "submit" && this.onSubmitCallback) {
            this.onSubmitCallback(this.currentData);
          } else if (action === "apply" && this.onApplyCallback) {
            this.onApplyCallback(this.currentData);
            this.hide();
          }
        }
      });
    }
  }
  /**
   * Check if the modal is currently visible
   */
  isVisible() {
    return this.modalContainer ? !this.modalContainer.classList.contains("hidden") : false;
  }
  /**
   * Show a modal with content from the specified template ID.
   * Uses TemplateLoader to get the content element.
   * @param templateId ID used in `data-template-id` attribute in TemplateRegistry.html
   * @param data Optional data to pass to the modal. Can include callbacks like `onSubmit`.
   * @returns The root HTMLElement of the loaded content, or null if failed.
   */
  show(templateId, data = null) {
    if (!this.modalContainer || !this.modalContent) {
      console.error("Modal container or content area not found.");
      return null;
    }
    const success = this.templateLoader.loadInto(templateId, this.modalContent);
    if (!success) {
      this.modalContainer.classList.remove("hidden");
      setTimeout(() => this.modalContainer.classList.add("modal-active"), 10);
      return null;
    }
    this.currentTemplateId = templateId;
    this.currentData = data || {};
    this.onSubmitCallback = data?.onSubmit || null;
    this.onApplyCallback = data?.onApply || null;
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "onSubmit" && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")) {
          if (this.modalContent) this.modalContent.dataset[key] = String(value);
        }
      });
    }
    this.modalContainer.classList.remove("hidden");
    setTimeout(() => {
      this.modalContainer.classList.add("modal-active");
    }, 10);
    const firstElement = this.modalContent;
    return firstElement;
  }
  /**
   * Hide the modal
   */
  hide() {
    return new Promise((resolve) => {
      if (!this.modalContainer) return;
      this.modalContainer.classList.remove("modal-active");
      setTimeout(() => {
        this.modalContainer.classList.add("hidden");
        this.currentTemplateId = null;
        this.currentData = null;
        this.onSubmitCallback = null;
        this.onApplyCallback = null;
        if (this.modalContent) this.modalContent.innerHTML = "";
        resolve();
      }, 200);
    });
  }
  /**
   * Get the current modal content element
   */
  getContentElement() {
    return this.modalContent;
  }
  /**
   * Get the current template ID
   */
  getCurrentTemplate() {
    return this.currentTemplateId;
  }
  /**
   * Get the current modal data
   */
  getCurrentData() {
    return this.currentData;
  }
  /**
   * Update modal data (excluding callbacks for now)
   */
  updateData(newData) {
    this.currentData = { ...this.currentData, ...newData };
    if (this.modalContent && newData) {
      Object.entries(newData).forEach(([key, value]) => {
        if (key !== "onSubmit" && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")) {
          if (this.modalContent) this.modalContent.dataset[key] = String(value);
        }
      });
    }
  }
  /**
   * Initialize the modal component
   */
  static init() {
    return _Modal2.getInstance();
  }
};
_Modal.instance = null;
var _ToastManager = class _ToastManager2 {
  /**
   * Private constructor for singleton pattern
   */
  constructor() {
    this.toasts = /* @__PURE__ */ new Map();
    this.counter = 0;
    this.container = document.getElementById("toast-container");
    this.template = document.getElementById("toast-template");
  }
  /**
   * Get the ToastManager instance (singleton)
   */
  static getInstance() {
    if (!_ToastManager2.instance) {
      _ToastManager2.instance = new _ToastManager2();
    }
    return _ToastManager2.instance;
  }
  /**
   * Show a toast notification
   * @param title Toast title
   * @param message Toast message
   * @param type Toast type for styling
   * @param duration Duration in ms (default: 4000)
   */
  showToast(title, message, type = "info", duration = 4e3) {
    if (!this.container || !this.template) return "";
    const id = `toast-${Date.now()}-${this.counter++}`;
    const toast = this.template.cloneNode(true);
    toast.id = id;
    toast.classList.remove("hidden");
    const titleElement = toast.querySelector(".toast-title");
    const messageElement = toast.querySelector(".toast-message");
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    const iconContainer = toast.querySelector(".flex-shrink-0");
    if (iconContainer) {
      iconContainer.innerHTML = "";
      let icon;
      let borderColor;
      switch (type) {
        case "success":
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>';
          borderColor = "border-green-500";
          break;
        case "error":
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>';
          borderColor = "border-red-500";
          break;
        case "warning":
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
          borderColor = "border-yellow-500";
          break;
        case "info":
        default:
          icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>';
          borderColor = "border-blue-500";
          break;
      }
      iconContainer.innerHTML = icon;
      const borderElement = toast.querySelector(".border-l-4");
      if (borderElement) {
        borderElement.className = borderElement.className.replace(/border-[a-z]+-500/g, borderColor);
      }
    }
    const closeButton = toast.querySelector(".toast-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.hideToast(id);
      });
    }
    this.container.appendChild(toast);
    this.toasts.set(id, toast);
    setTimeout(() => {
      toast.classList.remove("scale-95", "opacity-0");
      toast.classList.add("scale-100", "opacity-100");
    }, 10);
    if (duration > 0) {
      setTimeout(() => {
        this.hideToast(id);
      }, duration);
    }
    return id;
  }
  /**
   * Hide a toast notification
   * @param id Toast ID
   */
  hideToast(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;
    toast.classList.remove("scale-100", "opacity-100");
    toast.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      toast.remove();
      this.toasts.delete(id);
    }, 300);
  }
  /**
   * Hide all toast notifications
   */
  hideAllToasts() {
    this.toasts.forEach((_, id) => {
      this.hideToast(id);
    });
  }
  /**
   * Initialize the component
   */
  static init() {
    return _ToastManager2.getInstance();
  }
};
_ToastManager.instance = null;
var SplashScreen = class {
  /**
   * Dismiss the splash screen with a fade-out animation
   * Safe to call multiple times - only dismisses once
   */
  static dismiss() {
    if (this.dismissed) {
      return;
    }
    const splash = document.getElementById(this.SPLASH_ID);
    if (!splash) {
      return;
    }
    this.dismissed = true;
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.remove();
    }, 300);
  }
  /**
   * Update the splash screen message (if it hasn't been dismissed yet)
   */
  static updateMessage(title, message) {
    if (this.dismissed) {
      return;
    }
    const splash = document.getElementById(this.SPLASH_ID);
    if (!splash) {
      return;
    }
    if (title) {
      const titleEl = splash.querySelector("[data-splash-title]");
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
    if (message) {
      const messageEl = splash.querySelector("[data-splash-message]");
      if (messageEl) {
        messageEl.textContent = message;
      }
    }
  }
  /**
   * Update the splash screen progress bar
   * @param percent - Progress percentage (0-100)
   */
  static updateProgress(percent) {
    if (this.dismissed) {
      return;
    }
    const splash = document.getElementById(this.SPLASH_ID);
    if (!splash) {
      return;
    }
    const clampedPercent = Math.max(0, Math.min(100, percent));
    const progressBar = splash.querySelector("[data-splash-progress-bar]");
    if (progressBar) {
      progressBar.style.width = `${clampedPercent}%`;
    }
    const progressText = splash.querySelector("[data-splash-progress-text]");
    if (progressText) {
      progressText.textContent = `${Math.round(clampedPercent)}%`;
    }
  }
  /**
   * Update both message and progress at once
   */
  static update(options) {
    if (options.title !== void 0 || options.message !== void 0) {
      this.updateMessage(options.title, options.message);
    }
    if (options.progress !== void 0) {
      this.updateProgress(options.progress);
    }
  }
  /**
   * Check if splash screen is still visible
   */
  static isVisible() {
    return !this.dismissed && !!document.getElementById(this.SPLASH_ID);
  }
};
SplashScreen.SPLASH_ID = "splash-screen";
SplashScreen.dismissed = false;

// index.ts
var eventBus = new EventBus();
globalThis.__lucidEventBus = eventBus;
console.log("[LucidCapture] tsappkit initialized");
//# sourceMappingURL=index.js.map