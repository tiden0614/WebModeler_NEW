require.config({
    baseUrl: "js",
    /*
     * 为了方便测试，先在每个js文件读取时加上一个参数，这样可以避免浏览器缓存这些js文件
     * 生产环境下应该把第7行注释掉
     */
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
        WMComponent: "wm/wmcomponent",
        // dojoParser: "lib/dojo/parser",
        // dojoBorderContainer: "lib/dijit/layout/BorderContainer",
        // dojoTabContainer: "lib/dijit/layout/TabContainer",
        // dojoContentPane: "lib/dijit/layout/ContentPane"
    }
});
require(["WMStage", "WMClass", "WMUsecase", "WMPackage", "WMComponent"],
    function(WMStage, WMClass, WMUsecase, WMPackage, WMComponent){
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
    WMStage.init({
        container: "wmcomponent-stage", width: stageWidth, height: stageHeight,
        elementFactory: WMComponent
    });
});
$("a[href=#wmclass-container]").tab("show");