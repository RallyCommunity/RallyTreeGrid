(function (global) {

  Ext.define("Rally.ui.tree.grid.Panel", {
    extend: "Ext.tree.Panel",

    alias: "wiget.rallytreegrid",

    config: {
      width: "100%",

      height: "100%",

      componentCls: "rallytree rally-grid",

      rootVisible: false,

      lines: false,

      viewConfig: {
    		toggleOnDblClick: false,
    		plugins: { ptype: 'treeviewdragdrop' }
    	},

    },

    constructor: function rally_tree_grid_ctor(config) {

      this.callParent(arguments);

      this.getView().on("beforedrop", this._onBeforeDrop);
    },

    _onBeforeDrop: function _onBeforeDrop(elt, data, overModel, dropPosition, dropFunciton, eOpts) {
      console.log("On Before Drop", arguments);

      if (dropPosition === "append") {
        return this._appendNodes.call(this, arguments);
      } else if ((dropPosition === "before") || (dropPosition === "after")) {
        return this._rerankNodde.call(this, arguments);
      } else {
        return false;
      }
    },

    _appendNodes: function _appendNode(elt, data, overModel, dropPosition, dropFunction, eOpts) {
      var me = this,
          recs = data.records,
          i, ii;


    },

    _doReparentPI: function _doReparentPI(parentModel, childModel) {
    },

    _doReparentUS: function _doReparentUS(parentModel, childModel) {
    },

    _doReparentTA: function _doReparentTA(parentModel, childModel) {
    },

    _doReparentDE: function _doReparentDE(parentModel, childModel) {
    },

    _rerankNodes: function _rerankNode(elt, data, overModel, dropPosition, dropFunction, eOpts) {

    }

  });
}(this));
