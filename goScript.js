function id(el) {
	// console.log("return element whose id is "+el);
	return document.getElementById(el);
}

// function() {
  'use strict';
	
  // GLOBAL VARIABLES
	var db;
	var records=[];
	var record={};
	var recordIndex=-1;
	var lastSave=null;
	var resort=false;
	var qFocus=null;

  // EVENT LISTENERS
	
  document.getElementById("main").addEventListener('click', function() {
  	id("menu").style.display="none";
  })

  document.getElementById('buttonMenu').addEventListener('click', function() { // MENU BUTTON
	var display = document.getElementById("menu").style.display;
	if(display == "block") id("menu").style.display = "none";
	else id("menu").style.display = "block";
  });
	
  document.getElementById("import").addEventListener('click', function() { // IMPORT OPTION
  	console.log("IMPORT");
	toggleDialog("importDialog", true);
  })
	
  document.getElementById('buttonCancelImport').addEventListener('click', function() { // CANCEL IMPORT DATA
    toggleDialog('importDialog', false);
	id("menu").style.display="none";
  });
	
  id("fileChooser").addEventListener('change', function() { // IMPORT FILE
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
		toggleDialog('fileChooserDialog',false);
		id("menu").style.display="none";
		alert("records imported - restart");		
  	});
  	fileReader.readAsText(file);
  },false);
	
  document.getElementById("export").addEventListener('click', function() { // EXPORT FILE
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
  
  id('lookupButton').addEventListener('click', function() { // LOOKUP BUTTON
  	var word=id('wordField').value;
  	console.log("lookup "+word);
  	var i=0;
  	var found=false;
  	while((i<records.length)&&!found) {
  		if(records[i].romaji.indexOf(word)>=0) found=true;
  		if(records[i].anglo.indexOf(word)>=0) found=true;
  		// if((word==records[i].romaji)||(word==record[i].anglo)) found=true;
  		if(!found) i++;
  	}
  	console.log("found is "+found+" record is "+i);
  	if(found) {
  		id('title').innerHTML=word+" match:";
  		id('kanji').innerHTML=records[i].kanji;
  		id('kana').innerHTML=records[i].kana;
  		id('romaji').innerHTML=records[i].romaji;
  		id('anglo').innerHTML=records[i].anglo;
  
  	}
  	else {
  		id('kanji').innerHTML=id('kana').innerHTML=id('romaji').innerHTML=id('anglo').innerHTML='';
  		id('title').innerHTML="no matches";
	}
	id('wordField').value='';
	id('display').style.display='block';
  })

  document.getElementById('buttonNew').addEventListener('click', function() { // NEW BUTTON
    // hide display if visible
    id('display').style.display='none';
    // show the dialog
	// console.log("show add diaog with today's date,  blank fields and delete button disabled");
    toggleDialog('recordDialog', true);
	id('kanjiField').value=id('kanaField').value=id('romajiField').value=id('angloField').value="";
	record={};
	recordIndex=-1;
	resort=false;
	id("buttonDelete").disabled=true;
	id('buttonDelete').style.color='gray';
  });

  document.getElementById('buttonSave').addEventListener('click', function() { // SAVE NEW/EDITED RECORD
	console.log("SAVE");
	
	record.kanji=id('kanjiField').value;
	// record.level=parseInt(id('levelField').value);
	record.kana=record.kana=id('kanaField').value.split(",");
	record.romaji=id('romajiField').value.split(",");
	record.anglo=id('angloField').value.split(",");
    toggleDialog('recordDialog', false);
    
    
   console.log("save "+record.kanji+"; "+record.kana+"; "+record.romaji+"; "+record.anglo);
    
    // check if this word/phrase is already in the recordws array - if so display alert
    
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

  document.getElementById('buttonCancel').addEventListener('click', function() { // CANCEL NEW/EDIT RECORD
    // Close the add new jotting dialog
    toggleDialog('recordDialog', false);
  });
  
  document.getElementById('buttonDelete').addEventListener('click', function() { // DELETE RECORD
	toggleDialog('recordDialog', false);
	console.log("delete record "+record.id);
	var dbTransaction = db.transaction("go","readwrite");
	console.log("transaction ready");
	var dbObjectStore = dbTransaction.objectStore("go");
	var request = dbObjectStore.delete(record.id);
	request.onsuccess = function(event) {
		records.splice(recordIndex,1) // remove record form records array
		console.log("record "+recordIndex+" (id "+record.id+") deleted. "+records.length+" records");
		// fillList();
	};
	request.onerror = function(event) {console.log("error deleting record "+record.id);};
  });

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
		request.onsuccess = function(event) {  
			var cursor = event.target.result;  
    			if (cursor) {
					records.push(cursor.value);
					console.log("record "+cursor.key+", id: "+cursor.value.id+": "+cursor.value.kanji+"; "+cursor.value.kana+"; "+cursor.value.romaji+"; "+cursor.value.anglo);
					cursor.continue();  
    			}
			else {console.log("No more entries!");
			// records.sort(function(a,b) { return Date.parse(b.date)-Date.parse(a.date)}); // reverse date order (latest first)
			records.sort(function(a,b) { return Date.parse(a.date)-Date.parse(b.date)}); // sort by date
  			// fillList();
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
