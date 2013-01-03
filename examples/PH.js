(function (global) {

  Ext.override(Rally.env.Server, {
    getWsapiUrl: function(version) {
      return this.getContextUrl() + "/webservice/1.39";
    }
  });

  Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
      var store = Ext.create('Rally.data.WsapiTreeStore', {
        rootArtifacts: ['portfolioitem/theme' ],
        childArtifacts: ['portfolioitem/initiative', 'portfolioitem/feature', 'hierarchicalrequirement', 'task', 'defect', 'testcase'],
      });

      this.add(Ext.create('Rally.ui.tree.grid.Panel', {
        store: store,
        dockedItems: [{
          xtype: 'rallypagingtoolbar',
          store: store,   // same store TreeGridPanel is using
          dock: 'bottom',
          displayInfo: true
        }],
        columns: [{
          xtype: 'treecolumn',
          text: 'Name',
          dataIndex: 'Name',
          flex: 2
        }, {
          xtype: 'templatecolumn',
          tpl: Ext.create('Rally.ui.renderer.template.PercentDoneByStoryPlanEstimateTemplate2'),
          text: '% Done by Plan Est',
          dataIndex: 'PercentDoneByPlanEstimate',
          flex: 1
        }, {
          text: 'Schedule State',
          dataIndex: 'ScheduleState',
          flex: 1
        }, {
          text: 'Est. Hours',
          dataIndex: 'Estimate',
          flex: 1
        }, {
          text: 'Remaining',
          dataIndex: 'ToDo',
          flex: 1
        }]
      }));
    }
  });
}(this));
