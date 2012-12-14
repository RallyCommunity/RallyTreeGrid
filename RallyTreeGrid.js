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
      var me = this;

      me.callParent(arguments);

      me.getView().on("beforedrop", Ext.bind(me._onBeforeDrop, me));
    },

    _onBeforeDrop: function _onBeforeDrop(elt, data, overModel, dropPosition, dropFunciton, eOpts) {
      console.log("On Before Drop", arguments);

      if (dropPosition === "append") {
        return this._appendNodes.apply(this, arguments);
      } else if ((dropPosition === "before") || (dropPosition === "after")) {
        return this._rerankNodes.apply(this, arguments);
      } else {
        return false;
      }
    },

    _appendNodes: function _appendNodes(elt, data, overModel, dropPosition, dropFunction, eOpts) {
      var me = this,
          recs,
          i, ii;

      if (!data) {
        return false;
      }

      

      return true;
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
