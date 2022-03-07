/* Magic Mirror
 * Module: MMM-NotifCustomActions
 *
 * By Sébastien Mazzon
 * MIT Licensed.
 */

Module.register("MMM-NotifCustomActions", {

	defaults: {
		actions: [],
	},
	modules_loaded: false,

	start: function() {
		this.modules_loaded = true;
	},

	notificationReceived: function (notification, payload, sender) {
		if (this.modules_loaded) {
			self = this;
			const actionsModule = this.config.actions.filter(actionModule => actionModule.notification === notification
															&& (typeof actionModule.sender === 'undefined' || actionModule.sender === sender.name));

			for (const actionModule of actionsModule) {
				if (typeof actionModule.action_node === 'function') {
					// Node actions
					this.sendSocketNotification("DO_ACTION", {action: actionModule.action_node.toString(), notification: notification, payload: payload, sender: sender.name});
				}

				if (typeof actionModule.action_module === 'function') {
					// Module actions
					Log.debug(payload);
					actionModule.action_module(sender.name, payload);
				}
			}
		}
	},
});
