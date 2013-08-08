(function (global) {
  var appID = window.location.hash.split("/")[4];
  
  if (!appID) {
    appID = "0000000";
  }

  Ext.tree.ViewDropZone.prototype.getPosition = function(e, node) {
      var view = this.view,
          record = view.getRecord(node),
          y = e.getPageY(),
          noAppend = false, // removed check for isLeaf
          noBelow = false,
          region = Ext.fly(node).getRegion(),
          fragment;

      // If we are dragging on top of the root node of the tree, we always want to append.
      if (record.isRoot()) {
          return 'append';
      }

      // Return 'append' if the node we are dragging on top of is not a leaf else return false.
      if (this.appendOnly) {
          return noAppend ? false : 'append';
      }

      if (!this.allowParentInsert) {
          noBelow = record.hasChildNodes() && record.isExpanded();
      }

      fragment = (region.bottom - region.top) / (noAppend ? 2 : 3);
      if (y >= region.top && y < (region.top + fragment)) {
          return 'before';
      }
      else if (!noBelow && (noAppend || (y >= (region.bottom - fragment) && y <= region.bottom))) {
          return 'after';
      }
      else {
          return 'append';
      }
  };

  Ext.tree.View.prototype.getCellCls = function(record, column) {
      return Rally.ui.grid.CellClsDecorator.getCellCls(record, column);
  };

  Ext.define("Rally.ui.tree.grid.Panel", {
    extend: "Ext.tree.Panel",

    alias: "wiget.rallytreegrid",

    mixins: {
      messageable: "Rally.Messageable"
    },

    plugins: [
      { ptype: "rallyrefreshviewoncolumnchangeplugin" }
    ],

    config: {
      width: "100%",

      height: "100%",

      componentCls: "rallytree rally-grid",

      rootVisible: false,

      lines: false,

      viewConfig: {
        toggleOnDblClick: false,
        plugins: [
          { ptype: 'treeviewdragdrop' }
        ]
      }

    },

    treeColumnCfg: {
      xtype: 'treecolumn',
      text: 'ID',
      dataIndex: 'FormattedID',
      flex: 1
    },

    constructor: function rally_tree_grid_ctor(config) {
      var me = this,
          autoGenColumns,
          i, ii;

      if (config.columnCfgs && config.models) {
        config.columns = [me.treeColumnCfg];
        for (i = 0, ii = config.models.length; i < ii; i++) {
          autoGenColumns = Ext.create('Rally.ui.grid.ColumnBuilder')
            .withDefaultColumns(config.columnCfgs)
            .shouldAutoAddAllModelFieldsAsColumns(true)
            .build(config.models[i].superclass);

          //console.log("Auto Columns", autoGenColumns);
          config.columns = config.columns.concat(autoGenColumns);
        }
      }

      //this.plugins.push({ ptype: "rallycellediting", messageBus: this._getMessageBus() });

      delete config.models;
      delete config.columCfgs;

      //console.log("Column Config", config.columns);
      me.callParent(arguments);

      //console.log("Version", Ext.getVersion().version);

      me.getView().on("nodedragover", Ext.bind(me._canDragDrop, me)); // Waiting on 4.1.2
      me.getView().on("beforedrop", Ext.bind(me._onBeforeDrop, me));
    },


    _canDragDrop: function _canDragDrop(targetNode, position, dragData) {
      //console.log("Can Drag Drop", arguments);

      var rec = dragData.records[0],
          targetType,
          targetOrd = -1,
          sourceType,
          sourceOrd = -1;

      targetType = targetNode.raw._type.toLowerCase();
      sourceType = rec.raw._type.toLowerCase();

      if (targetType.indexOf("portfolioitem") >= 0) {
        targetOrd = targetNode.self.superclass.self.ordinal;
        targetType = targetType.split("/")[0];
      }

      if (sourceType.indexOf("portfolioitem") >= 0) {
        sourceOrd = rec.self.superclass.self.ordinal;
        sourceType = sourceType.split("/")[0];
      }

      if (sourceType === targetType === "portfolioitem") {
        if (targetOrd === sourceOrd + 1) {
          return true;
        } else {
          return false;
        }
      }

      if (sourceType === "hierarchicalrequirement") {
        if (targetType === "portfolioitem") {
          if (targetOrd === 0) {
            return true;
          } else {
            return false;
          }
        } else if (targetType === "hierarchicalrequriement") {
          return true;
        } else {
          return false;
        }
      }

      return false;
    },

    _onBeforeDrop: function _onBeforeDrop(elt, data, overModel, dropPosition, dropFunciton, eOpts) {
      //console.log("On Before Drop", arguments);
      var success = false;

      if (dropPosition === "append") {
        success = this._appendNodes.apply(this, arguments);
        overModel.data.leaf = false;
      } else if ((dropPosition === "before") || (dropPosition === "after")) {
        success = this._rerankNodes.apply(this, arguments);
      }

      return success;
    },

    _appendNodes: function _appendNodes(elt, data, overModel, dropPosition, dropFunction, eOpts) {
      var me = this,
          recs,
          success = true,
          i, ii,
          type;

      if (!data) {
        return false;
      }

      recs = data.records;
      for (i = 0, ii = recs.length; i < ii; i++) {
        type = recs[i].raw._type.toLowerCase();
        if (type.indexOf("portfolioitem") >= 0) {
          success = success && this._doReparentPI(overModel, recs[i]);
        } else if (type === "hierarchicalrequirement") {
          success = success && this._doReparentUS(overModel, recs[i]);
        } else if (type === "defect") {
          success = success && this._doReparentDE(overModel, recs[i]);
        } else if (type === "task") {
          success = success && this._doReparentTA(overModel, recs[i]);
        } else {
          success = false; // I don't know what you are
          //console.log("Don't know how to reparent this model", recs[i]);
        }
      }

      return success;
    },

    _doReparentPI: function _doReparentPI(parentModel, childModel) {
      var parentOrd,
          childOrd,
          parentTypeName,
          childTypeName;

      parentOrd = parentModel.self.superclass.self.ordinal;
      childOrd = childModel.self.superclass.self.ordinal;

      if (parentOrd !== childOrd + 1) {
        parentTypeName = parentModel.self.superclass.self.elementName;
        childTypeName = childModel.self.superclass.self.elementName;

        //Rally.ui.flair.FlairManager.showFlair({message: "A " + childTypeName + " cannot be the child of a " + parentTypeName});
        return false;
      } else {
        childModel.set("Parent", parentModel.raw._ref);
        childModel.save();
      }

      return true;
    },

    _doReparentUS: function _doReparentUS(parentModel, childModel) {
      var parentTypeName,
          parentOrd = -1;

      parentTypeName = parentModel.raw._type.toLowerCase();
      if (parentTypeName.indexOf("portfolioitem") >= 0) {
        parentOrd = parentModel.self.superclass.self.ordinal;
        if (parentOrd > 0) {
          return false;
        }

        childModel.set("PortfolioItem", parentModel.raw._ref);
        childModel.save();
      } else if (parentTypeName === "hierarchicalrequirement") {
        childModel.set("Parent", parentModel.raw._ref);
        childModel.save();
      } else {
        return false;
      }

      return true;
    },

    _doReparentTA: function _doReparentTA(parentModel, childModel) {
      if ({
        hierarchicalrequirement: 1, 
        defect: 1,
        defectsuite: 1,
        testset: 1}.hasOwnProperty(parentModel.raw._type.toLowerCase())) {

        if (parentModel.get("Children").length === 0) {
          childModel.set("WorkProduct", parentModel.raw._ref);
          childModel.save();

          return true;
        }
      }

      return false;
    },

    _doReparentDE: function _doReparentDE(parentModel, childModel) {
      var parentType = parentModel.raw._type.toLowerCase();
      if (parentType === "hierarchicalrequirement") {
        childModel.set("Requirement", parentModel.raw._ref);
        childModel.save();
        return true;
      } else if (parentType === "defectsuite") {
        childModel.set("DefectSuite", parentModel.raw._ref);
        childModel.save();
        return true;
      }

      return false;
    },

    _rerankNodes: function _rerankNode(elt, data, overModel, dropPosition, dropFunction, eOpts) {
      //console.log("ReRank", arguments);

      var rankType = dropPosition === "after" ? "rankBelow" : "rankAbove",
          params = {};

      params[rankType] = Rally.util.Ref.getRelativeUri(overModel.raw._ref);

      data.records[0].save({
        params: params
      });

      return true;
    }

  });
}(this));
