

function main_callback (e) {

	var selection = munk.munkSelection;

	if ( ! selection || selection == '' || selection.match(/^[\t|\s|\n]+$/) || selection.match(/^\s+$/m)) {
		return false;
	}
	setTimeout(function () {
		addToHistory(selection, window.location.href);
		data = [];
		data.push({url : window.location.href, text: selection });
		checkPages(data);
		munkUi.style.display = 'none';
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
		var text = window.getSelection().getRangeAt(0).toString();
        response({text: text});
    }
});


function checkPages(data){
	console.log(data);
	if(data != undefined && data.length > 0){
		for(i = 0; i < data.length; i++){
			if(data[i].url === window.location.href){
				console.log("Finding "+data[i].text)
				findAndReplaceDOMText(document.body, {
					find: data[i].text,
					replace :  function(portion, match) {
						var e = document.createElement('span');
						e.className = 'highligher';
						e.appendChild(document.createTextNode(portion.text));
						return e;
					}
				})
			}
		}
	}
}


getFromDB();



var munk = {
	startX : 0,
	startY : 0,
	isEditableElem : 0,
	munkSelection : '',
	isEditableContent : function(e) {
		if (e.target) {
			try {
				if (e.target.nodeName == 'INPUT' || e.target.nodeName == 'TEXTAREA') {
					return true;
				}
			} catch(e) {

			};

			try {
				var targetNode = e.target;
				while (targetNode != null) {
					if (targetNode.getAttribute == undefined) {
						targetNode = targetNode.parentNode;
					} else {
						if (targetNode.getAttribute('contenteditable') != null) {
							if (targetNode.getAttribute('contenteditable') == 'true') {
								return true;
							} else {
								return false;
							}
						} else {
							targetNode = targetNode.parentNode;
						}
					}
				}
				return false;
			} catch(e) {
			};
		} else {
			return false;
		}
	},
	addUIButton : function(){
		munkUi = document.createElement("div");
		munkUi.classList.add('munkuiButtonWrapper');
		munkUiBtn = document.createElement("div");
		munkUiBtn.classList.add('munkuiButton');
		munkUi.appendChild(munkUiBtn);
		document.body.appendChild(munkUi);
	},
	highlightSelection : function(e){
		main_callback(e);
	},
	init : function(){
		document.addEventListener('dblclick', function (e) {
			e.d_type = 'dblclick';
		});

		document.addEventListener('mouseup', function (e) {
			if (window.getSelection().toString() != "" && munk.isEditableElem == 0) {
				var marginTop = munkUi.offsetHeight + 4;
				var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
				var startX = munk.startX;
				if (Math.abs(munk.startX - e.pageX) <= 1 && Math.abs(munk.startY - e.pageY) <= 1) { // double click
					startX = rect.left;
				}
				munk.startY = rect.top;
				munkUi.style.left = startX+'px';
				munkUi.style.top = (munk.startY + window.scrollY - marginTop)+'px';
				munkUi.style.display = 'block';
				munk.munkSelection = window.getSelection().getRangeAt(0).toString();
				e.d_type = 'mouseup';
			}else{
				munkUi.style.display = 'none';
			}
		});

		document.addEventListener('mousedown', function (e) {
			if (munk.isEditableContent(e) == true) {
				isEditableElem = 1;
			} else {
				isEditableElem = 0;
			}
			munk.startX = e.pageX;
			munk.startY = e.pageY;
			munkUi.style.display = 'none';
		});

		munk.addUIButton();

		document.querySelector('.munkuiButton').addEventListener('click', function (e) {
			munk.highlightSelection();
		});
		
	}
}

munk.init();
