define(["Kinetic"], function(Kinetic){
    /**
     * 为js的String添加format方法
     * ex.1 "abc{0}def{1}".format("AAA", "BBB") => "abcAAAdefBBB"
     * ex.2 "abc{name} def{value}".format({"name": "AAA", "value": "BBB"}) => "abcAAA defBBB"
     * @param args 可以是一个map，也可以是数量不定的string(注意不能是list类型)
     * @return String 转换好的字符串
     */
    String.prototype.format = function(args){
        var result = this;
        if(arguments.length > 0){
            if(arguments.length == 1 && typeof(args) == "object"){
                for(var key in args){
                    if(args[key] != undefined){
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            } else {
                for(var i = 0; i < arguments.length; i++){
                    if(arguments[i] != undefined){
                        var reg = new RegExp("({" + i + "})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    };
    var imgMap = {};
    var enabledLoggerLevel = {
        DEBUG: true,
        WARN: true,
        LOG: true,
        INFO: true,
        ERROR: true,
        EVENT: false
    };
    return {
        validateConfig: function(config, attributes){
            config = config || {};
            if(attributes != null){
                for(var key in attributes){
                    if(config[key] == null){
                        config[key] = attributes[key];
                    }
                }
            }
            return config;
        },
        setCursor: function(cursor){
            document.body.style.cursor = cursor;
        },
        getImage: function(config){
            config = this.validateConfig(config, {
                x: 0, y: 0, width: 50, height: 50, src: null
            });
            if(config["src"] != null){
                var kObject = new Kinetic.Image({
                    x: config["x"], y: config["y"],
                    width: config["width"], height: config["height"]
                });
                if(imgMap[config["src"]] != null){
                    kObject.setImage(imgMap[config["src"]]);
                    if(kObject.getLayer() != null){
                        kObject.draw();
                    }
                } else {
                    var img = new Image();
                    img.src = config["src"];
                    img.addEventListener("load", function(){
                        imgMap[config["src"]] = img;
                        kObject.setImage(imgMap[config["src"]]);
                        if(kObject.getLayer() != null){
                            kObject.draw();
                        }
                    });
                }
                return kObject;
            }
            return null;
        },
        getLogger: function(config){
            config = this.validateConfig(config, {
                name: "default", level: "DEBUG", on: true
            });
            var log = function(message){
                if(this.on && enabledLoggerLevel[this.level]){
                    var str = "[{t}] [{l}] {n}: {m}".format({
                        t: new Date().toLocaleString(),
                        l: this.level,
                        n: this.name,
                        m: message
                    });
                    console.log(str);
                }
            };
            return new function(){
                this.name = config["name"];
                this.level = config["level"];
                this.on = config["on"];
                this.log = log;
            };
        },
        getObjectStr: function(obj){
            if(obj === null) {
                return "null";
            } else if (obj === undefined){
                return "undefined";
            }
            var str = "{";
            for(var name in obj){
                str += " {n}: {v},".format({
                    n: name,
                    v: obj[name]
                });
            }
            return str.slice(0, str.length - 1) + " }";
        },
        getPointOnStage: function(p, stage){
            var x = p.x;
            var y = p.y;

            var _c = stage.getContainer();
            var bbox = _c.getBoundingClientRect();


            return {
                x: x - bbox.left,
                y: y - bbox.top
            };
        }
    };
});