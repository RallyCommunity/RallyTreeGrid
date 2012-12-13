(function (global) {
  Ext.define("Rally.data.WsapiTreeProxy", {
    requires: ["Rally.data.WsapiReader"],

    extend: "Rally.data.WsapiRestProxy",

    rootArtifacts: null, //["HierarchicalRequirement"],
    childArtifacts: null, //["HierarchicalRequirement"],
    isRoot: false,
    model: null,

    constructor: function ctor(config) {
      var me = this;

      Ext.apply(me, config);
      me.reader = Ext.create("Rally.data.WsapiReader",  {
        root: "HierarchicalRequirement",
        totalProperty: "TotalResultCount"
      });

      console.log("For Artifacts", me.rootArtifacts, me.childArtifacts);
      //debugger;
    },

    read: function read(operation, callback, scope) {
      var me = this;

      console.log("Calling WTP Read", operation);

      if (me.isRoot) {
        me._readRoot(operation, callback, scope);
      } else {
        me._readChildren(operation, callback, scope);
      }
    },

    _readRoot: function _readRoot(operation, callback, scope) {
      var loadedArtifacts = {},
          me = this,
          processCB = Ext.bind(this._processResults, {loadedArtifacts: loadedArtifacts, operation: operation, callback: callback, scope: scope}),
          i= 0, ii = me.rootArtifacts.length;

      console.log("Reading Root");

      for (; i < ii; i++) {
        loadedArtifacts[me.rootArtifacts[i].toLowerCase()] = 0;

        (function iHateJS(type) {
          Rally.data.TreeModelFactory.getModel({
            type: type,
            canExpandFn: me.canExpandFn,
            success: function onSuccess(model) {
              Ext.create("Rally.data.WsapiDataStore", {
                autoLoad: true,
                model: model,
                filter: model.buildParentQueryFn(model, null),
                listeners: {
                  load: function loaded(store, data, success) {
                    processCB(store, data, type);
                  }
                }
              });
            }
          });
        }(me.rootArtifacts[i].toLowerCase()));
      }
    },

    _readChildren: function _readChildren(operation, callback, scope) {
      var loadedArtifacts = {},
          me = this,
          processCB = Ext.bind(this._processResults, {loadedArtifacts: loadedArtifacts, operation: operation, callback: callback, scope: scope}),
          i= 0, ii = me.childArtifacts.length;

      console.log("Reading Children");

      for (; i < ii; i++) {
        //console.log("Fetching children of type", me.childArtifacts[i], i, ii);
        loadedArtifacts[me.childArtifacts[i].toLowerCase()] = 0;

        (function iHateJS(type) {
          Rally.data.TreeModelFactory.getModel({
            //canExpandFn: me.canExpandFn,
            type: type,
            success: function onSuccess(model) {

              Rally.data.ModelFactory.getModel({
                type: type,
                success: function onNormSuccess(rmodel) {

                  var whichModel = model;

                  if (type.indexOf("feature") != -1) {
                    //whichModel = rmodel;
                    //debugger;
                  }

              Ext.create("Rally.data.WsapiDataStore", {
                autoLoad: true,
                filters: [{
                  property: "Parent",
                  value: operation.node.raw._ref
                }],
                model: whichModel,
                listeners: {
                  load: function loaded(store, data, success) {
                    console.log("Loaded Children", type, store, data, success);
                    processCB(store, data, type);
                  }
                }
              });

                }
              });
            }
          });
        }(me.childArtifacts[i].toLowerCase()));
      }

    },

    _processResults: function (store, data, artifactType) {
      console.log("Loaded " + artifactType, data, this);

      if (this.loadedArtifacts[artifactType.toLowerCase()]) {
        return;
      }

      if (typeof this.operation.resultSet === "undefined") {
        this.operation.resultSet = [];
      }

      var i, ii, k, done = true;

      if (data) {
        for (i = 0, ii = data.length; i < ii; i ++) {
          this.operation.resultSet.push(data[i]);
        }
      }

      this.loadedArtifacts[artifactType] = 1;

      for (k in this.loadedArtifacts) {
        if (this.loadedArtifacts.hasOwnProperty(k)) {
          done = done && this.loadedArtifacts[k];
        }
      }

      if (done) {
        console.log("Done");

        this.operation.records = this.operation.resultSet;
        this.operation.setCompleted();
        this.operation.setSuccessful();

        console.dir(this.operation);
        //debugger;

        Ext.callback(this.callback, this.scope || me, [this.operation]);
      }
    }

    //getProxy: function () {
      //return {buildExtractors: function() {}};
    //}
  });
})(this);
