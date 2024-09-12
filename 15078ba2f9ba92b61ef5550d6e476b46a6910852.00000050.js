function enableSubmit(form){
	//Get the two buttons (we have an input and a button, depending on which design type we are)
	var submitBtn = form.getElementsByTagName('button')[0];
	var submitInput = form.querySelectorAll('.button')[0];
	//enable the buttons
    submitBtn.disabled = false;
    submitInput.disabled = false;
    //Remove the custom class from the buttons
    submitBtn.className = '';
    submitBtn.className = 'btn';

    submitInput.className = '';
    submitInput.className = 'button';	
}

function disableSubmit(form){
	//Get the two buttons (we have an input and a button, depending on which design type we are)
	var submitBtn = form.getElementsByTagName('button')[0];
	var submitInput = form.querySelectorAll('.button')[0];

	//Disable the two buttons
    submitBtn.disabled = true;
    submitInput.disabled = true;
	//Add the custom class 
	submitBtn.className = submitBtn.className + ' custom_loading';
	submitInput.className = submitInput.className + ' custom_loading';
}
