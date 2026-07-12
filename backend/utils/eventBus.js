/**
 * eventBus.js
 * Centralized Event Emitter for decoupling business logic from side effects
 * like Activity Logging and Notifications.
 */
const EventEmitter = require('events');

class EventBus extends EventEmitter {}

// Export a singleton instance
const eventBus = new EventBus();

// Increase max listeners if the app scales up significantly
eventBus.setMaxListeners(20);

module.exports = eventBus;
