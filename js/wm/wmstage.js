define(["Kinetic", "WMRelation", "Hammer", "WMUtils"],
		function(Kinetic, WMRelation, Hammer, WMUtils){
	var eventLogger = WMUtils.getLogger({
		name: "main", level: "EVENT", on: true
	});
	var debugLogger = WMUtils.getLogger({
		name: "main", level: "DEBUG", on: true
	});
	var eventLogger = WMUtils.getLogger({
		name: "main", level: "EVENT", on: true
	});
	var stageAMap = {
		WMClass: $("a[href=#wmclass-container]"),
		WMUsecase: $("a[href=#wmusecase-container]"),
		WMPackage: $("a[href=#wmpackage-container]")
	};
	var stageSequence = ["WMClass", "WMUsecase", "WMPackage"];
	var _init = function(config){
		(function(config){
			//config = WMUtils.validateConfig(config, {WMStageName: "WMClass"});
			var stage = null;
			var layer = null;
			var elementFactory = config["elementFactory"];
			if(elementFactory == null){
				eventLogger.log("No Element Factory Specified!");
			}
			stage = new Kinetic.Stage({
				width: config["width"], height: config["height"],
				container: config["container"], listening: true
			});
			layer = new Kinetic.Layer();
			layer.newConnectLineHitBox = new Kinetic.Rect({
				x: 0, y: 0, width: config["width"], height: config["height"],
				fill: "lightyellow", opacity: 0
			});
			layer.lineEndDrawingHitBox = new Kinetic.Rect({
				x: 0, y: 0, width: 200, height: 200,
				fill: "red", opacity: 0.3
			});
			layer.globalDrawingHitBox = new Kinetic.Rect({
				x: 0, y: 0, width: config["width"], height: config["height"],
				fill: "red", opacity: 0.3
			});
			layer.backgroundHitBox = new Kinetic.Rect({
				x: 0, y: 0, width: config["width"], height: config["height"],
				fill: "black", opacity: 0
			});
			layer.trash = WMUtils.getImage({
				width: 100, height: 100,
				x: 10, y: stage.getHeight() - 100,
				src: "icons/trash.png"
			});
			layer.trash.WMIsInside = function(p){
				var trash = layer.trash;
				var pos = trash.getPosition();
				var w = trash.getWidth(), h = trash.getHeight();
				return (p.x > pos.x && p.x < pos.x + w
					&& p.y > pos.y && p.y < pos.y + h);
			};
			elementFactory.init({stage: stage});
			layer.add(layer.trash);
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
						var t = elementFactory.getInstanceFromPoint(p);
						if(this.lastT){
							this.lastT.setFill("white");
						}
						if(t != null && t != f){
							var rect = t.WMGetComponent("rect");
							rect.setFill("lightblue");
							this.lastT = rect;
						}
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
					f.WMGetComponent("rect").setFill("lightblue");
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
					f.WMGetComponent("rect").setFill("white");
					var l = f.longPressConnectLine;
					if(l != null){
						var __ps = l.points();
						var p = {
							x: __ps[2], y: __ps[3]
						};
						var t = elementFactory.getInstanceFromPoint(p);
						if(this.lastT){
							this.lastT.setFill("white");
							this.lastT = null;
						}
						if(t != null && t != f){
							var dLHIS = elementFactory.getDefaultLineHeadImgSrc();
							var dLTIS = elementFactory.getDefaultLineTailImgSrc();
							var config = {
								start: f, end: t,
								lineHeadImgSrc: dLHIS, lineTailImgSrc: dLTIS
							};
							if(t.dashRelation === true){
								config["dash"] = [20, 10];
							}
							if(t.defaultLineName){
								config["text"] = t.defaultLineName;
							}
							WMRelation.connect(config);
							t.WMGetComponent("rect").setFill("white");
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
					WMUtils.globalFocus(null);
				}
				layer.lineEndDrawingHitBox.remove();
				layer.globalDrawingHitBox.remove();
				layer.draw();
			});
			backgroundHitBoxHammer.on("doubletap", function(){
				debugLogger.log("About to draw global strokes");
				layer.globalDrawingHitBox.setPosition({x: 0, y: 0});
				layer.globalDrawingHitBox.setWidth(stage.getWidth());
				layer.globalDrawingHitBox.setHeight(stage.getHeight());
				layer.add(layer.globalDrawingHitBox);
				layer.draw();
			});
			backgroundHitBoxHammer.on("swipeleft", function(){
				var stageName = elementFactory.getWMName();
				var length = stageSequence.length;
				var thisIndex = stageSequence.indexOf(stageName);
				if(thisIndex == -1) thisIndex = 1;
				var previous = (thisIndex - 1 + length) % length;
				var targetName = stageSequence[previous];
				var targetA = stageAMap[targetName];
				debugLogger.log("Switching to stage of " + targetName);
				targetA.click();
			});
			backgroundHitBoxHammer.on("swiperight", function(){
				var stageName = elementFactory.getWMName();
				var length = stageSequence.length;
				var thisIndex = stageSequence.indexOf(stageName);
				if(thisIndex == -1) thisIndex = 1;
				var next = (thisIndex + 1) % length;
				var targetName = stageSequence[next];
				var targetA = stageAMap[targetName];
				debugLogger.log("Switching to stage of " + targetName);
				targetA.click();
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
				if(this.lineTrackPoints && this.lineTrackPoints.length > 10){
					var rResult = WMUtils.recognizeTrack([this.lineTrackPoints]);
					debugLogger.log("Recognized Global Shape: " + rResult.Name);
					var centerP = e["gesture"]["center"];
					var p = WMUtils.getPointOnStage({
						x: centerP["pageX"],
						y: centerP["pageY"]
					}, stage);
					var newClass = elementFactory.newInstance({
						x: p.x, y: p.y, shape: rResult.Name
					});
					layer.add(newClass);
				}
				this.lineTrack.remove();
				this.remove();
				layer.draw();
			});
		})(config);
	};

	return {
		init: function(config){_init(config);},
		getStage: function(){return stage;},
		getLayer: function(){return layer;}
	};
});
