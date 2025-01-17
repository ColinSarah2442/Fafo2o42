/**
 * The box sizing polyfill for IE7 is based on this:
 *
 * @see https://github.com/Schepp/box-sizing-polyfill
 */
(function (window, document, undefined) {

    var stylesheets = document.styleSheets,
        applyPolyfill = document.cookie.indexOf('box_sizing_polyfill=true') !== -1 ? true : false;

    if (!applyPolyfill) {

        for (var i = 0; i < stylesheets.length; i++) {

            if (stylesheets[i].cssText.indexOf('border-box') !== -1) {
                applyPolyfill = true;
                break;
            }
        }

    }
    if (applyPolyfill) {

        var els = document.body.getElementsByTagName('*');

        for (var i = 0; i < els.length; i++) {
            boxSizingPolyfill(els[i]);
        }

    }

    document.cookie = 'box_sizing_polyfill=' + applyPolyfill;

    function boxSizingPolyfill(element) {

        // Don't apply the polyfill in browsers other than IE6/7
        // or if the polyfill has already been applied
        if (!window.navigator.userAgent.match(/msie (6|7)/gi) || element.getAttribute('data-box-sizing-polyfill')) {
            return;
        } else {
            element.setAttribute('data-box-sizing-polyfill', true);
        }

        var viewportwidth = (typeof window.innerWidth != 'undefined' ? window.innerWidth : element.document.documentElement.clientWidth);

        // Shortcut for the document object
        var doc = document;

        // Buffer for multiple resize events
        var resizetimeout = null;

        // Don't apply box-sizing to certain elements
        var apply = false;
        switch(element.nodeName){
            case '#comment':
            case 'HTML':
            case 'HEAD':
            case 'TITLE':
            case 'SCRIPT':
            case 'STYLE':
            case 'LINK':
            case 'META':
            break;

            default:
                apply = true;
            break;
        }

        /*
        * update gets called during resize events, then waits until there are no further resize events, and finally triggers a recalculation
        */
        function update(){
            if(resizetimeout !== null){
                window.clearTimeout(resizetimeout);
            }
            resizetimeout = window.setTimeout(function(){
                try{
                    restore();
                    init();
                }
                catch(e){}
                resizetimeout = null;
            },100);
        }

        /*
        * restore gets called when the behavior is being detached (see event binding at the top),
        * resets everything like it was before applying the behavior
        */
        function restore(){
            if(apply){
                try{
                    element.runtimeStyle.removeAttribute("width");
                    element.runtimeStyle.removeAttribute("height");
                }
                catch(e){}
            }
        }

        /*
        * init gets called once at the start and then never again,
        * triggers box-sizing calculations and updates width and height
        */
        function init(){
            if(apply){
                updateBorderBoxWidth();
                updateBorderBoxHeight();
            }
        }

        /*
        * checkPropertyChange gets called as soon as an element property changes
        * (see event binding at the top), it then checks if any property influencing its
        * dimensions was changed and if yes recalculates width and height
        */
        function checkPropertyChange(){
            if(apply){
                var pn = event.propertyName;
                if(pn === "style.boxSizing" && element.style.boxSizing === ""){
                    element.style.removeAttribute("boxSizing");
                    element.runtimeStyle.removeAttribute("boxSizing");
                    element.runtimeStyle.removeAttribute("width");
                    element.runtimeStyle.removeAttribute("height");
                }
                switch (pn){
                    case "style.width":
                    case "style.minWidth":
                    case "style.maxWidth":
                    case "style.borderLeftWidth":
                    case "style.borderLeftStyle":
                    case "style.borderRightWidth":
                    case "style.borderRightStyle":
                    case "style.paddingLeft":
                    case "style.paddingRight":
                        updateBorderBoxWidth();
                    break;

                    case "style.height":
                    case "style.minHeight":
                    case "style.maxHeight":
                    case "style.borderTopWidth":
                    case "style.borderTopStyle":
                    case "style.borderBottomWidth":
                    case "style.borderBottomStyle":
                    case "style.paddingTop":
                    case "style.paddingBottom":
                        updateBorderBoxHeight();
                    break;

                    case "className":
                    case "style.boxSizing":
                        updateBorderBoxWidth();
                        updateBorderBoxHeight();
                    break;
                }
            }
        }

        /*
         * Helper function, taken from Dean Edward's IE7 framework,
         * added by Schepp on 12.06.2010.
         * http://code.google.com/p/ie7-js/
         *
         * Allows us to convert from relative to pixel-values.
         */
        function getPixelValue(value){
            var PIXEL = /^\d+(px)?$/i;
            if (PIXEL.test(value)) return parseInt(value);
            var style = element.style.left;
            var runtimeStyle = element.runtimeStyle.left;
            element.runtimeStyle.left = element.currentStyle.left;
            element.style.left = value || 0;
            value = parseInt(element.style.pixelLeft);
            element.style.left = style;
            element.runtimeStyle.left = runtimeStyle;

            return value;
        }

        function getPixelWidth(object, value){
            // For Pixel Values
            var PIXEL = /^\d+(px)?$/i;
            if (PIXEL.test(value)) return parseInt(value);

            // For Percentage Values
            var PERCENT = /^[\d\.]+%$/i;
            if (PERCENT.test(value)){
                try{
                    var parentPaddingLeft = getPixelWidth(object.parentElement,object.parentElement.currentStyle.paddingLeft);
                    var parentPaddingRight = getPixelWidth(object.parentElement,object.parentElement.currentStyle.paddingRight);
                    var parentBorderLeft = getPixelWidth(object.parentElement,object.parentElement.currentStyle.borderLeft);
                    var parentBorderRight = getPixelWidth(object.parentElement,object.parentElement.currentStyle.borderRight);

                    //var parentWidth = getPixelWidth(object.parentElement,(object.parentElement.currentStyle.width != "auto" ? object.parentElement.currentStyle.width : "100%"));
                    var parentWidth = object.parentElement.offsetWidth - parentPaddingLeft - parentPaddingRight - parentBorderLeft - parentBorderRight;
                    var value = (parseFloat(value) / 100) * parentWidth;
                }
                catch(e){
                    var value = (parseFloat(value) / 100) * element.document.documentElement.clientWidth;
                }
                return parseInt(value);
            }

            // For EM Values
            var style = object.style.left;
            var runtimeStyle = object.runtimeStyle.left;
            object.runtimeStyle.left = object.currentStyle.left;
            object.style.left = value || 0;
            value = parseInt(object.style.pixelLeft);
            object.style.left = style;
            object.runtimeStyle.left = runtimeStyle;

            return value;
        }

        function getPixelHeight(object, value){
            // For Pixel Values
            var PIXEL = /^\d+(px)?$/i;
            if (PIXEL.test(value)) return parseInt(value);

            // For Percentage Values
            var PERCENT = /^[\d\.]+%$/i;
            if (PERCENT.test(value)){
                try{
                    if(object.parentElement.currentStyle.height != "auto"){
                        switch(object.parentElement.nodeName){
                            default:
                                if(object.parentElement.currentStyle.height !== "auto"){
                                    var parentPaddingTop = getPixelWidth(object.parentElement,object.parentElement.currentStyle.paddingTop);
                                    var parentPaddingBottom = getPixelWidth(object.parentElement,object.parentElement.currentStyle.paddingBottom);
                                    var parentBorderTop = getPixelWidth(object.parentElement,object.parentElement.currentStyle.borderTop);
                                    var parentBorderBottom = getPixelWidth(object.parentElement,object.parentElement.currentStyle.borderBottom);

                                    var parentHeight = object.parentElement.offsetHeight - parentPaddingTop - parentPaddingBottom - parentBorderTop - parentBorderBottom;
                                    //var parentHeight = getPixelHeight(object.parentElement,object.parentElement.currentStyle.height);

                                    value = (parseFloat(value) / 100) * parentHeight;
                                }
                                else {
                                    value = "auto";
                                }
                            break;

                            case 'HTML':
                                parentHeight = element.document.documentElement.clientHeight;
                                if(parentHeight !== "auto"){
                                    value = (parseFloat(value) / 100) * parentHeight;
                                }
                                else {
                                    value = "auto";
                                }
                            break;
                        }
                        if(value !== "auto") value = parseInt(value);
                    }
                    else {
                        value = "auto";
                    }
                }
                catch(e){
                    value = "auto";
                }
                return value;
            }

            // For EM Values
            var style = object.style.left;
            var runtimeStyle = object.runtimeStyle.left;
            object.runtimeStyle.left = object.currentStyle.left;
            object.style.left = value || 0;
            value = parseInt(object.style.pixelLeft);
            object.style.left = style;
            object.runtimeStyle.left = runtimeStyle;

            return value;
        }


        /*
         * getBorderWidth & friends
         * Border width getters
         */
        function getBorderWidth(sSide){
            if(element.currentStyle["border" + sSide + "Style"] == "none"){
                return 0;
            }
            var n = getPixelValue(element.currentStyle["border" + sSide + "Width"]);
            return n || 0;
        }
        function getBorderLeftWidth() { return getBorderWidth("Left"); }
        function getBorderRightWidth() { return getBorderWidth("Right"); }
        function getBorderTopWidth() { return getBorderWidth("Top"); }
        function getBorderBottomWidth() { return getBorderWidth("Bottom"); }


        /*
         * getPadding & friends
         * Padding width getters
         */
        function getPadding(sSide) {
            var n = getPixelValue(element.currentStyle["padding" + sSide]);
            return n || 0;
        }
        function getPaddingLeft() { return getPadding("Left"); }
        function getPaddingRight() { return getPadding("Right"); }
        function getPaddingTop() { return getPadding("Top"); }
        function getPaddingBottom() { return getPadding("Bottom"); }



        /*
         * getBoxSizing
         * Get the box-sizing value for the current element
         */
        function getBoxSizing(){
            var s = element.style;
            var cs = element.currentStyle
            if(typeof s.boxSizing != "undefined" && s.boxSizing != ""){
                return s.boxSizing;
            }
            if(typeof s["box-sizing"] != "undefined" && s["box-sizing"] != ""){
                return s["box-sizing"];
            }
            if(typeof cs.boxSizing != "undefined" && cs.boxSizing != ""){
                return cs.boxSizing;
            }
            if(typeof cs["box-sizing"] != "undefined" && cs["box-sizing"] != ""){
                return cs["box-sizing"];
            }
            return getDocumentBoxSizing();
        }


        /*
         * getDocumentBoxSizing
         * Get the default document box sizing (check for quirks mode)
         */
        function getDocumentBoxSizing(){
            if(doc.compatMode === null || doc.compatMode === "BackCompat"){
                return "border-box";
            }
            return "content-box"
        }


        /*
         * setBorderBoxWidth & friends
         * Width and height setters
         */
        function setBorderBoxWidth(n){
            element.runtimeStyle.width = Math.max(0, n - getBorderLeftWidth() -
                getPaddingLeft() - getPaddingRight() - getBorderRightWidth()) + "px";
        }
        function setBorderBoxMinWidth(n){
            element.runtimeStyle.minWidth = Math.max(0, n - getBorderLeftWidth() -
                getPaddingLeft() - getPaddingRight() - getBorderRightWidth()) + "px";
        }
        function setBorderBoxMaxWidth(n){
            element.runtimeStyle.maxWidth = Math.max(0, n - getBorderLeftWidth() -
                getPaddingLeft() - getPaddingRight() - getBorderRightWidth()) + "px";
        }
        function setBorderBoxHeight(n){
            element.runtimeStyle.height = Math.max(0, n - getBorderTopWidth() -
                getPaddingTop() - getPaddingBottom() - getBorderBottomWidth()) + "px";
        }
        function setBorderBoxMinHeight(n){
            element.runtimeStyle.minHeight = Math.max(0, n - getBorderTopWidth() -
                getPaddingTop() - getPaddingBottom() - getBorderBottomWidth()) + "px";
        }
        function setBorderBoxMaxHeight(n){
            element.runtimeStyle.maxHeight = Math.max(0, n - getBorderTopWidth() -
                getPaddingTop() - getPaddingBottom() - getBorderBottomWidth()) + "px";
        }
        function setContentBoxWidth(n){
            element.runtimeStyle.width = Math.max(0, n + getBorderLeftWidth() +
                getPaddingLeft() + getPaddingRight() + getBorderRightWidth()) + "px";
        }
        function setContentBoxMinWidth(n){
            element.runtimeStyle.minWidth = Math.max(0, n + getBorderLeftWidth() +
                getPaddingLeft() + getPaddingRight() + getBorderRightWidth()) + "px";
        }
        function setContentBoxMaxWidth(n){
            element.runtimeStyle.maxWidth = Math.max(0, n + getBorderLeftWidth() +
                getPaddingLeft() + getPaddingRight() + getBorderRightWidth()) + "px";
        }
        function setContentBoxHeight(n){
            element.runtimeStyle.height = Math.max(0, n + getBorderTopWidth() +
                getPaddingTop() + getPaddingBottom() + getBorderBottomWidth()) + "px";
        }
        function setContentBoxMinHeight(n){
            element.runtimeStyle.minHeight = Math.max(0, n + getBorderTopWidth() +
                getPaddingTop() + getPaddingBottom() + getBorderBottomWidth()) + "px";
        }
        function setContentBoxMaxHeight(n){
            element.runtimeStyle.maxHeight = Math.max(0, n + getBorderTopWidth() +
                getPaddingTop() + getPaddingBottom() + getBorderBottomWidth()) + "px";
        }


        /*
         * updateBorderBoxWidth & updateBorderBoxHeight
         *
         */
        function updateBorderBoxWidth() {
            if(getDocumentBoxSizing() == getBoxSizing()){
                return;
            }

            var csw = element.currentStyle.width;
            if(csw != "auto"){
                csw = getPixelWidth(element,csw);
                if(getBoxSizing() == "border-box"){
                    setBorderBoxWidth(parseInt(csw));
                }
                else{
                    setContentBoxWidth(parseInt(csw));
                }
            }

            csw = element.currentStyle.minWidth;
            if(csw != "none"){
                csw = getPixelWidth(element,csw);
                if(getBoxSizing() == "border-box"){
                    setBorderBoxMinWidth(parseInt(csw));
                }
                else{
                    setContentBoxMinWidth(parseInt(csw));
                }
            }

            csw = element.currentStyle.maxWidth;
            if(csw != "none"){
                csw = getPixelWidth(element,csw);
                if(getBoxSizing() == "border-box"){
                    setBorderBoxMaxWidth(parseInt(csw));
                }
                else{
                    setContentBoxMaxWidth(parseInt(csw));
                }
            }
        }

        function updateBorderBoxHeight() {
            if(getDocumentBoxSizing() == getBoxSizing()){
                return;
            }

            var csh = element.currentStyle.height;
            if(csh != "auto"){
                csh = getPixelHeight(element,csh);
                if(csh !== "auto"){
                    if(getBoxSizing() == "border-box"){
                        setBorderBoxHeight(parseInt(csh));
                    }
                    else{
                        setContentBoxHeight(parseInt(csh));
                    }
                }
            }

            csh = element.currentStyle.minHeight;
            if(csh != "none"){
                csh = getPixelHeight(element,csh);
                if(csh !== "none"){
                    if(getBoxSizing() == "border-box"){
                        setBorderBoxMinHeight(parseInt(csh));
                    }
                    else{
                        setContentBoxMinHeight(parseInt(csh));
                    }
                }
            }

            csh = element.currentStyle.maxHeight;
            if(csh != "none"){
                csh = getPixelHeight(element,csh);
                if(csh !== "none"){
                    if(getBoxSizing() == "border-box"){
                        setBorderBoxMaxHeight(parseInt(csh));
                    }
                    else{
                        setContentBoxMaxHeight(parseInt(csh));
                    }
                }
            }
        }


        // Run the calculations
        init();

    };


})(window, document);
