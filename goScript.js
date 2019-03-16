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
	var mode='add';
	var lang='English';
	var recordIndex=-1;
	var lastSave=null;
	var resort=false;
	var qFocus=null;

  // EVENT LISTENERS
	
  id("main").addEventListener('click', function() {
  	id("menu").style.display="none";
  })
  
  // MENU BUTTON

  id('buttonMenu').addEventListener('click', function() {
	var display = id("menu").style.display;
	if(display == "block") id("menu").style.display = "none";
	else id("menu").style.display = "block";
  });
  
  // IMPORT OPTION
	
  id("import").addEventListener('click', function() {
  	console.log("IMPORT");
	// toggleDialog("importDialog", true);
	id('importDialog').style.display='block';
  })
  
  // CANCEL IMPORT DATA
	
  id('buttonCancelImport').addEventListener('click', function() {
    // toggleDialog('importDialog', false);
    id('importDialog').style.display='none';
	id("menu").style.display="none";
  });

	// IMPORT FILE

  id("fileChooser").addEventListener('change', function() {
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
			var request = dbObjectStore.add(records[i]);
			request.onsuccess = function(e) {
				console.log(records.length+" records added to database");
			};
			request.onerror = function(e) {console.log("error adding record");};
		};
		// toggleDialog('fileChooserDialog',false);
		id('fileChooserDialog').style.display='none';
		id("menu").style.display="none";
		alert("records imported - restart");		
  	});
  	fileReader.readAsText(file);
  },false);
  
  // EXPORT FILE
	
  id("export").addEventListener('click', function() {
  	console.log("EXPORT");
	var today= new Date();
	var fileName = "nihongo" + today.getDate();
	var n = today.getMonth();
	// fileName += months.substr(n*3,3);
	var n = today.getFullYear() % 100;
	if(n<10) fileName+="0";
	fileName += n + ".json";
	var data={'records': records};
	var json=JSON.stringify(data);
	console.log(records.length+" records to save");
	var blob=new Blob([json], {type:"data:application/json"});
	var a =document.createElement('a');
	a.style.display='none';
	var url = window.URL.createObjectURL(blob);
	a.href= url;
	a.download=fileName;
	document.body.appendChild(a);
	a.click();
	alert(fileName+" saved to downloads folder");
	id("menu").style.display="none";
  })
  
  // FIND BUTTON
  
  id('findButton').addEventListener('click', function() {
  	var word=id('findField').value;
  	// var word=id('findField').value.toLowerCase();
  	console.log("lookup "+word);
  	alert("find "+word);
  	var i=0;
  	var found=false;
  	record={};
  	while((i<records.length)&&!found) {
  		if(records[i].romaji.indexOf(word)>=0) found=true;
  		if(records[i].anglo.indexOf(word)>=0) found=true;
   		if(!found) i++;
  	}
  	console.log("found is "+found+" record is "+i);
  	if(found) {
  		id('title').innerHTML=word;
  		id('kanji').innerHTML=records[i].kanji;
  		id('kana').innerHTML=records[i].kana;
  		id('romaji').innerHTML=records[i].romaji;
  		id('anglo').innerHTML=records[i].anglo;
  		record=records[i];
  		recordIndex=i;
  	}
  	else {
  		id('kanji').innerHTML=id('kana').innerHTML=id('romaji').innerHTML=id('anglo').innerHTML='';
  		id('title').innerHTML="no matches";
	}
	id('findField').value='';
	id('buttonNextDone').innerHTML='DONE';
	id('display').style.display='block';
  })
  
  // EDIT word/phrase
  
  id('buttonEdit').addEventListener('click', function() {
  	id('display').style.display='none';
  	mode='edit';
  	id('wordField').value=record.kanji;
  	step=1;
  	id("buttonDelete").disabled=false;
	id('buttonDelete').style.color='red';
	// toggleDialog('recordDialog', true);
	id('recordDialog').style.display='block';
  })
  
  // NEXT/DONE
  
  id('buttonNextDone').addEventListener('click', function() {
  	if(id('buttonNextDone').innerHTML=='DONE') id('display').style.display='none';
  	// else SHOW NEXT FLASHCARD
  	else { // flashcards
  		if((lang=='Japanese')&&(step<4)) { // reveal words one at a time
  			step++;
  			if(step==2) {id('kana').innerHTML=record.kana}
  			else if(step==3) {id('romaji').innerHTML=record.romaji}
  			else id('anglo').innerHTML=record.anglo;
  		}
  		else if((lang=='English')&&(step==4)) { // reveal all Japanese at once
  			id('kanji').innerHTML=record.kanji;
  			id('kana').innerHTML=record.kana;
  			id('romaji').innerHTML=record.romaji;
  			step=0;
  		}
  		else flashcard(recordIndex);
  	}
  })
  
  // JAPANESE flashcards
  
  id('nihongoButton').addEventListener('click', function() {
	id('title').innerHTML='flashcard';
	id('buttonNextDone').innerHTML='NEXT';
	lang='Japanese';
	id('display').style.display='block';
	flashcard();
  })
  
  // ENGLISH flashcards
  
  id('angloButton').addEventListener('click', function() {
	id('title').innerHTML='flashcard';
	id('buttonNextDone').innerHTML='NEXT';
	lang='English';
	id('display').style.display='block';
	flashcard();
  })
  
  // RANDOM FLASHCARD
  
  function flashcard(lastIndex) {
  	var n=records.length;
	console.log(n+" words");
  	var i=Math.random();
  	console.log('random: '+i);
  	i=Math.floor(i*n);
  	console.log("record "+i);
  	if(i==lastIndex) flashcard(lastIndex); // avoid getting same word twice in succession
  	record=records[i];
  	recordIndex=i;
  	if(lang=='Japanese') {
  		id('kanji').innerHTML=record.kanji;
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
	// toggleDialog('recordDialog', true);
	id('recordDialog').style.display='block';
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
	console.log('anglo:'+record.anglo);
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
			// fillList();
		};
		request.onerror = function(event) {console.log("error adding new record");};
	}
	else { // update record
		var request = dbObjectStore.put(record); // update record in database
		request.onsuccess = function(event)  {
			console.log("record "+record.id+" updated");
			if(resort) { // if date altered need to re-sort records
				console.log("re-sort");
				records.sort(function(a,b) { return Date.parse(b.date)-Date.parse(a.date)}); // reverse date order (latest first)
			}
			// fillList();
		};
		request.onerror = function(event) {console.log("error updating record "+record.id);};
	}
  });
  
  // CANCEL NEW/EDIT RECORD

  id('buttonCancel').addEventListener('click', function() {
    // Close the add new jotting dialog
    // toggleDialog('recordDialog', false);
    id('recordDialog').style.display='none';
  });
  
  // DELETE RECORD
  
  id('buttonDelete').addEventListener('click', function() {
	// toggleDialog('recordDialog', false);
	// id('recordDialog').style.display='none';
	alert("delete record "+record.id);
	var dbTransaction = db.transaction("go","readwrite");
	console.log("transaction ready");
	var dbObjectStore = dbTransaction.objectStore("go");
	var request = dbObjectStore.delete(record.id);
	request.onsuccess = function(event) {
		records.splice(recordIndex,1) // remove record form records array
		console.log("record "+recordIndex+" (id "+record.id+") deleted. "+records.length+" records");
		id('recordDialog').style.display='none';
		// fillList();
	};
	request.onerror = function(event) {console.log("error deleting record "+record.id);};
  });
/*
  function toggleDialog(d,visible) { // SHOW/HIDE DIALOG
	if(d == 'importDialog') {
		if (visible) id("importDialog").classList.add('dialog-container--visible');
		else id("importDialog").classList.remove('dialog-container--visible');
	}
	else if(d == 'recordDialog') {
		if (visible) id("recordDialog").classList.add('dialog-container--visible');
		else id("recordDialog").classList.remove('dialog-container--visible');
	}
	else if(d=='fileChooserDialog') {
		if (visible) id("fileChooserDialog").classList.add('dialog-container--visible');
		else id("fileChooserDialog").classList.remove('dialog-container--visible');
	}
  };
*/
/*
  function openRecord() { // OPEN SELECTED RECORD FOR EDITING
	// console.log("open record "+recordIndex);
	record=records[recordIndex];
	console.log("open record "+recordIndex+"; id: "+record.id+" "+record.date+"; "+record.litres+"litres @ "+record.miles+"miles");
	toggleDialog('recordDialog', true);
	id('kanjiField').value=record.kanji;
	id('levelField').value=record.level;
	id('kanaField').value=record.kana;
	id('romajiField').value=record.romaji;
	id('angloField').value=record.anglo;
	id('buttonDelete').disabled=false;
	id('buttonDelete').style.color='red';
  } 
*/
  // START-UP CODE
  
  console.log("STARTING");
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
		var words="";
		request.onsuccess = function(event) {  
			var cursor = event.target.result;  
    			if (cursor) {
					records.push(cursor.value);
					console.log("record "+cursor.key+", id: "+cursor.value.id+": "+cursor.value.kanji+"; "+cursor.value.kana+"; "+cursor.value.romaji+"; "+cursor.value.anglo);
					words+=cursor.value.romaji;
					words+="; ";
					cursor.continue();  
    			}
			else {
				console.log("No more entries!");
				alert("words: "+words);
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
