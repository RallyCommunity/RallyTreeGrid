(function (global) {
  Ext.define("Rally.data.WsapiTreeStore", {
    extend: "Ext.data.TreeStore",

    rootArtifacts: ["HierarchicalRequirement", "Defect"],
    childArtifacts: ["HierarchicalRequirement", "Task"],

    constructor: function wsapi_tree_store_ctor(config) {
      var me = this,
          trmConfig = {};


      Ext.apply(me, config);

      console.log("WsapiTreeStore Root Artifacts", me.rootArtifacts);

      me.root = Ext.create("Rally.data.TreeRootModel", {
        rootArtifacts: me.rootArtifacts
      });

      //me.proxy = Ext.create("Rally.data.WsapiTreeProxy", {
        //rootArtifact: me.rootArtifacts,
        //childArtifacts: me.childArtifacts
      //});

      me.callParent([config]);

    },

    load: function load(options) {
      console.log("Tree Store Load Options");
      console.dir(options);
      console.log("Is Node Loaded?", options.node.isLoaded());

      var me = this;

      options.callback = function t() {
        console.log("Tree Loaded", arguments);
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
