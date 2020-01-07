# Description

Attempt to re-create the game presented by Dr. Hannah Fry's guest, Seb Lee-Delisle, during the
Royal Institution Christmas Lectures 2019, Lecture 2. See [clip](https://youtu.be/AJJS80lbpJs?t=560).

![Frame from Clip](frame-from-clip.png)

# Keyboard actions

| Key | Description |
| --- | ----------- |
| Up Arrow | Apply an upward force on the sparkler |
| M | Toggle microphone on/off. When on, making a noise applies an upward force on the sparkler |
| V | Toggle live visualisation of the microphone signal on/off |
| B | Emit a burst |

# Browser compatibility

I have only tried this using Chrome on a MacBook Pro.
I use the Web Audio API [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) interface which doesn't seem to be widely implemented.

> TODO: fallback to [ScriptProcessorNode](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode). Perhaps use [audioworklet-polyfill](https://github.com/GoogleChromeLabs/audioworklet-polyfill).

# TODO

* ~~Animate single particle~~
* ~~Animate multiple particles~~
* ~~Use multiple colours in the sparkler~~
* ~~Add gravity effect~~
* ~~Add shrinking effect~~
* ~~Add fading effect~~
* Add glow effect (may need to switch to SVG or THREE.js for this)
* Add drag effect to the sparkler particles
* ~~Add burst effect (via the 'B' key)~~
* ~~Add ability to keep the sparkler in the air by applying boosts via the up arrow key~~
* ~~Add ability to control the upward boost via the microphone volume level~~
* ~~Add obstacles~~
* ~~Add horizontal scrolling of the obstacles~~
* ~~Add collision detection of the sparkler colliding with obstacles~~
* ~~Trigger the burst effect after successfully navigating each obstacle~~
* ~~Display the current score (count of successfully navigated obstacles)~~
* ~~Handle game over on collision and show final score~~

# Links

* [Clip](https://youtu.be/AJJS80lbpJs?t=560)
* [Seb Lee-Delisle on GitHub](https://github.com/sebleedelisle)
* [Royal Institution tweet re crowd-noise laser](https://twitter.com/Ri_Science/status/1210654725529624576?s=20)
* [Modeling Physics in Javascript: Gravity and Drag](https://burakkanber.com/blog/modeling-physics-javascript-gravity-and-drag/)
* [Vector Battle Font](https://www.fontspace.com/freaky-fonts/vector-battle)
