function getOptions (callback, e) {
	chrome.extension.sendMessage({
		method: 'getOption',
	}, function (resp) {
		callback(resp, e);
	});
}



function addToHistory (word, url) {
	chrome.extension.sendMessage({
		method: 'addToHistory',
		word: word,
		url: url
	}, function () {});
}


function getFromDB() {
	chrome.runtime.sendMessage({from:"content"});
	chrome.extension.sendMessage({
		method: 'getFromDB'
	},function () {});
}

