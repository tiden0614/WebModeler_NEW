define(["Kinetic", "WMClass", "WMRelation", "Hammer", "WMUtils"], 
		function(Kinetic, WMClass, WMRelation, Hammer, WMUtils){
	var eventLogger = WMUtils.getLogger({
		name: "main", level: "EVENT", on: true
	});
	var debugLogger = WMUtils.getLogger({
		name: "main", level: "DEBUG", on: true
	});
	var stage = null;
	var layer = null;
	var _init = function(config){
		stage = new Kinetic.Stage({
			width: config["width"], height: config["height"], container: config["container"], listening: true
		});
		layer = new Kinetic.Layer();
		layer.newConnectLineHitBox = new Kinetic.Rect({
			x: 0, y: 0, width: config["width"], height: config["height"],
			fill: "lightyellow", opacity: 0.3
		});
		layer.lineEndDrawingHitBox = new Kinetic.Rect({
			x: 0, y: 0, width: 200, height: 200,
			fill: "lightblue", opacity: 0.3
		});
		layer.globalDrawingHitBox = new Kinetic.Rect({
			x: 0, y: 0, width: config["width"], height: config["height"],
			fill: "lightblue", opacity: 0.3
		});
		layer.backgroundHitBox = new Kinetic.Rect({
			x: 0, y: 0, width: config["width"], height: config["height"],
			fill: "black", opacity: 0
		});
		WMClass.init({stage: stage});
		layer.add(layer.backgroundHitBox);
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
		backgroundHitBoxHammer.on("touch", function(){
			var focus = WMUtils.globalFocus();
			if(focus != null){
				if(focus.editable){
					if(typeof(focus.WMToggleComponents) == "function"){
						focus.WMToggleComponents(false);
					}
				}
			}
		});
		backgroundHitBoxHammer.on("doubletap", function(){
			debugLogger.log("About to draw global strokes");
			layer.add(layer.globalDrawingHitBox);
			layer.draw();
		});
		var onDrawingTouchStart = function(e){
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
		};
		var onDrawingTouchMove = function(e){
			var p = WMUtils.getPointOnStage({
				x: e.touches[0]["pageX"],
				y: e.touches[0]["pageY"]
			}, stage);
			var ps = this.lineTrack.points();
			ps.push(p.x);
			ps.push(p.y);
			this.lineTrackPoints.push({X: p.x, Y: p.y});
			this.getLayer().batchDraw();
		};
		var lineEndDrawingHitBoxHammer = new Hammer(layer.lineEndDrawingHitBox);
		var globalDrawingHitBoxHammer = new Hammer(layer.globalDrawingHitBox);
		lineEndDrawingHitBoxHammer.on("touchstart", onDrawingTouchStart);
		lineEndDrawingHitBoxHammer.on("touchmove", onDrawingTouchMove);
		lineEndDrawingHitBoxHammer.on("release", function(e){
			var rResult = WMUtils.recognizeTrack([this.lineTrackPoints]);
			debugLogger.log("Recognized Line End Shape: " + rResult.Name);
			this.lineTrack.remove();
			this.remove();
			var focus = this.lineEndFocus;
			this.lineEndFocus = null;
			if(focus){
				focus.WMSwitchLineEndType(rResult.Name);
			}
		});
		globalDrawingHitBoxHammer.on("touchstart", onDrawingTouchStart);
		globalDrawingHitBoxHammer.on("touchmove", onDrawingTouchMove);
		globalDrawingHitBoxHammer.on("release", function(e){
			var rResult = WMUtils.recognizeTrack([this.lineTrackPoints]);
			debugLogger.log("Recognized Global Shape: " + rResult.Name);
			this.lineTrack.remove();
			this.remove();
			var centerP = e["gesture"]["center"];
			var p = WMUtils.getPointOnStage({
				x: centerP["pageX"],
				y: centerP["pageY"]
			}, stage);
			var newClass = WMClass.newInstance({x: p.x, y: p.y});
			layer.add(newClass);
			layer.draw();
		});
	};

	return {
		init: function(config){_init(config);},
		getStage: function(){return stage;},
		getLayer: function(){return layer;}
	};
});
