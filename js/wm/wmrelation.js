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
		var group = WMGroup.getNewInstance({x: 0, y: 0});
		var line = new Kinetic.Line({
			points: [sP, eP], stroke: black, strokeWidth: 2
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
		(function(){
			group.WMAddComponent(line, "line");
			group.WMAddComponent(text, "text");
			group.WMAddComponent(textHitBox, "textHitBox");
			group.editable = false;
			group.start = config["start"];
			group.end = config["end"];
			group.WMRefreshPosition = function(){
				sP = startObj.WMGetClosestPoint(endObj.getPosition());
				eP = endObj.WMGetClosestPoint(startObj.getPosition());
				text.setX((sP.x + eP.x) / 2);
				text.setY((sP.y + eP.y) / 2);
				textHitBox.setX((sP.x + eP.x) / 2);
				textHitBox.setY((sP.y + eP.y) / 2);
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
		})();
		WMRelationStorage.push(group);
		return group;
	};

	var pushIntoWMElementRelMap = function(config, rel){
		var start, end = config["start"], config["end"];
		if(start != null && end != null){
			var sMap;
			if(WMElementRelMap[start.id] == null){
				sMap = WMElementRelMap[start.id] = {};
			}
			if(sMap[end.id] == null){
				sMap[end.id] = [];
			}
			sMap[end.id].push(rel);

			var eMap;
			if(WMElementRelMap[end.id] == null){
				eMap = WMElementRelMap[end.id] = {};
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
			var start, end = config["start"], config["end"];
			if(start != null && end != null){
				var rel = this.newInstance(config);
				pushIntoWMElementRelMap(config, rel);
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
