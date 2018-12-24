/* jshint esversion:6 */

/**** Extending your module to work with MMM-KeyBindings *****
 *  
 *  Use the code below in your module to accept key press
 *  events generated by the MMM-KeyBindings module.
 * 
 *  These is a basic implementation, expand as needed.
 *
 */
let keyBindings = { 
    // DO NOT COPY ABOVE THIS LINE (for future modulization)

    /*** defaults ***
     *
     *   Add items below to your moduleName.js's `defaults` object
     *
     */
    defaults: {
        /*** MMM-KeyBindings STANDARD MAPPING ***/
        /* Add the "mode" you would like to respond to */
        keyBindingsMode: "DEFAULT",
        keyBindings: {
            /* Add each key you want to respond to in the form:
             *      yourKeyName: "KeyName_from_MMM-KeyBindings"
             */
            Right: "ArrowRight",
            Left: "ArrowLeft",
            /* ... */
        },
        
        /*** OPTIONAL ***/
        /*  When using muliple instances (i.e. the screen connected
         *  to the server & browser windows on other computers):
         *  
         *  kbMultiInstance: true -- the bluetooth device will only
         *  control the local server's instance.
         *  The browswer windows are controlled by the local
         *   keyboard (assuming enableMoustrap:true in
         *   MMM-KeyBindings' config)
         *
         *  kbMultiInstance: false -- the bluetooth device will
         *  control all instances of this module.
         *  
         */
        kbMultiInstance: true,

        /* If you would like your module to "take focus" when a
         * particular key is pressed change the keyBindingsMode
         * setting to "MYKEYWORD" and add a "keyBindingsTakeFocus"
         * mapped to a key. This will keep other modules
         * from responding to key presses when you have focus.
         * 
         * Just remember you must release focus when done!
         * Call this.sendNotification("KEYPRESS_MODE_CHANGED", "DEFAULT")
         * when you're ready to release the focus.
         * 
         * Additional Option:
         * For complex setups you can also set an "external interrupt"
         * in the MMM-KeyBindings config which can set the mode
         * without first sending a keypress to all modules
         * 
         * Example below takes the focus when "Enter" is pressed
         *
         */
        keyBindingsTakeFocus: "Enter",
        /* OR AS AN OBJECT: */
        // keyBindingsTakeFocus: { KeyName: "Enter", KeyState: "KEY_LONGPRESSED" }
    },

    /*** setupKeyBindings ***
     *
     *   Add function below to your moduleName.js
     *   Add `this.setupKeyBindings()` to module's 'start' function
     *
     *   If your module does not already overridde the function, use the snippet below
     *      start: function() {
     *          console.log(this.name + " has started...");
     *          this.setupKeyBindings();
     *      },
     *
     */
    setupKeyBindings: function() {
        this.currentKeyPressMode = "DEFAULT";
        if (typeof this.config.kbMultiInstance === undefined) {
            this.config.kbMultiInstance = true;
        }
        this.reverseKBMap = {};
        for (var eKey in this.config.keyBindings) {
            if (this.config.keyBindings.hasOwnProperty(eKey)) {
                this.reverseKBMap[this.config.keyBindings[eKey]] = eKey;
            }
        }
    },

    /*** validateKeyPress ***
     *
     *   Add function below to your moduleName.js
     *   Add `if (this.validateKeyPress(notification, payload)) { return; }` 
     *    to the first line of module's 'notificationRecieved' function.
     *
     *   If your module does not already overridde the function, use the snippet below
     *      notificationReceived: function(notification, payload, sender) {
     *          if (this.validateKeyPress(notification, payload)) { return; }
     *      },
     *
     */
    validateKeyPress: function(notification, payload) {
        // Handle KEYPRESS mode change events from the MMM-KeyBindings Module
        if (notification === "KEYPRESS_MODE_CHANGED") {
            this.currentKeyPressMode = payload;
            return true;
        }

        // Uncomment line below for diagnostics & to confirm keypresses are being recieved
        // if (notification === "KEYPRESS") { console.log(payload); }

        // Validate Keypresses
        if (notification === "KEYPRESS" && this.currentKeyPressMode === this.config.keyBindingsMode) {
            if (this.config.kbMultiInstance && payload.Sender !== payload.instance) {
                return false; // Wrong Instance
            }
            if (!(payload.KeyName in this.reverseKBMap)) {
                return false; // Not a key we listen for
            }
            this.validKeyPress(payload);
            return true;
        }

        // Test for focus key pressed and need to take focus:
        if (notification === "KEYPRESS" && ("keyBindingsTakeFocus" in this.config)) {
            if (this.currentKeyPressMode === this.config.keyBindingsMode) {
                return false; // Already have focus.
            }
            if (this.config.kbMultiInstance && payload.Sender !== this.kbInstance) {
                return false; // Wrong Instance
            }
            if (typeof this.config.keyBindingsTakeFocus === "object") {
                if (this.config.keyBindingsTakeFocus.KeyPress !== payload.KeyPress ||
                    this.config.keyBindingsTakeFocus.KeyState !== payload.KeyState) {
                    return false; // Wrong KeyName/KeyPress Combo
                }
            } else if (typeof this.config.keyBindingsTakeFocus === "string" &&
                payload.KeyName !== this.config.keyBindingsTakeFocus) {
                return false; // Wrong Key;
            }

            this.keyPressFocusReceived();
            return true;
        }

        return false;
    },
    /*** validKeyPress ***
     *
     *   Add function below to your moduleName.js
     *   Function is called when a valid key press for your module
     *      has been received and is ready for action
     *   Modify this function to do what you need in your module
     *      whenever a valid key is pressed.
     *
     */
    validKeyPress: function(kp) {
        console.log(kp.KeyName);

        // Example for responding to "Left" and "Right" arrow
        if (kp.KeyName === this.config.keyBindings.Right) {
            console.log("RIGHT KEY WAS PRESSED!");
        } else if (kp.KeyName === this.config.keyBindings.Left) {
            console.log("LEFT KEY WAS PRESSED!");
        }
    },

    /*** OPTIONAL: keyPressFocusReceived ***
     *
     *   Add function below to your moduleName.js
     *   Function is called when a valid take focus key press 
     *      has been received and is ready for action
     *   Modify this function to do what you need in your module
     *      whenever focus is received.
     *
     */
    keyPressFocusReceived: function(kp) {
        console.log(this.name + "HAS FOCUS!");
        this.sendNotification("KEYPRESS_MODE_CHANGED", this.config.keyBindingsMode);
        this.currentKeyPressMode = this.config.keyBindingsMode;
        // DO ANYTHING YOU NEED
    },

    /*** OPTIONAL: keyPressReleaseFocus ***
     *
     *   Add function below to your moduleName.js
     *   Call this function when ready to release focus
     *
     *   Modify this function to do what you need in your module
     *      whenever you're ready to give up focus.
     *
     */
    keyPressReleaseFocus: function() {
        console.log(this.name + "HAS RELEASED FOCUS!");
        this.sendNotification("KEYPRESS_MODE_CHANGED", "DEFAULT");
        this.currentKeyPressMode = "DEFAULT";
        // DO ANYTHING YOU NEED
    },

    // DO NOT COPY BELOW THIS LINE
};