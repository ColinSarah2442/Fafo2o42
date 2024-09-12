/**
 * _monoTracker by mono solutions
 *
 * Usage:
 *
 *     <a data-track-event="click" data-track-action="linkWasClicked" href="#">Trackable link</a>
 *
 * Options are available by using data-track-* attributes
 * on the DOM elements to track:
 *
 *     data-track-event: One or more events, separated by spaces
 *     data-track-action: Name of the action
 *
 * The following JavaScript API methods are available:
 *
 *     _monoTracker.addObject(DOM element, 'event', 'action name');
 *     _monoTracker.addTracker(function with tracking code);
 *     _monoTracker.track('action name');
 *
 * Adding your own tracking code:
 * The various tracking codes to be added should use the track page
 * view feature, where the action will be the URI. E.g. for Google
 * Analytics the code would like like this:
 *
 *     _monoTracker.addTracker(function (action) {
 *         if (window._gaq) {
 *             _gaq.push(['_trackPageview', '/' + action]);
 *         }
 *     });
 *
 * @author Chiel Robben <cr@mono.net>
 * @copyright mono solutions ApS 2013
 */
var _monoTracker = function (window, document) {

    'use strict';

    /**
     * Array with functions of all trackers code.
     *
     * @type {Array}
     */
    var trackers = [],
        trackObjects = [],
        phoneObjects = [],
        dataObjects = {},
        ctn = false;


    /**
     * Initalizes and sets up all event listeners
     */
    function init() {

        getObjectsFromDom();

        detectCallTracking(window.location.search,document.cookie);

        replaceCallTracking();

        addObjects();

    }

    /**
     * determines if ctn is in supplied in the url or if ctn cookie is set
     */
    function detectCallTracking(queryString,cookieString) {

        var ctnPart = queryString.match(/mono_ctn=([^&]+)/i);

        // extract ctn
        if(ctnPart) {

            // assigning
            ctn = decodeURIComponent(ctnPart[1]);

            // setting ctn in cookie
            document.cookie="mono_ctn=" + ctn;

        } else {

            // is ctn in cookie
            var ctnPart = cookieString.match(/mono_ctn=([^;]+)/i);

            if(ctnPart) {

                // assigning
                ctn = ctnPart[1];

            }
        }

    }

    /**
     * Replaces phone number with ctn value
     */
    function replaceCallTracking() {

        // return if no ctn is detected
        if(!ctn) {
            return false;
        }

        // find phonenumbers to replace
        for (var i = 0; i < phoneObjects.length; i++) {

            phoneObjects[i].innerHTML = ctn;

            if(phoneObjects[i].tagName.toLowerCase() == 'a') {
                phoneObjects[i].setAttribute('href', 'tel:'+ctn.replace(/[- .\(\)]+/,''));
            }


        }


    }

    /**
     * finds objects from dom and adds then to the tracker
     */
    function addObjects() {

        // Iterate through all objects
        for (var i = 0; i < trackObjects.length; i++) {
            addObject(trackObjects[i]);
        }

    }

    /**
     * Traverse the entire DOM for objects to track and objects containing specific itemprops

     */
    function getObjectsFromDom() {


        if (document.querySelectorAll) {
            trackObjects = document.body.querySelectorAll('[data-track-event][data-track-action]');
            phoneObjects = document.body.querySelectorAll('[itemprop="telephone"]');
        } else {

            trackObjects = [];
            phoneObjects = [];

            var els = document.body.getElementsByTagName('*');

            for (var i = 0; i < els.length; i++) {
                // finding objects to track
                if (els[i].getAttribute('data-track-event') && els[i].getAttribute('data-track-action')) {
                    trackObjects.push(els[i]);
                }
                // finding itemprop phone
                if (els[i].getAttribute('itemprop') == 'telephone' ) {
                    phoneObjects.push(els[i]);
                }
            }

        }

    }

    /**
     * Adds an event listener to a DOM object
     *
     * @param {Object}   obj      DOM object
     * @param {String}   event    Event type
     * @param {Function} callback
     */
    function addEvent(obj, event, callback) {

        if (obj.addEventListener) {
            obj.addEventListener(event, callback, false);
        } else if (obj.attachEvent) {
            obj.attachEvent('on' + event, callback);
        }

    }

    /**
     * Add a single DOM element to be tracked
     *
     * Events and action can be supplied either by data-track-* attributes or
     * paramaters when calling the method.
     *
     * @param {Object} el
     * @param {String} events (Optional) List of events separated with spaces
     * @param {String} action (Optional) Name of action
     * @return mixed
     */
    function addObject(el, events, action) {

        if (!el) {
            return false;
        }

        if (!events && el.getAttribute('data-track-event')) {
            events = el.getAttribute('data-track-event');
        }

        if (!action && el.getAttribute('data-track-action')) {
            action = el.getAttribute('data-track-action');
        }

        if (!events || !action) {
            return false;
        }

        events = events.split(' ');

        // Iterate through each of the objects' events add add them
        for (var i = 0; i < events.length; i++) {

            // Trim excessive white space before adding the event
            addEvent(el, events[i].replace(/^\s+|\s$/, ''), function () {
                track(action);
            });

        }

        return el;

    }

    /**
     * Adds a tracker
     *
     * Supply a function which will be executed on all DOM elements which
     * are being tracked.
     *
     * @param {Function} func
     * @return {Boolean}
     */
    function addTracker(func) {

        if (typeof(func) !== 'function') {
            return false;
        }

        trackers.push(func);

        return true;

    }

    /**
     * Allows for variables to be stored in the monoTracker, used e.g. for ecommerce order tracking
     * @param {String} name the hash key e.g. 'ecommerce'
     * @param {mixed} data 
     */
    function setData(name, data) {

        if (typeof(name) !== 'string') {
            return false;
        }

        // setting data values to name key
        dataObjects[name] = data;

        return true;
    } 

    /**
     * Allows for variables to be fetched
     * @param {String} name the hash key e.g. 'ecommerce'
     * @return {mixed}
     */
    function getData(name) {

        if (typeof(name) !== 'string') {
            return false;
        }

        if(typeof(dataObjects[name]) == 'undefined') {
            return false;
        }

        return dataObjects[name];
    } 

    /**
     * Triggers a track with all tracker functions defined in the tracker array.
     *
     * @param {String} action Name of the action
     * @return {Boolean}
     */
    function track(action) {

        if (typeof(action) !== 'string') {
            return false;
        }

        // Iterate through all trackers and execute the tracking code
        for (var i = 0; i < trackers.length; i++) {
            trackers[i](action);
        }

        return true;

    }

    /**
     * Function for testing private variables and functions
     * @param  {string} expr Expression to execute in private scope
     * @return {mixed}      return result of eval
     */
    function _test(expr) {

        return eval(expr);

    }

    /**
     * Expose public API methods
     */
    return {
        addObject: addObject,
        addTracker: addTracker,
        setData: setData,
        getData: getData,
        detectCallTracking: detectCallTracking,
        track: track,
        init: init,
        _test: _test
    };

}(window, document);
_monoTracker.init();
