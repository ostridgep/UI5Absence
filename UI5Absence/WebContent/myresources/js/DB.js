var objtype="";	
var objid="";	
var objshorttext="";	
var objaddress="";	
var objswerk="";		
var pageRefreshed = false;
var SAPServerPrefix="";
var SAPServerSuffix="";	

var parTrace= "ON";
var syncDetsSet=false;
var demoDataLoaded=0;
var syncTransactionalDetsUpdated=false;
var syncReferenceDetsUpdated=false;
var syncCnt=0;
function zeroFill(x){
    return (x < 10) ? ("0" + x) : x;   
}			
function getDate()	{			
				var currentdate = new Date(); 
	return zeroFill(currentdate.getFullYear().toString()) + zeroFill((currentdate.getMonth()+1).toString() ) + zeroFill(currentdate.getDate().toString());

}
function getTime()	{			
				var currentdate = new Date(); 
    x1=zeroFill( currentdate.getHours()).toString();
          x2=zeroFill(currentdate.getMinutes()).toString();
    x3=zeroFill( currentdate.getSeconds()).toString();
	return x1+x2+x3;

}
function getDateStamp(){
nowd=getDate();
nowt=getTime();
dtstamp=nowd+nowt;
return dtstamp;
}
function formatDateTime(dt){

var formatteddt="";
formatteddt=dt.substring(6,8)+"-"+dt.substring(4,6)+"-"+dt.substring(0,4)+" "+dt.substring(8,10)+":"+dt.substring(10,12)+":"+dt.substring(12,14);
return formatteddt;
}
function formatDateTimeStamp(dt){

	var formatteddt="";
	formatteddt=dt.substring(0,4)+"-"+dt.substring(4,6)+"-"+dt.substring(6,8)+" "+dt.substring(8,10)+":"+dt.substring(10,12)+":"+dt.substring(12,14);
	return formatteddt;
	}
function formatDate(dt){

	var formatteddt="";
	formatteddt=dt.substring(6,8)+"/"+dt.substring(4,6)+"/"+dt.substring(0,4)
	return formatteddt;
	}

function requestSAPData(page,params){

	opMessage(SAPServerPrefix+page+params);
	var myurl=SAPServerPrefix+page+params;

  $.getJSON(myurl);
  
}
function sendSAPData(page){
	opMessage(page);

   $.getJSON(page);
}

function opMessage(msg){



	opLog(msg);


}
function prepLogMessage(msg){

nowd=getDate();
nowt=getTime();
dtstamp=nowd+nowt;


return('INSERT INTO LogFile (datestamp , type, message ) VALUES ("'+dtstamp+'","I","'+ msg+'")');

}

function opLog(msg){

nowd=getDate();
nowt=getTime();
dtstamp=nowd+nowt;


var sqlstatement='INSERT INTO LogFile (datestamp , type, message ) VALUES ("'+dtstamp+'","I","'+ msg+'");';
	if (localStorage.Trace=='ON'){
		html5sql.process(sqlstatement,
						 function(){
							 //alert("Success Creating Tables");
						 },
						 function(error, statement){
							 window.console&&console.log("Error: " + error.message + " when processing " + statement);
						 }        
				);

	}
}
function deleteAllAbsence(type){

	nowd=getDate();
	nowt=getTime();
	dtstamp=nowd+nowt;


	var sqlstatement='DELETE FROM  Absence;';
		
		html5sql.process(sqlstatement,
						 function(){
							 if(type==1){
								 getAbsenceData();
							 }else{
								 if(pageRefreshed == false){
									 pageRefreshed = true;
									 window.location.reload();									 
								 }else{pageRefreshed = false}
								 
							 }
						 },
						 function(error, statement){
							 window.console&&console.log("Error: " + error.message + " when processing " + statement);
						 }        
				);

		
	}
function createDB(){

	html5sql.process(
		["SELECT * FROM sqlite_master WHERE type='table';"],
		function(transaction, results, rowsArray){
			
			if( rowsArray.length > 3) {
				
				return(true);
				}else{
				createTables();
				}


		},
		 function(error, statement){
			 window.console&&console.log("Error: " + error.message + " when processing " + statement);
			 return(false);
		 }   
	);
	
}	
function syncTheUploadData(){
var result;
var LastSync=""
var createURL="http://"+localStorage.getItem("Server")+"/MyAbsence/CreateAbsence.php?user="+localStorage.getItem("User");
var deleteURL="http://"+localStorage.getItem("Server")+"/MyAbsence/UpdateAbsence.php?user="+localStorage.getItem("User");
var fullURL=""

	html5sql.process("SELECT * from absence where sid = 'NEW' or used = 'DELETE' ",
	    function(transaction, results, rowsArray){
		  syncCnt=rowsArray.length;
	      for(var i = 0; i < rowsArray.length; i++){
	    	  if (rowsArray[i].used =='DELETE'){
	    		  fullURL=deleteURL+"&id="+rowsArray[i].sid+"&used="+rowsArray[i].used
	    	  }else{
	    		  fullURL=createURL+"&type="+rowsArray[i].type+"&start="+rowsArray[i].start+"&end="+rowsArray[i].end+"&days="+rowsArray[i].days+"&desc="+rowsArray[i].description+"&id="+rowsArray[i].id+"&used="+rowsArray[i].used
	    	  }
	    		//alert(fullURL)  
	    	  $.getJSON(fullURL, 
		    		  function(result){
		    	  
		    	  $.each(result, function(i, field){
		    		  result=field.split("-")
		    		 
		    		  html5sql.process("UPDATE absence SET sid = '"+result[1]+"' WHERE id = '"+result[0]+"';",
		    					 function(){
		    						 //alert("Success dropping Tables");
		    			  		LastSync=formatDateTimeStamp(getDateStamp())
		    			  		
		    			  		html5sql.process("UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';",
				    					 function(){
		    			  				 localStorage.setItem('LastSync',LastSync);
			    			  				syncCnt--;
			    			  				 if(syncCnt==0){
			    								
			    									 window.location.reload();									 
			    								
			    			  				 }
				    					 },
				    					 function(error, statement){
				    						opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
				    					 }        
				    					);
		    					 },
		    					 function(error, statement){
		    						opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
		    					 }        
		    					);
		    	  });
		    	  
		      });
	    	  
	    	  
	      }
	    },
	    function(error, statement){
	      //hande error here           
	    }
	);			
		
	}
function getAbsenceData(){
	var result;
	var LastSync=""
	var getURL="http://"+localStorage.getItem("Server")+"/MyAbsence/GetAbsence.php?user="+localStorage.getItem("User");
		$.getJSON(getURL, 
			    		  function(result){
			for(var key in result) {
			    var value = result[key];
			    if(typeof value == 'object') {
			        if(value instanceof Array) {
			            // an array. loop through children
			        	syncCnt = value.length;
			        	//alert (getCnt);
			            for(var i = 0; i < value.length; i++) {
			                var item = value[i];
			                
			    		  html5sql.process("INSERT INTO Absence (type ,start, sid, end, days , description, used) VALUES ("+
			 					 "'"+item.type+"','"+item.start+"','"+ item.id +"','"+item.end+"','"+item.days+"','"+item.description+"','"+item.used+"');",
			    					 function(){
			    						 //alert("Success dropping Tables");
			    			  		LastSync=formatDateTimeStamp(getDateStamp())
			    			  		
			    			  		html5sql.process("UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';",
					    					 function(){
			    			  				 localStorage.setItem('LastSync',LastSync);
			    			  				syncCnt--;
			    			  				 if(syncCnt==0){
			    								 if(pageRefreshed == false){
			    									 pageRefreshed = true;
			    									 window.location.reload();									 
			    								 }else{pageRefreshed = false}
			    			  				 }
					    					 },
					    					 function(error, statement){
					    						opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
					    					 }        
					    					);
			    					 },
			    					 function(error, statement){
			    						opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
			    					 }        
			    					);
			            }
			        } else {
			            // complex object, not array. inner for loop on keys?
			        }
			    } else {
			        // regular string/number etc. just print out value?
			    }
			}			    	  

			      });
		    	  
			
			
}
function syncTheData(){
	
	var result;
	var LastSync=""
	var doUpload=true
	var getURL="http://"+localStorage.getItem("Server")+"/MyAbsence/GetNewAbsence.php?user="+localStorage.getItem("User")+ "&lastsync="+localStorage.getItem('LastSync');
		
	$.getJSON(getURL, 
			    		  function(result){
		//alert(result)
			for(var key in result) {
			    var value = result[key];
			    if(typeof value == 'object') {
			        if(value instanceof Array) {
			            // an array. loop through children
			        	syncCnt = value.length;
			        	//alert (syncCnt);
			            for(var i = 0; i < value.length; i++) {
			                var item = value[i];
			           
			    		  html5sql.process("INSERT INTO Absence (type ,start, sid, end, days , description) VALUES ("+
			 					 "'"+item.type+"','"+item.start+"','"+ item.id +"','"+item.end+"','"+item.days+"','"+item.description+"');",
			    					 function(){
			    			  			    syncCnt--;
			    			  				if(syncCnt==0){
			    			  						
 			  				
							    			  		LastSync=formatDateTimeStamp(getDateStamp())
							    			  		
							    			  		html5sql.process("UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';",
									    					 function(){
							    			  				 localStorage.setItem('LastSync',LastSync);
							    			  				 doUpload=false
							    			  				 syncTheUploadData()
									    					 },
									    					 function(error, statement){
									    						opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
									    					 }        
									    					);
			    			  				}
			    					 },
			    					 function(error, statement){
			    						opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
			    					 }        
			    					);
			            }
			            

			        } else {
			            
			        }
			    } else {
			    	
			    }
			}			    	  
            if(doUpload){
            	syncTheUploadData()
            }
			      });
		    	  
			
			
}
function updateConfig(Server, User, Holiday, Sick){
	SetConfigParam('Server', Server);
	SetConfigParam('User', User);
	SetConfigParam('Holiday', Holiday);
	SetConfigParam('Sick', Sick);
}
function SetLocalStorage(){

html5sql.process(
    ["SELECT * from Config "],
    function(transaction, results, rowsArray){
      for(var i = 0; i < rowsArray.length; i++){
        //each row in the rowsArray represents a row retrieved from the database
		
			localStorage.setItem(rowsArray[i].type,rowsArray[i].value);

      }
    },
    function(error, statement){
      //hande error here           
    }
);			
	
}



function GetConfigParam(type){

	html5sql.process(
		["SELECT * from Config where type = '"+type+"'"],
		function(transaction, results, rowsArray){
			if( rowsArray.length > 0) {
				localStorage.setItem(rowsArray[0].type,rowsArray[0].value);
				
			}
	

		},
		 function(error, statement){
			 window.console&&console.log("Error: " + error.message + " when processing " + statement);
		 }   
	);
}
function SetConfigParam(type, value){

		
	localStorage.setItem(type,value);
			
			
	html5sql.process(
		["SELECT * from Config where type = '"+type+"'"],
		function(transaction, results, rowsArray){
			if( rowsArray.length > 0) {
				sqlstatement="UPDATE Config SET value = '"+value+"' WHERE type = '"+type+"';";
				}else{
				sqlstatement="INSERT INTO Config (type , value ) VALUES ('"+type+"','"+value+"');";
				}
			html5sql.process(sqlstatement,
			 function(){
				 //alert("Success dropping Tables");
			 },
			 function(error, statement){
				opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);
			 }        
			);
		},
		function(error, statement){
		 opMessage("Error: " + error.message + " when SetConfigParam processing " + statement);          
		}
	);
}		

//*************************************************************************************************************************
//
//  User Maintenance Functions
//
//*************************************************************************************************************************















function deleteDBAbsence(id)
{

	html5sql.process("Update absence set used = 'DELETE' where id = '"+id+"' ",
	 function(){
		 if(pageRefreshed == false){
			 pageRefreshed = true;
			 window.location.reload();									 
		 }else{pageRefreshed = false}
	 },
	 function(error, statement){
		alert("Error: " + error.message + " when deleting absence processing " + statement);
	 }        
	);
}

//*************************************************************************************************************************
//
//  Create Routines
//
//*************************************************************************************************************************



function createAbsence(type,start,end,days, description)
{
	var used ;
	if (type=='Lieu'){
		used = 'NO';
	}
	html5sql.process("INSERT INTO Absence (type ,start, used, sid, end, days , description) VALUES ("+
					 "'"+type+"','"+start+"','"+used+"','NEW','"+end+"','"+days+"','"+description+"');",
	 function(){
		 if(pageRefreshed == false){
			 pageRefreshed = true;
			 window.location.reload();									 
		 }else{pageRefreshed = false}
		
	 },
	 function(error, statement){
		alert("Error: " + error.message + " when createActivity processing " + statement);
	 }        
	);
}
function createConfig(notifno,groupcd,codecd, grouptext, codetext, description)
{

	html5sql.process("INSERT INTO MyEffects (notifno , item_id, effect_codegrp , effect_code , txt_effectgrp, txt_effectcd , value, task_id, effect_cat_typ ) VALUES ("+
					 "'"+notifno+"','NEW','"+groupcd+"','"+codecd+"','"+grouptext+"','"+codetext+"','"+description+"','','');",
	 function(){
		 //alert("Success dropping Tables");
	 },
	 function(error, statement){
		opMessage("Error: " + error.message + " when createActivity processing " + statement);
	 }        
	);
}
//*************************************************************************************************************************
//
//  Create Database Tables
//
//*************************************************************************************************************************
function createTables() { 




	//opMessage("Creating The Tables");	
        
		sqlstatement='CREATE TABLE IF NOT EXISTS Config     	( id integer primary key autoincrement,  type TEXT, value TEXT);'+
					 'CREATE TABLE IF NOT EXISTS Absence     	( id integer primary key autoincrement,  sid TEXT, type TEXT, start TEXT, end TEXT, days TEXT, used TEXT, description TEXT);'+
					 'CREATE TABLE IF NOT EXISTS Logfile        ( datestamp TEXT, type TEXT, message TEXT)';
		html5sql.process(sqlstatement,
						 function(){
							
							emptyTables();
							
							
						 },
						 function(error, statement){
							 opMessage("Error: " + error.message + " when create processing " + statement);
							
							 
						 }        
				);


}
//*************************************************************************************************************************
//
//  Delete all Tables
//
//*************************************************************************************************************************
function dropTables() { 


		sqlstatement=	'DROP TABLE IF EXISTS Config;'+
						'DROP TABLE IF EXISTS Absence;'+
						'DROP TABLE IF EXISTS Logfile;';

						html5sql.process(sqlstatement,
						 function(){
							 //alert("Success dropping Tables");
						 },
						 function(error, statement){
							
						 }        
				);
}
function emptyTables() { 
	

		sqlstatement=	'DELETE FROM  Config;'+
						'DELETE FROM  Absence;'+
						'DELETE FROM  Logfile;';
						
						

						html5sql.process(sqlstatement,
						 function(){
							
							SetConfigParam("User",  "");
							SetConfigParam("Server",  "");
							SetConfigParam("Holiday", "0");
							SetConfigParam("Sick", "0");
							SetConfigParam("LastSync", "");		
							SetConfigParam("Trace", "OFF");		
						 },
						 function(error, statement){
							 
							 opMessage("Error: " + error.message + " when delete processing " + statement);
						 }        
				);
}

function DeleteLog() { 
		html5sql.process("DELETE FROM LogFile",
						 function(){
							 //alert("Success Deleting Logfile");
						 },
						 function(error, statement){
							 opMessage("Error: " + error.message + " when processing " + statement);
						 }        
				);

}


		

		


	



	



