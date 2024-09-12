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
var _monoTracker=function(window,document,undefined){"use strict";var trackers=[],trackObjects=[],phoneObjects=[],dataObjects={},ctn=false;var domready=function(ready){var fns=[],fn,f=false,doc=document,testEl=doc.documentElement,hack=testEl.doScroll,domContentLoaded="DOMContentLoaded",addEventListener="addEventListener",onreadystatechange="onreadystatechange",readyState="readyState",loadedRgx=hack?/^loaded|^c/:/^loaded|c/,loaded=loadedRgx.test(doc[readyState]);function flush(f){loaded=1;while(f=fns.shift()){f()}}doc[addEventListener]&&doc[addEventListener](domContentLoaded,fn=function(){doc.removeEventListener(domContentLoaded,fn,f);flush()},f);hack&&doc.attachEvent(onreadystatechange,fn=function(){if(/^c/.test(doc[readyState])){doc.detachEvent(onreadystatechange,fn);flush()}});return ready=hack?function(fn){self!=top?loaded?fn():fns.push(fn):function(){try{testEl.doScroll("left")}catch(e){return setTimeout(function(){ready(fn)},50)}fn()}()}:function(fn){loaded?fn():fns.push(fn)}}();function init(){getObjectsFromDom();detectCallTracking(window.location.search,document.cookie);replaceCallTracking();addObjects()}function detectCallTracking(queryString,cookieString){var ctnPart=queryString.match(/mono_ctn=([^&]+)/i);if(ctnPart){ctn=decodeURIComponent(ctnPart[1]);document.cookie="mono_ctn="+ctn}else{var ctnPart=cookieString.match(/mono_ctn=([^;]+)/i);if(ctnPart){ctn=ctnPart[1]}}}function replaceCallTracking(){if(!ctn){return false}for(var i=0;i<phoneObjects.length;i++){phoneObjects[i].innerHTML=ctn;if(phoneObjects[i].tagName.toLowerCase()=="a"){phoneObjects[i].setAttribute("href","tel:"+ctn.replace(/[- .\(\)]+/,""))}}}function addObjects(){for(var i=0;i<trackObjects.length;i++){addObject(trackObjects[i])}}function getObjectsFromDom(){if(document.querySelectorAll){trackObjects=document.body.querySelectorAll("[data-track-event][data-track-action]");phoneObjects=document.body.querySelectorAll('[itemprop="telephone"]')}else{trackObjects=[];phoneObjects=[];var els=document.body.getElementsByTagName("*");for(var i=0;i<els.length;i++){if(els[i].getAttribute("data-track-event")&&els[i].getAttribute("data-track-action")){trackObjects.push(els[i])}if(els[i].getAttribute("itemprop")=="telephone"){phoneObjects.push(els[i])}}}}function addEvent(obj,event,callback){if(obj.addEventListener){obj.addEventListener(event,callback,false)}else if(obj.attachEvent){obj.attachEvent("on"+event,callback)}}function addObject(el,events,action){if(!el){return false}if(!events&&el.getAttribute("data-track-event")){events=el.getAttribute("data-track-event")}if(!action&&el.getAttribute("data-track-action")){action=el.getAttribute("data-track-action")}if(!events||!action){return false}events=events.split(" ");for(var i=0;i<events.length;i++){addEvent(el,events[i].replace(/^\s+|\s$/,""),function(){track(action)})}return el}function addTracker(func){if(typeof func!=="function"){return false}trackers.push(func);return true}function setData(name,data){if(typeof name!=="string"){return false}dataObjects[name]=data;return true}function getData(name){if(typeof name!=="string"){return false}if(typeof dataObjects[name]=="undefined"){return false}return dataObjects[name]}function track(action){if(typeof action!=="string"){return false}for(var i=0;i<trackers.length;i++){trackers[i](action)}return true}function _test(expr){return eval(expr)}domready(function(){init()});return{addObject:addObject,addTracker:addTracker,setData:setData,getData:getData,detectCallTracking:detectCallTracking,track:track,_test:_test}}(window,document);