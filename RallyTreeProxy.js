(function (global) {
  Ext.define("Rally.data.WsapiTreeProxy", {
    requires: ["Rally.data.WsapiReader"],

    extend: "Rally.data.WsapiRestProxy",

    topLevelModels: null, //["HierarchicalRequirement"],
    childModels: null, //["HierarchicalRequirement"],
    isRoot: false,
    model: null,

    constructor: function ctor(config) {
      var me = this;

      Ext.apply(me, config);
      me.reader = Ext.create("Rally.data.WsapiReader",  {
        root: "HierarchicalRequirement",
        totalProperty: "TotalResultCount"
      });

      //console.log("For Artifacts", me.topLevelModels, me.childModels);
      //debugger;
    },

    read: function read(operation, callback, scope) {
      var me = this;

      //console.log("Calling WTP Read", operation);

      if (me.isRoot) {
        me._readRoot(operation, callback, scope);
      } else {
        me._readChildren(operation, callback, scope);
      }
    },

    _readRoot: function _readRoot(operation, callback, scope) {
      var loadedArtifacts = {},
          me = this,
          processCB = Ext.bind(this._processResults, {filterFn: me.filterFn, loadedArtifacts: loadedArtifacts, operation: operation, callback: callback, scope: scope}),
          i= 0, ii = me.topLevelModels.length;

      //console.log("Reading Root");

      for (; i < ii; i++) {
        loadedArtifacts[me.topLevelModels[i].toLowerCase()] = 0;

        (function iHateJsScoping(type) {
          var sorter = [{
            property: "Rank",
            direction: "ASC"
          }];

          Rally.data.TreeModelFactory.getModel({
            type: type,
            canExpandFn: me.canExpandFn,
            success: function onSuccess(model) {
              var query = model.buildParentQueryFn(model, null);

              if (me.wsapiStoreOptions.query) {
                query = query.and(me.wsapiStoreOptions.query);
              }

              var wsapi = Ext.create("Rally.data.WsapiDataStore", {
                autoLoad: false,
                model: model,
                pageSize: me.wsapiStoreOptions.limit,
                startPage: me.wsapiStoreOptions.page,
                page: me.wsapiStoreOptions.page,
                start: me.wsapiStoreOptions.start,
                limit: me.wsapiStoreOptions.limit,
                isPaging: me.wsapiStoreOptions.isPaging,
                filters: query,
                sorters: model.superclass.self.typeName.toLowerCase() !== "testcase" ? sorter : null,
                listeners: {
                  load: function loaded(store, data, success) {
                    processCB(store, data, type);
                  }
                }
              });

              wsapi.loadPage(me.wsapiStoreOptions.page);
            }
          });
        }(me.topLevelModels[i].toLowerCase()));
      }
    },

    _readChildren: function _readChildren(operation, callback, scope) {
      var loadedArtifacts = {},
          me = this,
          processCB = Ext.bind(this._processResults, {filterFn: me.filterFn, loadedArtifacts: loadedArtifacts, operation: operation, callback: callback, scope: scope}),
          i= 0, ii = me.childModels.length;

      //console.log("Reading Children");

      for (; i < ii; i++) {
        //console.log("Fetching children of type", me.childModels[i], i, ii);
        loadedArtifacts[me.childModels[i].toLowerCase()] = 0;

        (function iHateJsScoping(type) {
          var sorter = [{
            property: "Rank",
            direction: "ASC"
          }];

          Rally.data.TreeModelFactory.getModel({
            canExpandFn: me.canExpandFn,
            type: type,
            success: function onSuccess(model) {
              Ext.create("Rally.data.WsapiDataStore", {
                autoLoad: true,
                filters: model.buildParentQueryFn(model, operation.node),
                sorters: model.superclass.self.typeName.toLowerCase() !== "testcase" ? sorter : null,
                model: model,
                listeners: {
                  load: function loaded(store, data, success) {
                    //console.log("Loaded Children", type, store, data, success);
                    processCB(store, data, type);
                  }
                }
              });
            }
          });
        }(me.childModels[i].toLowerCase()));
      }

    },

    _processResults: function (store, data, artifactType) {
      //console.log("Loaded " + artifactType, data, this);

      if (this.loadedArtifacts[artifactType.toLowerCase()]) {
        //console.log("Already processed, abort");
        return;
      }

      if (typeof this.operation.resultSet === "undefined") {
        this.operation.resultSet = [];
      }
      if (typeof this.operation.totalResultCount === "undefined") {
        this.operation.totalResultCount = 0;
      }

      var i, ii, k, done = true;
      this.operation.totalResultCount = this.operation.totalResultCount + store.getTotalCount();

      if (data) {
        for (i = 0, ii = data.length; i < ii; i ++) {
          //console.log("Data processing", typeof data[i], data[i]);

          data[i].data.cls = data[i].raw._type.split("/").join("").toLowerCase();
          data[i].data.href = Rally.util.Navigation.createRallyDetailUrl(data[i].data);
          data[i].data.hrefTarget = "_top";

          if (this.filterFn(data[i])) {
            this.operation.resultSet.push(data[i]);
          }
        }
      }

      this.loadedArtifacts[artifactType] = 1;

      for (k in this.loadedArtifacts) {
        if (this.loadedArtifacts.hasOwnProperty(k)) {
          done = done && this.loadedArtifacts[k];
        }
      }

      if (done) {
        //console.log("Done");

        this.operation.records = this.operation.resultSet;
        this.operation.setCompleted();
        this.operation.setSuccessful();

        //console.dir(this.operation);
        //debugger;

        Ext.callback(this.callback, this.scope || this, [this.operation]);
      }
    }

    //getProxy: function () {
      //return {buildExtractors: function() {}};
    //}
  });
})(this);
