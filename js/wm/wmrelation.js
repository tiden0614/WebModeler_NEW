define(["Kinetic", "Hammer", "WMUtils", "WMGroup", "WMClass"], 
		function(Kinetic, Hammer, WMUtils, WMGroup, WMClass){
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
		var lineHeadHitBox = new Kinetic.Rect({
			x: eP.x, y: eP.y, width: 60, height: 60, offset: {x: 30, y: 30},
			fill: "black", opacity: 0.3
		});
		var lineTailHitBox = new Kinetic.Rect({
			x: sP.x, y: sP.y, width: 60, height: 60, offset: {x: 30, y: 30},
			fill: "black", opacity: 0.3
		});
		(function(){
			group.WMAddComponent(line, "line");
			group.WMAddComponent(text, "text");
			group.WMAddComponent(textHitBox, "textHitBox");
			group.WMAddComponent(lineHead, "lineHead");
			group.WMAddComponent(lineHeadHitBox, "lineHeadHitBox");
			group.WMAddComponent(lineTailHitBox, "lineTailHitBox");
			group.editable = false;
			group.start = config["start"];
			group.end = config["end"];
			group.WMRefreshPosition = function(){
				var sp = startObj.WMGetClosestPoint(endObj.getPosition());
				var ep = endObj.WMGetClosestPoint(startObj.getPosition());
				line.setPoints([sp.x, sp.y, ep.x, ep.y]);
				text.setX((sp.x + ep.x) / 2);
				text.setY((sp.y + ep.y) / 2);
				textHitBox.setX((sp.x + ep.x) / 2);
				textHitBox.setY((sp.y + ep.y) / 2);
				lineHead.setX(ep.x);
				lineHead.setY(ep.y);
				lineHead.setRotation(WMUtils.getRotationAngle(sp, ep));
				lineHeadHitBox.setPosition({x: ep.x, y: ep.y});
				lineTailHitBox.setPosition({x: sp.x, y: sp.y});
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

	var getWMRelationListByObj = function(obj){
		var list = null;
		if(obj != null && WMElementRelMap[obj.id] != null){
			list = WMElementRelMap[obj.id];
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
			var oMap = getWMRelationListByObj(obj);
			if(oMap == null){return;}
			for(var t in oMap){
				var list = oMap[t];
				if(list != null){
					for(var i = 0; i < list.length; i++){
						list[i].WMRefreshPosition();
					}
				}
			}
		}
	};
});
