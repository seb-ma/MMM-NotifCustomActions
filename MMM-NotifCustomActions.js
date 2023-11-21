/**
 * This is a MagicMirror² module designed to do the glue between modules or do simple js function.
 * @module MMM-NotifCustomActions
 * @class Module
 * @see `README.md`
 * @author Sébastien Mazzon
 * @license MIT - @see `LICENCE.txt`
 */
"use strict";

Module.register("MMM-NotifCustomActions", {

	/**
	 * Default properties of the module
	 * @see `module.defaults`
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#defaults>
	 * @see `README.md`
	 */
	defaults: {
		actions: [], // List of actions (node and clients) when notification is received
	},

	/**
	 * Indicates if all modules are initialized (when `start` is called)
	 */
	modules_loaded: false,

	/**
	 * Initializes module
	 * @see `module.start`
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#start>
	 */
	start: function () {
		// Initializes socket connection
		this.sendSocketNotification("INIT");
		// All modules are initialized
		this.modules_loaded = true;
	},

	/**
	 * Returns the user script to load (if if exists)
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html#getscripts>
	 * @returns {string[]} An array with filenames
	 */
	getScripts: function () {
		const fileExists = (file) =>
			fetch(file, { method: "HEAD", cache: "no-store" })
				.then(response => response.status == 200)
				.catch(e => false);

		// User script to load (if exists)
		const userScript = this.file("user_client.js");
		let isExisting;
		(async () => {
			isExisting = await fileExists(userScript);
		})();

		return isExisting ? [userScript] : [];
	},

	/**
	 * Called by the MagicMirror² core when a notification arrives.
	 *
	 * @param {string} notification The identifier of the notification.
	 * @param {*} payload The payload of the notification.
	 * @param {Module} sender The module that sent the notification.
	 */
	notificationReceived: function (notification, payload, sender) {
		if (this.modules_loaded) {
			// Execute actions only after full init of modules
			const self = this;
			// Find actions linked to received notification (sender is optional)
			const actionsModule = this.config.actions.filter(actionModule => actionModule.notification === notification
				&& (typeof actionModule.sender === 'undefined' || actionModule.sender === sender?.name));

			for (const actionModule of actionsModule) {
				if (typeof actionModule.action_node === 'function') {
					// Send node action to node helper
					this.sendSocketNotification("DO_ACTION", { action: actionModule.action_node.toString(), notification: notification, payload: payload, sender: sender.name });
				}

				if (typeof actionModule.action_client === 'function') {
					// Execute client action
					Log.debug(payload);
					actionModule.action_client(self, sender?.name, payload);
				}
			}
		}
	},

	/**
	 * Called when a socket notification arrives.
	 * @see `module.socketNotificationReceived`
	 * @see <https://docs.magicmirror.builders/development/core-module-file.html?#socketnotificationreceived-function-notification-payload>
	 * @param {string} notification The identifier of the notification.
	 * @param {*} payload The payload of the notification.
	 */
	socketNotificationReceived: function (notification, payload) {
		if (notification === "NOTIFICATION_FROM_URL") {
			// Find actions linked to received notification (sender is optional)
			const actionsModule = this.config.actions.filter(actionModule => actionModule.notification === payload.notification
				&& (typeof actionModule.sender === 'undefined' || actionModule.sender === this.name));
			// If the notification is declared
			if (actionsModule.length > 0) {
				// Relay notification to other modules
				this.sendNotification(payload.notification, payload.params);
				// Process own notification
				this.notificationReceived(payload.notification, payload.params, this);
			}
		}
	},

});
