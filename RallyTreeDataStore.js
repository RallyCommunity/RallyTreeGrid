(function (global) {
  var totalProcessed = 0;

  Ext.define("Rally.data.WsapiTreeStore", {
    extend: "Ext.data.TreeStore",

    rootArtifacts: ["HierarchicalRequirement", "Defect"],
    childArtifacts: ["HierarchicalRequirement", "Task"],

    pageSize: 25,

    totalProcessed: 0,
    totalCount: 0,

    currentPage: 1,

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

    onProxyLoad: function(operation) {
      var me = this;

      if (operation.success && !operation.node.parentNode) {
        me.totalProcessed = me.totalProcessed + operation.resultSet.length;
        me.totalCount = operation.totalResultCount;
      }

      me.callParent(arguments);
    },

    load: function load(options) {
      console.log("Tree Store Load Options");
      console.dir(options);
      console.log("Is Node Loaded?", options.node.isLoaded());

      var me = this,
          ocb = options.callback;

      options.callback = function updateTotals(nodes, ops, success) {
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
    },

    getCount: function getCount() {
      return this.totalProcessed || 0;
    },

    getTotalCount: function getTotalCount() {
      return this.totalCount || 0;
    },

    loadPage: function loadPage(num, options) {
      this.currentPage = num;
      this.load(options);
    },

    nextPage: function nextPage(options) {
      this.loadPage(this.currentPage + 1);
    },

    previousPage: function previousPage(options) {
      this.loadPage(this.currentPage - 1);
    },

    getPageSize: function getPageSize() {
      return this.pageSize;
    }

  });
}(this));
