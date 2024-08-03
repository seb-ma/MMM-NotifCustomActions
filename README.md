# MMM-NotifCustomActions

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

It is a technical module designed to do the glue between modules or do simple js function.

It reacts on module notifications.

For example, it can send a specific notification to a module or execute a shell command when another module broadcast a notification.

It can also call action from a URL call (GET or POST) using: `https://<host-magicmirror>/action/<notification-from-list>`.
See examples below.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
	modules: [
		{
			module: "MMM-NotifCustomActions",
			config: {
				actions: [
					// See below for detail
				],
			}
		},
	]
}
```

### Advanced usage

A JavaScript file can be loaded on node side or on client side to be used in actions.
This files must be located in `config` directory and must be named:

- `user_node.js` for the file loaded by node
  - it is loaded and accessible in global variable `user`
- `user_client.js` for the file loaded by browser
  - it is loaded as a standard js script

## Installation

```sh
cd ~/MagicMirror/modules # Change path to modules directory of your actual MagiMirror² installation
git clone https://github.com/seb-ma/MMM-NotifCustomActions
cd MMM-NotifCustomActions
npm install --no-audit --no-fund --no-update-notifier --only=prod --omit=dev
```

## Configuration options

| Option	| Description
|---------- |-------------
| `actions`	| *Required* Notifications action<br><br>**Type:** `array` See below for content

`actions` is a list of:

```js
{
	notification: "RECEIVED_NOTIFICATION", // Notification to observe
	sender: "sender_name" // (optional) Sender of the notification to observe
	action_node: function(self, sender, payload) { // May not be defined if there is no action to execute on node side
		/* code executed on node side */
	},
	action_client: function(self, sender, payload) { // May not be defined if there is no action to execute on client side
		/* code executed on client side */
	},
},
```

## Function content for action_node

- All standard JavaScript can be used.
- `this` of NodeJs can be accessed by keyword `self`
- Some librairies are accessible:
  - `exec` (`child_process.exec`)
  - `fs`
  - `os`
  - `path`
  - `url`
  - `util`
- Special user script is accessible (if `user_node.js` exists):
  - `user`

## Function content for action_client

- All standard JavaScript can be used.
- `this` of module can be accessed by keyword `self` (allowing for example `self.sendNotification` call)
- content of `user_client.js` file (if exists)

## Example of configuration

This example do:
- a `shutdown` command when notification `ACTION_SHUTDOWN` is received.
- a sent of notification `PAGE_SELECT` with payload `"musicPage"` when notification `SPOTIFY_CONNECTED` is received.

```js
actions: [
	{
		// Can be called by URL .../action/ACTION_SHUTDOWN or triggered by a notification ACTION_SHUTDOWN
		notification: "ACTION_SHUTDOWN",
		action_node: function(self, sender, payload) {
			exec("sudo shutdown -h now");
		}
	},
	{
		// Can be called by URL .../action/SPOTIFY_CONNECTED or triggered by a notification ACTION_SHUTDOWN
		notification: "SPOTIFY_CONNECTED",
		action_client: function(self, sender, payload) {
			self.sendNotification("PAGE_SELECT", "musicPage");
		}
	},
	{
		// Can be called by URL:
		// - as GET request - ex: http://localhost:8080/action/showPage?page=mainPage&delay=1000
		// - as POST request - ex: http://localhost:8080/action/showPage with JSON content in body { page: mainPage, delay: 1000 } 
		// Can be triggered by notification - ex: this.sendNotification("PAGE_SELECT" { page: mainPage, delay: 1000 });
		notification: "showPage",
		action_client: function(self, sender, payload) { // payload = { page: mainPage, delay: 1000 }
			self.sendNotification("PAGE_SELECT", payload);
		}
	},
]
```
