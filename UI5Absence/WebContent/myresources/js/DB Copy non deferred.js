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

var dbInProgress=false;




var executeSQL = function(sqlStatement) {
	    var $d = $.Deferred();

	    html5sql.process(sqlStatement,
	    		function (transaction, results, rowsArray) {
	    			$d.resolve(results, rowsArray);
	    			},

	    		function (error, statement) {
	    			$d.reject(error,statement);
	    			}
	    		)
	    return $d.promise();
}
    



function writeToLog(type,msg){

	nowd=getDate();
	nowt=getTime();
	dtstamp=nowd+nowt;

	




	
	executeSQL('INSERT INTO LogFile (datestamp , type, message ) VALUES ("'+dtstamp+'","'+type+'","'+ msg+'");')
	.done(function(results, rowsArray){
	    alert("Insert OK");
	})
	.fail(function(error,statement){
	    alert(error+":"+statement);
	});
	}

function selectAbsence(){


	executeSQL('select * from LogFile;')
	.done(function(results, rowsArray){
		cnt = 0;
		while (cnt<rowsArray.length){
			
			alert(rowsArray[cnt].type+rowsArray[cnt].message+cnt)
			cnt++;
			}
	    
	})
	.fail(function(error,statement){
	    alert("s"+error+":"+statement);
	});
	}



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

function emptyLog(){
	
	localStorage.setItem("Log","")
}

function outputLog(){
	alert(localStorage.getItem("Log"));
	if(localStorage.getItem("Log")!=""){ 
		
		if (localStorage.getItem("Trace")=='ON'){
	
			html5sql.process(localStorage.getItem("Log"),
					 function(){
						
						emptyLog();
					 },
					 function(error, statement){
						alert("Error: " + error.message + " when processing " + statement);
					 }        
			);
		
	
		}
	}
}

function writeLogMessage(type,msg){

nowd=getDate();
nowt=getTime();
dtstamp=nowd+nowt;

var newLog = localStorage.getItem("Log");




newLog+='INSERT INTO LogFile (datestamp , type, message ) VALUES ("'+dtstamp+'","I","'+ msg+'");';

localStorage.setItem("Log",newLog)
}

function writeLogMessage2(type,msg){

	nowd=getDate();
	nowt=getTime();
	dtstamp=nowd+nowt;







	var sqlstatement='INSERT INTO LogFile (datestamp , type, message ) VALUES ("'+dtstamp+'","I","'+ msg+'");';

		if (localStorage.getItem("Trace")=='ON'){
			
			html5sql.process(sqlstatement,
							 function(){
								alert("log Write")
							 },
							 function(error, statement){
								alert("Error: " + error.message + " when processing " + statement);
							 }        
					);
			alert("done")

		}
	}
function deleteAllAbsence(type){

	nowd=getDate();
	nowt=getTime();
	dtstamp=nowd+nowt;


	var sqlstatement='DELETE FROM  Absence;';
	writeLogMessage("Information", "About to Dele All Absence data SQL="+sqlstatement)	
		html5sql.process(sqlstatement,
						 function(){
							writeLogMessage("Success", "Deleting All Absence Data");
						 localStorage.setItem("LastSync","")
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
							 writeLogMessage("Error", "deleteAllAbsence: "+ error.message +" - "+ statement);  
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
	writeLogMessage("Information", "syncTheUploadData: create URL="+createURL)
	writeLogMessage("Information", "syncTheUploadData: delete URL="+deleteURL)
	writeLogMessage("Information", "syncTheUploadData: Select New or DELETES")
	html5sql.process("SELECT * from absence where sid = 'NEW' or used = 'DELETE' ",
	    function(transaction, results, rowsArray){
		  syncCnt=rowsArray.length;
		  writeLogMessage("Information", "syncTheUploadData: Select returned "+syncCount+" records")
	      for(var i = 0; i < rowsArray.length; i++){
	    	  if (rowsArray[i].used =='DELETE'){
	    		  fullURL=deleteURL+"&id="+rowsArray[i].sid+"&used="+rowsArray[i].used
	    	  }else{
	    		  fullURL=createURL+"&type="+rowsArray[i].type+"&start="+rowsArray[i].start+"&end="+rowsArray[i].end+"&days="+rowsArray[i].days+"&desc="+rowsArray[i].description+"&id="+rowsArray[i].id+"&used="+rowsArray[i].used
	    	  }
			  writeLogMessage("Information", "syncTheUploadData: Calling Server URL: "+fullURL)
	    		
	    	  $.getJSON(fullURL, 
		    		  function(result){
		    	  
		    	  $.each(result, function(i, field){
		    		  result=field.split("-")
		    		  if (result[3]=='DELETE'){
		    			 updateSQL="UPDATE absence SET sid = 'DELETE' WHERE sid = '"+result[0]+"';"
		    		  }else{
		    			 updateSQL="UPDATE absence SET sid = '"+result[1]+"' WHERE id = '"+result[0]+"';"
		    		  }
		    			  
		    		  html5sql.process(updateSQL,
		    					 function(){
		    			  		

		    			  		LastSync=formatDateTimeStamp(getDateStamp())
		    			  		
		    			  		html5sql.process("UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';",
				    					 function(){
		    			  				 	localStorage.setItem('LastSync',LastSync);
		    			  				 	writeLogMessage("Information", "syncTheUploadData: update LastSync localStorage : "+LastSync)
		    			  				 	writeLogMessage("Information", "syncTheUploadData: update LastSync Config: "+LastSync)
			    			  				syncCnt--;
			    			  				 if(syncCnt==0){
			    								
			    									 window.location.reload();	
			    				    			  		html5sql.process("DELETE from Absence where sid =  'DELETE';",
			    						    					 function(){
			    				    			  				 writeLogMessage("Success", "syncTheUploadData: DELETE from Absence where sid =  'DELETE'")	
			    						    					 },
			    						    					 function(error, statement){
			    						    						 writeLogMessage("Error", "syncTheUpload: "+ error.message +" - "+ statement);  
			    						    						
			    						    					 }        
			    						    					);
			    								
			    			  				 }
				    					 },
				    					 function(error, statement){
				    						 writeLogMessage("Error", "syncTheUpload: "+ error.message +" - "+ statement);  
				    						
				    					 }        
				    					);
		    					 },
		    					 function(error, statement){
		    						 writeLogMessage("Error", "syncTheUpload: "+ error.message +" - "+ statement);  
		    						
		    					 }        
		    					);
		    	  });
		    	  
		      });
	    	  
	    	  
	      }
	    if(rowsArray.length==0){
	    	 window.location.reload();	
	    }
	    },
	    function(error, statement){
	    	 writeLogMessage("Error", "syncTheUpload: "+ error.message +" - "+ statement);      
	    }
	);			
		
	}
function getAbsenceData(){
	var result;
	var LastSync=""
	var getURL="http://"+localStorage.getItem("Server")+"/MyAbsence/GetAbsence.php?user="+localStorage.getItem("User");
	writeLogMessage("Information", "getAbsenceData: URL: "+getURL)        
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
			                
			    		  html5sql.process("INSERT INTO Absence (type ,start, sid, end, days , description, used, comments) VALUES ("+
			 					 "'"+item.type+"','"+item.start+"','"+ item.id +"','"+item.end+"','"+item.days+"','"+item.description+"','"+item.used+"','"+item.comments+"');",
			    					 function(){
			    						 //alert("Success dropping Tables");
			    			  		LastSync=formatDateTimeStamp(getDateStamp())
			    			  		
			    			  		html5sql.process("UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';",
					    					 function(){
			    			  				 localStorage.setItem('LastSync',LastSync);
			    			  				 writeLogMessage("Success", "getAbsenceData: Update LastSync localStorage "+LastSync)	
			    			  				 writeLogMessage("Success", "getAbsenceData: Update LastSync Config "+LastSync)	
			    			  				syncCnt--;
			    			  				 if(syncCnt==0){
			    								 if(pageRefreshed == false){
			    									 pageRefreshed = true;
			    									 window.location.reload();									 
			    								 }else{pageRefreshed = false}
			    			  				 }
					    					 },
					    					 function(error, statement){
					    						 writeLogMessage("Error", "getAbsenceData: "+ error.message +" - "+ statement);   
					    					 }        
					    					);
			    					 },
			    					 function(error, statement){
			    						 writeLogMessage("Error", "getAbsenceData: "+ error.message +" - "+ statement);   
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
	writeLogMessage("Information", "syncTheData: URL: "+getURL) 	
	$.getJSON(getURL, 
			    		  function(result){
		//alert(getURL)
			for(var key in result) {
				
			    var value = result[key];
			    //alert(value)
			    if(typeof value == 'object') {
			        if(value instanceof Array) {
			            // an array. loop through children
			        	syncCnt = value.length;
			        	//alert (syncCnt);
			            for(var i = 0; i < value.length; i++) {
			                var item = value[i];
			                //alert(item.description)
			    		  html5sql.process("INSERT INTO Absence (type , used, start, sid, end, days , description, comments) VALUES ("+
			 					 "'"+item.type+"','"+item.used+"','"+item.start+"','"+ item.id +"','"+item.end+"','"+item.days+"','"+item.description+"','"+item.comments+"');",
			    					 function(){
			    			  				writeLogMessage("Success", "syncTheData: "+"INSERT INTO Absence (type , used, start, sid, end, days , description, comments) VALUES ("+
			    				 					 "'"+item.type+"','"+item.used+"','"+item.start+"','"+ item.id +"','"+item.end+"','"+item.days+"','"+item.description+"','"+item.comments+"');")	
			    			  			    syncCnt--;
			    			  				if(syncCnt==0){
			    			  						
 			  				
							    			  		LastSync=formatDateTimeStamp(getDateStamp())
							    			  		
							    			  		html5sql.process("UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';",
									    					 function(){
							    			  				writeLogMessage("Success", "syncTheData: "+"UPDATE config SET value = '"+LastSync+"' WHERE type = 'LastSync';")	
						    			  			    
							    			  				 localStorage.setItem('LastSync',LastSync);
							    			  				 doUpload=false
							    			  				 
							    			  				 syncTheUploadData()
									    					 },
									    					 function(error, statement){
									    						 writeLogMessage("Error", "syncTheData: "+ error.message +" - "+ statement);   
									    					 }        
									    					);
			    			  				}
			    					 },
			    					 function(error, statement){
			    						 writeLogMessage("Error", "syncTheData: "+ error.message +" - "+ statement);   
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
function updateConfig(Server, User, Holiday, Sick, Trace){
	SetConfigParam('Server', Server);
	SetConfigParam('User', User);
	SetConfigParam('Holiday', Holiday);
	SetConfigParam('Sick', Sick);
	SetConfigParam('Trace', Trace);
}
function SetLocalStorage(){
	writeLogMessage("Information", "SetLocalStorage: SELECT * from Config ") 
html5sql.process(
    ["SELECT * from Config "],
    function(transaction, results, rowsArray){
    	writeLogMessage("Success", "SetLocalStorage: Getting Config records = "+rowsArray.length) 
      for(var i = 0; i < rowsArray.length; i++){
        //each row in the rowsArray represents a row retrieved from the database
		
			localStorage.setItem(rowsArray[i].type,rowsArray[i].value);

      }
    },
    function(error, statement){
    	writeLogMessage("Error", "SetLocalStorage: "+ error.message +" - "+ statement);         
    }
);			
	
}



function GetConfigParam(type){
	writeLogMessage("Information", "GetConfigParam: SELECT * from Config where type = "+type) 
	html5sql.process(
		["SELECT * from Config where type = '"+type+"'"],
		function(transaction, results, rowsArray){
			writeLogMessage("Success", "GetConfigParam: Getting Config type = "+type) 
			if( rowsArray.length > 0) {
				localStorage.setItem(rowsArray[0].type,rowsArray[0].value);
				
			}
	

		},
		 function(error, statement){
			writeLogMessage("Error", "GetConfigParam: "+ error.message +" - "+ statement);    
		 }   
	);
}
function SetConfigParam(type, value){
	writeLogMessage("Information", "SetConfigParam: SELECT * from Config where type = "+type+" value = "+value) 
		
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
				 writeLogMessage("Error", "SetConfigParam: "+ error.message +" - "+ statement);    
			 }        
			);
		},
		function(error, statement){
			writeLogMessage("Error", "SetConfigParam: "+ error.message +" - "+ statement);        
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
	writeLogMessage("Information", "deleteDBAbsence: Delete Absence id = "+id) 
	
	html5sql.process("Select sid from absence where id = '"+id+"' ",
		function(transaction, results, rowsArray){
		writeLogMessage("Success", "deleteDBAbsence: Select Absence id = "+id) 
		if(rowsArray[0].sid=='NEW'){
			html5sql.process("delete from absence where id = '"+id+"' ",
					 function(){
							writeLogMessage("Success", "deleteDBAbsence: Delete Absence id = "+id) 
							 window.location.reload();									 

					 },
					 function(error, statement){
						 writeLogMessage("Error", "deleteDBAbsence: "+ error.message +" - "+ statement);
					 }        
					);
		}else{
			html5sql.process("Update absence set used = 'DELETE' where id = '"+id+"' ",
					 function(){
					writeLogMessage("Success", "deleteDBAbsence: Update absence set used = 'DELETE' where id = '"+id+"' ")  
							 								 
						window.location.reload();	
					 },
					 function(error, statement){
						 writeLogMessage("Error", "deleteDBAbsence: "+ error.message +" - "+ statement);

					 }        
					);
		}

			 window.location.reload();									 

	 },
	 function(error, statement){
		 writeLogMessage("Error", "deleteDBAbsence: "+ error.message +" - "+ statement);
	 }        
	);
}

//*************************************************************************************************************************
//
//  Create Routines
//
//*************************************************************************************************************************



function createAbsence(type,start,end,days, description, comments)
{
	Log="";
	dbInProgress=true;
	var used ='';
		
		used = 'NO';
		writeLogMessage("Information", "createAbsence: INSERT INTO Absence (type ,start, used, sid, end, days , description, comments) VALUES ("+
				 "'"+type+"','"+start+"','"+used+"','NEW','"+end+"','"+days+"','"+description+"','"+comments+"');") 	

	html5sql.process("INSERT INTO Absence (type ,start, used, sid, end, days , description, comments) VALUES ("+
					 "'"+type+"','"+start+"','"+used+"','NEW','"+end+"','"+days+"','"+description+"','"+comments+"');",
	 function(){
		
		 if(pageRefreshed == false){
			 pageRefreshed = true;
			 window.location.reload();									 
		 }else{pageRefreshed = false}
		
	 },
	 function(error, statement){
		 
		 writeLogMessage("Error", "createAbsence: "+ error.message +" - "+ statement);
		 outputLog();
	 }        
	);
}

//*************************************************************************************************************************
//
//  Create Database Tables
//
//*************************************************************************************************************************
function createTables() { 




	
        
		sqlstatement='CREATE TABLE IF NOT EXISTS Config     	( id integer primary key autoincrement,  type TEXT, value TEXT);'+
					 'CREATE TABLE IF NOT EXISTS Absence     	( id integer primary key autoincrement,  sid TEXT, type TEXT, start TEXT, end TEXT, days TEXT, used TEXT, description TEXT, comments TEXT);'+
					 'CREATE TABLE IF NOT EXISTS Logfile        ( datestamp TEXT, type TEXT, message TEXT)';
		html5sql.process(sqlstatement,
						 function(){
							
							emptyTables();
							
							
						 },
						 function(error, statement){
							 alert("Error: " + error.message + " when create processing " + statement);
							
							 
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
							 
							alert("Error: " + error.message + " when delete processing " + statement);
						 }        
				);
}

function DeleteLog() { 
		html5sql.process("DELETE FROM LogFile",
						 function(){
							 //alert("Success Deleting Logfile");
						 },
						 function(error, statement){
							alert("Error: " + error.message + " when processing " + statement);
						 }        
				);

}


		

		


	



	



