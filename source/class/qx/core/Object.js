/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 *
 * * object management (creation and destruction)
 * * interfaces for event system
 * * generic setter/getter support
 * * interfaces for logging console
 * * user friendly OO interfaces like {@link #self} or {@link #base}
 *
 * @require(qx.core.ObjectRegistry)
 */
qx.Class.define("qx.core.Object", {
  extend: Object,
  include: qx.core.Environment.filter({
    "module.databinding": qx.data.MBinding,
    "module.logger": qx.core.MLogging,
    "module.events": qx.core.MEvent,
    "module.property": qx.core.MProperty,
    "module.objectid": qx.core.MObjectId,
    "qx.debug": qx.core.MAssert
  }),

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   */
  construct() {},

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /** Internal type */
    $$type: "Object"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __Property: qx.core.Environment.get("module.property")
      ? qx.core.Property
      : null,

    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * Return unique hash code of object
     *
     * @return {String} unique hash code of the object
     */
    toHashCode() {
      if (!this.$$hash && !this.$$disposed) {
        if (
          !qx.core.Environment.get("qx.automaticMemoryManagement") ||
          qx.Class.hasInterface(this.constructor, qx.core.IDisposable)
        ) {
          qx.core.ObjectRegistry.register(this);
        } else {
          qx.core.ObjectRegistry.toHashCode(this);
        }
      }
      return this.$$hash;
    },

    /**
     * Returns a UUID for this object
     *
     * @return {String} a UUID
     */
    toUuid() {
      if (!this.$$uuid) {
        this.$$uuid = qx.util.Uuid.createUuidV4();
      }

      return this.$$uuid;
    },

    /**
     * Sets a UUID; normally set automatically, you would only set this manually
     * if you have a very special reason to do so - for example, you are using UUIDs which are
     * synchronized from a special source, eg remote server.
     *
     * This can only be called once, and only if it has not been automatically allocated.  If
     * you really do need to call this, call it as soon after construction as possible to avoid
     * an exception.
     *
     * @param uuid {String} an ID which is unique across the whole application
     */
    setExplicitUuid(uuid) {
      if (Boolean(this.$$uuid)) {
        throw new Error("Cannot change the UUID of an object once set");
      }
      this.$$uuid = uuid;
    },

    /**
     * Returns a string representation of the qooxdoo object.
     *
     * @return {String} string representation of the object
     */
    toString() {
      return this.classname + "[" + this.toHashCode() + "]";
    },

    /**
     * Call the same method of the super class.
     *
     * Either the compiler translate all calls to this.base
     * into mypkg.MyBaseClass.prototype.myMethod.call(this, 123);
     * this method is still needed for use in compile.js or playground
     * which are not precompiled
     *
     * @param args {IArguments} the arguments variable of the calling method
     * @param varargs {var?} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base(args, varargs) {
      var func = args.callee.base;
      if (!func) {
        func = this[args.callee.name].base;
      }

      if (qx.core.Environment.get("qx.debug")) {
        if (!qx.Bootstrap.isFunctionOrAsyncFunction(func)) {
          throw new Error(
            "Cannot call super class. Method is not derived: " +
              args.callee.displayName
          );
        }
      }

      if (arguments.length === 1) {
        return func.call(this);
      } else {
        return func.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },

    /**
     * Returns the static class (to access static members of this class)
     *
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self(args) {
      return args.callee.self;
    },

    /*
    ---------------------------------------------------------------------------
      CLONE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     *
     * Returns a clone of this object. Copies over all user configured
     * property values. Do not configure a parent nor apply the appearance
     * styles directly.
     *
     * @return {qx.core.Object} The clone
     */
    clone() {
      if (!qx.core.Environment.get("module.property")) {
        throw new Error("Cloning only possible with properties.");
      }

      var clazz = this.constructor;
      var clone = new clazz();
      var props = qx.Class.getProperties(clazz);
      var user = this.__Property.$$store.user;
      var setter = this.__Property.$$method.set;
      var name;

      // Iterate through properties
      for (var i = 0, l = props.length; i < l; i++) {
        name = props[i];
        if (this.hasOwnProperty(user[name])) {
          clone[setter[name]](this[user[name]]);
        }
      }

      // Return clone
      return clone;
    },

    /*
    ---------------------------------------------------------------------------
      USER DATA
    ---------------------------------------------------------------------------
    */

    /** @type {Map} stored user data */
    __userData: null,

    /**
     * Store user defined data inside the object.
     *
     * @param key {String} the key
     * @param value {Object} the value of the user data
     */
    setUserData(key, value) {
      if (!this.__userData) {
        this.__userData = {};
      }

      this.__userData[key] = value;
    },

    /**
     * Load user defined data from the object
     *
     * @param key {String} the key
     * @return {Object} the user data
     */
    getUserData(key) {
      if (!this.__userData) {
        return null;
      }
      var data = this.__userData[key];
      return data === undefined ? null : data;
    },

    /**
     * Clears all user defined data from the object.
     */
    resetUserData() {
      this.__userData = null;
    },

    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns true if the object is disposed.
     *
     * @return {Boolean} Whether the object has been disposed
     */
    isDisposed() {
      return this.$$disposed || false;
    },

    /**
     * Returns true if the object is being disposed, ie this.dispose() has started but
     * not finished
     *
     * @return {Boolean} Whether the object is being disposed
     */
    isDisposing() {
      return this.$$disposing || false;
    },

    /**
     * Dispose this object
     *
     */
    dispose() {
      // Check first
      if (this.$$disposed) {
        return;
      }

      // Mark as disposed (directly, not at end, to omit recursions)
      this.$$disposed = true;
      this.$$disposing = true;
      this.$$instance = null;
      this.$$allowconstruct = null;

      // Debug output
      if (qx.core.Environment.get("qx.debug")) {
        if (qx.core.Environment.get("qx.debug.dispose.level") > 2) {
          qx.Bootstrap.debug(
            this,
            "Disposing " + this.classname + "[" + this.toHashCode() + "]"
          );
        }
      }

      // Remove all listeners.
      //
      // This must be done early, since it calls
      // qx.core.ObjectRegistry.toHashCode(target) which would add a
      // hash code back in after code here has cleaned it up.
      qx.event.Registration.removeAllListeners(this);

      // Deconstructor support for classes
      var clazz = this.constructor;
      var mixins;

      while (clazz.superclass) {
        // Processing this class...
        if (clazz.$$destructor) {
          clazz.$$destructor.call(this);
        }

        // Destructor support for mixins
        if (clazz.$$includes) {
          mixins = clazz.$$flatIncludes;

          for (var i = 0, l = mixins.length; i < l; i++) {
            if (mixins[i].$$destructor) {
              mixins[i].$$destructor.call(this);
            }
          }
        }

        // Jump up to next super class
        clazz = clazz.superclass;
      }

      this.$$disposing = false;

      // Additional checks
      if (qx.core.Environment.get("qx.debug")) {
        if (qx.core.Environment.get("qx.debug.dispose.level") > 0) {
          var key, value;
          for (key in this) {
            value = this[key];

            // Check for Objects but respect values attached to the prototype itself
            if (
              value !== null &&
              typeof value === "object" &&
              !qx.Bootstrap.isString(value)
            ) {
              // Check prototype value
              // undefined is the best, but null may be used as a placeholder for
              // private variables (hint: checks in qx.Class.define). We accept both.
              if (this.constructor.prototype[key] != null) {
                continue;
              }

              if (qx.core.Environment.get("qx.debug.dispose.level") > 1) {
                qx.Bootstrap.warn(
                  this,
                  "Missing destruct definition for '" +
                    key +
                    "' in " +
                    this.classname +
                    "[" +
                    this.toHashCode() +
                    "]: " +
                    value
                );

                delete this[key];
              }
            }
          }
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} Names of fields (which store objects) to dispose
     */
    _disposeObjects(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, arguments);
    },

    /**
     * Disconnects and disposes given singleton objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} Names of fields (which store objects) to dispose
     */
    _disposeSingletonObjects(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, arguments, true);
    },

    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param field {String} Name of the field which refers to the array
     */
    _disposeArray(field) {
      qx.util.DisposeUtil.disposeArray(this, field);
    },

    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param field {String} Name of the field which refers to the map
     */
    _disposeMap(field) {
      qx.util.DisposeUtil.disposeMap(this, field);
    }
  },

  /*
  *****************************************************************************
     ENVIRONMENT SETTINGS
  *****************************************************************************
  */

  environment: {
    "qx.debug.dispose.level": 0,

    // Ideally this would be in the mixin, but mixins do not support environment blocks
    // Also, this would be better as false, not true but that would not be BC
    "qx.core.Object.allowUndefinedObjectId": true
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    if (qx.core.Environment.get("module.events")) {
      if (!qx.core.ObjectRegistry.inShutDown) {
        // Cleanup event listeners
        qx.event.Registration.removeAllListeners(this);
      } else {
        // on shutdown, just clear the internal listener map
        qx.event.Registration.deleteAllListeners(this);
      }
    }

    // Cleanup object registry
    qx.core.ObjectRegistry.unregister(this);

    // Cleanup user data
    this.__userData = null;

    // only of properties are available
    if (qx.core.Environment.get("module.property")) {
      // Cleanup properties
      var clazz = this.constructor;
      var properties;
      var store = this.__Property.$$store;
      var storeUser = store.user;
      var storeTheme = store.theme;
      var storeInherit = store.inherit;
      var storeUseinit = store.useinit;
      var storeInit = store.init;

      while (clazz) {
        properties = clazz.$$properties;
        if (properties) {
          for (var name in properties) {
            if (properties[name].dereference) {
              this[storeUser[name]] =
                this[storeTheme[name]] =
                this[storeInherit[name]] =
                this[storeUseinit[name]] =
                this[storeInit[name]] =
                  undefined;
            }
          }
        }

        clazz = clazz.superclass;
      }
    }
  }
});
