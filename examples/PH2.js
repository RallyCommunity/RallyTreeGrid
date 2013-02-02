(function (global) {

  Ext.override(Rally.env.Server, {
    getWsapiUrl: function(version) {
      return this.getContextUrl() + "/webservice/1.37";
    }
  });

  var defaultFilterFn = function () { return true; };

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

    mixins: {
      maskable: "Rally.ui.mask.Maskable"
    },

    loading: null,

    filterFn: defaultFilterFn,

    launch: function() {
      var me = this;

      //me.loading = new Ext.LoadMask(me.up("dashboard-container"), {msg: "Loading..."});
      me.maskTarget = me.el;

      me.showLoading();

      me.add(Ext.create("Ext.Panel", {
        border: false,
        layout: 'anchor',
        margin: '15 0 0 0',
        padding: '0 0 0 0',
        height: 45,
        width: '100%',
        items: [
          //{
            //anchor: '100% 45',
            //items: [
          {
            width: '100%',
            anchor: '100% 45',
            //height: 35,
            border: false,
            layout: 'hbox',
            items: [
              {
                xtype: 'tbspacer',
                flex: 1
                //width: 200
              },
              me._createTypeSelector(), {
                xtype: 'tbspacer',
                width: 10
              }
            ]
        //}]
            }]
      }));

      //me.add(me._createTypeChoices());

    },

    showLoading: function() {
      var me = this;

      me.showMask("Loading...");
    },

    hideLoading: function() {
      var me = this;

      me.hideMask();
    },

    _createTypeSelector: function _createViewSelector() {
      var cb = Ext.create("Rally.ui.combobox.PortfolioItemTypeComboBox", {});

      cb.on("change", this._applyFilter, this);

      return cb;
    },

    _applyFilter: function _applyFilter(sender, newVal, oldVal, eOpts) {
      var i, ii;
      var me = this;

      this._types = [];
      
      for (i = 0, ii = sender.store.data.items.length; i < ii; i++) {
        this._types.push(sender.store.data.items[i].data.TypePath.toLowerCase());
      }

      this._types.splice(0, sender.store.data.items.length - sender.valueModels[0].data.Ordinal);

      console.log("Apply Filter", newVal, oldVal);
      console.log("Foo", this._types, sender.store.data.items.length - sender.valueModels[0].data.Ordinal);

      this._types.push("hierarchicalrequirement");
      this._types.push("task");
      this._types.push("defect");

      newVal = sender.valueModels[0].data;

      me.showLoading();

      if (this._treePanel) {
        this.remove(this._treePanel);
      }

      Rally.data.TreeModelFactory.getModel({
        type: newVal.TypePath,
        success: function modelSuccess(model) {
          me.model = model;
          
          var ssf, i, ii, f = model.getFields();

          for (i = 0, ii = f.length; i < ii; i++) {
            if (f[i].name === "UnifiedState") {
              ssf = f[i];
              break;
            }
          }

          me._ssf = ssf;

          var doLoad = function(childModels) {
            console.log("Child models", childModels);
            me.store = Ext.create('Rally.data.WsapiTreeStore', {
              topLevelModels: [ newVal.TypePath ],
              childModels: childModels
            });

            me._onLoadData(newVal);
          };

          var childModels = me._types;

          //for (i in me.childTypes) {
            //if (me.childTypes.hasOwnProperty(i)) {
              //if (me.childTypes[i]) {
                //childModels.push(i);
              //}
            //}
          //}
          doLoad(childModels);
        }
      });
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
          displayInfo: true,
          listeners: {
            beforechange: function () {
              this.showLoading();
            },
            scope: me
          }
        }],
        listeners: {
          load: function() { me.hideLoading(); }
        },
        columnCfgs: [
          "Name",
          "Release",
          "Iteration",
          "ScheduleState",
          "PlanEstimate",
          {
            text: 'Task Est.',
            dataIndex: 'Estimate',
            renderer: Ext.bind(renderTask, me, ["TaskEstimateTotal"], 0),
            flex: 1,
            hidden: true
          },
          {
            text: 'To Do',
            dataIndex: 'ToDo',
            renderer: Ext.bind(renderTask, me, ["TaskRemainingTotal"], 0),
            flex: 1,
            hidden: true
          }, {
            xtype: 'templatecolumn',
            tpl: Ext.create('Rally.ui.renderer.template.PercentDoneByStoryPlanEstimateTemplate2'),
            text: '% Done By Plan Estimate',
            dataIndex: 'PercentDoneByPlanEstimate',
            flex: 1
          }, {
            xtype: 'templatecolumn',
            tpl: Ext.create('Rally.ui.renderer.template.PercentDoneByStoryPlanEstimateTemplate2'),
            text: '% Done By Story Count',
            dataIndex: 'PercentDoneByStoryCount',
            flex: 1
          }, 
          "PrelimenaryEstimate",
          "PlannedStartDate",
          "PlannedEndDate",
          "ValueScore",
          "RiskScore",
          {
            xtype: 'templatecolumn',
            tpl: Ext.create('Rally.ui.renderer.template.ScheduleStateTemplate2', {field: me._ssf}),
            text: 'State',
            flex: 1
          }
        ]

      });

      me._treePanel.on("load", function() { me.hideLoading(); });
      me.add(me._treePanel);
    }
  });
}(this));
