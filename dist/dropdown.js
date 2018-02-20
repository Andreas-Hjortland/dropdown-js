(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.dropdown = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Dropdown = function () {
        _createClass(Dropdown, [{
            key: '_keyboardHandlers',
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
        }], [{
            key: '_closeRelated',
            value: function _closeRelated(subnav) {
                subnav.parentElement.querySelectorAll('.' + Dropdown._openClassName).forEach(function (subnav) {
                    subnav.classList.remove(Dropdown._openClassName);
                });
            }
        }, {
            key: '_openNested',
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
            key: '_baseClassName',
            get: function get() {
                return 'dropdown';
            }
        }, {
            key: '_subnavClassName',
            get: function get() {
                return 'subnav';
            }
        }, {
            key: '_openClassName',
            get: function get() {
                return 'open';
            }
        }, {
            key: '_dividerClassName',
            get: function get() {
                return 'divider';
            }
        }, {
            key: '_activeClassName',
            get: function get() {
                return 'active';
            }
        }, {
            key: '_disabledClassName',
            get: function get() {
                return 'disabled';
            }
        }, {
            key: '_nestedXPos',
            get: function get() {
                return '95%';
            }
        }, {
            key: '_nestedYPos',
            get: function get() {
                return '-0.2em';
            }
        }]);

        /**
         * @constructor
         * @param {Array<Dropdown~NavItem|Dropdown~NavMenu|Dropdown~NavDivider>} navList - Object representation of the context menu.
         * @param {Dropdown~Options} options - Optional parameters for this instance
         */
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

            (options.context ? options.context : document.body).appendChild(this.ul);
        }

        /**
         * A helper function to create the dom structure of the dropdown
         *
         * @private 
         *
         * @param navList {Array<Dropdown~NavItem|Dropdown~NavMenu|Dropdown~NavDivider>} The object representation of the context menu
         */


        _createClass(Dropdown, [{
            key: '_createList',
            value: function _createList(navList, keyPrefix) {
                var _this2 = this;

                var ul = document.createElement('ul');

                var that = this;
                ul.addEventListener('click', function (e) {
                    var key = e.target.getAttribute('data-key');
                    if (!key || !that._items[key]) {
                        return;
                    }
                    var _that$_items$key = that._items[key],
                        li = _that$_items$key.li,
                        navElt = _that$_items$key.navElt;


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
                        navElt.action.call(this, e);
                    }
                });

                navList.forEach(function (navElt, idx) {
                    var li = document.createElement('li');

                    navElt.key = navElt.key ? navElt.key : keyPrefix + '-' + idx;
                    if (_this2._items.hasOwnProperty(navElt.key)) {
                        throw new Error('Got duplicate key');
                    } else {
                        _this2._items[navElt.key] = { navElt: navElt, li: li };
                    }
                    li.setAttribute('data-key', navElt.key); // only used for debugging

                    var divider = typeof navElt.label === 'undefined';
                    if (navElt.disabled || divider) {
                        li.classList.add(Dropdown._disabledClassName);
                    }
                    if (divider) {
                        // divider
                        li.classList.add(Dropdown._dividerClassName);
                    } else {
                        li.innerText = navElt.label;
                    }

                    if (navElt.icon) {
                        li.style.backgroundImage = navElt.icon;
                    } else if (navElt.iconClass) {
                        var span = document.createElement('span');
                        span.className = navElt.iconClass + ' icon';
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
            key: 'setDisabledState',
            value: function setDisabledState(key, disabled) {
                var _items$key = this._items[key],
                    li = _items$key.li,
                    navElt = _items$key.navElt;

                navElt.disabled = disabled;
                if (disabled) {
                    li.classList.add(Dropdown._disabledClassName);
                    li.classList.remove(Dropdown._openClassName);
                    li.classList.remove(Dropdown._activeClassName);

                    li.querySelectorAll('.' + Dropdown._openClassName + ', .' + Dropdown._activeClassName).forEach(function (elt) {
                        elt.classList.remove(Dropdown._openClassName);
                        elt.classList.remove(Dropdown._activeClassName);
                    });
                } else {
                    li.classList.remove(Dropdown._disabledClassName);
                }
            }
        }, {
            key: '_go',
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
        }, {
            key: '_keyboardNavigation',
            value: function _keyboardNavigation(e) {
                var open = this.ul.querySelectorAll('.' + Dropdown._openClassName + ' > ul');
                if (open.length > 0) {
                    open = open[open.length - 1];
                } else {
                    open = this.ul;
                }
                var active = open.querySelector('li.' + Dropdown._activeClassName);
                this.logger(open);

                var key = '' + e.keyCode;
                if (this._keyboardHandlers.hasOwnProperty(key)) {
                    e.stopPropagation();
                    e.preventDefault();
                    this._keyboardHandlers[key](active, open);
                }
            }
        }, {
            key: 'dismiss',
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
        }, {
            key: 'openClick',
            value: function openClick(evt) {
                this.logger(evt);
                evt.stopPropagation();
                evt.preventDefault();
                if (evt.clientX && evt.clientY) {
                    return this.open(window.pageXOffset + evt.clientX, window.pageYOffset + evt.clientY, true);
                }

                var rect = evt.target.getBoundingClientRect();
                return this.open(window.pageXOffset + rect.right, window.pageYOffset + rect.bottom, true);
            }
        }, {
            key: 'open',
            value: function open(left, top) {
                var autoExpandDir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

                this.ul.querySelectorAll('.' + Dropdown._openClassName + ',.' + Dropdown._activeClassName).forEach(function (elt) {
                    elt.classList.remove(Dropdown._openClassName);
                    elt.classList.remove(Dropdown._activeClassName);
                });
                this.ul.classList.add(Dropdown._openClassName);

                var rect = this.ul.getBoundingClientRect();
                this.ul.style.left = left + 'px';
                this.ul.style.top = top + 'px';
                if (autoExpandDir) {
                    if (left + rect.width >= window.pageXOffset + window.innerWidth) {
                        this.ul.style.left = left - rect.width + 'px';
                    }
                    if (top + rect.height >= window.pageYOffset + window.innerHeight) {
                        this.ul.style.top = top - rect.height + 'px';
                    }
                }

                document.addEventListener('keydown', this._keyboardNavigation);
                document.addEventListener('click', this.dismiss);

                return this.ul;
            }
        }]);

        return Dropdown;
    }();

    exports.default = Dropdown;
});
//# sourceMappingURL=dropdown.js.map
