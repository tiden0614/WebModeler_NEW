define(["Kinetic", "Hammer", "WMUtils", "WMGroup"],
		function(Kinetic, Hammer, WMUtils, WMGroup){
	var debugLogger = WMUtils.getLogger({name: "WMRelation", level: "DEBUG"});
	var eventLogger = WMUtils.getLogger({name: "WMRelation", level: "EVENT"});
	var errorLogger = WMUtils.getLogger({name: "WMRelation", level: "ERROR"});
	var WMRelationIdCount = 0;
	var WMRelationStorage = [];
	var WMElementRelMap = {};
	var generateNewWMRelationComponents = function(config){
		debugLogger.log("Creating New Relation");
		config = WMUtils.validateConfig(config, {
			start: null, end: null, text: "New Relation " + WMRelationIdCount,
			type: "inherit"
		});
		var startObj = config["start"], endObj = config["end"];
		if(startObj == null || endObj == null){
			errorLogger.log("Start Or End Null Pointer. config: "
				+ WMUtils.getObjectStr(config));
		}
		var sP = startObj.WMGetClosestPoint(endObj.getPosition());
		var eP = endObj.WMGetClosestPoint(startObj.getPosition());
		var group = WMGroup.newInstance({x: 0, y: 0});
		var line = new Kinetic.Line({
			points: [sP.x, sP.y, eP.x, eP.y], stroke: "black", strokeWidth: 2
		});
		var text = new Kinetic.Text({
			x: (sP.x + eP.x) / 2, y: (sP.y + eP.y) / 2,
			text: config["text"], listening: false,
			fontSize: 16, fontFamily: "Calibri",
			fill: "#555", padding: 5, align: "center"
		});
		var textHitBox = new Kinetic.Rect({
			x: (sP.x + eP.x) / 2, y: (sP.y + eP.y) / 2,
			width: text.getWidth(), height: text.getHeight(),
			opcity: 0.5, fill: "lightyellow"
		});
		var lineHead = WMUtils.getImage({
			x: eP.x, y: eP.y, width: 16, height: 16,
			src: "icons/inherit-arrow.png", offset: {x: 8, y: 0},
			rotation: WMUtils.getRotationAngle(sP, eP)
		});
		var lineTail = WMUtils.getImage({
			x: sP.x, y: sP.y, width: 16, height: 16,
			src: "icons/blank.png", offset: {x: 8, y: 0},
			rotation: 180 + WMUtils.getRotationAngle(sP, eP)
		});
		var lineHeadHitBox = new Kinetic.Rect({
			x: eP.x, y: eP.y, width: 60, height: 60, offset: {x: 30, y: 30},
			fill: "black", opacity: 0
		});
		var lineTailHitBox = new Kinetic.Rect({
			x: sP.x, y: sP.y, width: 60, height: 60, offset: {x: 30, y: 30},
			fill: "black", opacity: 0
		});
		(function(){
			lineHeadHitBox.lineEnd = "Head";
			lineTailHitBox.lineEnd = "Tail";
			lineHeadHitBox.lineEndObj = config["end"];
			lineTailHitBox.lineEndObj = config["start"];
			lineHeadHitBox.WMSwitchLineEndType =
			lineTailHitBox.WMSwitchLineEndType = function(type){
				var lineEndImg =
					this.getParent().WMGetComponent("line" + this.lineEnd);
				var typeSrcMap = this.lineEndObj.WMGetTypeSrcMap();
				var src = typeSrcMap[type];
				if(src == null){
					src = typeSrcMap["default"];
				}
				lineEndImg.WMLoadImg(src);
			};
			var onHitBoxTouchStart = function(e){
				this.setOpacity(0.3);
				this.getLayer().draw();
			};
			var onHitBoxTouchEnd   = function(e){
				this.setOpacity(0);
				this.getLayer().draw();
			};
			var onHitBoxHold       = function(e){
				this.setOpacity(0);
				var __l = this.getLayer();
				var hbx = __l.lineEndDrawingHitBox;
				var rec = this.lineEndObj.WMGetComponent("rect");
				hbx.setPosition(this.lineEndObj.getPosition());
				hbx.setWidth(rec.getWidth());
				hbx.setHeight(rec.getHeight());
				__l.add(__l.lineEndDrawingHitBox);
				__l.draw();
				__l.lineEndDrawingHitBox.lineEndFocus = this;
			};
			var lineHeadHitBoxHammer = new Hammer(lineHeadHitBox);
			var lineTailHitBoxHammer = new Hammer(lineTailHitBox);
			lineHeadHitBoxHammer.on("touchstart", onHitBoxTouchStart);
			lineTailHitBoxHammer.on("touchstart", onHitBoxTouchStart);
			lineHeadHitBoxHammer.on("touchend", onHitBoxTouchEnd);
			lineTailHitBoxHammer.on("touchend", onHitBoxTouchEnd);
			lineHeadHitBoxHammer.on("hold", onHitBoxHold);
			lineTailHitBoxHammer.on("hold", onHitBoxHold);
			group.WMAddComponent(line, "line");
			//group.WMAddComponent(text, "text");
			//group.WMAddComponent(textHitBox, "textHitBox");
			group.WMAddComponent(lineHead, "lineHead");
			group.WMAddComponent(lineTail, "lineTail");
			group.WMAddComponent(lineHeadHitBox, "lineHeadHitBox");
			group.WMAddComponent(lineTailHitBox, "lineTailHitBox");
			group.editable = false;
			group.start = config["start"];
			group.end = config["end"];
			group.WMRefreshPosition = function(){
				var sp = startObj.WMGetClosestPoint(endObj.getPosition());
				var ep = endObj.WMGetClosestPoint(startObj.getPosition());
				line.setPoints([sp.x, sp.y, ep.x, ep.y]);
				var md = {x: (sp.x + ep.x) / 2, y: (sp.y + ep.y) / 2};
				var ra = WMUtils.getRotationAngle(sp, ep);
				text.setPosition(md);
				textHitBox.setPosition(md);
				lineHead.setPosition(ep);
				lineHead.setRotation(ra)
				lineTail.setPosition(sp);
				lineTail.setRotation(180 + ra);
				lineHeadHitBox.setPosition(ep);
				lineTailHitBox.setPosition(sp);
			};
			group.WMGetTheOtherSide = function(obj){
				var target = null;
				if(obj == this.start){
					target = this.end;
				} else if(obj == this.end){
					target = this.start;
				}
				return target;
			};
			group.WMGetIdString = function(){
				return "WMRelation { id: " + this.id + " }";
			};
		})();
		WMRelationStorage.push(group);
		return group;
	};

	var pushIntoWMElementRelMap = function(config, rel){
		var start = config["start"], end = config["end"];
		if(start != null && end != null){
			debugLogger.log("Pushing " + rel.WMGetIdString()
					+ " into WMElementRelMap, "
					+ "start: " + start.WMGetIdString()
					+ ", end: " + end.WMGetIdString());
			var sMap;
			if(WMElementRelMap[start.id] == null){
				sMap = WMElementRelMap[start.id] = {};
			} else {
				sMap = WMElementRelMap[start.id];
			}
			if(sMap[end.id] == null){
				sMap[end.id] = [];
			}
			sMap[end.id].push(rel);

			var eMap;
			if(WMElementRelMap[end.id] == null){
				eMap = WMElementRelMap[end.id] = {};
			} else {
				eMap = WMElementRelMap[end.id];
			}
			if(eMap[start.id] == null){
				eMap[start.id] = [];
			}
			eMap[start.id].push(rel);
		}
	};

	var getWMRelationListById = function(id){
		var list = null;
		if(WMElementRelMap[id] != null){
			list = WMElementRelMap[id];
		}
		return list;
	};

	return {
		newInstance: function(config){
			return generateNewWMRelationComponents(config);
		},
		connect: function(config){
			var start = config["start"], end = config["end"];
			if(start != null && end != null){
				var rel = this.newInstance(config);
				pushIntoWMElementRelMap(config, rel);
				var layer = end.getLayer();
				layer.add(rel);
			}
		},
		refreshRelationsByObj: function(obj){
			var oMap = getWMRelationListById(obj.id);
			if(oMap == null){return;}
			for(var t in oMap){
				var list = oMap[t];
				if(list != null){
					for(var i = 0; i < list.length; i++){
						list[i].WMRefreshPosition();
					}
				}
			}
		},
		getRelMapById: function(id){
			return getWMRelationListById(id);
		},
		deleteRelatedRelsById: function(oid){
			var rMap = getWMRelationListById(oid);
			for(var tid in rMap){
				var tMap = getWMRelationListById(oid);
				delete tMap[oid];
				var otList = rMap[tid];
				for(var i = 0; i < otList.length; i++){
					otList[i].destroy();
				}
				delete rMap[tid];
			}
		}
	};
});
