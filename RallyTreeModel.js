(function (global) {
  Ext.define("Rally.data.TreeModel", {
    requires: [
      "Ext.data.NodeInterface",
      "Rally.data.TreeProxy"
    ],

    extend: "Ext.data.Model",

    constructor: function ctor(options) {
      var me = this;

      me.callParent([options]);

      Ext.data.NodeInterface.decorate(me);

      me.proxy = Ext.create("Rally.data.TreeProxy", {
        rootArtifacts: options.rootArtifacts
      });
    }
  });
})(this);
