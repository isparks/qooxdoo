/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Radio buttons can be used in radio groups to allow to the user to select
 * exactly one item from a list. Radio groups are established by adding
 * radio buttons to a radio manager {@link qx.ui.form.RadioGroup}.
 *
 * Example:
 * <pre class="javascript">
 *   var container = new qx.ui.container.Composite(new qx.ui.layout.VBox);
 *
 *   var female = new qx.ui.form.RadioButton("female");
 *   var male = new qx.ui.form.RadioButton("male");
 *
 *   var mgr = new qx.ui.form.RadioGroup();
 *   mgr.add(female, male);
 *
 *   container.add(male);
 *   container.add(female);
 * </pre>
 */
qx.Class.define("qx.ui.form.RadioButton",
{
  extend : qx.ui.form.Button,
  include : [
    qx.ui.form.MForm,
    qx.ui.form.MModelProperty
  ],
  implement : [
    qx.ui.form.IRadioItem,
    qx.ui.form.IForm,
    qx.ui.form.IBooleanForm,
    qx.ui.form.IModel
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String?null} An optional label for the radio button.
   */
  construct : function(label)
  {
    if (qx.core.Variant.isSet("qx.debug", "on")) {
      this.assertArgumentsCount(arguments, 0, 1);
    }

    this.base(arguments, label);

    // Add listeners
    this.addListener("execute", this._onExecute);
    this.addListener("keypress", this._onKeyPress);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
    group :
    {
      check  : "qx.ui.form.RadioGroup",
      nullable : true,
      apply : "_applyGroup"
    },

    /** The value of the widget. True, if the widget is checked. */
    value :
    {
      check : "Boolean",
      nullable : true,
      event : "changeValue",
      apply : "_applyValue",
      init: false
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "radiobutton"
    },

    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events : {
    /**
     * The old checked change event. Please use the value property instead.
     * @deprecated
     */
    "changeChecked" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyValue : function(value, old)
    {
      value ?
        this.addState("checked") :
        this.removeState("checked");

      if (value && this.getFocusable()) {
        this.focus();
      }

      // @deprecated
      this.fireDataEvent("changeChecked", value, old);
    },


    // property apply
    _applyGroup : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for the "execute" event.
     *
     * Sets the property "checked" to true.
     *
     * @param e {qx.event.type.Event} execute event
     * @return {void}
     */
    _onExecute : function(e) {
      this.setValue(true);
    },


    /**
     * Event listener for the "keyPress" event.
     *
     * Selects the previous RadioButton when pressing "Left" or "Up" and
     * Selects the next RadioButton when pressing "Right" and "Down"
     *
     * @param e {qx.event.type.KeySequence} KeyPress event
     * @return {void}
     */
    _onKeyPress : function(e)
    {

      var grp = this.getGroup();
      if (!grp) {
        return;
      }

      switch(e.getKeyIdentifier())
      {
        case "Left":
        case "Up":
          grp.selectPrevious();
          break;

        case "Right":
        case "Down":
          grp.selectNext();
          break;
      }
    },



    /*
    ---------------------------------------------------------------------------
      DEPRECATED STUFF
    ---------------------------------------------------------------------------
    */
    /**
     * Old set method for the checked property. Please use the value
     * property instead.
     *
     * @param value {String} The value of the label.
     * @deprecated
     */
    setChecked: function(value) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.setValue(value);
    },


    /**
     * Old is method for the checked property. Please use the value property
     * instead.
     *
     * @deprecated
     */
    isChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      return this.getValue();
    },


    /**
     * Old toggle method for the checked property. Please use the value property
     * instead.
     *
     * @deprecated
     */
    toggleChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.setValue(!this.getValue());
    },


    /**
     * Old get method for the checked property. Please use the value
     * property instead.
     *
     * @deprecated
     */
    getChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      return this.getValue();
    },


    /**
     * Old reset method for the checked property. Please use the value
     * property instead.
     *
     * @deprecated
     */
    resetChecked: function() {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee, "Please use the value property instead."
      );

      this.resetValue();
    },


    // overridden
    addListener: function(type, listener, self, capture) {
      if (type == "changeChecked") {
        qx.log.Logger.deprecatedEventWarning(
          arguments.callee,
          "changeChecked",
          "Please use the changeValue event instead."
        );
      }
      return this.base(arguments, type, listener, self, capture);
    }
  }
});
