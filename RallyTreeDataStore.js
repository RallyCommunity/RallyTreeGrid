(function (global) {
  var totalProcessed = 0;

  Ext.define("Rally.data.WsapiTreeStore", {
    extend: "Ext.data.TreeStore",

    rootArtifacts: ["HierarchicalRequirement", "Defect"],
    childArtifacts: ["HierarchicalRequirement", "Task"],

    constructor: function wsapi_tree_store_ctor(config) {
      var me = this,
          trmConfig = {};


      Ext.apply(me, config);

      me.callParent([config]);

      console.log("WsapiTreeStore Root Artifacts", me.rootArtifacts);

      me.setRootNode(Ext.create("Rally.data.TreeRootModel", {
        rootArtifacts: me.rootArtifacts,
        leaf: false
      }));

      //me.proxy = Ext.create("Rally.data.WsapiTreeProxy", {
        //rootArtifact: me.rootArtifacts,
        //childArtifacts: me.childArtifacts
      //});


    },

    load: function load(options) {
      console.log("Tree Store Load Options");
      console.dir(options);
      console.log("Is Node Loaded?", options.node.isLoaded());

      var me = this,
          ocb = options.callback;

      options.callback = function t() {
        totalProcessed = totalProcessed + arguments[0].length;
        console.log("Tree Loaded", totalProcessed, arguments);

        if (ocb) {
          Ext.callback(ocb, options.scope || me, arguments);
        }
      };

      me.setProxy(Ext.create("Rally.data.WsapiTreeProxy", {
        model: options.node,
        rootArtifacts: me.rootArtifacts,
        childArtifacts: me.childArtifacts,
        isRoot: me.getRootNode().modelName === options.node.modelName,
        canExpandFn: me.canExpandFn
      }));

      me.callParent([options]);
    }
  });
}(this));
