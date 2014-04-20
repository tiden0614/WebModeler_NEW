define(["Kinetic", "Hammer", "WMGroup", "WMUtils", "WMRelation"],
    function(Kinetic, Hammer, WMGroup, WMUtils, WMRelation){
    var MAX_VALUE = Number.MAX_VALUE;
    var WMUsecaseIdCount = 0;
    var WMClassMap = {};
    var WMClassStorage = [];
    var WMRelationStorage = [];
    var attrHeight = 20;
    var defaultUserWidth = 60;
    var defaultUserHeight = 100;
    var defaultUsecaseWidth = 150;
    var defaultUsecaseHeight = 60;
    var defaultLineHeadImgSrc = "icons/blank.png";
    var defaultLineTailImgSrc = "icons/blank.png";
    var debugLogger = WMUtils.getLogger({name: "WMClass", level: "DEBUG", on: true});
    var eventLogger = WMUtils.getLogger({name: "WMClass", level: "EVENT", on: true});
    var errorLogger = WMUtils.getLogger({name: "WMClass", level: "ERROR", on: true});
    var stage = null;
    var nameMask = $(".nameMask");
    var typeSrcMap = {
        D: "icons/empty-arrow.png",
        X: "icons/empty-rhombus.png",
        line: "icons/blank.png",
        "default": "icons/empty-arrow.png"
    };
    var shapeGeneratorMap = {};

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
        /* 先将mask内div的内容删除 */
        nameMask.html("");
        /* 调整mask的css样式 */
        var rect = this.WMGetComponent("rect");
        var defaultWidth = this.defaultWidth;
        var defaultHeight = this.defaultHeight;
        (function(){
            var nameText = _this.WMGetComponent("nameText");
            var nameTextPos = getPointOnPage(nameText.getAbsolutePosition());
            nameMask.css({
                top: nameTextPos.y + 15, left: nameTextPos.x + 10,
                "z-index": 10
            });
            var inputObj = $(generateInnerInput({
                value: nameText.getText(),
                width: nameText.getWidth() - 23,
                // fontSize: nameText.getFontSize()
                fontSize: 14, height: 23
            }));
            inputObj.on("input", function(){
                var cnp = getPointOnPage(nameText.getAbsolutePosition());
                nameMask.css({
                    top: cnp.y + 15, left: cnp.x + 10,
                    "z-index": 10
                });
                nameText.setText($(this).val());
                var w = nameText.getWidth(), h = nameText.getHeight();
                // nameText.setPosition({
                //     x: defaultUsecaseWidth / 2 - w / 2,
                //     y: defaultUsecaseHeight / 2 - h / 2
                // });
                nameText.setX(defaultWidth / 2 - w / 2);
                $(this).css("width", nameText.getWidth() - 30);
            });
            nameMask.append(inputObj);
        })();
    };

    /* 生成User的初始显示组件 */
    var generateNewWMUserInnerComponents = shapeGeneratorMap["X"] = function(config){
        debugLogger.log("Constructing new WMUser: " + WMUtils.getObjectStr(config));
        var _id = WMUsecaseIdCount++;
        config = WMUtils.validateConfig(config, {name: "NewUser" + _id});
        var group = new WMGroup.newInstance({
            x: config["x"], y: config["y"]
        });
        var circle = WMUtils.getImage({
            x: 0, y: 0, width: defaultUserWidth, height: defaultUserHeight,
            stroke: "black", strokewidth: 1, fill: "white",
            shadowcolor: "black", shadowblur: 10,
            shadowoffset: [4, 4], shadowopacity: 0.2,
            src: "icons/user.png"
        });
        var hitRect = new Kinetic.Rect({
            x: 0, y: 0, width: defaultUserWidth, height: defaultUserHeight,
            fill: "white", opacity: 0.3
        });
        var nameText = new Kinetic.Text({
            x: 0, y: 0, text: config["name"], listening: false,
            fontSize: 16, fontFamily: "Calibri",
            fill: "#555", padding: 20, align: "center"
        });

        /* 设置一些初始化动作 */
        (function(){
            group.WMAddComponent(circle, "circle");
            group.WMAddComponent(nameText, "nameText");
            group.WMAddComponent(hitRect, "rect");
            group.defaultWidth = defaultUserWidth;
            group.defaultHeight = defaultUserHeight;
            nameText.setPosition({
                x: defaultUserWidth / 2 - nameText.getWidth() / 2,
                y: defaultUserHeight
            });
            WMClassMap["" + _id] = group;
        })();

        return group;
    };

    /* 生成Usecase的初始显示组件 */
    var generateNewWMUsecaseInnerComponents = shapeGeneratorMap["D"] = function(config){
        debugLogger.log("Constructing new WMUsecase: " + WMUtils.getObjectStr(config));
        var _id = WMUsecaseIdCount++;
        config = WMUtils.validateConfig(config, {name: "NewUsecase" + _id});
        var group = new WMGroup.newInstance({
            x: config["x"], y: config["y"]
        });
        var circle = new Kinetic.Ellipse({
            x: 0, y: 0, width: defaultUsecaseWidth, height: defaultUsecaseHeight,
            stroke: "black", strokewidth: 1, fill: "white",
            shadowcolor: "black", shadowblur: 10,
            shadowoffset: [4, 4], shadowopacity: 0.2,
            offset: {x: -defaultUsecaseWidth / 2, y: -defaultUsecaseHeight / 2}
        });
        var hitRect = new Kinetic.Rect({
            x: 0, y: 0, width: defaultUsecaseWidth, height: defaultUsecaseHeight,
            fill: "white", opacity: 0.3
        });
        var nameText = new Kinetic.Text({
            x: 0, y: 0, text: config["name"], listening: false,
            fontSize: 16, fontFamily: "Calibri",
            fill: "#555", padding: 20, align: "center"
        });

        /* 设置一些初始化动作 */
        (function(){
            group.WMAddComponent(circle, "circle");
            group.WMAddComponent(nameText, "nameText");
            group.WMAddComponent(hitRect, "rect");
            group.defaultWidth = defaultUsecaseWidth;
            group.defaultHeight = defaultUsecaseHeight;
            nameText.setX(defaultUsecaseWidth / 2 - nameText.getWidth() / 2);
            nameText.setY(defaultUsecaseHeight / 2 - nameText.getHeight() / 2);
            WMClassMap["" + _id] = group;
        })();

        return group;
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
            /* 上中 */
            case 1: return {
                x: rectPosition.x + width / 2,
                y: rectPosition.y
            };
            /* 右中 */
            case 2: return {
                x: rectPosition.x + width,
                y: rectPosition.y + height / 2
            };
            /* 下中 */
            case 3: return {
                x: rectPosition.x + width / 2,
                y: rectPosition.y + height
            };
            /* 左中 */
            case 4: return {
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
        for(var i = 1; i < 5; i++){
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
        config = WMUtils.validateConfig(config, {
            x: 0, y: 0, width: defaultUsecaseWidth, height: defaultUsecaseHeight,
            editable: false, gestureCreated: false, shape: "D"
        });
        var _shape = config["shape"];
        delete config["shape"];
        var groupGen = shapeGeneratorMap[_shape];
        if(groupGen == null){
            groupGen = generateNewWMUsecaseInnerComponents;
        }
        var group = groupGen(config);

        group.WMGetClosestPoint = function(point){
            var p = getClosestConnectPoint.call(this, point);
            return p;
        };

        group.WMGetTypeSrcMap = function(){return typeSrcMap};

        group.WMGetIdString = function(){
            return "WMUsecase { id: " + this.id + " }";
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
            var circle = this.WMGetComponent("circle");
            if(this.editable){
                m = "show";
                info = "Showing";
                maskThis.call(this);
                circle.setFill("lightyellow");
            } else {
                nameMask.html("");
                nameMask.css("z-index", "-10");
                circle.setFill("white");
            }
            debugLogger.log(info + " Editable Components of "
                + this.WMGetIdString());
            if(this.getLayer() != null){
                this.draw();
            }
        };

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

        group.editable = false;
        group.gestureCreated = config["gestureCreated"];
        group.holdStart = false;
        group.holdPoint = {x: 0, y: 0};
        group.longPressConnect = false;
        group.toggleComponents = [];
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
                var circle = this.WMGetComponent("circle");
                if(this.WMIsInsideTrash()){
                    circle.setFill("grey");
                    circle.setOpacity(0.6);
                } else {
                    circle.setFill("white");
                    circle.setOpacity(1);
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
                            self.WMGetComponent("rect").setFill("lightblue");
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
                                x: self.holdPoint["x"] - defaultUsecaseWidth / 2,
                                y: self.holdPoint["y"] - defaultUsecaseHeight / 2,
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

        (function(){
            group.WMToggleComponents(config["editable"]);
        })();

        WMClassStorage.push(group);
        return group;
    };

    var getInstanceFromPoint = function(stagePoint){
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
        },
        getDefaultLineHeadImgSrc: function(){
            return defaultLineHeadImgSrc;
        },
        getDefaultLineTailImgSrc: function(){
            return defaultLineTailImgSrc;
        }
    };
 });
