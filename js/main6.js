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
        WMUsecase: "wm/wmusecase",
        WMPackage: "wm/wmpackage",
        // dojoParser: "lib/dojo/parser",
        // dojoBorderContainer: "lib/dijit/layout/BorderContainer",
        // dojoTabContainer: "lib/dijit/layout/TabContainer",
        // dojoContentPane: "lib/dijit/layout/ContentPane"
    }
});
require(["WMStage", "WMClass", "WMUsecase", "WMPackage"],
    function(WMStage, WMClass, WMUsecase, WMPackage){
    var stageWidth = 1000, stageHeight = 550
    WMStage.init({
        container: "wmclass-stage", width: stageWidth, height: stageHeight,
        elementFactory: WMClass
    });
    WMStage.init({
        container: "wmusecase-stage", width: stageWidth, height: stageHeight,
        elementFactory: WMUsecase
    });
	WMStage.init({
		container: "wmpackage-stage", width: stageWidth, height: stageHeight,
        elementFactory: WMPackage
	});
});
$("a[href=#wmclass-container]").tab("show");