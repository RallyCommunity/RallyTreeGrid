(function(global) {

  Ext.define('Rally.data.TreeModelFactory', {
    requires: ['Ext.data.NodeInterface', 'Rally.data.ModelFactory'],

    singleton: true,

    getModel: function getModel(options) {
      var me = this,
          cb = options.success || function noop() {},
          canExpandFn = options.canExpandFn,
          buildParentQueryFn = options.buildParentQueryFn;

      delete options.canExpandFn;

      options.success = function onTreeModelSuccess(model) {
        var treeModel = me.createTreeModel(model, {canExpand: canExpandFn, buildParentQueryFn: buildParentQueryFn});
        cb(treeModel);
      };

      //debugger;

      Rally.data.ModelFactory.getModel(options);

    },

    createTreeModel: function createTreeModel(baseModel, options) {
        var o = {},
            canExpandFn = options.canExpandFn,
            buildParentQueryFn = options.buildParentQueryFn,
            treeModel;

        if (typeof canExpandFn !== "function") {
          canExpandFn = function defaultCanExpandFn(rec) {
            console.log("Checking Can Expand");
            var names = rec.self.getChildFieldNames(),
                canExpand = true,
                i, ii;

            console.log("Can Expand Fields", names);

            for (i = 0, ii = names.length; i < ii; i++) {
              if (rec.raw.hasOwnProperty(names[i])) {
                canExpand = canExpand && rec.raw[names[i]].length > 0;
              }
            }

            return canExpand;
          };
        }

        if (typeof buildParentQueryFn !== "function") {
          buildParentQueryFn = function defaultBuildParentQueryFn(model, parentRec) {
            var names = model.getParentFieldNames(),
                parentType,
                parentRef,
                query,
                i, ii;

            if (parentRec) {
              parentType = parentRec.self.modelName.toLowerCase();
              parentRef = parentRec.raw._ref;
            } else {
              parentType = null;
              parentRef = null;
            }

            query = Ext.create("Rally.data.QueryFilter", {
              property: names[0],
              operator: "=",
              value: parentRef
            });

            for (i = 1, ii = names.length; i < ii; i++) {
              query = query.or(Ext.create("Rally.data.QueryFilter", {
                property: names[i],
                operator: "=",
                value: parentRef
              }));
            }

            return query;
          }
        }

        Ext.applyIf(o, {
          extend: baseModel,

          constructor: function ctor(config) {
            console.log("Tree Model Config options", config);
            this.callParent([config]);
          },

          statics: {
            canExpandFn: canExpandFn,

            buildParentQueryFn: buildParentQueryFn,

            getParentFieldNames: function getParentFieldNames() {
              var typeName = baseModel.typeName.toLowerCase();

              if ({"task": 1, "testcase": 1}.hasOwnProperty(typeName)) {
                return ["WorkItem"];
              } else if ({"defect": 1}.hasOwnProperty(typeName)) {
                return ["Requirement"];
              } else if ({"testcasestep": 1}.hasOwnProperty(typeName)) {
                return ["TestCase"];
              } else if ({"hierarchicalrequirement": 1}.hasOwnProperty(typeName)) {
                return ["Parent", "PortfolioItem"];
              } else {
                return ["Parent"];
              }
            },

            getChildFieldNames: function getChildFieldNames() {
              var typeName = baseModel.typeName.toLowerCase();

              if (typeName === "hierarchicalrequirement") {
                return ["Tasks", "Children", "Defects", "TestCases"];
              } else if (typeName === "defectsuite") {
                return ["Defects", "Tasks"];
              } else if (typeName === "defect") {
                return ["Tasks"];
              } else if (typeName === "testcase") {
                return ["TestCaseSteps"];
              } else if (typeName.indexOf("portfolioitem") !== -1) {
                return ["Children", "UserStories"];
              } else {
                return ["Children"];
              }
            }
          }
        });

        treeModel = Ext.define(baseModel.modelName + ".TreeModel", o);

        console.log("Base model");
        console.dir(baseModel);

        Ext.data.NodeInterface.decorate(treeModel);

        var i = 0, fields = treeModel.getFields(), ii = fields.length;

        for (; i < ii; i++) {
          if ({leaf: 1}.hasOwnProperty(fields[i].name)) {
            console.log("Adding leaf conversion");
            fields[i].convert = function (v, rec) {
              console.log("Converting leaf", v, rec);
              console.dir(rec);
              return !rec.self.canExpandFn(rec);
            };
          }
        }

        treeModel.applyField;

        return treeModel;
    }
  });

})(this);
