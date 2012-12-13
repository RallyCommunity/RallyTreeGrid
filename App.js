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
        rootArtifacts: ['portfolioitem/theme'],
        childArtifacts: ['portfolioitem/initiative', 'portfolioitem/feature', 'hierarchicalrequirement'],
        //canExpandFn: function(rec) {
          
        //},
        listeners: {
          append: function appened() {
            console.log("Appending Data");
            console.dir(arguments);
          }
        }
      });

      this.add(Ext.create('Ext.tree.Panel', {
        title: 'Simple Tree',
        width: '100%',
        height: '100%',
        componentCls: 'rally-grid',
        store: store,
        rootVisible: false,
        columns: [{
          xtype: 'treecolumn',
          text: 'Name',
          dataIndex: 'Name',
          flex: 2
        }, {
          text: 'Schedule State',
          dataIndex: 'ScheduleState',
          flex: 1
        }],
        listeners: {
          afteritemexpand: function (node, idx, elt, oOpt) {
            console.log("Expaned node", node);
          },
          load: function (store, node, recs, success, oOpt) {
            console.log("Loaded", success, recs, node);
            node.expand();
          }
        }
      }));
    }
  });
}(this));
