define(["Kinetic", "WMUtils"], function(Kinetic, WMUtils){
	var WMGroupIdCount = 0;
    return {
        newInstance: function(config){
			config = WMUtils.validateConfig(config, {id: WMGroupIdCount++});
            var group = new Kinetic.Group(config);
            group.WMComponents = {};
            group.WMComponentCount = 0;
			group.id = config["id"];
            group.WMAddComponent = function(obj, name){
                this.add(obj);
                name = name || obj.getName() + this.WMComponentCount++;
                this.WMComponents[name] = obj;
                return obj;
            };
            group.WMGetComponent = function(name){
                return this.WMComponents[name];
            };
            group.WMEachComponent = function(func){
                var count = 0;
                for(var i in this["WMComponents"]){
                    var c = this.WMGetComponent(i);
                    if(c != null){
                        func.call(c, count++);
                    }
                }
            };
            return group;
        }
    };
});
