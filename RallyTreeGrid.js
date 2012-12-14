(function (global) {

  Ext.define("Rally.tree.Panel", {
    extend: "Ext.tree.Panel",

    alias: "wiget.rallytreegrid",

    config: {
      width: "100%",

      height: "100%",

      componentCls: "rallytree rally-grid",

      rootVisible: false,

      lines: false
    },

    constructor: function rally_tree_grid_ctor(config) {

      this.callParent(arguments);
    }

}(this));
