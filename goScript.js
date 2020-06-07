function id(el) {
	// console.log("return element whose id is "+el);
	return document.getElementById(el);
}

'use strict';
	
  // GLOBAL VARIABLES
	var db;
	var records=[];
	var record={};
	var step=0;
	var cardIndex=0;
	var cardStep=0;
	var mode='add';
	var lang='English';
	var recordIndex=-1;
	var lastSave=null;
	var resort=false;
	var qFocus=null;
	var finds=[]; // NEW: list of words matching find term
	// var find=-1; // index for matching finds (-1 if none)

// EVENT LISTENERS

// FIND BUTTON
id('findButton').addEventListener('click', function() {
  	var word=id('findField').value.toLowerCase();
  	console.log("find "+word);
  	var i=0,j=0;
  	var found=false;
  	record={};
  	finds=[];
  	while(i<records.length) { // check every record
  	    found=false;
  	    for(j=0;j<records[i].romaji.length;j++) {
  	        if(records[i].romaji[j].indexOf(word)>=0) found=true;
  	    }
  	    for(j=0;j<records[i].anglo.length;j++) {
  	        if(records[i].anglo[j].indexOf(word)>=0) found=true;
  	    }
  	    if(found) finds.push(i);
   		i++;
  	}
  	if(finds.length>0) { // if any matches...
  	    id('title').innerHTML=word;
  	    showMatch(); // show first match
  	}
  	else {
  		id('kanji').innerHTML=id('kana').innerHTML=id('romaji').innerHTML=id('anglo').innerHTML='';
  		id('title').innerHTML="no matches";
	}
	id('findField').value='';
	id('display').style.display='block';
	id('help').innerHTML='';
})
  
function showMatch() {
    recordIndex=finds.shift(); // next match
  	record=records[recordIndex];
  	id('kanji').innerHTML=record.kanji;
  	id('kana').innerHTML=record.kana;
  	id('romaji').innerHTML=record.romaji;
  	id('anglo').innerHTML=record.anglo;
    if(finds.length<1) { // last match
        id('buttonNextDone').innerHTML='DONE';
        console.log('last match');
    }
    else id('buttonNextDone').innerHTML='NEXT';
}

id('buttonClose').addEventListener('click', function() {
    id('display').style.display='none';
})
  
// EDIT word/phrase
id('buttonEdit').addEventListener('click', function() {
  	id('display').style.display='none';
  	mode='edit';
  	id('dialogTitle').innerHTML="edit word/phrase";
    id('label').innerHTML='kanji';
  	id('wordField').value=record.kanji;
  	step=1;
  	id('buttonNextSave').innerHTML='NEXT';
  	id("buttonDelete").disabled=false;
		id('buttonDelete').style.color='yellow';
		id('recordDialog').style.display='block';
})
  
// NEXT/DONE
id('buttonNextDone').addEventListener('click', function() {
  	if(id('buttonNextDone').innerHTML=='DONE') id('display').style.display='none';
  	else if(finds.length>0) { // show next match
  	    showMatch();
  	}
  	else { // show next flashcard
  		if((lang=='Japanese')&&(step<4)) { // reveal words one at a time
  			step++;
  			if(step==2) {
  			    id('kana').innerHTML=record.kana
  			    id('title').innerHTML='kana';
  			}
  			else if(step==3) {
  			    id('romaji').innerHTML=record.romaji
  			    id('title').innerHTML='Romaji';
  			}
  			else {
  			    id('anglo').innerHTML=record.anglo;
  			    id('title').innerHTML='English';
  			}
  		}
  		else if((lang=='English')&&(step==4)) { // reveal all Japanese at once
  			id('kanji').innerHTML=record.kanji;
  			id('kana').innerHTML=record.kana;
  			id('romaji').innerHTML=record.romaji;
  			step=0;
  		}
  		else flashcard(false);
  	}
})
  
// JAPANESE flashcards
id('nihongoButton').addEventListener('click', function() {
	id('title').innerHTML='Japanese kanji';
	id('buttonNextDone').innerHTML='NEXT';
	lang='Japanese';
	id('display').style.display='block';
	id('help').innerHTML='';
	// cardIndex=Math.floor(Math.random()*records.length);
	flashcard(true);
})
  
// ENGLISH flashcards
id('angloButton').addEventListener('click', function() {
	id('title').innerHTML='English';
	id('buttonNextDone').innerHTML='NEXT';
	lang='English';
	id('display').style.display='block';
	id('help').innerHTML='';
	// cardIndex=Math.floor(Math.random()*records.length);
	flashcard(true);
})
  
// RANDOM FLASHCARD
function flashcard(first) {
  	if(first) {
  		cardIndex=Math.floor(Math.random()*records.length);
  		cardStep=1+Math.floor(Math.random()*5); // flashcards step by 1-5 words
  		console.log("flashcard "+cardIndex+" step by "+cardStep);
  	}
  	console.log("flashcard "+cardIndex);
  	recordIndex=cardIndex; // NEEDED???
  	record=records[cardIndex];
  	if(lang=='Japanese') {
  		id('kanji').innerHTML=record.kanji;
  		id('title').innerHTML='kanji';
  		if(record.kanji) {
  			id('kana').innerHTML='-';
  			step=1;
  		}
  		else { // no kanji
  			id('kana').innerHTML=record.kana;
  			step=2;
  		}
  		id('romaji').innerHTML=id('anglo').innerHTML='-';
  	}
  	else {
  		id('anglo').innerHTML=record.anglo;
  		id('kanji').innerHTML=id('kana').innerHTML=id('romaji').innerHTML='-';
  		step=4;	
  	}
  	cardIndex=(cardIndex+cardStep)%records.length; // ready for next flashcard
}
  
// ADD word/phrase BUTTON
id('buttonAdd').addEventListener('click', function() {
    id('display').style.display='none';
    mode='add';
    step=1;
    id('label').innerHTML='kanji';
    id('wordField').value='';
	record={};
	recordIndex=-1;
	id('dialogTitle').innerHTML="add word/phrase";
	id("buttonDelete").disabled=true;
	id('buttonDelete').style.color='gray';
	id('buttonNextSave').innerHTML='NEXT';
	id('buttonClose').disabled=false;
	id('recordDialog').style.display='block';
	id('help').innerHTML='';
});
  
// NEXT field or SAVE NEW/EDITED RECORD
id('buttonNextSave').addEventListener('click', function() {
	console.log("input: "+id('wordField').value);
	if(id('buttonNextSave').innerHTML=='NEXT') {
		if(step==1) { // kanji
			record.kanji=id('wordField').value;
			console.log('kanji:'+record.kanji);
			id('dialogTitle').innerHTML=record.kanji;
			step++;
			id('label').innerHTML='kana';
			if(mode=='edit') id('wordField').value=record.kana;
			else id('wordField').value='';
		}
		else if(step==2) { // kana
			record.kana=id('wordField').value.split(",");
			console.log('kana:'+record.kana);
			id('dialogTitle').innerHTML+=" "+record.kana;
			step++;
			id('label').innerHTML='romaji';
			if(mode=='edit') id('wordField').value=record.romaji;
			else id('wordField').value='';
		}
		else if(step==3) { // romaji
			record.romaji=id('wordField').value.toLowerCase().split(",");
			for(var i=0;i<record.romaji.length;i++) { // strip any spaces following commas
	            var w=record.romaji[i];
	            while(w.charAt(0)==' ') w=w.slice(1);
	            record.romaji[i]=w;
		    }
			console.log('romaji:'+record.romaji);
			id('dialogTitle').innerHTML+=" "+record.romaji;
			step++;
			id('label').innerHTML='English';
			if(mode=='edit') id('wordField').value=record.anglo;
			else id('wordField').value='';
			id('buttonNextSave').innerHTML='SAVE';
		}
		return;
	}
	// reach here after entering English word (step 4)
	record.anglo=id('wordField').value.toLowerCase().split(",");
	for(var i=0;i<record.anglo.length;i++) { // strip any spaces following commas
	    var w=record.anglo[i];
	    while(w.charAt(0)==' ') w=w.slice(1);
	    record.anglo[i]=w;
	}
	id('dialogTitle').innerHTML+=" "+record.anglo; // ****** no point? ******
	console.log("SAVE");
    // toggleDialog('recordDialog', false);
    id('recordDialog').style.display='none';
    console.log("save "+record.kanji+"; "+record.kana+"; "+record.romaji+"; "+record.anglo);
    
    // check if this word/phrase is already in the records array - if so display alert
    
	var dbTransaction = db.transaction('go',"readwrite");
	console.log("transaction ready");
	var dbObjectStore = dbTransaction.objectStore('go');
	console.log("objectStore ready");
	if(recordIndex<0) { // add new record
		var request = dbObjectStore.add(record);
		// request.onsuccess = function(event) {console.log("record added - id is "+event.target.id);};
		request.onsuccess = function(event) {
			record.id = event.target.result;
			console.log("record added - id is " + record.id);
			// insert into records array
			var i=0;
			var found=false;
			while((i<records.length) && !found) {
				// console.log("record "+i+" date: "+records[i].date);
				if(records[i].date>record.date) found=true;
				else i++;
			}
			records.splice(i,0,record);
			qFocus=null;
			id('count').innerHTML=records.length;
		};
		request.onerror = function(event) {console.log("error adding new record");};
	}
	else { // update record
		var request = dbObjectStore.put(record); // update record in database
		request.onsuccess = function(event)  {
			console.log("record "+record.id+" updated");
		};
		request.onerror = function(event) {console.log("error updating record "+record.id);};
	}
	id('title').innerHTML="saved";
    id('kanji').innerHTML=record.kanji;
    id('kana').innerHTML=record.kana;
    id('romaji').innerHTML=record.romaji;
    id('anglo').innerHTML=record.anglo;
    id('buttonNextDone').innerHTML='DONE';
    id('display').style.display='block';
});
  
// CANCEL NEW/EDIT RECORD
id('buttonCancel').addEventListener('click', function() {
    // Close the add new jotting dialog
    id('recordDialog').style.display='none';
});
  
// DELETE RECORD
id('buttonDelete').addEventListener('click', function() {
	alert("delete record "+record.id);
	var dbTransaction = db.transaction("go","readwrite");
	console.log("transaction ready");
	var dbObjectStore = dbTransaction.objectStore("go");
	var request = dbObjectStore.delete(record.id);
	request.onsuccess = function(event) {
		records.splice(recordIndex,1) // remove record form records array
		console.log("record "+recordIndex+" (id "+record.id+") deleted. "+records.length+" records");
		id('recordDialog').style.display='none';
	};
	request.onerror = function(event) {console.log("error deleting record "+record.id);};
});
  
// RESTORE BACKUP
id("fileChooser").addEventListener('change', function() {
    console.log("file chosen");
	var file=id('fileChooser').files[0];
	console.log("file: "+file+" name: "+file.name);
	var fileReader=new FileReader();
	fileReader.addEventListener('load', function(evt) {
		console.log("file read: "+evt.target.result);
		var data=evt.target.result;
		var json=JSON.parse(data);
		console.log("json: "+json);
		var records=json.records;
		console.log(records.length+" records loaded");
		var dbTransaction = db.transaction('go',"readwrite");
		var dbObjectStore = dbTransaction.objectStore('go');
		var request = dbObjectStore.clear();
			request.onsuccess = function(e) {
				console.log(records.length+" records in database");
			};
		for(var i=0;i<records.length;i++) {
			console.log("add records"+i);
			request = dbObjectStore.add(records[i]);
			request.onsuccess = function(e) {
				console.log(records.length+" records added to database");
			};
			request.onerror = function(e) {console.log("error adding record");};
		}
		// toggleDialog('fileChooserDialog',false);
		id('fileChooserDialog').style.display='none';
		id("menu").style.display="none";
		alert("records imported - restart")
	});
  	fileReader.readAsText(file);
});

// CANCEL RESTORE
id('buttonCancelImport').addEventListener('click', function() {
    console.log("cancel restore");
    id('importDialog').style.display='none';
});

// BACKUP
function backup() {
  	console.log("EXPORT");
	var fileName="tango.json";
	var data={'records': records};
	var json=JSON.stringify(data);
	console.log(records.length+" records to save");
	var blob=new Blob([json], {type:"data:application/json"});
	var a =document.createElement('a');
	a.style.display='none';
	var url=window.URL.createObjectURL(blob);
	a.href=url;
	a.download=fileName;
	document.body.appendChild(a);
	a.click();
	alert(fileName+" saved to downloads folder");
	var today=new Date();
	lastSave=today.getMonth(); // remember month of backup
	window.localStorage.setItem('lastSave',lastSave);
}

// START-UP CODE
  console.log("STARTING");
  lastSave=window.localStorage.getItem('lastSave');
  console.log('lastSave: '+lastSave);
  var defaultData = {records: [{kanji:"字", level:1, kana:"じ ", romaji:"ji", anglo:"character"}]}
  var request = window.indexedDB.open("nihongoDB");
	request.onsuccess = function(event) {
		console.log("request: "+request);
		db=event.target.result;
		console.log("DB open");
		var dbTransaction = db.transaction('go',"readwrite");
		console.log("transaction ready");
		var dbObjectStore = dbTransaction.objectStore('go');
		console.log("objectStore ready");
		records=[];
		console.log("records array ready");
		var request = dbObjectStore.openCursor();
		// var words="";
		request.onsuccess = function(event) {  
			var cursor = event.target.result;  
    			if (cursor) {
					records.push(cursor.value);
					console.log("record "+cursor.key+", id: "+cursor.value.id+": "+cursor.value.kanji+"; "+cursor.value.kana+"; "+cursor.value.romaji+"; "+cursor.value.anglo);
					// words+=cursor.value.romaji;
					// words+="; ";
					cursor.continue();  
    			}
			else {
				console.log("No more entries!");
				console.log("words: "+records.length);
				id('count').innerHTML=records.length;
				if(records.length<1) {
				    console.log("no records - restore backup?");
				    id('importDialog').style.display='block'; // offer to recover backup
				}
				var today=new Date();
				if(today.getMonth()!=lastSave) backup(); // monthly backups
			}
		};
	};
	request.onupgradeneeded = function(event) {
		var dbObjectStore = event.currentTarget.result.createObjectStore("go", { keyPath: "id", autoIncrement: true });
		console.log("new go ObjectStore created");
	};
	request.onerror = function(event) {
		alert("indexedDB error code "+event.target.errorCode);
		records = defaultData.records;
		alert("use default data");
	};

  // implement service worker if browser is PWA friendly
	if (navigator.serviceWorker.controller) {
		console.log('Active service worker found, no need to register')
	} else { //Register the ServiceWorker
		navigator.serviceWorker.register('goSW.js').then(function(reg) {
			console.log('Service worker has been registered for scope:'+ reg.scope);
		});
	}
 
