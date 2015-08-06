	var oLayout1 = new sap.ui.layout.form.ResponsiveGridLayout("L1");
var currentAbsence='';
var currentType='';
	var absenceFooter = new sap.m.Bar({
		id: 'AbsenceFooter',
		contentRight : [
						new sap.m.Button("Delete", {
							 text: "Delete",
							 press: [ function(){
									deleteAbsence() ;
									}]
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
				            	                    
				            	                }),
				            	                new sap.m.ObjectAttribute('TextCommentsHDR',{
				            	                    
				            	                }),
				            	                new sap.m.ObjectAttribute('TextComments',{
				            	                    
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
						 sap.ui.getCore().getElementById('Used').setText("")	
						 sap.ui.getCore().getElementById('TextCommentsHDR').setText("Comments:")	
						  sap.ui.getCore().getElementById('TextComments').setText(rowsArray[0].comments)	
						 sap.ui.getCore().getElementById('HEADER').setNumber(rowsArray[0].days)	
						 sap.ui.getCore().getElementById('HEADER').setNumberUnit("Days")	
						 if(type == 'Lieu'){
							 
							 if(rowsArray[0].days<0){
								 sap.ui.getCore().getElementById('State').setText("Off in Lieu")		
								 sap.ui.getCore().getElementById('State').setState("Success")
							 }else{
								 sap.ui.getCore().getElementById('State').setText("Worked in Lieu")		
								 sap.ui.getCore().getElementById('State').setState("Error")
							 }
							 
						 }else{
							 
							 sap.ui.getCore().getElementById('State').setText(type)		
							 sap.ui.getCore().getElementById('State').setState("Success")							 
						 }

						 
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

}
