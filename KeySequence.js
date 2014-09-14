/**
 * KeySequence.js
 * By makzk <me@makzk.com>
 * This library detects a key sequence and do something.
 * 
 * Licence: use this as you want, be cool, and have fun.
 * September, 2014.
 *
 * function KeySequence(sequence, onready, timeout, onsequencefollow), where:
 *
 * sequence: An array of keycodes that can be obtained from here:
 * http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
 * If that sequence is not an array, the function
 *
 * onready(e): A function that receives a parameter that contains the event object
 * and is executed when the full sequence is typed.
 *
 * timeout: a time in milliseconds that will invalidate if the sequence
 * is tiped off the time. If the timeout is 0, there will be no timeout.
 * The same happens if no timeout is provided.
 *
 * onsequencefollow: A function that receives the event object, and is executed
 * when te sequence is followed. By example, if the sequence is "A B C", and 
 * the key "A" is pressed, the function will be executed. Then, if the key "B"
 * is pressed, this function will be executed again. The same if key "C" is pressed.
 *
 * A simple example of the code can be found here:
 * http://kawaii.makzk.com/keyseq.html
**/

// This function helps to bind the key event listener to the execution
function ApplyEventListener(element, eventName, eventHandler, scope) {
    var scoped = scope ? function(e) { eventHandler.apply(scope, [e]); } : eventHandler;
    if(document.addEventListener)
        element.addEventListener(eventName, scoped, false);
    else if(document.attachEvent)
        element.attachEvent("on"+eventName, scoped);
}

// Main function that executes the program logic.
// Use it as an object instantiator, like "var a = new KeySequence(...)"
function KeySequence(sequence, onready, timeout, onsequencefollow) {
    if( Object.prototype.toString.call( sequence ) !== '[object Array]' ||
        sequence.length == 0) {
        console.error("KeySequence: The sequence must be an array and contain at least one element");
        return;
    }

    this.sequence = sequence;
    this.lastkey = -1;
    this.lasttime = 0;

    this.timeout = typeof timeout !== 'undefined' ? timeout : 0;
    this.onready = (typeof onready !== 'undefined') ? onready : function(){};
    this.onfollowsequence = (typeof onfollowsequence !== 'undefined') ? onfollowsequence : function(){};

    this.start = function(){
        ApplyEventListener(window, "keydown", this.eventHandler, this);
    };
    this.reset = function(){
        this.lastkey = -1;
        this.lasttime = 0;
    };

}

// Process the key presses. Must be done outside the object so the
// event is correctly handled.
KeySequence.prototype.eventHandler = function(e){
    var key = e.keyCode;
    var now = (new Date()).getTime();
    if (
        (!this.timeout || (now - this.lasttime) < this.timeout) &&
        key == this.sequence[this.lastkey+1] ) 
    {
        this.lastkey++;
        this.lasttime = now;
        this.onfollowsequence(e);
        
        if(this.lastkey == (this.sequence.length - 1)) {
            this.onready();
        }
    } else {
        this.reset();
        // If the key pressed is the first from the sequence, 
        // reset and retry
        if(key == this.sequence[0]) {
            this.lasttime = now;
            this.eventHandler(e);
        } 
    }
};
