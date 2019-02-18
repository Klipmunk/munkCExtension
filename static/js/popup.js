// chrome.tabs.query({
//     active: true,    
//     lastFocusedWindow: true
// }, function(array_of_Tabs) {
//     var tab = array_of_Tabs[0];
// 	chrome.tabs.sendMessage(tab.id,  {from:'page_action', subject: "getSelection"}, defaultSearch);
// });




function getAllSavedDB(){
	
	chrome.extension.getBackgroundPage().getFromDB();
	var db = chrome.extension.getBackgroundPage().dataDB;
	setUI(db);
}
 

function setUI(data){
	console.log(data);
	var str = '';
	if(data != undefined && data.length > 0){
		for(i = 0; i < data.length; i++){
	    	str += '<div class="card" style="width: 18rem;"><div class="card-body"><p class="card-text">'+data[i].text+'</p><a href="'+data[i].url+'" class="card-link">Go to Page</a></div></div>';
		}
	}else{
		str = "No Saved Klips";
	}
	
	document.getElementById('savedData').innerHTML = str;
	document.getElementById('savedData').style.display = "block";
}

document.body.onload =  function() {
  getAllSavedDB();
}