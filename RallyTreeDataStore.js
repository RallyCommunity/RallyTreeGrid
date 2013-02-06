(function (global) {
  var totalProcessed = 0;

  Ext.define("Rally.data.WsapiTreeStore", {
    extend: "Ext.data.TreeStore",

    topLevelModels: ["HierarchicalRequirement"],
    childModels: ["HierarchicalRequirement", "Task"],

    pageSize: 25,

    totalProcessed: 0,
    totalCount: 0,

    currentPage: 1,

    filterFn: function defaultFilterFn() { return true; },

    constructor: function wsapi_tree_store_ctor(config) {
      var me = this,
          trmConfig = {};


      Ext.apply(me, config);

      me.callParent([config]);

      //console.log("WsapiTreeStore Root Artifacts", me.topLevelModels);

      me.setRootNode(Ext.create("Rally.data.TreeRootModel", {
        topLevelModels: me.topLevelModels,
        leaf: false
      }));

      //me.proxy = Ext.create("Rally.data.WsapiTreeProxy", {
        //topLevelModels: me.topLevelModels,
        //childModels: me.childModels
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
      var me = this,
          ocb = options.callback;

      options.wsapi = {
        page: me.currentPage,
        start: (me.currentPage - 1) * me.pageSize,
        limit: me.pageSize,
        isPaging: true,
        query: me.query
      };

      //console.log("Tree Store Load Options");
      //console.dir(options);
      //console.log("Is Node Loaded?", options.node.isLoaded());


      options.callback = function updateTotals(nodes, ops, success) {
        //console.log("Tree Loaded", totalProcessed, arguments);

        if (ocb) {
          Ext.callback(ocb, options.scope || me, arguments);
        }
      };

      me.setProxy(Ext.create("Rally.data.WsapiTreeProxy", {
        model: options.node,
        topLevelModels: me.topLevelModels,
        childModels: me.childModels,
        isRoot: me.getRootNode().modelName === options.node.modelName,
        canExpandFn: me.canExpandFn,
        filterFn: me.filterFn,
        wsapiStoreOptions: options.wsapi
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
      options = options || {};
      options.node = this.getRootNode();
      this.load(options);
    },

    nextPage: function nextPage(options) {
      this.loadPage(this.currentPage + 1, options);
    },

    previousPage: function previousPage(options) {
      this.loadPage(this.currentPage - 1, options);
    },

    getPageSize: function getPageSize() {
      return this.pageSize;
    }

  });
}(this));
