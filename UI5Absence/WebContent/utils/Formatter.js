jQuery.sap.declare("sap.ui.demo.splitapp.utils.Formatter");

sap.ui.demo.splitapp.utils.Formatter = {
	/* *
	
		WRITE ALL YOUR FORMATTING FUNCTIONS HERE
	*/
	_statusStateMap : {
			"P" : "Success",
			"N" : "Warning"
			},
	statusText : function (value) {
			var bundle = this.getModel("i18n").getResourceBundle();
			return bundle.getText("StatusText" + value, "?");
			},
	statusState : function (value) {
			var map = sap.ui.demo.myFiori.util.Formatter._statusStateMap;
			console.log("Status is "+value+":"+map[value]);
			return (value && map[value]) ? map[value] : "None";
			},
	formatDateFromString:function(inputDate){
		return inputDate;
	}
}