require.config({
    baseUrl: "js",
    paths: {
        Kinetic: "lib/kinetic-v5.0.2.min",
        // Kinetic: "lib/kinetic-v4.3.3",
        Hammer: "lib/hammer.min",
        WMUtils: "wm/wmutils",
        WMGroup: "wm/wmgroup",
        WMRelation: "wm/wmrelation",
        WMClass: "wm/wmclass"
    }
});
require(["Kinetic", "WMClass", "WMRelation", "Hammer", "WMUtils"], 
		function(Kinetic, WMClass, WMRelation, Hammer, WMUtils){
	var eventLogger = WMUtils.getLogger({
		name: "main", level: "EVENT", on: true
	});
    var stage = new Kinetic.Stage({
		width: 800, height: 600, container: "stage", listening: true
    });
	WMClass.init({stage: stage});
    var layer = new Kinetic.Layer();
    var _class = WMClass.newInstance({
        x: 100, y: 100, editable: true
    });
    var _class1 = WMClass.newInstance({
        x: 500, y: 300, editable: true
    });
    layer.add(_class);
    layer.add(_class1);
	layer.newConnectLineHitBox = new Kinetic.Rect({
		x: 0, y: 0, width: 800, height: 600,
		fill: "lightyellow", opacity: 0.3
	});
    stage.add(layer);
	//WMRelation.connect({"start": _class, "end": _class1});
	layer.draw();
	var hammer = new Hammer(layer.newConnectLineHitBox);
	hammer.on("touchmove", function(e){
		e.preventDefault();
		eventLogger.log("TOUCHING ON STAGE!!");
		var f = WMUtils.globalFocus();
		if(f != null){
			var l = f.longPressConnectLine;
			if(f.longPressConnect && l != null){
				var p = WMUtils.getPointOnStage({
					x: e.touches[0]["pageX"],
					y: e.touches[0]["pageY"]
				}, stage);
				var __ps = l.points();
				__ps[2] = p.x;
				__ps[3] = p.y;
				layer.batchDraw();
			}
		}
	});
	hammer.on("tap", function(e){
		e.preventDefault();
		eventLogger.log("TAP ON HITBOX!!");
		var f = WMUtils.globalFocus();
		if(f != null){
			f.longPressConnect = false;
			f.holdStart = false;
			var l = f.longPressConnectLine;
			if(l != null){
				l.destroy();
			}
		}
		var layer = this.getLayer();
		this.remove();
		if(layer != null){
			layer.draw();
		}
	});
	hammer.on("touchend", function(e){
		e.preventDefault();
		eventLogger.log("TOUCHEND ON HITBOX!!");
		var f = WMUtils.globalFocus();
		if(f != null){
			f.longPressConnect = false;
			f.holdStart = false;
			var l = f.longPressConnectLine;
			if(l != null){
				var __ps = l.points();
				var p = {
					x: __ps[2], y: __ps[3]
				};
				var t = WMClass.getInstanceFromPoint(p);
				if(t != null){
					WMRelation.connect({"start": f, "end": t});
					eventLogger.log("Found t " + t.WMGetIdString());
				}
				l.destroy();
			}
		}
		var layer = this.getLayer();
		this.remove();
		if(layer != null){
			layer.draw();
		}
	});
});
