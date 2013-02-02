(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * The Ext.XTemplate used to render State fields, like user story ScheduleState and portfolio item State.
     */
    Ext.define('Rally.ui.renderer.template.ScheduleStateTemplate2', {
        requires: [],
        extend: 'Ext.XTemplate',

        config: {
            /**
             * @cfg {String} width define a width if necessary to fit where it's being used
             */
            width: '100%',

            /**
             * @cfg {Ext.data.Field} (required)
             * The state field on the model. E.g., ScheduleState field on the user story model.
             */
            field: undefined
        },

        constructor: function(config) {
            this.initConfig(config);
            var me = this;

            var templateConfig = [
                '<div class="schedule-state-wrapper {[this._addClsIfEditable(values)]}" style="width: {[this._getWidth()]}">',
                    '{[this._renderStates(values)]}',
                '</div>',
                {
                    _renderStates: function(recordData){
                        return me.renderStates(recordData);
                    },
                    _getWidth: function(){
                        return me.getWidth();
                    },
                    _addClsIfEditable: function(recordData) {
                        return recordData.updatable ?  'field-editable' : '';
                    }
                }
            ];

            return this.callParent(templateConfig);

        },

        renderStates: function(recordData) {
            var type = recordData._type.toLowerCase();

            console.log("Template Record Data", arguments);

            //if (type === "hierarchicalrequirement") {
            //} else if (type === "task") {
            //} else {
              //return "";
            //}

            var stateUsed = true;
            var returnVal = [];
            var states = Ext.Array.pluck(this.getField().allowedValues, 'StringValue');
            var currentState = recordData[this.getField().name];
            var blocked = recordData.Blocked;

            var blockWidth = Math.floor((95/(states.length))-3);

            Ext.each(states, function(state, index) {
                //don't add spacer at the front
                if(index !== 0 ) {
                    returnVal.push('<span class="schedule-state-spacer');

                    //make spacer blue if it's between selected states
                    if(stateUsed) {
                        returnVal.push(blocked ? ' blocked' : ' selected');
                    }

                    returnVal.push('"></span>');
                }

                //render an individual state block
                returnVal.push('<div class="schedule-state');

                if(stateUsed) {
                    returnVal.push(blocked ? ' blocked' : ' selected');
                }

                returnVal.push('" style="width:' + blockWidth + '%">&nbsp;</div>');

                //flip the switch so remaining states are gray
                if(state === currentState) {
                    stateUsed = false;
                }
            });

            returnVal.push('<div class="statename ellipses">');
            returnVal.push(currentState);
            returnVal.push('</div>');


            return returnVal.join('');
        }

    });

})();
