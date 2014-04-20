define(["Kinetic", "Hammer", "WMGroup", "WMUtils", "WMRelation"],
    function(Kinetic, Hammer, WMGroup, WMUtils, WMRelation){
    var MAX_VALUE = Number.MAX_VALUE;
    var WMClassIdCount = 0;
    var WMClassMap = {};
	var WMClassStorage = [];
	var WMRelationStorage = [];
    var attrHeight = 20;
    var defaultWidth = 200;
    var defaultHeight = 80;
    var debugLogger = WMUtils.getLogger({name: "WMClass", level: "DEBUG", on: true});
    var eventLogger = WMUtils.getLogger({name: "WMClass", level: "EVENT", on: true});
    var errorLogger = WMUtils.getLogger({name: "WMClass", level: "ERROR", on: true});
    var stage = null;
    var attrPool = $("#wmclass-container .attrPool");
    var methPool = $("#wmclass-container .methPool");
    var classNameDiv = $("#wmclass-container .nameMask");
    var typeSrcMap = {
        D: "icons/inherit-arrow.png",
        X: "icons/rhombus.png",
        line: "icons/blank.png"
    };

    var getPointOnPage = function(p){
        if(stage == null){
            errorLogger.log("No Stage Specified!");
        }
        return WMUtils.getPointOnPage(p, stage);
    };

    var getPointOnStage = function(p){
        if(stage == null){
			errorLogger.log("No Stage Specified!");
        }
        return WMUtils.getPointOnStage(p, stage);
    };

    var maskThis = function(){
        var _this = this;
        var generateInnerInput = function(config){
            config = WMUtils.validateConfig(config, {
                top: 0, left: 0, id: 0, value: "", width: 20,
                fontSize: 12, height: 18
            });
            var width = new Number(config["width"]) > 20 ?
                                config["width"] : 20;
            var inputHtml = "<input type='text' value='{v}' "
                          + "data-id='{id}' class='fixed' "
                          + "style='top: {top}px; left: {left}px; "
                          + "width: {width}px; height: {height}px;"
                          + "font-size: {fs}px'>";
            return inputHtml.format({
                v: config["value"], id: config["id"], top: config["top"],
                left: config["left"], width: width, height: config["height"],
                fs: config["fontSize"]
            });
        };
        var generateAttrPoolContent = function(pool, poolName){
            var poolPos = getPointOnPage(pool.getAbsolutePosition());
            var poolDom = attrPool;
            if(poolName == "meth"){
                poolDom = methPool;
            }
            poolDom.css({
                top: poolPos.y, left: poolPos.x, "z-index": 10
            });
            for(var attrId in pool["WMComponents"]){
                var attr = pool["WMComponents"][attrId];
                if(attr != null){
                    /*
                     * 不用这个闭包的话会引起问题
                     * 因为这个方法是通过markThis.call(this)的方式调用的，
                     * 所以多个调用者会共用一个闭包，这样在inputObj.on方法
                     * 中就会出现attrText仅为最后一次调用时的值的情况
                     */
                    (function(){
                        var attrPos = attr.getPosition();
                        var attrText = attr.WMGetComponent("text");
                        var inputObj = $(generateInnerInput({
                            top: attrPos.y, left: attrPos.x, id: attr.id,
                            value: attrText.getText(), fontSize: 11,
                            width: attrText.getWidth() + 5
                        }));
                        inputObj.on("input", function(){
                            attrText.setText($(this).val());
                            $(this).css("width", attrText.getWidth());
                            resetClassWidth.call(_this);
                        });
                        poolDom.append(inputObj);
                    })();
                }
            }
        };
        /* 先将mask内div的内容删除 */
        attrPool.html("");
        methPool.html("");
        classNameDiv.html("");
        /* 调整mask的css样式 */
        var rect = this.WMGetComponent("rect");
        generateAttrPoolContent(this.WMGetComponent("attrPool"), "attr");
        generateAttrPoolContent(this.WMGetComponent("methPool"), "meth");
        (function(){
            var className = _this.WMGetComponent("nameText");
            var classNamePos = getPointOnPage(className.getAbsolutePosition());
            classNameDiv.css({
                top: classNamePos.y + 15, left: classNamePos.x + 10,
                "z-index": 10
            });
            var inputObj = $(generateInnerInput({
                value: className.getText(),
                width: className.getWidth() - 23,
                // fontSize: className.getFontSize()
                fontSize: 14, height: 23
            }));
            inputObj.on("input", function(){
                var cnp = getPointOnPage(className.getAbsolutePosition());
                classNameDiv.css({
                    top: cnp.y + 15, left: cnp.x + 10,
                    "z-index": 10
                });
                className.setText($(this).val());
                $(this).css("width", className.getWidth() - 30);
                resetClassWidth.call(_this);
            });
            classNameDiv.append(inputObj);
        })();
        resetClassWidth.call(this);
    };

    /* 生成Class的初始显示组件 */
    var generateNewWMClassInnerComponents = function(config){
        debugLogger.log("Constructing new WMClass: " + WMUtils.getObjectStr(config));
        var group = new WMGroup.newInstance({
            x: config["x"], y: config["y"]
        });
        var rect = new Kinetic.Rect({
            x: 0, y: 0,
            width: config["width"], height: config["height"],
            stroke: "black", strokewidth: 1, fill: "white",
            shadowcolor: "black", shadowblur: 10,
            shadowoffset: [4, 4], shadowopacity: 0.2
        });
        var nameText = new Kinetic.Text({
            x: 0, y: -10, text: config["name"], listening: false,
            fontSize: 16, fontFamily: "Calibri",
            fill: "#555", padding: 20, align: "center"
        });
        var nameSeparator = new Kinetic.Line({
            points: [1, 30, config["width"] - 1, 30],
            stroke: "black", strokeWidth: 1
        });
        var attrSeparator = new Kinetic.Line({
            points: [1, 55, config["width"] - 1, 55],
            stroke: "black", strokeWidth: 1
        });
        var attrAdder = WMUtils.getImage({
            x: 15, y: 35, width: 16, height: 16,
            src: "icons/adder-icon.png"
        });
        var methAdder = WMUtils.getImage({
            x: 15, y: 60, width: 16, height: 16,
            src: "icons/adder-icon.png"
        });
        var attrPool = WMGroup.newInstance({
            x: 15, y: 35
        });
        var methPool = WMGroup.newInstance({
            x: 15, y: 60
        });

        /* 设置一些初始化动作 */
        (function(){
			group.WMAddComponent(rect, "rect");
			group.WMAddComponent(nameText, "nameText");
			group.WMAddComponent(nameSeparator, "nameSeparator");
			group.WMAddComponent(attrSeparator, "attrSeparator");
			group.WMAddComponent(attrAdder, "attrAdder");
			group.WMAddComponent(methAdder, "methAdder");
			group.WMAddComponent(attrPool, "attrPool");
			group.WMAddComponent(methPool, "methPool");
			nameText.setX(config["width"] / 2 - nameText.getWidth() / 2);
			group.attrIdCount = 0;
			group.methIdCount = 0;
			group.attrInsertY = 0;
			group.methInsertY = 0;
			group.maxAttrWidth = config["width"];
			//group.id = config["id"];
			group.editable = false;
			group.gestureCreated = config["gestureCreated"];
			group.holdStart = false;
			group.holdPoint = {x: 0, y: 0};
			group.longPressConnect = false;
			group.toggleComponents = [attrAdder, methAdder];
			var hammer = new Hammer(group);
			hammer.on("dbltap", function(){
				eventLogger.log("Double Tapped " + this.WMGetIdString());
				this.holdStart = false;
				if(!this.gestureCreated && !this.editable){
					var focus = WMUtils.globalFocus();
					if(focus != this){
						if(focus && typeof(focus.WMToggleComponents) == "function"){
							focus.WMToggleComponents(false);
						}
						this.WMToggleComponents(true);
						WMUtils.globalFocus(this);
					}
				}
			});
			hammer.on("touchmove", function(e){
				e.preventDefault();
				eventLogger.log("TOUCHMOVE on " + this.WMGetIdString()
					+ ", touches: " + e.touches.length);
				var p = getPointOnStage({
                    x: e.touches[0]["pageX"], y: e.touches[0]["pageY"]
                });
                /* 当手指向某一方向移动超过15px时，将长按标记置为否 */
				if(this.holdStart){
					var hP = this.holdPoint;
					if(Math.abs(p.x - hP.x) > 15 && Math.abs(p.y - hP.y) > 15){
						this.holdStart = false;
                    }
				}
				if(e.touches.length == 1 && !this.editable && !this.longPressConnect){
					eventLogger.log("DRAGGING on " + this.WMGetIdString()
						+ ", p: " + WMUtils.getObjectStr(p));
					var rect = this.WMGetComponent("rect");
					var moveP = {
						x: p.x - this.getX() - rect.getWidth() / 2,
				        y: p.y - this.getY() - rect.getHeight() / 2
					};
					this.move(moveP);
                    if(this.WMIsInsideTrash()){
                        rect.setFill("grey");
                        rect.setOpacity(0.6);
                    } else {
                        rect.setFill("white");
                        rect.setOpacity(1);
                    }
					this.getLayer().batchDraw();
                /* 两指操作时，为使用双指创建新类之后的拖拽操作 */
				} else if (e.touches.length == 2 && !this.editable
						&& !this.longPressConnect && this.gestureCreated){
					eventLogger.log("DRAGGING on Gesture Created "
							+ this.WMGetIdString() + ", p:"
							+ WMUtils.getObjectStr(p));
					var rect = this.WMGetComponent("rect");
					eventLogger.log("DRAGGING on " + this.WMGetIdString()
							+ ", p: " + WMUtils.getObjectStr(p));
					var moveP = {
						x: p.x - this.getX() - rect.getWidth() / 2,
						y: p.y - this.getY() - rect.getHeight() / 2
					};
					this.move(moveP);
					this.getLayer().newConnectLineHitBox.remove();
					this.getLayer().batchDraw();
				}
			});
			hammer.on("touchend", function(){
				eventLogger.log("TOUCHEND on " + this.WMGetIdString());
				this.gestureCreated = false;
				this.holdStart = false;
                if(this.WMIsInsideTrash()){
                    this.destroy();
                }
			});
			hammer.on("touchstart", function(e){
				e.preventDefault();
				if(!this.gestureCreated){
					eventLogger.log("TOUCHSTART on " + this.WMGetIdString());
					this.holdStart = true;
					this.holdPoint = getPointOnStage({
						x: e.touches[0]["pageX"],
						y: e.touches[0]["pageY"]
					});
					var self = this;
					if(e.touches.length == 1 && !this.editable){
						setTimeout(function(){
							if(self.holdStart && !self.longPressConnect
                                && !self.editable){
								eventLogger.log("1 TOUCH HOLD on"
									+ self.WMGetIdString());
								self.longPressConnect = true;
								self.longPressConnectLine = new Kinetic.Line({
									points: [self.holdPoint.x, self.holdPoint.y,
									self.holdPoint.x, self.holdPoint.y],
									stroke: "black", strokeWidth: 2
								});
								var __layer = self.getLayer();
								WMUtils.globalFocus(self);
								__layer.add(self.longPressConnectLine);
								__layer.add(__layer.newConnectLineHitBox);
								self.getLayer().draw();
							}
						}, 800);
					} else if(e.touches.length > 1 && !this.editable){
						setTimeout(function(){
							if(self.holdStart && !self.editable){
								eventLogger.log("2 TOUCHES HOLD on "
									+ self.WMGetIdString());
								self.holdStart = false;
								self.longPressConnect = false;
								var _newClass = newInstance({
									x: self.holdPoint["x"] - defaultWidth / 2,
									y: self.holdPoint["y"] - defaultHeight / 2,
									editable: false, gestureCreated: true
								});
								WMRelation.connect({start: _newClass, end: self});
								self.getLayer().add(_newClass);
								self.getLayer().newConnectLineHitBox.remove();
								self.getLayer().draw();
							}
						}, 400);
					}
				}
			});
        })();
        return group;
    };

    /* 生成新属性的组件 */
    var generateNewWMClassAttribute = function(config){
        config = WMUtils.validateConfig(config, {
            x: 0, y: 0, name: "attribute", id: 0, WMAttrType: "attr"
        });
        debugLogger.log("Adding Attr: " + WMUtils.getObjectStr({
            id: config["id"],
            WMAttrType: config["WMAttrType"],
            name: config["name"]
        }) + " to WMClass"
            + "{ id: {i} }".format({i: config["WMClassId"]}));
        var attr = WMGroup.newInstance({
            x: config["x"], y: config["y"]
        });
        var text = new Kinetic.Text({
            x: 0, y: 0, text: config["name"], listening: false,
            fontSize: 12, fontFamily: "Calibri",
            fill: "#555", padding: 5, align: "left"
        });
        var remove = WMUtils.getImage({
            x: -15, y: 3, width: 16, height: 16,
            src: "icons/remove-icon.png"
        });
        //attr.id = config["id"];
        attr.WMAttrType = config["WMAttrType"];
        attr.WMAddComponent(text, "text");
        attr.WMAddComponent(remove, "remove");
        attr.WMGetText = function(){
            return text.getText();
        };
        attr.WMSetText = function(t){
            text.setText(t);
        };
        attr.WMGetAttrWidth = function(){
            return text.getWidth();
        };
        remove.on("click tap", function(){
            var pool = attr.getParent();
            var wmclass = pool.getParent();
            var poolName = "attrPool";
            if(attr.WMAttrType == "meth"){
                poolName = "methPool";
            }
            eventLogger.log("Tapped the Remover of attr { id: "
                + attr.id + " } of " + wmclass.WMGetIdString());
            removeAttr.call(wmclass, poolName, attr.id);
        });
        return attr;
    };

    var setClassWidth = function(width){
        this.WMGetComponent("rect").setWidth(width);
        this.WMGetComponent("nameSeparator").getPoints()[2] = width - 1;
        this.WMGetComponent("attrSeparator").getPoints()[2] = width - 1;
        var nameText = this.WMGetComponent("nameText");
        nameText.setX(width / 2 - nameText.getWidth() / 2);
    };

    var resetClassWidth = function(){
        var attrPool = this.WMGetComponent("attrPool");
        var methPool = this.WMGetComponent("methPool");
        var rect = this.WMGetComponent("rect");
        var width = defaultWidth;
        var thisWidth = rect.getWidth();
        attrPool.WMEachComponent(function(){
            width = Math.max(width, 25 + this.WMGetAttrWidth());
        });
        methPool.WMEachComponent(function(){
            width = Math.max(width, 25 + this.WMGetAttrWidth());
        });
        setClassWidth.call(this, width);
		WMRelation.refreshRelationsByObj(this);
        if(this.getLayer() != null){
            this.getLayer().draw();
        }
    };

    var addAttr = function(c){
        var pool = this.WMGetComponent("attrPool");
        c["y"] = this.attrInsertY;
        this.attrInsertY += attrHeight;
        c["id"] = this.attrIdCount++;
        c["WMClassId"] = this.id;
        var attr = generateNewWMClassAttribute(c);
        pool.WMAddComponent(attr, "" + attr.id);
        this.toggleComponents.push(attr.WMGetComponent("remove"));
        var rect = this.WMGetComponent("rect");
        rect.setHeight(rect.getHeight() + attrHeight);
        var moveParam = {x: 0, y: attrHeight};
        this.WMGetComponent("attrSeparator").move(moveParam);
        this.WMGetComponent("methPool").move(moveParam);
        this.WMGetComponent("attrAdder").move(moveParam);
        this.WMGetComponent("methAdder").move(moveParam);
        maskThis.call(this);
    };

    var addMeth = function(c){
        var pool = this.WMGetComponent("methPool");
        c["y"] = this.methInsertY;
        this.methInsertY += attrHeight;
        c["id"] = this.methIdCount++;
        c["WMClassId"] = this.id;
        var meth = generateNewWMClassAttribute(c);
        pool.WMAddComponent(meth, "" + meth.id);
        this.toggleComponents.push(meth.WMGetComponent("remove"));
        var rect = this.WMGetComponent("rect");
        rect.setHeight(rect.getHeight() + attrHeight);
        var moveParam = {x: 0, y: attrHeight};
        this.WMGetComponent("methAdder").move(moveParam);
        maskThis.call(this);
    };

    var removeAttr = function(poolName, id){
        var pool = this.WMGetComponent(poolName);
        var attr = pool.WMGetComponent(id);
        debugLogger.log("Removing Attr: " + WMUtils.getObjectStr({
            id: id,
            WMAttrType: attr.WMAttrType,
            name: attr.WMGetText()
        }) + " from " + this.WMGetIdString());
        delete pool["WMComponents"][id];
        attr.destroy();
        if(poolName == "attrPool"){
            var moveParam = {x: 0, y: -attrHeight};
            this.WMGetComponent("attrSeparator").move(moveParam);
            this.WMGetComponent("methPool").move(moveParam);
            this.WMGetComponent("attrAdder").move(moveParam);
            this.WMGetComponent("methAdder").move(moveParam);
            var rect = this.WMGetComponent("rect");
            rect.setHeight(rect.getHeight() - attrHeight);
            this.attrInsertY -= attrHeight;
            pool.WMEachComponent(function(){
                if(new Number(id) < this.id){
                    this.move(moveParam);
                }
            });
        } else {
            var moveParam = {x: 0, y: -attrHeight};
            this.WMGetComponent("methAdder").move(moveParam);
            var rect = this.WMGetComponent("rect");
            rect.setHeight(rect.getHeight() - attrHeight);
            this.methInsertY -= attrHeight;
            pool.WMEachComponent(function(){
                if(new Number(id) < this.id){
                    this.move(moveParam);
                }
            });
        }
        maskThis.call(this);
    };

    /**
     * 获得当前类的某个连个连接点。1...8分别指左上角、上中、右上角...左中。
     * @param Number pos 位置。从1开始。
     * @return Object {x: 指定点的x坐标, y: 指定点的y坐标}。绝对坐标。
     */
    var getConnectPoint = function (pos) {
        if(pos == null){
            return null;
        }
        var rect         = this.WMGetComponent("rect");
        var width        = rect.getWidth();
        var height       = rect.getHeight();
        var rectPosition = rect.getAbsolutePosition();
        switch(pos){
            /* 左上角 */
            case 1: return rectPosition;
            /* 上中 */
            case 2: return {
                x: rectPosition.x + width / 2,
                y: rectPosition.y
            };
            /* 右上角 */
            case 3: return {
                x: rectPosition.x + width,
                y: rectPosition.y
            };
            /* 右中 */
            case 4: return {
                x: rectPosition.x + width,
                y: rectPosition.y + height / 2
            };
            /* 右下角 */
            case 5: return {
                x: rectPosition.x + width,
                y: rectPosition.y + height
            };
            /* 下中 */
            case 6: return {
                x: rectPosition.x + width / 2,
                y: rectPosition.y + height
            };
            /* 左下角 */
            case 7: return {
                x: rectPosition.x,
                y: rectPosition.y + height
            };
            /* 左中 */
            case 8: return {
                x: rectPosition.x,
                y: rectPosition.y + height / 2
            };
            default: return null;
        }
    };

    /**
     * 计算当前类的各个连接点与给定的点之间的距离，返回距离给定点最近的点
     * @param Object point 给定的点。绝对坐标。
     * @return Object 距离最小的点。绝对坐标。
     */
    var getClosestConnectPoint = function(point){
        var p = null;
        if(point == null){
            return null;
        } else if (point instanceof Array){
            p = {
                x: point[0],
                y: point[1]
            };
        } else {
            p = point;
        }
        var distance = MAX_VALUE, chosenP = null;
        for(var i = 1; i < 9; i++){
            var _p = getConnectPoint.call(this, i);
            var _d = (p["x"] - _p["x"]) * (p["x"] - _p["x"])
                   + (p["y"] - _p["y"]) * (p["y"] - _p["y"]);
            if(_d < distance){
                distance = _d;
                chosenP  = _p;
            }
        }
        return chosenP;
    };

    var newInstance = function(config){
        /* 配置默认参数 */
        var _id = WMClassIdCount++;
        config = WMUtils.validateConfig(config, {
            x: 0, y: 0, width: defaultWidth, height: defaultHeight,
            name: "NewClass" + _id, editable: false,
            gestureCreated: false
        });
        var group = generateNewWMClassInnerComponents(config);
        WMClassMap["" + _id] = group;

        group.WMGetClosestPoint = function(point){
            var p = getClosestConnectPoint.call(this, point);
            return p;
        };

        group.WMGetTypeSrcMap = function(){return typeSrcMap};

        group.WMGetIdString = function(){
            return "WMClass { id: " + this.id + " }";
        };

		var oriMove = group.move;
		group.move = function(p){
			WMRelation.refreshRelationsByObj(this);
			oriMove.call(this, p);
		};

        var oriDest = group.destroy;
        group.destroy = function(){
            WMRelation.deleteRelatedRelsById(group.id);
            var layer = this.getLayer();
            oriDest.call(this);
            if(layer != null){
                layer.draw();
            }
        };

        group.WMIsInsideTrash = function(){
            var rect = this.WMGetComponent("rect");
            return this.getLayer().trash.WMIsInside({
                x: this.getX() + rect.getWidth() / 2,
                y: this.getY() + rect.getHeight() / 2
            });
        };

        group.WMToggleComponents = function(editable){
            if(editable == null){
                this.editable = !this.editable;
            } else {
                this.editable = editable;
            }
            var m = "hide";
            var info = "Hidding";
            var rect = this.WMGetComponent("rect");
            if(this.editable){
                m = "show";
                info = "Showing";
                maskThis.call(this);
                rect.setFill("lightyellow");
            } else {
                attrPool.html("");
                methPool.html("");
                classNameDiv.html("");
                attrPool.css("z-index", "-10");
                methPool.css("z-index", "-10");
                classNameDiv.css("z-index", "-10");
                rect.setFill("white");
            }
            debugLogger.log(info + " Editable Components of "
                + this.WMGetIdString());
            for(var i = 0; i < group.toggleComponents.length; i++){
                var obj = group.toggleComponents[i];
                obj[m].call(obj);
            }
            if(this.getLayer() != null){
                this.draw();
            }
        };

        /* 为添加属性按扭附上动作 */
        group.WMGetComponent("attrAdder").on("click tap", function(){
            eventLogger.log("Tapped the attrAdder of "
                + group.WMGetIdString());
            addAttr.call(group, {name: "+attr: Type"});
        });

        /* 为添加属性按扭附上动作 */
        group.WMGetComponent("methAdder").on("click tap", function(){
            eventLogger.log("Tapped the methAdder of "
                + group.WMGetIdString());
            addMeth.call(group, {
                name: "+function(a: Type, b: Type): Type",
                WMAttrType: "meth"
            });
        });

		group.insideThis = function(p){
			var inside = false;
			var rect = this.WMGetComponent("rect");
			var w = rect.getWidth(), h = rect.getHeight();
			var _p = this.getAbsolutePosition();
			if(p.x >= _p.x && p.x <= _p.x + w
				&& p.y >= _p.y && p.y <= _p.y + h){
				inside = true;
			}
			return inside;
		};

        (function(){
            group.WMToggleComponents(config["editable"]);
        })();

		WMClassStorage.push(group);
        return group;
    };

	var getInstanceFromPoint = function(p){
		stagePoint = getPointOnStage(p);
		hitClass = null;
		for(var i = 0; i < WMClassStorage.length; i++){
			var wmclass = WMClassStorage[i];
			if(wmclass.insideThis(stagePoint)){
				if(hitClass == null){
					hitClass = wmclass;
				} else {
					if(wmclass.getZIndex() > hitClass.getZIndex()){
						hitClass = wmclass;
					}
				}
			}
		}
		return hitClass;
	};

    return {
		init: function(config){
			if(config["stage"] == null){
				errorLogger.log("No Stage Specified!");
			}
			stage = config["stage"];
		},
        newInstance: function(config){
            return newInstance(config);
        },
		getInstanceFromPoint: function(p){
			return getInstanceFromPoint(p);
		}
    };
 });
