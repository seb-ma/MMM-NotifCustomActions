/**
 * This is a MagicMirror² module designed to do the glue between modules or do simple js function.
 * @module MMM-NotifCustomActions
 * @class NodeHelper
 * @see `README.md`
 * @author Sébastien Mazzon
 * @license MIT - @see `LICENCE.txt`
 */
"use strict";

const NodeHelper = require("node_helper");
const Log = require("logger");
const BodyParser = require("body-parser");

// Convenient libraries to be used by actions
const exec = require("child_process").exec;
const fs = require("fs");
const os = require("os");
const path = require("path");
const url = require("url");
const util = require("util");

/**
 * User script file (if exists) to load
 */
let user = undefined;


module.exports = NodeHelper.create({

	/**
	 * Starts the node helper of the module
	 * @see `node_helper.start`
	 * @see <https://docs.magicmirror.builders/development/node-helper.html#start>
	 */
	start: function () {
		// User script to load (if exists)
		const userScript = `${this.path}/../../config/user_node.js`;
		if (fs.existsSync(userScript)) {
			// Load user file
			user = require(userScript);
			Log.log("User script loaded");
		} else {
			// No user script
			Log.log("No user script to load");
		}

		const self = this;
		this.expressApp.use(BodyParser.urlencoded({ extended: true }));
		// Allows to run action from url call using GET
		this.expressApp.get("/action/:notif", function (req, res) {
			const payload = { notification: req.params.notif, params: req.query };
			Log.info("Forward notification", payload);
			self.sendSocketNotification("NOTIFICATION_FROM_URL", payload);
			res.sendStatus(200);
		});
		// Allows to run action from url call using POST
		this.expressApp.post("/action/:notif", function (req, res) {
			const payload = { notification: req.params.notif, params: req.body };
			Log.info("Forward notification", payload);
			self.sendSocketNotification("NOTIFICATION_FROM_URL", payload);
			res.sendStatus(200);
		})
	},

	/**
	 * This method is called when a socket notification arrives.
	 * @see `node_helper.socketNotificationReceived`
	 * @see <https://docs.magicmirror.builders/development/node-helper.html#socketnotificationreceived-function-notification-payload>
	 * @param {string} notification The identifier of the notification.
	 * @param {*} payload The payload of the notification.
	 */
	socketNotificationReceived: function (notification, payload) {
		const self = this;
		if (notification === "INIT") {
			// Nothing to do - this notification is only sent to establish socket connection
		} else if (notification === "DO_ACTION") {
			// Action to execute on node side - payload is {sender, action, payload}
			Log.info(payload);

			// Tricky part to execute (eval) action (declared function) in module context (call(this, ...))
			const strAction = '(' + payload.action + ')';
			return function (self, sender, payload) { return eval(strAction)(self, sender, payload); }
				.call(self, payload.sender, payload.payload);
		}
	},

});
