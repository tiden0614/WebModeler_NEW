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
    var layer = new Kinetic.Layer();
	WMClass.init({stage: stage});
	layer.newConnectLineHitBox = new Kinetic.Rect({
		x: 0, y: 0, width: 800, height: 600,
		fill: "lightyellow", opacity: 0.3
	});
	layer.lineEndDrawingHitBox = new Kinetic.Rect({
		x: 0, y: 0, width: 200, height: 200,
		fill: "lightblue", opacity: 0.3
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
	var newConnectLineHitBoxHammer = new Hammer(layer.newConnectLineHitBox);
	newConnectLineHitBoxHammer.on("touchmove", function(e){
		e.preventDefault();
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
	newConnectLineHitBoxHammer.on("tap", function(e){
		e.preventDefault();
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
	newConnectLineHitBoxHammer.on("touchend", function(e){
		e.preventDefault();
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
		if(focus != null){
			if(focus.editable){
				if(typeof(focus.WMToggleComponents) == "function"){
					focus.WMToggleComponents(false);
				}
			}
		}
	});
	var lineEndDrawingHitBoxHammer = new Hammer(layer.lineEndDrawingHitBox);
	lineEndDrawingHitBoxHammer.on("touchstart", function(e){
		var p = WMUtils.getPointOnStage({
			x: e.touches[0]["pageX"],
			y: e.touches[0]["pageY"]
		}, stage);
		if(this.lineTrack == null){
			this.lineTrack = new Kinetic.Line({
				stroke: "black", strokeWidth: 3
			});
		}
		this.lineTrack.points([p.x, p.y]);
		this.lineTrackPoints = [{X: p.x, Y: p.y}];
		this.getLayer().add(this.lineTrack);
	});
	lineEndDrawingHitBoxHammer.on("touchmove", function(e){
		var p = WMUtils.getPointOnStage({
			x: e.touches[0]["pageX"],
			y: e.touches[0]["pageY"]
		}, stage);
		var ps = this.lineTrack.points();
		ps.push(p.x);
		ps.push(p.y);
		this.lineTrackPoints.push({X: p.x, Y: p.y});
		this.getLayer().batchDraw();
	});
	lineEndDrawingHitBoxHammer.on("release", function(e){
		var rResult = WMUtils.recognizeTrack(this.lineTrackPoints);
		debugLogger.log("Recognized Line End Shape: " + rResult.Name);
		this.lineTrack.remove();
		this.remove();
		var focus = this.lineEndFocus;
		this.lineEndFocus = null;
	});
});
