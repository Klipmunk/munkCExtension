


var HoverListener = {
  addElem: function( elem, callback, outCallback,  delay )
  {
    if ( delay === undefined )
    {
      delay = 500;
    }

    var hoverTimer;

    addEvent( elem, 'mouseover', function()
    {
    	klip = this;
     	hoverTimer = setTimeout( function(){callback(klip);}, delay );
    });

    addEvent( elem, 'mouseout', function()
    {
      	clearTimeout( hoverTimer );
      	outCallback();
    });
  }
}
function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function addEvent( obj, evt, func )
{
  if ( 'undefined' != typeof obj.addEventListener )
  {
    obj.addEventListener( evt, func, false );
  }
  else if ( 'undefined' != typeof obj.attachEvent )
  {
    obj.attachEvent( "on" + evt, func );
  }
}
 function addHoverComment(id){
	HoverListener.addElem(document.getElementById(id), munk.showComment, function(){});
 }


function main_callback (e) {

	var selection = munk.munkSelection;

	if ( ! selection || selection == '' || selection.match(/^[\t|\s|\n]+$/) || selection.match(/^\s+$/m)) {
		return false;
	}
	setTimeout(function () {
		id = munk.generateKlipId();
		addToHistory(id, selection, window.location.href);
		data = [];
		data[id] = {id : id, url : window.location.href, text: selection };
		checkPages(data);
		munk.munkUi.style.display = 'none';
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

// Chnage in Db obj

function checkPages(data){
	console.log(data);
	if(data != undefined && Object.keys(data).length > 0){
		for (var key in data){
			if(data[key].url === window.location.href){
				console.log("Finding "+data[key].text);
				findAndReplaceDOMText(document.body, {
					find: data[key].text,
					replace :  function(portion, match) {
						var e = document.createElement('span');
						e.className = 'highligher';
						e.id = data[key].id;
						e.appendChild(document.createTextNode(portion.text));
						return e;
					}
				});
				addHoverComment(data[key].id);
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
	munkSelectionObj :{},
	validKlipId : function(id){
		var pattern = /^[a-z0-9]*$/;
		return id != null && id != '' && pattern.test(id) && id.length == 10;
	},
	generateKlipId : function(){
		var letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		do{
			var x = '';
			for (var i = 0; i < 10; i++) {
				x += letters[Math.floor(Math.random() * 36)];
			}
		}while(x in munk.munkSelectionObj);
		munk.munkSelectionObj[x] = this;
		return x;
	},
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
		this.munkUi = document.createElement("div");
		this.munkUi.classList.add('munkuiButtonWrapper');
		this.munkUiBtn = document.createElement("div");
		this.munkUiBtn.classList.add('munkuiButton');
		this.munkUi.appendChild(this.munkUiBtn);
		document.body.appendChild(this.munkUi);
	},
	addUIComment : function(){
		str = '<div class="munkCommentDiv" data-klipid= ""><textarea class="munkCommentTextarea" placeholder="Comment Here ..."></textarea><div class="munk-comment-block"><p class="munk-saving munk-label">Saving...</p><p class="munk-saved munk-label">Saved</p></div></div>';
		this.munkUiComment = document.createElement("div");
		this.munkUiComment.classList.add('munkCommentWrapper');
		this.munkUiComment.innerHTML = str;
		document.body.appendChild(this.munkUiComment);
	},
	addUIMiniBtn : function(){
		str = '<div class="munk-counter-wrap-div"><div class="munk-counter-wrap"><span class="munk-counter">1</span><span class="munk-check"></span></div><span class="munk-expand"></span></div>';
		this.munkUiMiniBtn = document.createElement("div");
		this.munkUiMiniBtn.classList.add('munk-mini-btn-Wrapper');
		this.munkUiMiniBtn.innerHTML = str;
		document.body.appendChild(this.munkUiMiniBtn);
	},
	addUINotify : function(){
		str = '<div class="munk-notify-close"></div><div class="munk-notify-wrap"><div class="munk-notify-icon"></div><p class="munk-notify-text">Drag any sentence and click LINER icon to start highlighting.</p></div>';
		this.munkUiNotify = document.createElement("div");
		this.munkUiNotify.classList.add('munk-notify-tooltip');
		this.munkUiNotify.innerHTML = str;
		document.body.appendChild(this.munkUiNotify);
		this.showNotifyUi();
	},
	showNotifyUi : function(){
		this.munkUiNotify.style.display = 'block';
		setTimeout(function () {munk.munkUiNotify.style.display='none'}, 3000);
	},
	highlightSelection : function(e){
		main_callback(e);
	},
	showComment : function(klip){
		var klipOffset = offset(klip);
		document.querySelector('.munkCommentDiv').dataset.klipid = klip.id;
		document.querySelector('.munkCommentWrapper').style.left= klipOffset.left+'px';
		document.querySelector('.munkCommentWrapper').style.top= klipOffset.top+30+'px';
		document.querySelector('.munkCommentWrapper').style.display= 'block';
	},
	hideComment : function(klip){
		document.querySelector('.munkCommentDiv').dataset.klipid = '';
		document.querySelector('.munkCommentWrapper').style.display= 'none';
	},
	saveComment : function(comment){
		commentDiv = comment.closest('.munkCommentDiv');
		klipid = commentDiv.getAttribute('data-klipid');
		comment = comment.value;
		if(comment != '' && comment != null && munk.validKlipId(klipid)){
			commentDiv.querySelector('.munk-saving').style.display = 'block';
			saveCommentInDB(comment, klipid, function(){
				commentDiv.querySelector('.munk-saving').style.display = 'none';
				commentDiv.querySelector('.munk-saved').style.display = 'block';
				setTimeout(function(){
					commentDiv.querySelector('.munk-saved').style.display = 'none';
				},3000);
			});
		}
	},
	init : function(){

		document.addEventListener('click', function (e) {
			munk.highlightSelection();
			if(e.target.className ==  'munkCommentTextarea'){

			}else{
				munk.hideComment();
			}
		});
	
		document.addEventListener('dblclick', function (e) {
			e.d_type = 'dblclick';
		});		

		
		document.addEventListener('mouseup', function (e) {
			if (window.getSelection().toString() != "" && munk.isEditableElem == 0) {
				var marginTop = munk.munkUi.offsetHeight + 4;
				var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
				var startX = munk.startX;
				if (Math.abs(munk.startX - e.pageX) <= 1 && Math.abs(munk.startY - e.pageY) <= 1) { // double click
					startX = rect.left;
				}
				munk.startY = rect.top;
				munk.munkUi.style.left = startX+'px';
				munk.munkUi.style.top = (munk.startY + window.scrollY - marginTop)+'px';
				munk.munkUi.style.display = 'block';
				munk.munkSelection = window.getSelection().getRangeAt(0).toString();
				e.d_type = 'mouseup';
			}else{
				munk.munkUi.style.display = 'none';
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
			munk.munkUi.style.display = 'none';
		});

		munk.addUIButton();
		munk.addUIComment();
		munk.addUIMiniBtn();
		munk.addUINotify();
		document.querySelector('.munkCommentTextarea').addEventListener('keydown', function (e) {
			munk.saveComment(this);
		});
	}
}

munk.init();
