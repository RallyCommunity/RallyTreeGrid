Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        //Write app code here
        Rally.data.TreeModelFactory.getModel({
          //type: 'hierarchicalrequirement',
          type: 'portfolioitem/theme',
          success: function onSuccess(res) {
            console.dir(res);

            var rec = Ext.create(res);

            console.dir(rec);
            console.log("Parent names", res.getParentFieldNames());
            console.log("Child names", res.getChildFieldNames());
          }
        });

        var store = Ext.create('Ext.data.TreeStore', {
          root: {
              expanded: true,
              children: [
                  { text: "detention", leaf: true },
                  { text: "homework", expanded: true, children: [
                      { text: "book report", leaf: true },
                      { text: "alegrbra", leaf: true}
                  ] },
                  { text: "buy lottery tickets", leaf: true }
              ]
          }
      });

      this.add(Ext.create('Ext.tree.Panel', {
          title: 'Simple Tree',
          width: 200,
          height: 150,
          store: store,
          rootVisible: false,
      }));
    }
});
