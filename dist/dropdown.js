(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.dropdown = mod.exports;
  }
})(this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  /**
   * Class representing a dropdown
   */
  var Dropdown =
  /*#__PURE__*/
  function () {
    _createClass(Dropdown, [{
      key: "_keyboardHandlers",
      get: function get() {
        var _this = this;

        return {
          // up arrow
          '38': function _(open, active) {
            return _this._go(true, open, active);
          },
          // down arrow
          '40': function _(open, active) {
            return _this._go(false, open, active);
          },
          // left arrow
          '37': function _(active, open) {
            if (active && active.parentElement !== _this.ul && active.parentElement.parentElement !== _this.ul) {
              active.classList.remove(Dropdown._activeClassName);
              active.parentElement.parentElement.classList.remove(Dropdown._openClassName);
              active.parentElement.parentElement.classList.add(Dropdown._activeClassName);
            } else if (open && open !== _this.ul) {
              Dropdown._closeRelated(open.parentElement);
            }
          },
          // right arrow
          '39': function _(active) {
            if (active && active.classList.contains(Dropdown._subnavClassName)) {
              Dropdown._openNested(active);

              active.querySelector('li').classList.add(Dropdown._activeClassName);
            }
          },
          // enter
          '13': function _(active) {
            return active && active.click();
          },
          // escape
          '27': this.dismiss
        };
      }
      /**
       * @constructor
       * @param {Array<Dropdown~NavItem|Dropdown~NavMenu|Dropdown~NavDivider>} navList - Object representation of the context menu.
       * @param {Dropdown~Options} options - Optional parameters for this instance
       */

    }], [{
      key: "_closeRelated",
      // Private static methods

      /**
       * A helper function to close all submenus on a given level.
       *
       * @private
       *
       * @param {Element} subnav - An element on the level we want to close all the open subnavs
       */
      value: function _closeRelated(subnav) {
        subnav.parentElement.querySelectorAll(".".concat(Dropdown._openClassName)).forEach(function (subnav) {
          subnav.classList.remove(Dropdown._openClassName);
        });
      }
      /**
       * A helper function to open a specific submenu
       *
       * @private
       *
       * @param {Element} subnav - The element of the subnav item we want to open
       */

    }, {
      key: "_openNested",
      value: function _openNested(subnav) {
        Dropdown._closeRelated(subnav);

        subnav.classList.add(Dropdown._openClassName);
        var ul = subnav.querySelector('ul');
        var rect = subnav.getBoundingClientRect();
        var ulRect = ul.getBoundingClientRect();

        if (rect.right + ulRect.width > window.innerWidth) {
          ul.style.left = '';
          ul.style.right = Dropdown._nestedXPos;
        } else {
          ul.style.right = '';
          ul.style.left = Dropdown._nestedXPos;
        }

        if (rect.top + ulRect.height > window.innerHeight) {
          ul.style.top = '';
          ul.style.bottom = Dropdown._nestedYPos;
        } else {
          ul.style.bottom = '';
          ul.style.top = Dropdown._nestedYPos;
        }
      }
    }, {
      key: "_baseClassName",
      // General documentation of the types

      /**
       * @typedef {Object} Dropdown~NavDivider
       * This is the structure of a navigation divider. It is just like the NavItem with no label or action.
       * @property {string}  [key] - A unique key for this item. It will be auto generated if not supplied
       */

      /**
       * @typedef {Object} Dropdown~NavItem
       * This is the structure of a navigation item
       * @property {string|function} label    - The label which is used in the menu. If it is a function it will be called
       *                                        every time the menu is opened and set the label to the return value of
       *                                        this function. The <code>this</code> object of the function is the
       *                                        Dropdown instance itself unless otherwise bound.
       * @property {string}  [icon]           - An icon to be used. This needs to be a path to a valid css
       *                                        background-image string.
       * @property {string}  [key]            - A unique key for this item. It will be auto generated if not supplied
       * @property {boolean} [disabled=false] - If this is true the item is disabled. When disabled we will not navigate
       *                                        according to the action parameter or run the action callback.
       * @property {(string|Dropdown~actionCallback)} action - What to do when we select this nav item. If this is a
       *                                                       string we will navigate like an &lt;a&gt; tag
       */

      /**
       * @typedef {Object} Dropdown~NavMenu
       * This is the structure of a navigation submenu
       * @property {string} label             - The label which is used in the menu
       * @property {string} [icon]            - An icon to be used. This needs to be a path to a valid css
       *                                        background-image string.
       * @property {string}  [key]            - A unique key for this item. It will be auto generated if not supplied
       * @property {boolean} [disabled=false] - If this is true the item is disabled. When disabled it will not be
       *                                        expanded
       * @property {Array<Dropdown~NavItem|Dropdown~NavMenu|Dropdown~NavDivider>} children - The children of this menu
       */

      /**
       * The action callback. The <code>this</code> context is the instance of the dropdown itself unless otherwise bound.
       * @callback Dropdown~actionCallback
       * @param {Event} event - This is the event (either click or keypress) which triggered this handler
       */

      /**
       * @typedef {Object} Dropdown~Options
       * This is the structure of the options object
       * @property {Dropdown~logger} [logger=console.log] - The logger to use
       * @property {Element} [element=document.body] - The element to attach the dropdown to
       */

      /**
       * The logging function. Use this if you want to expose internal logging information.
       * @callback Dropdown~logger
       * @param {...*} logItems - This should work similarly to how <code>console.log</code> uses multiple parameters
       */
      // Private members

      /**
       * Base class name
       *
       * @private
       */
      get: function get() {
        return 'dropdown';
      }
      /**
       * Class name of a subnav
       *
       * @private
       */

    }, {
      key: "_subnavClassName",
      get: function get() {
        return 'subnav';
      }
      /**
       * Class name of an open subnav
       *
       * @private
       */

    }, {
      key: "_openClassName",
      get: function get() {
        return 'open';
      }
      /**
       * Class name of a divider
       *
       * @private
       */

    }, {
      key: "_dividerClassName",
      get: function get() {
        return 'divider';
      }
      /*
       * Class name of an active item
       *
       * @private
       */

    }, {
      key: "_activeClassName",
      get: function get() {
        return 'active';
      }
      /**
       * Class name of a disabled item
       *
       * @private
       */

    }, {
      key: "_disabledClassName",
      get: function get() {
        return 'disabled';
      }
      /**
       * X-position (either positive or negative dependeing on space available) of a submenu. Relative to the parent item.
       *
       * @private
       */

    }, {
      key: "_nestedXPos",
      get: function get() {
        return '95%';
      }
      /**
       * Y-position (either positive or negative depending on space available) of a submenu. Relative to the parent item.
       *
       * @private
       */

    }, {
      key: "_nestedYPos",
      get: function get() {
        return '-0.2em';
      }
    }]);

    function Dropdown(navList) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Dropdown);

      this.dismiss = this.dismiss.bind(this);
      this._keyboardNavigation = this._keyboardNavigation.bind(this);
      this.logger = options.logger ? options.logger : console.log.bind(console); // eslint-disable-line no-console

      this.navList = navList;
      this._items = {};
      this.ul = this._createList(navList, 'item');
      this.ul.classList.add(Dropdown._baseClassName);
      this.context = options.context || document.body;
    }
    /**
     * A helper function to create the dom structure of the dropdown
     *
     * @private 
     *
     * @param navList {Array<Dropdown~NavItem|Dropdown~NavMenu|Dropdown~NavDivider>} The object representation of the context menu
     */


    _createClass(Dropdown, [{
      key: "_createList",
      value: function _createList(navList, keyPrefix) {
        var _this2 = this;

        var ul = document.createElement('ul');
        ul.addEventListener('click', function (e) {
          var key = e.target.getAttribute('data-key');

          if (!key || !_this2._items[key]) {
            return;
          }

          var _this2$_items$key = _this2._items[key],
              li = _this2$_items$key.li,
              navElt = _this2$_items$key.navElt;

          if (navElt.disabled || !navElt.label) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          if (navElt.children) {
            Dropdown._openNested(li);

            e.preventDefault();
            e.stopPropagation();
          } else if (typeof navElt.action === 'string') {
            window.location.href = navElt.action;
          } else if (typeof navElt.action === 'function') {
            navElt.action.call(_this2, e);
          }
        });
        navList.forEach(function (navElt, idx) {
          var li = document.createElement('li');
          navElt.key = navElt.key ? navElt.key : "".concat(keyPrefix, "-").concat(idx);

          if (_this2._items.hasOwnProperty(navElt.key)) {
            throw new Error('Got duplicate key');
          } else {
            _this2._items[navElt.key] = {
              navElt: navElt,
              li: li
            };
          }

          li.setAttribute('data-key', navElt.key);
          var divider = typeof navElt.label === 'undefined';

          if (navElt.disabled || divider) {
            li.classList.add(Dropdown._disabledClassName);
          }

          if (divider) {
            // divider
            li.classList.add(Dropdown._dividerClassName);
          } else if (typeof navElt.label === 'function') {
            li.innerText = navElt.label.call(_this2);
          } else {
            li.innerText = navElt.label;
          }

          if (navElt.icon) {
            li.style.backgroundImage = navElt.icon;
          } else if (navElt.iconClass) {
            var span = document.createElement('span');
            span.className = "".concat(navElt.iconClass, " icon");
            li.insertBefore(span, li.firstChild);
          }

          li.addEventListener('mouseleave', function (e) {
            _this2.logger('mouseleave', e);

            clearTimeout(_this2.timeout);
            e.target.classList.remove(Dropdown._activeClassName);
          });
          li.addEventListener('mouseenter', function (e) {
            _this2.logger('mouseenter', e);

            clearTimeout(_this2.timeout);

            if (navElt.disabled || divider) {
              _this2.timeout = setTimeout(Dropdown._closeRelated.bind(null, e.target), 500);
              return;
            }

            e.target.classList.add(Dropdown._activeClassName);
            clearTimeout(_this2.timeout);

            if (navElt.children) {
              _this2.timeout = setTimeout(Dropdown._openNested.bind(null, e.target), 500);
            } else {
              _this2.timeout = setTimeout(Dropdown._closeRelated.bind(null, e.target), 500);
            }
          });

          if (navElt.children) {
            li.appendChild(_this2._createList(navElt.children, navElt.key));
            li.classList.add(Dropdown._subnavClassName);
          }

          ul.appendChild(li);
        });
        return ul;
      }
    }, {
      key: "setDisabledState",
      value: function setDisabledState(key, disabled) {
        var _this$_items$key = this._items[key],
            li = _this$_items$key.li,
            navElt = _this$_items$key.navElt;
        navElt.disabled = disabled;

        if (disabled) {
          li.classList.add(Dropdown._disabledClassName);
          li.classList.remove(Dropdown._openClassName);
          li.classList.remove(Dropdown._activeClassName);
          li.querySelectorAll(".".concat(Dropdown._openClassName, ", .").concat(Dropdown._activeClassName)).forEach(function (elt) {
            elt.classList.remove(Dropdown._openClassName);
            elt.classList.remove(Dropdown._activeClassName);
          });
        } else {
          li.classList.remove(Dropdown._disabledClassName);
        }
      }
    }, {
      key: "_go",
      value: function _go(dirUp, active, open) {
        var getNext = function getNext(next) {
          if (dirUp) {
            return next.previousElementSibling;
          } else {
            return next.nextElementSibling;
          }
        };

        if (active) {
          active.classList.remove(Dropdown._activeClassName);
        }

        var next = active && getNext(active) || open.children[dirUp ? open.children.length - 1 : 0];

        while (next && next.classList.contains(Dropdown._disabledClassName)) {
          next = getNext(next);
        }

        if (next) {
          next.classList.add(Dropdown._activeClassName);
        }

        return next;
      }
      /**
       * This is the keyboard navigation event handler
       *
       * @private
       *
       * @param {Event} e - The keyboard event that triggerd this handler
       */

    }, {
      key: "_keyboardNavigation",
      value: function _keyboardNavigation(e) {
        var open = this.ul.querySelectorAll(".".concat(Dropdown._openClassName, " > ul"));

        if (open.length > 0) {
          open = open[open.length - 1];
        } else {
          open = this.ul;
        }

        var active = open.querySelector("li.".concat(Dropdown._activeClassName));
        this.logger(open);
        var key = "".concat(e.keyCode);

        if (this._keyboardHandlers.hasOwnProperty(key)) {
          e.stopPropagation();
          e.preventDefault();

          this._keyboardHandlers[key](active, open);
        }
      }
      /**
       * Update all labels where we have a function that generates the labels instead of a string
       *
       * @private
       */

    }, {
      key: "_updateLabels",
      value: function _updateLabels() {
        for (var key in this._items) {
          if (this._items.hasOwnProperty(key)) {
            var _this$_items$key2 = this._items[key],
                navElt = _this$_items$key2.navElt,
                li = _this$_items$key2.li;

            if (typeof navElt.label === 'function') {
              li.innerText = navElt.label.call(this);
            }
          }
        }
      } // Public methods

      /**
       * Close a dropdown and remove all event listeners on it
       */

    }, {
      key: "dismiss",
      value: function dismiss() {
        this.logger('dismiss');
        this.ul.classList.remove(Dropdown._openClassName);
        document.removeEventListener('keydown', this._keyboardNavigation);
        document.removeEventListener('click', this.dismiss);
        this.ul.querySelectorAll('li').forEach(function (subnav) {
          subnav.classList.remove(Dropdown._openClassName);
          subnav.classList.remove(Dropdown._activeClassName);
        });
      }
      /**
       * This function will take an event and try to open and position the dropdown next to the mouse pointer or the
       * element the event triggered on.
       *
       * @param {Event} evt     - The event that triggered this click
       * @param {any} [context] - Optional context which is set on the Dropdown instance when we open it. This can be
       *                          anything and is available through <code>this.context</code> on the action function
       */

    }, {
      key: "openClick",
      value: function openClick(evt) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        this.logger(evt);
        evt.stopPropagation();
        evt.preventDefault();

        if (evt.clientX && evt.clientY) {
          return this.open(window.pageXOffset + evt.clientX, window.pageYOffset + evt.clientY, true, context);
        }

        var rect = evt.target.getBoundingClientRect();
        return this.open(window.pageXOffset + rect.right, window.pageYOffset + rect.bottom, true, context);
      }
      /**
       * Open the dropdown rooted in the given position. It will expand down and to the right by default, but change
       * expansion direction if it does not have enough space.
       *
       * @param {Number} left                  - How many pixels from the left the element should be positioned
       * @param {Number} top                   - How many pixels from the top the element should be positioned
       * @param {boolean} [autoExpandDir=true] - If true we will automatically expand the dropdown towards the top or
       *                                         left if we don't have any space for it below or to the right. If false we
       *                                         will only expand down and to the right.
       * @param {any} [context]                - Optional context which is set on the Dropdown instance when we open it.
       *                                         This can be anything and is available through <code>this.context</code>
       *                                         on the action function
       */

    }, {
      key: "open",
      value: function open(left, top) {
        var autoExpandDir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

        if (!this.context.contains(this.ul)) {
          this.context.appendChild(this.ul);
        }

        this.context = context;

        this._updateLabels();

        this.ul.querySelectorAll(".".concat(Dropdown._openClassName, ",.").concat(Dropdown._activeClassName)).forEach(function (elt) {
          elt.classList.remove(Dropdown._openClassName);
          elt.classList.remove(Dropdown._activeClassName);
        });
        this.ul.classList.add(Dropdown._openClassName);
        var rect = this.ul.getBoundingClientRect();
        this.ul.style.left = "".concat(left, "px");
        this.ul.style.top = "".concat(top, "px");

        if (autoExpandDir) {
          if (left + rect.width >= window.pageXOffset + window.innerWidth) {
            this.ul.style.left = "".concat(left - rect.width, "px");
          }

          if (top + rect.height >= window.pageYOffset + window.innerHeight) {
            this.ul.style.top = "".concat(top - rect.height, "px");
          }
        }

        document.addEventListener('keydown', this._keyboardNavigation);
        document.addEventListener('click', this.dismiss);
        return this.ul;
      }
    }]);

    return Dropdown;
  }();

  var _default = Dropdown;
  _exports.default = _default;
});
//# sourceMappingURL=dropdown.js.map
