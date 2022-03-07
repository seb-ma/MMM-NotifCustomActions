/* Magic Mirror
 * Node Helper: MMM-NotifCustomActions
 *
 * By Sébastien Mazzon
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const Log = require("logger");

// Convenient libraries to be used by actions
const exec = require("child_process").exec;
const fs = require("fs");
const os = require("os");
const path = require("path");
const url = require("url");
const util = require("util");


module.exports = NodeHelper.create({

    socketNotificationReceived: function(notification, payload) {
        self = this;
        if (notification === "DO_ACTION") {
            Log.info(payload);

            // Tricky part to execute (eval) action (declared function) in module context (call(this, ...))
            const strAction = '(' + payload.action + ')';
            return function(sender, payload) {return eval(strAction)(sender, payload); }
                .call(this, payload.sender, payload.payload);
        }
    },
});
