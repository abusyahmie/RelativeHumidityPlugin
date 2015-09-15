/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

/**
 * This class provides access to device relative humidity sensor data.
 * @constructor
 */
var argscheck = require('cordova/argscheck'),
    utils = require("cordova/utils"),
    exec = require("cordova/exec"),
    RelativeHumidity = require('./RelativeHumidity');

// Is the relative humidity sensor running?
var running = false;

// Keeps reference to watchRelativeHumidity calls.
var timers = {};

// Array of listeners; used to keep track of when we should call start and stop.
var listeners = [];

// Last returned relativehumidity object from native
var relativehumidity = null;

// Timer used when faking up devicesensor events
var eventTimerId = null;

// Tells native to start.
function start() {
    exec(function(a) {
        var tempListeners = listeners.slice(0);
        relativehumidity = new RelativeHumidity(a.rh, a.timestamp);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].win(relativehumidity);
        }
    }, function(e) {
        var tempListeners = listeners.slice(0);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].fail(e);
        }
    }, "RelativeHumidityListener", "start", []);
    running = true;
}

// Tells native to stop.
function stop() {
    exec(null, null, "RelativeHumidityListener", "stop", []);
    relativehumidity = null;
    running = false;
}

// Adds a callback pair to the listeners array
function createCallbackPair(win, fail) {
    return { win: win, fail: fail };
}

// Removes a win/fail listener pair from the listeners array
function removeListeners(l) {
    var idx = listeners.indexOf(l);
    if (idx > -1) {
        listeners.splice(idx, 1);
        if (listeners.length === 0) {
            stop();
        }
    }
}

var relativehumiditysensor = {
    /**
     * Asynchronously acquires the current relativehumidity.
     *
     * @param {Function} successCallback    The function to call when the relativehumidity data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the relativehumidity data. (OPTIONAL)
     * @param {RelativeHumidityOptions} options The options for getting the relativehumiditysensor data such as timeout. (OPTIONAL)
     */
    getCurrentRelativeHumidity: function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'relativehumiditysensor.getCurrentRelativeHumidity', arguments);

        if (cordova.platformId === "windowsphone") {
            exec(function(a) {
                relativehumidity = new RelativeHumidity(a.rh, a.timestamp);
                successCallback(relativehumidity);
            }, function(e) {
                errorCallback(e);
            }, "RelativeHumidityListener", "getCurrentRelativeHumidity", []);

            return;
        }

        var p;
        var win = function(a) {
            removeListeners(p);
            successCallback(a);
        };
        var fail = function(e) {
            removeListeners(p);
            errorCallback && errorCallback(e);
        };

        p = createCallbackPair(win, fail);
        listeners.push(p);

        if (!running) {
            start();
        }
    },

    /**
     * Asynchronously acquires the relativehumidity repeatedly at a given interval.
     *
     * @param {Function} successCallback    The function to call each time the relativehumidity data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the relativehumidity data. (OPTIONAL)
     * @param {RelativeHumidityOptions} options The options for getting the relativehumiditysensor data such as timeout. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    watchRelativeHumidity: function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'relativehumiditysensor.watchRelativeHumidity', arguments);
        // Default interval (10 sec)
        var frequency = (options && options.frequency && typeof options.frequency == 'number') ? options.frequency : 10000;

        // Keep reference to watch id, and report relativehumidity readings as often as defined in frequency
        var id = utils.createUUID();

        var p = createCallbackPair(function() { }, function(e) {
            removeListeners(p);
            errorCallback && errorCallback(e);
        });
        listeners.push(p);

        timers[id] = {
            timer: window.setInterval(function() {
                if (relativehumidity) {
                    successCallback(relativehumidity);
                }
            }, frequency),
            listeners: p
        };

        if (running) {
            // If we're already running then immediately invoke the success callback
            // but only if we have retrieved a value, sample code does not check for null ...
            if (relativehumidity) {
                successCallback(relativehumidity);
            }
        } else {
            start();
        }

        if (cordova.platformId === "browser" && !eventTimerId) {
            // Start firing devicesensor events if we haven't already
            var devicesensorEvent = new Event('devicesensor');
            eventTimerId = window.setInterval(function() {
                window.dispatchEvent(devicesensorEvent);
            }, 200);
        }

        return id;
    },

    /**
     * Clears the specified relativehumiditysensor watch.
     *
     * @param {String} id       The id of the watch returned from #watchRelativeHumidity.
     */
    clearWatch: function(id) {
        // Stop javascript timer & remove from timer list
        if (id && timers[id]) {
            window.clearInterval(timers[id].timer);
            removeListeners(timers[id].listeners);
            delete timers[id];

            if (eventTimerId && Object.keys(timers).length === 0) {
                // No more watchers, so stop firing 'devicesensor' events
                window.clearInterval(eventTimerId);
                eventTimerId = null;
            }
        }
    }
};
module.exports = relativehumiditysensor;
