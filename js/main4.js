require.config({
    baseUrl: "js",
	urlArgs: "bust=" + new Date().getTime(),
    paths: {
        Kinetic: "lib/kinetic-v5.0.2.min",
        // Kinetic: "lib/kinetic-v4.3.3",
        Hammer: "lib/hammer.min",
        WMUtils: "wm/wmutils",
        WMGroup: "wm/wmgroup",
        WMRelation: "wm/wmrelation",
        WMStage: "wm/wmstage",
        WMClass: "wm/wmclass"
    }
});
require(["WMClass", "WMStage"], function(WMClass, WMStage){
	WMStage.init({
		container: "stage", width: 800, height: 600
	});
});
