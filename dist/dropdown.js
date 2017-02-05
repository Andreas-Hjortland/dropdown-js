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
        _createClass(Dropdown, null, [{
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
         * @param {Array<Dropdown~NavItem|Dropdown~NavMenu>} navList - Object representation of the context menu.
         * @param {Dropdown~Options} options - Optional parameters for this instance
         */
        function Dropdown(navList) {
            var _this = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, Dropdown);

            this.logger = options.logger ? options.logger : console.log.bind(console); // eslint-disable-line no-console

            this.dismiss = this.dismiss.bind(this);

            this.ul = this._createList(navList);
            this.ul.classList.add('dropdown');

            this._keyboardHandlers = {
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

            (options.context ? options.context : document.body).appendChild(this.ul);

            this._keyboardNavigation = this._keyboardNavigation.bind(this);
        }

        /**
         * A helper function to create the dom structure of the dropdown
         *
         * @private 
         *
         * @param navList {Array<Dropdown~NavItem|Dropdown~NavMenu>} The object representation of the context menu
         */


        _createClass(Dropdown, [{
            key: '_createList',
            value: function _createList(navList) {
                var _this2 = this;

                var ul = document.createElement('ul');
                navList.forEach(function (navElt) {
                    var li = document.createElement('li');
                    li.innerText = navElt.label;

                    if (navElt.disabled) {
                        li.classList.add(Dropdown._disabledClassName);
                        li.addEventListener('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    } else {
                        li.addEventListener('mouseleave', function (e) {
                            _this2.logger('mouseleave', e);
                            clearTimeout(_this2.timeout);
                            e.target.classList.remove(Dropdown._activeClassName);
                        });
                        li.addEventListener('mouseenter', function (e) {
                            _this2.logger('mouseenter', e);

                            e.target.classList.add(Dropdown._activeClassName);

                            clearTimeout(_this2.timeout);
                            if (navElt.children) {
                                _this2.timeout = setTimeout(Dropdown._openNested.bind(null, e.target), 500);
                            } else {
                                _this2.timeout = setTimeout(Dropdown._closeRelated.bind(null, e.target), 500);
                            }
                        });

                        if (navElt.children) {
                            li.addEventListener('click', function (e) {
                                if (e.target === this) {
                                    Dropdown._openNested(li);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            });
                            li.appendChild(_this2._createList(navElt.children));
                            li.classList.add(Dropdown._subnavClassName);
                        } else if (typeof navElt.action === 'string') {
                            li.addEventListener('click', function () {
                                return window.location.href = navElt.action;
                            });
                        } else if (typeof navElt.action === 'function') {
                            li.addEventListener('click', navElt.action);
                        }
                    }

                    ul.appendChild(li);
                });

                return ul;
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
                    subnav.classList.remove(Dropdown._openClassName, Dropdown._activeClassName);
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
                    elt.classList.remove(Dropdown._openClassName, Dropdown._activeClassName);
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
