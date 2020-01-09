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

> **NOTE** Use of the microphone to control the sparkler seems to work fine on Chrome and Firefox
(I haven't tested other browsers).
However, I have disabled the live visualisation of the microphone signal on browsers that
don't support the Web Audio API
[AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) interface
because it slows things down too much.
So, effectively, the live microphone visualisation only works on Chrome at the moment.

# Browser compatibility

## Audio

Initially, I used the Web Audio API [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) interface. However, this does not appear to be widely implemented.
I am now using the [audioworklet-polyfill](https://github.com/GoogleChromeLabs/audioworklet-polyfill)
which tries to use [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
but falls back to [ScriptProcessorNode](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode).

## Mobile/touchscreen devices

This is still a TODO item.

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
* Support mobile/touchscreen devices

# Links

* [Clip](https://youtu.be/AJJS80lbpJs?t=560)
* [Seb Lee-Delisle on GitHub](https://github.com/sebleedelisle)
* [Royal Institution tweet re crowd-noise laser](https://twitter.com/Ri_Science/status/1210654725529624576?s=20)
* [Modeling Physics in Javascript: Gravity and Drag](https://burakkanber.com/blog/modeling-physics-javascript-gravity-and-drag/)
* [Vector Battle Font](https://www.fontspace.com/freaky-fonts/vector-battle)
