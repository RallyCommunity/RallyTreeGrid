(function (global) {

  Ext.override(Rally.env.Server, {
    getWsapiUrl: function(version) {
      return this.getContextUrl() + "/webservice/1.39";
    }
  });

  var renderComplex = function renderComplex(val, __, rec) {
    //console.log("Render Complex", arguments);

    if (val && val._refObjectName) {
      return val._refObjectName;
    } else {
      return "";
    }
  };

  var renderTask = function renderTask(p, val, __, rec) {
    if (rec && rec.get) {
      if (rec.raw._type.toLowerCase() !== "task") {
        if (rec.raw.hasOwnProperty(p)) {
          return rec.raw[p];
        }
      }
    }

    return val;
  };

  Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
      var store = Ext.create('Rally.data.WsapiTreeStore', {
        topLevelModels: ['hierarchicalrequirement' ],
        childModels: ['hierarchicalrequirement', 'task'],
      }),
      me = this;

      Rally.data.TreeModelFactory.getModel({
        type: "HierarchicalRequirement",
        success: function modelSuccess(model) {
          var ssf, i, ii, f = model.getFields();

          console.log("Fields", f);
          for (i = 0, ii = f.length; i < ii; i++) {
            if (f[i].name === "UnifiedState") {
              ssf = f[i];
              break;
            }
          }

          console.log("Found SSF?", ssf);
          console.log("Model");
          console.dir(model);
          me.add(Ext.create('Rally.ui.tree.grid.Panel', {
            store: store,
            models: [model],
            dockedItems: [{
              xtype: 'rallypagingtoolbar',
              store: store,   // same store TreeGridPanel is using
              dock: 'bottom',
              displayInfo: true
            }],
            columnCfgs: [
              "Name",
              {
                xtype: 'templatecolumn',
                tpl: Ext.create('Rally.ui.renderer.template.ScheduleStateTemplate', {field: ssf}),
                text: 'State',
                flex: 2
              },
              {
                text: 'Task Est.',
                dataIndex: 'Estimate',
                renderer: Ext.bind(renderTask, me, ["TaskEstimateTotal"], 0),
                flex: 1
              },
              {
                text: 'To Do',
                dataIndex: 'ToDo',
                renderer: Ext.bind(renderTask, me, ["TaskRemainingTotal"], 0),
                flex: 1
              }
            ]

            }));

          }
      });
    }
  });
}(this));
