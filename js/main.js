require.config({
    baseUrl: "js",
    paths: {
        Kinetic: "lib/kinetic-v5.0.2.min",
        // Kinetic: "lib/kinetic-v4.3.3",
        Hammer: "lib/hammer.min",
        WMUtils: "wm/wmutils",
        WMGroup: "wm/wmgroup",
        WMClass: "wm/wmclass"
    }
});
require(["Kinetic", "WMClass"], function(Kinetic, WMClass){
    var stage = new Kinetic.Stage({
        width: 800, height: 600, container: "stage"
    });
    var layer = new Kinetic.Layer();
    var _class = WMClass.newInstance({
        x: 100, y: 100, editable: true
    });
    layer.add(_class);
    stage.add(layer);
    _class.WMGetClosestPoint({x:0,y:0});
});