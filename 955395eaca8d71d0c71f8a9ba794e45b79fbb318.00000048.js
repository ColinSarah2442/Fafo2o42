// AJAX CLASS
// COPYRIGHT D/SITE MONO 2006

// main ajax class
function ajax() {
	
	// variables
	this.http_request 		= false;
	this.arrError			= new Array();
	this.arrParams			= new Array();
	this.arrGetParams		= new Array();
	this.arrEvent			= new Array();
	this.arrPreEvent		= new Array();
	this.arrPostEvent		= new Array();
	this.arrContent			= new Array();
	this.arrTmpScripts 		= new Array();
	this.xml				= "";
	this.xmlError			= false;
	this.xmlEvent			= false;
	this.xmlContent			= false;
	this.file				= "";
	var objRef = this;
	var defaultCallback = function() {
		objRef.xml = objRef.http_request.responseXML.documentElement;
			
		objRef.xml.normalize();
				
		// parsing XML
		objRef.parse();
				
		// executing XML
		objRef.execute();
				
		// removing request from memory
		delete objRef.http_request['onreadystatechange']; 
				
		// removing request from memory
		objRef.http_request = null;
	}
	
	// initializing
	if (window.XMLHttpRequest) { // Mozilla, Safari,...
    	this.http_request = new XMLHttpRequest();
     	if (this.http_request.overrideMimeType) {
        	this.http_request.overrideMimeType('text/xml');
     	}
  	} else if (window.ActiveXObject) { // IE
     	try {
        	this.http_request = new ActiveXObject("Msxml2.XMLHTTP");
     	} catch (e) {
        	try {
           		this.http_request = new ActiveXObject("Microsoft.XMLHTTP");
        	} catch (e) {}
     	}
  	}
  	
  	if (!this.http_request) {
     	this.arrError[this.arrError.length] = "Cannot create XMLHTTP instance";
  	}
  	
	// Post 
	this.post = function(treeId) {

		
		if(this.getGetParamStr().length > 0) {
		
			if(this.file.match(/\?/)) {
			
				var paramStr = this.file + "&" + this.getGetParamStr();
			
			} else {
			
				var paramStr = this.file + "?" + this.getGetParamStr();
			}
		
		} else {
			var paramStr = this.file;
		}
		
		this.http_request.open('POST', paramStr, true);
		this.http_request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      	this.http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      	this.http_request.send(this.getParamStr());
      
	}
	
	// GET 
	this.get = function(cb) {
		
		cb = cb || false
			
		if(this.getGetParamStr().length > 0) {
			var paramStr = this.file + "?" + this.getGetParamStr();
		} else {
			var paramStr = this.file;
		}

		this.http_request.open('GET', paramStr, true);
		this.http_request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		this.http_request.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
			    var response = this.responseText;
			    if (cb && typeof cb == 'function') { 
                    cb(response); 
                } else {
                    defaultCallback();
                }
		  	}
		}
      	this.http_request.send(null);
      
	}
	
	// setting file
	this.setFile = function(file) {
		
		this.file = file;
      
	}
	
	// getting paramString for get 
	this.getGetParamStr = function() {
		
		// making parameter string
		var tmpParam = "";
		
		for(key in this.arrGetParams) {
			if(key && this.arrGetParams[key]) {
				tmpParam += key + "=" + this.arrGetParams[key] + "&";
			}
		}
		
		// removing last &
		tmpParam = tmpParam.substr(0,(tmpParam.length - 1));
		
		return tmpParam;
		
	}
	
	// getting paramString for post 
	this.getParamStr = function() {
		
		// making parameter string
		var tmpParam = "";
		
		for(key in this.arrParams) {
			//if(key && this.arrParams[key]) {
			if(key) {
				
				// check if values are arrays
				if(typeof(this.arrParams[key]) == "object") {
					
					for(var ii = 0; ii<this.arrParams[key].length ; ii++ ) {
					
						// do we have []
						key_tmp = key.replace("[]","");
						tmpParam += key_tmp + "[]=" + this.arrParams[key][ii] + "&";
					
					}
				} else {
					
					tmpParam += key + "=" + this.arrParams[key] + "&";
				}
				
				
			}
		}
		
		// removing last &
		tmpParam = tmpParam.substr(0,(tmpParam.length - 1));
		
		return tmpParam;
		
	}

	// adding parameter to post
   	this.addParam = function(name,val) {
   		
   		// adding param to array
   		if(this.arrParams[name]) {
   			
   			if(typeof(this.arrParams[name]) != "object") {
   				
   				// save old value
   				var tmpVal = this.arrParams[name];
   				
   				// create array
   				this.arrParams[name] = new Array();
   				
   				// put old value in array
   				this.arrParams[name][this.arrParams[name].length] = tmpVal;
   				
   			} 

   			// add new value
	   		this.arrParams[name][this.arrParams[name].length] = encodeURIComponent(val);
   			
   		} else {
   			
   			this.arrParams[name] = encodeURIComponent(val);
   			
   		}
   		
   	}
   	
   	// adding parameter to get
   	this.addGetParam = function(name,val) {
   		
   		// adding param to array
   		this.arrGetParams[name] = escape(val);
   		
   	}
   	
   	// getting form
   	this.addForm = function(formName) {
   		
   		if(typeof(formName) == 'object') {
   		
   			var objForm = formName;
   		
   		} else {
   			
   			// getting form object
   			var objForm = document.forms[formName];
   	
   		}
   		
   		
   		
   		if(objForm) {
   		
   			// looping through form elements
	   		for(var i = 0;i < objForm.elements.length;i++) {
				
	   			switch(objForm.elements[i].type) {
	   				
	   				case "url":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					
	   					break;
	   				
	   				case "tel":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					
	   					break;
	   				
	   				case "date":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					
	   					break;
	   				
	   				case "email":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					
	   					break;
	   				
	   				case "text":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					
	   					break;
	   					
	   				case "submit":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					
	   					break;
	   				
	   				case "hidden":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   				
	   					break;
	   					
	   				case "password":
	   				
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   				
	   					break;
	   					
	   				case "textarea":
	   				
	   					// check if html field
	   					if(objForm.elements[i].className == 'ckeditor') {
	   					
	   						this.addParam(objForm.elements[i].name,CKEDITOR.instances[objForm.elements[i].name].getData());
	   						
	   					} else {
	   						this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					}
	   					
	   				
	   					
	   				
	   					break;
	   					
	   				case "checkbox":
	   					if(objForm.elements[i].checked) {
	   						this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					} else {
	   						this.addParam(objForm.elements[i].name,'0');
	   					}
	   					break;
	   					
	   				case "radio":
	   				
	   					if(objForm.elements[i].checked) {
	   						this.addParam(objForm.elements[i].name,objForm.elements[i].value);
	   					} 
	   					
	   					break;
	   					
	   				case "select-one":
	   					
	   					this.addParam(objForm.elements[i].name,objForm.elements[i].options[objForm.elements[i].selectedIndex].value);
	   					
	   					break;
	   			}
	   			
	   		}
   		}
   	}
   	
   	this.result = function () {
   		if (objRef.http_request.readyState == 4) {
			if (objRef.http_request.status == 200) {
				defaultCallback();
			} else {
				objRef.arrError[objRef.arrError.length] = "There was a problem with the request";
			}
		}
	}
	
	this.http_request.onreadystatechange = this.result;
	
	// parsing the returndata
	this.parse = function () {
		
		// setting action
		this.xmlEvent = this.xml.getElementsByTagName('event');
		
		// setting content
		this.xmlContent = this.xml.getElementsByTagName('content');
	}
	
	// parsing the returndata
	this.execute = function () {
	
	
		this.getEvents();
		
		this.getContents();
			
		
		// Events
		this.runPreEvents();
			
		// content
		this.displayContent();
		
		// Events
		this.runEvents();
		
		
	}
	
	
	// setting errors
	this.getEvents = function () {
		
		// looping errors
		for(var i = 0; i < this.xmlEvent.length; i++) {
			
			var tmpType = "";
			
			// getting type
			if(this.xmlEvent[i].getAttribute('type')) {
				tmpType = this.xmlEvent[i].getAttribute('type');
			}
			
			switch(tmpType) {
			
				case "pre":
				
					// adding errors in array for later printout
					this.arrPreEvent[this.arrPreEvent.length] = this.xmlEvent[i].firstChild.nodeValue;
					
					break;
					
									
				default:
				
					// adding errors in array for later printout
					this.arrEvent[this.arrEvent.length] = this.xmlEvent[i].firstChild.nodeValue;
				
					break;
			}
			
		}
	}
	
	// setting errors
	this.getContents = function () {
	
		//Event.notLoaded = 0;
		
		// looping errors
		for(var i = 0; i < this.xmlContent.length; i++) {
			
			var tmpId = "";
			// default
			var tmpType = "add";
			var tmpValue = "";
			
			// getting id
			if(this.xmlContent[i].getAttribute('id')) {
				tmpId = this.xmlContent[i].getAttribute('id');
			}
			
			// getting type
			if(this.xmlContent[i].getAttribute('type')) {
				tmpType = this.xmlContent[i].getAttribute('type');
			}
			
			// getting value
			if(this.xmlContent[i].firstChild) {
				tmpValue = unescape(this.xmlContent[i].firstChild.nodeValue);				
				
			}
			
			this.arrContent[this.arrContent.length] = new Array(tmpId,tmpType,tmpValue);
			
		}
		
	}
	
	// displaying errors
	this.displayContent = function () {
	
				
		// finding all images
		var tmpImagesCounter = 0;
		
		// looping errors
		for(var i=0;i<this.arrContent.length;i++) {
			
			// making tmp reference to HTML object
			var tmpObj = document.getElementById(this.arrContent[i][0]);
			
			// only print if object exists
			if(tmpObj) {
				
				
				
				// how to update
				switch (this.arrContent[i][1]) {
					
					case "set": 
					
						tmpObj.innerHTML = this.arrContent[i][2];
						
					break;
					
					case "add": 
						
						tmpObj.innerHTML += this.arrContent[i][2];
						
					break;
					
					case "insertBefore": 
						
						// creating object container for insert
						var newObj = document.createElement("div");
						
						newObj.innerHTML = this.arrContent[i][2];
						
						// insert before
						tmpObj.parentNode.insertBefore(newObj, tmpObj);
							
						// remove insert container 
						// first insert all children before parent
						for(var x=0;newObj.childNodes.length; x++) {
							
							tmpObj.parentNode.insertBefore(newObj.childNodes[x], tmpObj);
							
						}
						
						// remove tmp container
						tmpObj.parentNode.removeChild(newObj);
						
						
						
					break;
					
					case "insertAfter": 
						
						// creating object container for insert
						var newObj = document.createElement("div");
						
						newObj.innerHTML = this.arrContent[i][2];
						
						// insert after
						// check if node is last
						if(tmpObj.nextSibling) {
							
							// insert before next sibling
							tmpObj.parentNode.insertBefore(newObj, tmpObj.nextSibling);
							
						} else {
							
							// appending child
							tmpObj.parentNode.appendChild(newObj);
							
						}
						
						// remove insert container 
						// first insert all children before parent
						for(var x=0;newObj.childNodes.length; x++) {
							
							newObj.parentNode.insertBefore(newObj.childNodes[x], newObj);
							
						}
						
						// remove tmp container
						newObj.parentNode.removeChild(newObj);
						
						
						
					break;
					
					case "insertLast": 
					
						// creating object container for insert
						var newObj = document.createElement("div");
						
						newObj.innerHTML = this.arrContent[i][2];
						
						// appending child
						tmpObj.appendChild(newObj);
							
						// remove insert container 
						// first insert all children before parent
						for(var x=0;newObj.childNodes.length; x++) {
							
							newObj.parentNode.insertBefore(newObj.childNodes[x], newObj);
							
						}
						
						// remove tmp container
						newObj.parentNode.removeChild(newObj);
					
						
					break;
					
					case "replace": 
						
						var newObj = document.createElement("div");
						
						newObj.innerHTML = this.arrContent[i][2];
						
						tmpObj.parentNode.replaceChild(newObj.firstChild,tmpObj);
						
					break;
				}
			}	
		}
		
	}
	
	// running events
	this.runEvents = function () {
		
		// looping eventes
		for(var ajaxRunEventsI=0;ajaxRunEventsI<this.arrEvent.length;ajaxRunEventsI++) {
		
			eval(this.arrEvent[ajaxRunEventsI]);
			
		}
	}
	
	// running events
	this.runPreEvents = function () {
		
		// looping errors
		for(var i=0;i<this.arrPreEvent.length;i++) {
			
			eval(this.arrPreEvent[i]);
			
		}
	}
	
	return this;
}

// submit function for form
function submitForm(formObj,action,command) {

	
	var ajaxCall = new ajax();
	
	if(ajaxCall.arrError.length == 0) {
	
		ajaxCall.setFile(action?action:formObj.action);
		ajaxCall.addForm(formObj);
	
		ajaxCall.addGetParam('c',command?command:'refreshItems');
		
		if(formObj.id) {
		
			ajaxCall.addGetParam('m',formObj.id.replace(/^[^\-]*-/,"").replace(/_([0-9]*)_/g,"[$1]").replace(/-/g,"/"));
		
		}
		
		ajaxCall.post();
		
		return false;
	}
	
		
}

// submit function for form
function send(url,args, cb) {
	cb = cb || false
	try{
	
		var ajaxCall = new ajax();
					
		ajaxCall.setFile(url);
				
		if(args) {
				
			for(key in args) {
				
				ajaxCall.addGetParam(key,args[key]);
								
			}
				
		}
			
		ajaxCall.get(cb);
		
	} catch (e) {
	
		// on error send link as regular get
		return true;
	}
		
	return false;	
}


function createUser(formObj,confirmText) {

	// clear form errors
	//document.getElementById('errorLayer').innerHTML = '';
	
	for(var i = 0;i < formObj.elements.length;i++) {
				
		switch(formObj.elements[i].type) {
			
			case "text":
			case  "email":
			case  "tel":
				formObj.elements[i].className = '';
				break;
				
			case "password":
				formObj.elements[i].className = '';
				break;	
		}
	}
	
	// check terms
	if(!formObj.freeWebsiteTerms.checked) {
	
		if(confirm(confirmText)) {
		
			formObj.freeWebsiteTerms.checked = true;
			/////////formObj.freeWebsiteTerms.onchange();
			
		} else {
			return false;
		}
	
	} 


	var ajaxCall = new ajax();
	
	if(ajaxCall.arrError.length == 0) {
	
		ajaxCall.setFile(formObj.action);
		ajaxCall.addForm(formObj);
	
		ajaxCall.addGetParam('c','refreshItems');
		
		if(formObj.id) {
		
			ajaxCall.addGetParam('m',formObj.id.replace(/^[^\-]*-/,"").replace(/_([0-9]*)_/g,"[$1]").replace(/-/g,"/"));
		
		}
		
		ajaxCall.post();
		
		return false;
	}
	
		
}


function hasClass(ele,cls) {
	if (ele != null){
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}
}

function addClass(ele,cls) {
	if (ele != null){
		if (!this.hasClass(ele,cls)) ele.className += " "+cls;
	}
}

function removeClass(ele,cls) {
	if (ele != null){
		if (hasClass(ele,cls)) {
	    	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className=ele.className.replace(reg,' ');
		}
	}
}
