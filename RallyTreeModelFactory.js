(function(global) {

  console.log("Is Rally.data.ModleFactory defined?", typeof Rally.data.ModelFactory);

  Ext.define('Rally.data.TreeModelFactory', {
    requires: ['Ext.data.NodeInterface', 'Rally.data.ModelFactory'],

    singleton: true,

    getModel: function getModel(options) {
      var me = this,
          cb = options.success || function noop() {}

      options.success = function onTreeModelSuccess(model) {
        var treeModel = me.createTreeModel(model);
        cb(treeModel);
      };

      //debugger;

      Rally.data.ModelFactory.getModel(options);

    },

    createTreeModel: function createTreeModel(baseModel, options) {
        var o = options || {},
            treeModel;

        Ext.applyIf(o, {
          extend: baseModel,

          statics: {
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
                return ["TestCaseSteps"]
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

        return treeModel;
    }
  });

})(this);
