Rally Tree Grid
===============

The Rally Tree Grid is a collection of ExtJS components to use the
Ext.tree.Panel component.  There is also a subclass of Ext.tree.Panel
that uses the default configuration to theme the Tree Grid.

To build the examples you will need to copy them from the examples
folder and rename/override the App.js file.  My general command to build
(on my Mac) is:

```bash
cp examples/US.js App.js && rake build && cat deploy/App.html | pbcopy
```

That line will copy the file, build the deployable html file and copy
the contents to the clipboard.

Classes Created
---------------

* Rally.data.TreeRootModel
* Rally.data.TreeModelFactory
* Rally.data.WsapiTreeProxy
* Rally.data.WsapiTreeStore
* Rally.ui.tree.grid.Panel

Screencast Demo
---------------

http://screencast.com/t/NnMDX85xDze

Screenshot
----------

![Rally Tree Grid Screenshot](https://raw.github.com/RallyCommunity/RallyTreeGrid/master/deploy/RallyTreeGrid.png)

Example
-------

### Portfolio Item Themes down to Tasks

```javascript

Ext.define('CustomApp', {
  extend: 'Rally.app.App',
  componentCls: 'app',

  launch: function() {
    var store = Ext.create('Rally.data.WsapiTreeStore', {
      topLevelModels: ['portfolioitem/theme' ],
      childModels: ['portfolioitem/initiative', 'portfolioitem/feature', 'hierarchicalrequirement', 'task'],
    });

    this.add(Ext.create('Rally.ui.tree.grid.Panel', {
      store: store,
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
```

### User Stories to Tasks with Paging
```javascript
Ext.define('CustomApp', {
  extend: 'Rally.app.App',
  componentCls: 'app',

  launch: function() {
    var store = Ext.create('Rally.data.WsapiTreeStore', {
      topLevelModels: ['hierarchicalrequirement'],
      childModels: ['hierarchicalrequirement', 'task'],
      }
    });

    this.add(Ext.create('Rally.ui.tree.grid.Panel', {
      store: store,
      dockedItems: [{
        xtype: 'rallypagingtoolbar',
        store: store,   // same store GridPanel is using
        dock: 'bottom',
        displayInfo: true
      }],
      columns: [{
        xtype: 'treecolumn',
        text: 'Name',
        dataIndex: 'Name',
        flex: 2
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
```
