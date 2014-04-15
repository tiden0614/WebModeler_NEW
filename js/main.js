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
	var debugLogger = WMUtils.getLogger({
		name: "main", level: "DEBUG", on: true
	});
    var stage = new Kinetic.Stage({
		width: 800, height: 600, container: "stage", listening: true
    });
	WMClass.init({stage: stage});
    var layer = new Kinetic.Layer();
	layer.newConnectLineHitBox = new Kinetic.Rect({
		x: 0, y: 0, width: 800, height: 600,
		fill: "lightyellow", opacity: 0.3
	});

	layer.backgroundHitBox = new Kinetic.Rect({
		x: 0, y: 0, width: 800, height: 600,
		fill: "black", opacity: 0
	});
    var _class = WMClass.newInstance({
        x: 100, y: 100, editable: false
    });
    var _class1 = WMClass.newInstance({
        x: 500, y: 300, editable: false
    });
	layer.add(layer.backgroundHitBox);
    layer.add(_class);
    layer.add(_class1);
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
		WMUtils.globalFocus(null);
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
				if(t != null && t != f){
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
	var backgroundHitBoxHammer = new Hammer(layer.backgroundHitBox);
	backgroundHitBoxHammer.on("tap", function(){
		var focus = WMUtils.globalFocus();
		debugLogger.log("tapped the backgroundhitbox");
		if(focus != null){
			if(focus.editable){
				if(typeof(focus.WMToggleComponents) == "function"){
					debugLogger.log("gonna hide components of the focus");
					focus.WMToggleComponents(false);
				}
			}
		}
	});
});
