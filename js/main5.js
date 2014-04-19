require.config({
    baseUrl: "js",
	urlArgs: "bust=" + new Date().getTime(),
    paths: {
        //jQuery: "lib/jquery-1.8.3.min"
        Kinetic: "lib/kinetic-v5.0.2.min",
        // Kinetic: "lib/kinetic-v4.3.3",
        Hammer: "lib/hammer.min",
        WMUtils: "wm/wmutils",
        WMGroup: "wm/wmgroup",
        WMRelation: "wm/wmrelation",
        WMStage: "wm/wmstage",
        WMClass: "wm/wmclass",
        // dojoParser: "lib/dojo/parser",
        // dojoBorderContainer: "lib/dijit/layout/BorderContainer",
        // dojoTabContainer: "lib/dijit/layout/TabContainer",
        // dojoContentPane: "lib/dijit/layout/ContentPane"
    }
});
require(["WMClass", "WMStage"], function(WMClass, WMStage){
	WMStage.init({
		container: "stage", width: 1000, height: 600,
        elementFactory: WMClass
	});
});
$("a[href=#wmclass-container]").tab("show");