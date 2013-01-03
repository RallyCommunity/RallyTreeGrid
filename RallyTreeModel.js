(function (global) {
  var trm = Ext.define("Rally.data.TreeRootModel", {
    requires: [
      "Ext.data.NodeInterface",
      "Rally.data.WsapiTreeProxy"
    ],

    extend: "Ext.data.Model",

    constructor: function ctor(options) {
      var me = this,
          o = {};

      Ext.apply(o, {
        topLevelModels: ["HierarchicalRequirement"]
      });
      Ext.apply(o, options);

      //console.log("TreeRootModel", o, options);

      me.proxy = Ext.create("Rally.data.WsapiTreeProxy", {
        topLevelModels: o.topLevelModels,
        isRoot: true
      });

      me.callParent([options]);
    }
  });

  Ext.data.NodeInterface.decorate(trm);
})(this);
