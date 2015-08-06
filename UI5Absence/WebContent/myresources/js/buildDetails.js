	var oLayout1 = new sap.ui.layout.form.ResponsiveGridLayout("L1");
var currentAbsence='';
var currentType='';
	var absenceFooter = new sap.m.Bar({
		id: 'AbsenceFooter',
		contentLeft : [
						new sap.m.Button("Delete", {
							 text: "Delete",
							 press: [ function(){
									deleteAbsence() ;
									}]
						 })
						],
		contentRight : [
									         
					new sap.m.Button("Edit", {
	   					 text: "Edit",
	  					 press: [ function(){
	  							editAbsence() ;
	  							}]
						 })
					]
	})


	var formTimeConfirmation = new sap.m.Dialog("TimeConfirmation",{
        title:"Create Time Confirmation",
        modal: true,
        contentWidth:"1em",
        buttons: [
					new sap.m.Button("Save", {
					    text: "Save",
					   tap: [ function(oEvt) {		  
							 
							  formTimeConfirmation.close()} ]
					}),   
					new sap.m.Button("Cancel", {
					    text: "Cancel",
					    tap: [ function(oEvt) {		  
							 
							  formTimeConfirmation.close()
							  } ]
					})
					],					
        content:[
     			new sap.ui.layout.form.SimpleForm({
    				minWidth : 1024,
    				maxContainerCols : 2,
    				content : [
								new sap.m.Label({
									text: 'Employee'
								}),
								new sap.m.Select({
									name: "Tconf-EmployeeNo",
									items: [
										new sap.ui.core.Item({
											key: "1",
											text: "100001 - Paul Ostridge"
										}),
								
										new sap.ui.core.Item({
											key: "2",
											text: "100002 - Jimmy Hendrix"
										}),
								
										new sap.ui.core.Item({
											key: "3",
											text: "100003 - John Lord"
										}),
								
										new sap.ui.core.Item({
											key: "4",
											text: "100004 - Kieth Moon"
										})
									],
								}),
				                 new sap.m.Label({text:"Duration"}),
				                 new sap.m.Slider('DurationControl',
				                		 {
				                	value: 0,
				                	max:120,
				                	min:0,
				                	step:5,
				                	change : function(){
				                		sap.ui.getCore().byId("Duration").setValue(sap.ui.getCore().byId("DurationControl").getValue());}
				                	
				                			 
				                			 
				                }), 
				  
				                new sap.m.Input("Duration",{
			                           value : sap.ui.getCore().byId("DurationControl").getValue(),
			                       type: sap.m.InputType.Input,
			                       width:"50px",
			                       change : function(){sap.ui.getCore().byId("DurationControl").setValue(parseInt(sap.ui.getCore().byId("Duration").getValue(),10));}
			                         }),
								
				                new sap.m.Label({text:"Type"}),

				                new sap.m.SegmentedButton ({
				                	id:"SBText",
				                	selectedButton:"Travel",
				                	buttons:[
						    			    new sap.m.Button({
						   			    	text: "Work",
						   			    	type: sap.m.ButtonType.Default,
						   			    	press : function() {
						   			    		
						   			    		}	
						   			    	}),
					        			    new sap.m.Button({
					       			    	text: "Travel",
					       			    	type: sap.m.ButtonType.Default,
					       			    	press : function() {
					       			    		
					       			    		}	
					       			    	})
						    			    ]
				                }),
				                 new sap.m.Label({text:"Comments"}),
									new sap.m.TextArea({
										placeholder : "Please add your comment",
										rows : 6,
										maxLength: 255,
										width: "100%"
									}), 
							]
     					})

                ]
	 })
	function buildDetails(type){
     			var objectHeader  = new sap.m.ObjectHeader('HEADER',
			{
				title:"",
				number:'',
				numberUnit:'',
				attributes: [
				               	                new sap.m.ObjectAttribute('StartDate',{
				            	                   
				            	                }),
				            	                new sap.m.ObjectAttribute('EndDate',{
				            	                    
				            	                }),
				            	                new sap.m.ObjectAttribute('Used',{
				            	                    
				            	                })
				               	                ],
				            	    firstStatus: [
				            	                new sap.m.ObjectStatus( 'State',{
				            	                  
				            	                   
				            	                })
				            	                ]

			});

	
	return objectHeader;

	}
	


function buildDetailsContent(aid,type){
	
	var res = aid.split(":")
	var id=res[1];
	currentAbsence=id;
	currentType = type;
	if(currentAbsence >-1){
		html5sql.process("SELECT * FROM Absence where id = '"+id+"' ;",
				 function(transaction, results, rowsArray){
					 if (rowsArray.length>0){
						 sap.ui.getCore().getElementById('HEADER').setTitle(rowsArray[0].description)
						 sap.ui.getCore().getElementById('StartDate').setText("Start Date:"+formatDate(rowsArray[0].start))
						 sap.ui.getCore().getElementById('EndDate').setText("End Date:"+formatDate(rowsArray[0].end))
						 sap.ui.getCore().getElementById('Used').setText("Used:"+rowsArray[0].used)	
						 sap.ui.getCore().getElementById('HEADER').setNumber(rowsArray[0].days)	
						 sap.ui.getCore().getElementById('HEADER').setNumberUnit("Days")	
						 sap.ui.getCore().getElementById('State').setText(type)		
						 sap.ui.getCore().getElementById('State').setState("Success")
					 }
					
					
					
				 },
				 function(error, statement){
					 
				 }        
				);	
	}
			 




if(currentAbsence >-1){
	oDetailPage.setFooter(absenceFooter)
}else{
	oDetailPage.setFooter(null)
}



}
function deleteAbsence()
{

deleteDBAbsence(currentAbsence)
location.reload();
}
