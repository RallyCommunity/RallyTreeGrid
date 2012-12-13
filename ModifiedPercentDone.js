(function (global) {

  Ext.define("Rally.ui.renderer.template.PercentDoneByStoryPlanEstimateTemplate2", {
    extend: 'Ext.XTemplate',

    config: {
        /**
         * @cfg {String} width define a width if necessary to fit where it's being used
         */
        width: '100%',
        /**
         * @cfg {String} height define a height if necessary to fit where it's being used
         */
        height: '20px',
        /**
         * @cfg {String} percentDoneName sometimes it's necessary to name the variable used as the percent done replacement in the template,
         * like in a grid when a record is used to render the template. The record's field name might be 'PercentDoneByStoryCount', not 'percentDone'
         */
        /**
         * @cfg {Function} showDangerNotificationFn A function that should return true to show a triangle in the top right to denote something is missing.
         * Defaults to:
         *      function(){ return false; }
         */
        showDangerNotificationFn: function() {
          return false;
        },

        percentDoneName: "PercentDoneByStoryPlanEstimate",

        showDangerNotificationFn: function (recordData) {
          return (!recordData.PlannedEndDate && !recordData.ActualEndDate) || recordData.UnEstimatedLeafStoryCount > 0;
        },

        /**
         * @cfg {Boolean} If the percent done is 0%, do not show the bar at all
         */
        showOnlyIfInProgress: false
    },

    constructor: function(config) {
        this.initConfig(config);
        config = this.config;
        var me = this;
        var templateConfig = [
            '<tpl if="this.shouldShowPercentDone(values)">',
            '<div class="percentDoneContainer field-{[this.getPercentDoneName()]}" style="width: ' + config.width + '; height: ' + config.height + '; line-height: ' + config.height + '">',
            '<div class="percentDoneBar" style="background-color: {[this.calculateColor(values)]}; width: {[this.calculatePercent(values)]}; "></div>',
            '<tpl if="this.showDangerNotification(values)"><div class="percentDoneDangerNotification"></div></tpl>',
            '<div class="percentDoneLabel">',
            '{[this.calculatePercent(values)]}',
            '</div>',
            '</div>',
            '</tpl>',
            {
                shouldShowPercentDone: function(recordData) {
                  if (!Ext.isNumber(recordData[config.percentDoneName])) {
                    return false;
                  }

                  if (config.showOnlyIfInProgress) {
                    return recordData[config.percentDoneName] > 0;
                  } else {
                    return true;
                  }
                },
                calculatePercent: function(recordData) {
                    var percentDone = recordData[config.percentDoneName];
                    return Math.round(percentDone * 100) + '%';
                },
                calculateColor: function(recordData) {
                    var colorObject = Rally.util.HealthColorCalculator.calculateHealthColorForPortfolioItemData(recordData, me.getPercentDoneName());
                    return colorObject.hex;
                },
                showDangerNotification: config.showDangerNotificationFn
            }];
        /**
         * @param {Date}  config.startDate  (days since the epoch or date type where Tomorrow()-Today() = 1.0 (real))
         * @param {Date} config.endDate (same type as startDate)
         * @param {Date} config.asOfDate (same type as startDate) - Most often today. The naming of
         * @param {Boolean} config.inProgress
         */
        return this.callParent(templateConfig);
    }
  });

}(this));
