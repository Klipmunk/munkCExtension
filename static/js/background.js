contentTabId = null;
chrome.extension.onMessage.addListener(function(req, sender, callback) {
	if (req.from == "content") {  //get content scripts tab id
	    contentTabId = sender.tab.id;
	}
	if(req.hasOwnProperty("method")){
		var ret = window[req.method](req);
		if(callback){
			callback(req);
		}
	}
	
});



chrome.omnibox.onInputEntered.addListener(function(text) {
    var url = 'https://www.dictionarist.com/' + text.replace(/\s+/g, '+');

	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.update(tab.id, {url: url});
	});
});

function getOption (req)
{
	return localStorage;
}

function addToHistory (data, callback)
{	
	var obj = {text : data.word, url : data.url};
	saveInDB(obj, callback);
}

function getFromDB(req){
	chrome.storage.local.get([dataKey], function(result) {
		if (!chrome.runtime.error) {
			if(result.hasOwnProperty(dataKey)){
				dataDB = JSON.parse(result[dataKey]);
		        sendDatatoContent();
			}
	    }
    });
}

function sendDatatoContent(){
	chrome.tabs.sendMessage(contentTabId, {
      from: "background",
      data: dataDB
    });
}

function saveInDB(obj, callback){
	chrome.storage.local.get([dataKey], function(result) {
		if (!chrome.runtime.error) {
			if(result.hasOwnProperty(dataKey)){
				dataDB = JSON.parse(result[dataKey]);
				dataDB.push(obj);
				data = JSON.stringify(dataDB);
				chrome.storage.local.set({[dataKey]: data}, function() {
					if (chrome.runtime.error) {
				      console.log("Runtime error.");
				    }
			        else if(callback){
			        	callback();
			        }
			    });
			}
	    }
    });
	
}

function genericOnClick(info, tab)
{
	chrome.tabs.create({
		url: 'https://www.klipmunk.com/' + (info.selectionText).toLowerCase()
	});
}

var id = chrome.contextMenus.create({
	title: 'Search Klips for \'%s\'',
	contexts: ['selection'],
	onclick: genericOnClick
});


dataKey = 'klipMunkDB';

dataDB = [];