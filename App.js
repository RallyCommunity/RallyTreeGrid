(function (global) {

  Ext.override(Rally.env.Server, {
    getWsapiUrl: function(version) {
      return this.getContextUrl() + "/webservice/1.40";
    }
  });

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

    childTypes: {
      defect: false,
      task: false,
      testcase: false
    },

    launch: function() {
      var me = this;

      me.add(Ext.create("Ext.Panel", {
        border: false,
        layout: 'fit',
        width: '100%',
        items: [
          {
            xtype: 'panel',
            width: '100%',
            border: false,
            layout: 'hbox',
            items: [
              me._createViewSelector(),
              {
                xtype: 'tbspacer',
                flex: 1
              },
              me._createTypeChoices()
            ]
        }]
      }));

      //me.add(me._createTypeChoices());

    },

    _createViewSelector: function _createViewSelector() {
      Ext.regModel("Views", {
        fields: [
          { type: "string", name: "name" },
          { type: "object", name: "value" }
        ]
      });

      var data = [];

      data.push({
        name: "All User Stories",
        value: {}
      });

      data.push({
        name: "Has Children",
        value: {
          wsapi: [
            {
               property: "DirectChildrenCount",
               operator: ">",
               value: "0"
            }
          ]
        }
      });

      data.push({
        name: "Has Active Defects", 
        value: {
          lbapi: {
            find: {
              _TypeHierarchy: "HierarchicalRequirement",
              DefectStatus: { $in: ["NONE_CLOSED", "SOME_CLOSED"] }
            },
            fields: ["ObjectID", "_ItemHierarchy", "DefectStatus", "Name"]
          }
        }
      });

      var store = Ext.create("Ext.data.Store", {
        model: "Views",
        data: data
      });

      var cb = Ext.create("Ext.form.field.ComboBox", {
        fieldLabel: "Views",
        autoSelect: true,
        editable: false,
        forceSelection: true,
        displayField: "name",
        valueField: "value",
        labelWidth: 75,
        queryMode: "local",
        store: store
      });

      cb.on('change', this._applyFilter, this);
      cb.select(cb.getStore().data.items[0]);

      return cb;
    },


    _createTypeChoices: function _createTypeChoices() {
      var me = this;

      return Ext.create("Ext.form.Panel", {
        width: '100%',
        height: '100%',
        border: false,
        region: 'center',
        defaultType: 'checkboxfield',
        layout: 'hbox',
        defaults: {
          margin: "0 5 0 0"
        },
        items: [{
          boxLabel: 'Defects',
          name: 'types',
          id: 'defect_type',
          inputValue: 'defect',
          listeners: {
            change: me._setTypeChoices,
            scope: me
          }
        }, {
          boxLabel: 'Tasks',
          name: 'types',
          id: 'task_type',
          inputValue: 'task',
          listeners: {
            change: me._setTypeChoices,
            scope: me
          }
        }, {
          boxLabel: 'Test Cases',
          name: 'types',
          id: 'testcase_type',
          inputValue: 'testcase',
          listeners: {
            change: me._setTypeChoices,
            scope: me
          }
        }]
      });
    },

    _loadLbapiQuery: function _loadLbapiQuery(query, callback) {
      var me = this,
          i, ii,
          projects = "__PROJECT_OIDS_IN_SCOPE__".split(',');
          woid = me.getContext().getWorkspace().ObjectID;

      for (i = 0, ii = projects.length; i < ii; i++) {
        projects[i] = parseInt(projects[i], 10);
      }

      query.pagesize = 1000;
      query.find.Project = {$in: projects};
      query.find.__At = "current";


      Ext.Ajax.request({
        url: "https://rally1.rallydev.com/analytics/v2.0/service/rally/workspace/" + woid + "/artifact/snapshot/query.js",
        method: "POST",
        jsonData: query,
        headers: { 
          'Content-Type' : 'application/json' 
        },
        success: function lbapiSuccess(response) {
          var res = Ext.decode(response.responseText);
          console.log(res);
          console.log(res.Results.length);
          Ext.callback(callback, me, [res]);
        }
      });
    },

    _applyFilter: function _applyFilter(sender, newVal, oldVal, eOpts) {
      var me = this;

      if (this._treePanel) {
        this.remove(this._treePanel);
      }

      me.currentFilter = newVal;

      Rally.data.TreeModelFactory.getModel({
        type: "HierarchicalRequirement",
        success: function modelSuccess(model) {
          me.model = model;

          var doLoad = function(query, childArtifacts) {
            me.store = Ext.create('Rally.data.WsapiTreeStore', {
              rootArtifacts: ['hierarchicalrequirement' ],
              childArtifacts: childArtifacts,
              query: query
            })

            me._onLoadData(newVal);
          };

          var query = null, i, ii;

          var childArtifacts = ["hierarchicalrequirement"];

          for (i in me.childTypes) {
            if (me.childTypes.hasOwnProperty(i)) {
              if (me.childTypes[i]) {
                childArtifacts.push(i);
              }
            }
          }

          if (newVal.wsapi && newVal.wsapi.length > 0) {
            query = Ext.create("Rally.data.QueryFilter", newVal.wsapi[0]);

            for (i = 1, ii = newVal.wsapi.length; i < ii; i++) {
              query = query.and(Ext.create("Rally.data.QueryFilter", newVal.wsapi[i]));
            }

            doLoad(query, childArtifacts);
          } else if (newVal.lbapi) {
            me._loadLbapiQuery(newVal.lbapi, function(res) {
              var topLevel = {},
                  inscope = {},
                  items = {},
                  prop = {
                    property: "ObjectID",
                    operator: "=",
                    value: ""
                  },
                  results = res.Results,
                  i, ii, j, jj;

              if (results.length > 0) {
                for (i = 0, ii = results.length; i < ii; i++) {
                  for (j = 0, jj = results[i]._ItemHierarchy.length; j < jj; j++) {
                    inscope[results[i]._ItemHierarchy[j]] = 1;
                  }
                  items[results[i].ObjectID] = 1;
                  //topLevel[results[i]._ItemHierarchy[0]] = 1;
                }
              }

              for (i in inscope) {
                if (inscope.hasOwnProperty(i)) {
                  console.log("Adding to list", i);
                  prop.value = i;

                  if (query === null) {
                    query = Ext.create("Rally.data.QueryFilter", prop);
                  } else {
                    query = query.or(Ext.create("Rally.data.QueryFilter", prop));
                  }
                }
              }

              doLoad(query, childArtifacts);
            });
          } else {
            doLoad(query, childArtifacts);
          }
        }
      });
    },

    _setTypeChoices: function _setTypeChoices(field, newVal, oldVal) {
      console.log("Changed Type", field, newVal, oldVal);
      var me = this;

      me.childTypes[field.inputValue] = newVal;

      me._applyFilter(null, me.currentFilter);
    },

    _onLoadData: function _onLoadData(newVal) {
      var me = this;

      console.log("Loading data", newVal);

      me._treePanel = Ext.create('Rally.ui.tree.grid.Panel', {
        store: me.store,
        models: [me.model],
        dockedItems: [{
          xtype: 'rallypagingtoolbar',
          store: me.store,   // same store TreeGridPanel is using
          dock: 'bottom',
          displayInfo: true
        }],
        columnCfgs: [
          "FormattedID",
          "Name",
          "ScheduleState",
          {
            text: 'Task Est.',
            dataIndex: 'Estimate',
            renderer: Ext.bind(renderTask, me, ["TaskEstimateTotal"], 0),
            flex: 1
          }, {
            text: 'To Do',
            dataIndex: 'ToDo',
            renderer: Ext.bind(renderTask, me, ["TaskRemainingTotal"], 0),
            flex: 1
          }
        ]

      });

      me.add(me._treePanel);
    }
  });
}(this));
