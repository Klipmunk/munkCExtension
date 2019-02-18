document.addEventListener('dblclick', function (e) {
	if (!e.target || e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA') {
		return;
	}
	e.d_type = 'dblclick';
	main_callback(e);
});
document.addEventListener('mouseup', function (e) {
	if (!e.target || e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA') {
		return;
	}
	e.d_type = 'mouseup';
	main_callback(e);
});


function main_callback (e) {

	var selection = window.getSelection().toString().trim();

	if ( ! selection || selection == '' || selection.match(/^[\t|\s|\n]+$/) || selection.match(/^\s+$/m)) {
		return false;
	}
	setTimeout(function () {
		addToHistory(window.getSelection().toString(), window.location.href);
	}, 5);
	
}


/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    if (msg.from == 'page_action')
	{
		//do something
	}
	if (msg.from == "background") {
		dataDb = msg.data;
		checkPages(dataDb);
	}
	if (msg.subject === "getSelection")
	{
		var text = window.getSelection().toString();
        response({text: text});
    }
});


function checkPages(data){
	console.log(data);
	if(data != undefined && data.length > 0){
		for(i = 0; i < data.length; i++){
			if(data[i].url === window.location.href){
				console.log("Finding "+data[i].text)
				findString(data[i].text);
			}
		}
	}
}

function findString(str) {
	if (parseInt(navigator.appVersion)<4) return;
	var strFound;
 	if (window.find) {

	  	strFound=self.find(str);
	 	if (!strFound) {
	   		strFound=self.find(str,0,1);
	  		while (self.find(str,0,1)) continue;
	  	}
	}
 	return;
}

getFromDB();