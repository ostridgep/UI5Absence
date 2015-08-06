/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./library','sap/ui/core/Element'],function(q,l,E){"use strict";var G=E.extend("sap.m.QuickViewGroup",{metadata:{library:"sap.m",properties:{visible:{type:"boolean",group:"Appearance",defaultValue:true},heading:{type:"string",group:"Misc",defaultValue:""}},defaultAggregation:"elements",aggregations:{elements:{type:"sap.m.QuickViewGroupElement",multiple:true,singularName:"element",bindable:"bindable"}}}});return G;},true);
