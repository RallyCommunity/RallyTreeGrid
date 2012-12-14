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
            //console.log("Checking Can Expand");
            var names = rec.self.getChildFieldNames(),
                canExpand = false,
                i, ii;

            //console.log("Can Expand Fields", names);

            for (i = 0, ii = names.length; i < ii; i++) {
              if (rec.raw.hasOwnProperty(names[i])) {
                canExpand = canExpand || rec.raw[names[i]].length > 0;
              }
            }

            return canExpand;
          };
        }

        if (typeof buildParentQueryFn !== "function") {
          buildParentQueryFn = function defaultBuildParentQueryFn(model, parentRec) {
            var names = model.getParentFieldNames(),
                filteredNames = [],
                modelType = model.superclass.self.typeName.toLowerCase(),
                parentType,
                parentRef,
                query,
                queryMeth = parentRec ? "or" : "and",
                i, ii;

            if (parentRec) {
              parentType = parentRec.self.superclass.self.typeName.toLowerCase();
              parentRef = parentRec.raw._ref;
            } else {
              parentType = null;
              parentRef = null;
            }

            // Remove potential Parent names when they don't exist on the model
            for (i = 0, ii = names.length; i < ii; i++) {
              if (model.getField(names[i])) {
                filteredNames.push(names[i]);
              }
            }

            if (filteredNames.length === 0) {
              return Ext.create("Rally.data.QueryFilter", {
                property: "ObjectID",
                operator: "!=",
                value: "0"
              });
            }

            // Let the crappy if statement begin!!!
            if (modelType.indexOf("portfolioitem") >= 0) {
              query = Ext.create("Rally.data.QueryFilter", {
                property: "Parent",
                operator: "=",
                value: parentRef
              });
            } else if (modelType === "hierarchicalrequirement") {
              console.log("Create Query for Stories");
              if (parentType === modelType) {
                console.log("Its a Story");
                query = Ext.create("Rally.data.QueryFilter", {
                  property: 'Parent',
                  operator: "=",
                  value: parentRef
                });
              } else if (parentType === null) {
                console.log("Top level story");
                query = Ext.create("Rally.data.QueryFilter", {
                  property: 'Parent',
                  operator: "=",
                  value: "null"
                });

                //query = query.and(Ext.create("Rally.data.QueryFilter", {
                  //property: 'PortfolioItem',
                  //operator: '=',
                  //value: 'null'
                //}));
              } else if (parentType.indexOf("portfolioitem") !== -1) {
                console.log("Its a PI");
                query = Ext.create("Rally.data.QueryFilter", {
                  property: 'PortfolioItem',
                  operator: "=",
                  value: parentRef
                });
              }
            } else {
              console.log("Don't know what this is", modelType, parentType);
              query = Ext.create("Rally.data.QueryFilter", {
                property: filteredNames[0],
                operator: "=",
                value: parentRef
              });

              for (i = 1, ii = filteredNames.length; i < ii; i++) {
                query = query[queryMeth].call(query, Ext.create("Rally.data.QueryFilter", {
                  property: filteredNames[i],
                  operator: "=",
                  value: parentRef
                }));
              }
            }

            //console.log("Query for ", model.modelName, query.toString());

            return query;
          };
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
                return ["WorkProduct"];
              } else if ({"defect": 1}.hasOwnProperty(typeName)) {
                return ["Requirement"];
              } else if ({"testcasestep": 1}.hasOwnProperty(typeName)) {
                return ["TestCase"];
              } else if ({"hierarchicalrequirement": 1}.hasOwnProperty(typeName)) {
                return ["Parent", "PortfolioItem"];
              } else if ({testcasestep: 1}.hasOwnProperty(typeName)) {
                return ["TestCase"];
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
                return ["Steps"];
              } else if (typeName.indexOf("portfolioitem") !== -1) {
                return ["Children", "UserStories"];
              } else {
                return ["Children"];
              }
            }
          }
        });

        treeModel = Ext.define(baseModel.modelName + ".TreeModel", o);

        //console.log("Base model");
        //console.dir(baseModel);

        Ext.data.NodeInterface.decorate(treeModel);

        var i = 0, fields = treeModel.getFields(), ii = fields.length;

        for (; i < ii; i++) {
          if ({leaf: 1}.hasOwnProperty(fields[i].name)) {
            //console.log("Adding leaf conversion");
            fields[i].convert = function (v, rec) {
              //console.log("Converting leaf", v, rec);
              //console.dir(rec);
              return !rec.self.canExpandFn(rec);
            };
          }
        }

        treeModel.applyField;

        return treeModel;
    }
  });

})(this);
