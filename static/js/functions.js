function getOptions (callback, e) {
	chrome.extension.sendMessage({
		method: 'getOption',
	}, function (resp) {
		callback(resp, e);
	});
}



function addToHistory (id, word, url) {
	chrome.extension.sendMessage({
		method: 'addToHistory',
		id : id,
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


function saveCommentInDB(txt, klipid, callback){
	if(callback){
		func = callback();
	}else{
		func = function () {};
	}
	chrome.extension.sendMessage({
		method: 'addToComment',
		comment: txt,
		klipId: klipid
	}, func);

}