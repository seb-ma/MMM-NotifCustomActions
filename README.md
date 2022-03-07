# MMM-NotifCustomActions

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

It is a technical module designed to do the glue between modules or do simple js function.

It reacts on module notifications.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-NotifCustomActions',
            config: {
        		actions: [
                    // See below for detail
                ],
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `actions`        | *Required* Notifications action <br><br>**Type:** `array` See below for content

`actions` is a list of:
```js
{
    notification: "RECEIVED_NOTIFICATION", // Notification to observe
    sender: "sender_name" // (optional) Sender of the notification to observe
    action_node: function(sender, payload) {
        /* code executed on node side */
    },
    action_module: function(sender, payload) {
        /* code executed on client side */
},
```

## Function content for action_node

- All standard JS can be used.
- `this` of NodeJs can be accessed by keyword `self`
- Some librairies are accessible:
  - `exec` (`child_process.exec`)
  - `fs`
  - `os`
  - `path`
  - `url`
  - `util`

## Function content for action_module

- All standard JS can be used.
- `this` of module can be accessed by keyword `self` (allowing for exemple `self.sendNotification` call)

## Exemple of configuration
```js
actions: [
    {
        notification: "ACTION_SHUTDOWN",
        action_node: function(sender, payload) {
            exec("sudo shutdown -h now");
        }
    },
    {
        notification: "SPOTIFY_CONNECTED",
        action_module: function(sender, payload) {
            self.sendNotification("PAGE_SELECT", "musicPage");
        }
    },
]
```
