var startDate=""
var endDate=""
var AbsenceType=""
var standardList  = new sap.m.List(
			  {
				  //items:standardListItem,
				  itemPress:[function(oEvt) {		  
					  buildDetailsContent(oEvt.getParameter("listItem").getId(),AbsenceType);
					 
					  oSplitApp.to("detail")}],
				  mode:sap.m.ListMode.SingleSelectMaster
			  });
		function handleChange(oEvent) {
			var oDRS = oEvent.oSource;
			var sFrom = oEvent.getParameter("from");
			var sTo = oEvent.getParameter("to");
			var bValid = oEvent.getParameter("valid");

			

			var oText = sap.ui.getCore().byId("TextEvent");
			//oText.setText("Event " + iEvent + "\nId: " + oEvent.oSource.getId() + "\nFrom: " + sFrom + "\nTo: " + sTo + "\nvalid: " + bValid);
			if (bValid) {
				oDRS.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDRS.setValueState(sap.ui.core.ValueState.Error);
			}
			
			startDate=sFrom.getFullYear().toString()+zeroFill(sFrom.getMonth()+1)+zeroFill(sFrom.getDate())
			endDate=sTo.getFullYear().toString()+zeroFill(sTo.getMonth()+1)+zeroFill(sTo.getDate())
			
		};
		var formAbsence = new sap.m.Dialog("dlgAbsence",{
	        title:"Create "+AbsenceType+" Absence",
	        modal: true,
	        contentWidth:"1em",
	        buttons: [
						new sap.m.Button( {
						    text: "Save",
						    tap: [ function(oEvt) {		  
								createAbsence(AbsenceType,startDate,endDate,
										sap.ui.getCore().byId("Days").getValue(),
										sap.ui.getCore().byId("Description").getValue(),
										sap.ui.getCore().byId("Comments").getValue()); 
						    	formAbsence.close()
								  } ]
						   
						}),   
						new sap.m.Button( {
						    text: "Cancel",
						    tap: [ function(oEvt) {		  
								 
								   formAbsence.close()} ]   
						})
						],					
	        content:[
	     			new sap.ui.layout.form.SimpleForm({
	    				minWidth : 1024,
	    				maxContainerCols : 2,
	    				content : [
									new sap.m.Label({text: "Start & End Date:", labelFor: "AbsenceDates"}),
									new sap.m.DateRangeSelection("AbsenceDates", { displayFormat: "yyyy.MM.dd", change: handleChange}),
					                 
									new sap.m.Label({text:"Days"}),
									new sap.m.Input("Days",{ type: sap.m.InputType.Number}),
									
									new sap.m.Label({text:"Description"}),
									new sap.m.Input("Description",{ type: sap.m.InputType.Input}),
									new sap.m.Label({text:"Comments"}),
									new sap.m.TextArea('Comments',{
										rows : 4
									}),
					                  
								]
	     					})

	                ]
		 })
var firstEntry="none:-1";


function buildAbsences(type){
	AbsenceType = type;		
	var lStatus="";
	var lStatusState="Success";
	html5sql.process("SELECT *  FROM Absence where type = '"+type+"' and used <> 'DELETE' order by start;",
			 function(transaction, results, rowsArray){
				if(rowsArray.length >0){
					firstEntry="absence:"+rowsArray[0].id
				}
					
				cnt = 0;
				while (cnt<rowsArray.length){
					
					if(type=='Lieu'){
						if(rowsArray[cnt].days<0){
							 lStatus="Off In Lieu"
							 lStatusState="Success"
						 }else{
							 lStatus="Worked In Lieu"
							 lStatusState="Error"
						 }
					}
					 
					  standardList.addItem(
							  new sap.m.ObjectListItem("absence:"+rowsArray[cnt].id,
								  {
							  title:rowsArray[cnt].description,
							  number:rowsArray[cnt].days, 
							
							  type:sap.m.ListType.Active,
						
							  attributes: [
							                new sap.m.ObjectAttribute( {
							                    text: 'Start:'+rowsArray[cnt].start
							                }),
							                new sap.m.ObjectAttribute( {
							                	 text: 'End:'+rowsArray[cnt].end
							                })
							                ],
							    firstStatus: [
							                new sap.m.ObjectStatus( {
							                    text: lStatus,
							                    state:lStatusState
							                })
							                ]
						
								  })
							  );
						  cnt++;
				 }
				oMasterPage.destroyContent()
				oMasterPage.addContent(standardList);
				buildDetailsContent(firstEntry,type)
			 },
			 function(error, statement){
				 
			 }        
			);	
	  cnt = 0;

	

	  
}