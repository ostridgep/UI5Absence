/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/format/DateFormat','sap/ui/model/FormatException','sap/ui/model/odata/type/ODataType','sap/ui/model/ParseException','sap/ui/model/ValidateException'],function(D,F,O,P,V){"use strict";var d={__edmType:"Edm.Time",ms:49646000};function g(o){return sap.ui.getCore().getLibraryResourceBundle().getText("EnterTime",[o.formatValue(d,"string")]);}function a(o){var f;if(!o.oFormat){f=jQuery.extend({strictParsing:true},o.oFormatOptions);f.UTC=true;o.oFormat=D.getTimeInstance(f);}return o.oFormat;}function i(o){return typeof o==="object"&&o.__edmType==="Edm.Time"&&typeof o.ms==="number";}function s(o,C){var n=C&&C.nullable;o.oConstraints=undefined;if(n===false||n==="false"){o.oConstraints={nullable:false};}else if(n!==undefined&&n!==true&&n!=="true"){jQuery.sap.log.warning("Illegal nullable: "+n,null,o.getName());}}function t(o){if(!i(o)){throw new F("Illegal sap.ui.model.odata.type.Time value: "+c(o));}return new Date(o.ms);}function b(o){return{__edmType:"Edm.Time",ms:((o.getUTCHours()*60+o.getUTCMinutes())*60+o.getUTCSeconds())*1000};}function c(v){try{return JSON.stringify(v);}catch(e){return String(v);}}var T=O.extend("sap.ui.model.odata.type.Time",{constructor:function(f,C){O.apply(this,arguments);s(this,C);this.oFormatOptions=f;}});T.prototype.formatValue=function(v,e){if(v===undefined||v===null){return null;}switch(e){case"any":return v;case"string":return a(this).format(t(v));default:throw new F("Don't know how to format "+this.getName()+" to "+e);}};T.prototype.getName=function(){return"sap.ui.model.odata.type.Time";};T.prototype.parseValue=function(v,S){var o;if(v===""||v===null){return null;}if(S!=="string"){throw new P("Don't know how to parse "+this.getName()+" from "+S);}o=a(this).parse(v);if(!o){throw new P(g(this));}return b(o);};T.prototype.validateValue=function(v){if(v===null){if(this.oConstraints&&this.oConstraints.nullable===false){throw new V(g(this));}return;}if(!i(v)){throw new V("Illegal "+this.getName()+" value: "+c(v));}};T.prototype._handleLocalizationChange=function(){this.oFormat=null;};return T;});
