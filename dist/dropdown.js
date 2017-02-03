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

//# sourceMappingURL=data:application/json;base64,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QUFPLEtBQUssS0FBYixJQUF3QixPQUFPLFdBQVAsR0FBcUIsT0FBTyxVQUF2RCxFQUFvRTtBQUNoRSw2QkFBSyxFQUFMLENBQVEsS0FBUixDQUFjLElBQWQsR0FBd0IsT0FBTyxLQUFLLEtBQXBDO0FBQ0g7QUFDRCx3QkFBSSxNQUFNLEtBQUssTUFBWixJQUF3QixPQUFPLFdBQVAsR0FBcUIsT0FBTyxXQUF2RCxFQUFxRTtBQUNqRSw2QkFBSyxFQUFMLENBQVEsS0FBUixDQUFjLEdBQWQsR0FBdUIsTUFBTSxLQUFLLE1BQWxDO0FBQ0g7QUFDSjs7QUFFRCx5QkFBUyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxLQUFLLG1CQUExQztBQUNBLHlCQUFTLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLEtBQUssT0FBeEM7O0FBRUEsdUJBQU8sS0FBSyxFQUFaO0FBQ0g7Ozs7OztzQkFoV2dCLFEiLCJmaWxlIjoiZHJvcGRvd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSAqL1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGRyb3Bkb3duXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wZG93biB7XHJcbiAgICAvLyBHZW5lcmFsIGRvY3VtZW50YXRpb24gb2YgdGhlIHR5cGVzXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IERyb3Bkb3dufk5hdkl0ZW1cclxuICAgICAqIFRoaXMgaXMgdGhlIHN0cnVjdHVyZSBvZiBhIG5hdmlnYXRpb24gaXRlbVxyXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGxhYmVsICAgICAgICAgICAgICAgICAgIC0gVGhlIGxhYmVsIHdoaWNoIGlzIHVzZWQgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Rpc2FibGVkPWZhbHNlXSAgICAgICAtIElmIHRoaXMgaXMgdHJ1ZSB0aGUgaXRlbSBpcyBkaXNhYmxlZC4gSWYgdGhpcyBpcyB0cnVlIHdlIHdpbGwgbm90XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZSBhY2NvcmRpbmcgdG8gdGhlIGFjdGlvbiBwYXJhbWV0ZXIgb3IgcnVuIHRoZSBhY3Rpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLlxyXG4gICAgICogQHByb3BlcnR5IHsoc3RyaW5nfERyb3Bkb3dufmFjdGlvbkNhbGxiYWNrKX0gYWN0aW9uIC0gV2hhdCB0byBkbyB3aGVuIHdlIHNlbGVjdCB0aGlzIG5hdiBpdGVtLiBJZiB0aGlzIGlzIGEgc3RyaW5nIHdlIHdpbGxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRlIGxpa2UgYW4gJmx0O2EmZ3Q7IHRhZ1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBEcm9wZG93bn5OYXZNZW51XHJcbiAgICAgKiBUaGlzIGlzIHRoZSBzdHJ1Y3R1cmUgb2YgYSBuYXZpZ2F0aW9uIHN1Ym1lbnVcclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsYWJlbCAgICAgICAgICAgICAgICAgICAgLSBUaGUgbGFiZWwgd2hpY2ggaXMgdXNlZCBpbiB0aGUgbWVudVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBbZGlzYWJsZWQ9ZmFsc2VdICAgICAgICAtIElmIHRoaXMgaXMgdHJ1ZSB0aGUgaXRlbSBpcyBkaXNhYmxlZC4gV2hlbiBkaXNhYmxlZCBpdCB3aWxsIG5vdCBiZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkXHJcbiAgICAgKiBAcHJvcGVydHkge0FycmF5PERyb3Bkb3dufk5hdkl0ZW18RHJvcGRvd25+TmF2TWVudT59IGNoaWxkcmVuIC0gVGhlIGNoaWxkcmVuIG9mIHRoaXMgbWVudVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgRHJvcGRvd25+YWN0aW9uQ2FsbGJhY2tcclxuICAgICAqIFRoaXMgaXMgdGhlIGFjdGlvbiBjYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBUaGlzIGlzIHRoZSBldmVudCAoZWl0aGVyIGNsaWNrIG9yIGtleXByZXNzKSB3aGljaCB0cmlnZ2VyZWQgdGhpcyBoYW5kbGVyXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IERyb3Bkb3dufk9wdGlvbnNcclxuICAgICAqIFRoaXMgaXMgdGhlIHN0cnVjdHVyZSBvZiB0aGUgb3B0aW9ucyBvYmplY3RcclxuICAgICAqIEBwcm9wZXJ0eSB7RHJvcGRvd25+bG9nZ2VyfSBbbG9nZ2VyPWNvbnNvbGUubG9nXSAtIFRoZSBsb2dnZXIgdG8gdXNlXHJcbiAgICAgKiBAcHJvcGVydHkge0VsZW1lbnR9IFtlbGVtZW50PWRvY3VtZW50LmJvZHldIC0gVGhlIGVsZW1lbnQgdG8gYXR0YWNoIHRoZSBkcm9wZG93biB0b1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgRHJvcGRvd25+bG9nZ2VyXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBsb2dnaW5nIGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0gey4uLip9IGxvZ0l0ZW1zIC0gVGhpcyBzaG91bGQgd29yayBzaW1pbGFybHkgdG8gaG93IGNvbnNvbGUubG9nIHVzZXMgbXVsdGlwbGUgcGFyYW1ldGVyc1xyXG4gICAgICovXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBtZW1iZXJzXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgb2YgYSBzdWJuYXZcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IF9zdWJuYXZDbGFzc05hbWUoKSB7IHJldHVybiAnc3VibmF2JzsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgbmFtZSBvZiBhbiBvcGVuIHN1Ym5hdlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX29wZW5DbGFzc05hbWUoKSB7IHJldHVybiAnb3Blbic7ICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDbGFzcyBuYW1lIG9mIGFuIGFjdGl2ZSBpdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBfYWN0aXZlQ2xhc3NOYW1lKCkgeyByZXR1cm4gJ2FjdGl2ZSc7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgb2YgYSBkaXNhYmxlZCBpdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBfZGlzYWJsZWRDbGFzc05hbWUoKSB7IHJldHVybiAnZGlzYWJsZWQnOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBYLXBvc2l0aW9uIChlaXRoZXIgcG9zaXRpdmUgb3IgbmVnYXRpdmUgZGVwZW5kZWluZyBvbiBzcGFjZSBhdmFpbGFibGUpIG9mIGEgc3VibWVudS4gUmVsYXRpdmUgdG8gdGhlIHBhcmVudCBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX25lc3RlZFhQb3MoKSB7IHJldHVybiAnOTUlJzsgICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogWS1wb3NpdGlvbiAoZWl0aGVyIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIGRlcGVuZGluZyBvbiBzcGFjZSBhdmFpbGFibGUpIG9mIGEgc3VibWVudS4gUmVsYXRpdmUgdG8gdGhlIHBhcmVudCBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX25lc3RlZFlQb3MoKSB7IHJldHVybiAnLTAuMmVtJzsgfVxyXG5cclxuICAgIC8vIFByaXZhdGUgc3RhdGljIG1ldGhvZHNcclxuICAgIC8qKlxyXG4gICAgICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY2xvc2UgYWxsIHN1Ym1lbnVzIG9uIGEgZ2l2ZW4gbGV2ZWwuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHN1Ym5hdiAtIEFuIGVsZW1lbnQgb24gdGhlIGxldmVsIHdlIHdhbnQgdG8gY2xvc2UgYWxsIHRoZSBvcGVuIHN1Ym5hdnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9jbG9zZVJlbGF0ZWQoc3VibmF2KSB7XHJcbiAgICAgICAgc3VibmF2LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgLiR7RHJvcGRvd24uX29wZW5DbGFzc05hbWV9YCkuZm9yRWFjaChzdWJuYXYgPT4ge1xyXG4gICAgICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIG9wZW4gYSBzcGVjaWZpYyBzdWJtZW51XHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHN1Ym5hdiAtIFRoZSBlbGVtZW50IG9mIHRoZSBzdWJuYXYgaXRlbSB3ZSB3YW50IHRvIG9wZW5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9vcGVuTmVzdGVkKHN1Ym5hdikge1xyXG4gICAgICAgIERyb3Bkb3duLl9jbG9zZVJlbGF0ZWQoc3VibmF2KTtcclxuICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgY29uc3QgdWwgPSBzdWJuYXYucXVlcnlTZWxlY3RvcigndWwnKTtcclxuICAgICAgICBjb25zdCByZWN0ID0gc3VibmF2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHVsUmVjdCA9IHVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBpZigocmVjdC5yaWdodCArIHVsUmVjdC53aWR0aCkgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnJpZ2h0ID0gRHJvcGRvd24uX25lc3RlZFhQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUucmlnaHQgPSAnJztcclxuICAgICAgICAgICAgdWwuc3R5bGUubGVmdCA9IERyb3Bkb3duLl9uZXN0ZWRYUG9zO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZigocmVjdC50b3AgKyB1bFJlY3QuaGVpZ2h0KSA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS50b3AgPSAnJztcclxuICAgICAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gRHJvcGRvd24uX25lc3RlZFlQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gJyc7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnRvcCA9IERyb3Bkb3duLl9uZXN0ZWRZUG9zO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7QXJyYXk8RHJvcGRvd25+TmF2SXRlbXxEcm9wZG93bn5OYXZNZW51Pn0gbmF2TGlzdCAtIE9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29udGV4dCBtZW51LlxyXG4gICAgICogQHBhcmFtIHtEcm9wZG93bn5PcHRpb25zfSBvcHRpb25zIC0gT3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhpcyBpbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihuYXZMaXN0LCBvcHRpb25zID0ge30pIHsgXHJcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlciA/IG9wdGlvbnMubG9nZ2VyIDogY29uc29sZS5sb2cuYmluZChjb25zb2xlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcblxyXG4gICAgICAgIHRoaXMuZGlzbWlzcyA9IHRoaXMuZGlzbWlzcy5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLnVsID0gdGhpcy5fY3JlYXRlTGlzdChuYXZMaXN0KTtcclxuICAgICAgICB0aGlzLnVsLmNsYXNzTGlzdC5hZGQoJ2Ryb3Bkb3duJyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2tleWJvYXJkSGFuZGxlcnMgPSB7XHJcbiAgICAgICAgICAgIC8vIHVwIGFycm93XHJcbiAgICAgICAgICAgICczOCc6IChvcGVuLCBhY3RpdmUpID0+IHRoaXMuX2dvKHRydWUsIG9wZW4sIGFjdGl2ZSksIFxyXG5cclxuICAgICAgICAgICAgLy8gZG93biBhcnJvd1xyXG4gICAgICAgICAgICAnNDAnOiAob3BlbiwgYWN0aXZlKSA9PiB0aGlzLl9nbyhmYWxzZSwgb3BlbiwgYWN0aXZlKSxcclxuXHJcbiAgICAgICAgICAgIC8vIGxlZnQgYXJyb3dcclxuICAgICAgICAgICAgJzM3JzogKGFjdGl2ZSwgb3BlbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlICYmIGFjdGl2ZS5wYXJlbnRFbGVtZW50ICE9PSB0aGlzLnVsICYmIGFjdGl2ZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQgIT09IHRoaXMudWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX29wZW5DbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZihvcGVuICYmIG9wZW4gIT09IHRoaXMudWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBEcm9wZG93bi5fY2xvc2VSZWxhdGVkKG9wZW4ucGFyZW50RWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvLyByaWdodCBhcnJvd1xyXG4gICAgICAgICAgICAnMzknOiBhY3RpdmUgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlICYmIGFjdGl2ZS5jbGFzc0xpc3QuY29udGFpbnMoRHJvcGRvd24uX3N1Ym5hdkNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBEcm9wZG93bi5fb3Blbk5lc3RlZChhY3RpdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5xdWVyeVNlbGVjdG9yKCdsaScpLmNsYXNzTGlzdC5hZGQoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvLyBlbnRlclxyXG4gICAgICAgICAgICAnMTMnOiBhY3RpdmUgPT4gYWN0aXZlICYmIGFjdGl2ZS5jbGljaygpLCBcclxuXHJcbiAgICAgICAgICAgIC8vIGVzY2FwZVxyXG4gICAgICAgICAgICAnMjcnOiB0aGlzLmRpc21pc3MsIFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIChvcHRpb25zLmNvbnRleHQgPyBvcHRpb25zLmNvbnRleHQgOiBkb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZCh0aGlzLnVsKTtcclxuXHJcbiAgICAgICAgdGhpcy5fa2V5Ym9hcmROYXZpZ2F0aW9uID0gdGhpcy5fa2V5Ym9hcmROYXZpZ2F0aW9uLmJpbmQodGhpcyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBkb20gc3RydWN0dXJlIG9mIHRoZSBkcm9wZG93blxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlIFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBuYXZMaXN0IHtBcnJheTxEcm9wZG93bn5OYXZJdGVtfERyb3Bkb3dufk5hdk1lbnU+fSBUaGUgb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb250ZXh0IG1lbnVcclxuICAgICAqL1xyXG4gICAgX2NyZWF0ZUxpc3QobmF2TGlzdCkge1xyXG4gICAgICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcclxuICAgICAgICBuYXZMaXN0LmZvckVhY2gobmF2RWx0ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICBsaS5pbm5lclRleHQgPSBuYXZFbHQubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZihuYXZFbHQuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoRHJvcGRvd24uX2Rpc2FibGVkQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlcignbW91c2VsZWF2ZScsIGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlcignbW91c2VlbnRlcicsIGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZihuYXZFbHQuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChEcm9wZG93bi5fb3Blbk5lc3RlZC5iaW5kKG51bGwsIGUudGFyZ2V0KSwgNTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KERyb3Bkb3duLl9jbG9zZVJlbGF0ZWQuYmluZChudWxsLCBlLnRhcmdldCksIDUwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYobmF2RWx0LmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBEcm9wZG93bi5fb3Blbk5lc3RlZChsaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQodGhpcy5fY3JlYXRlTGlzdChuYXZFbHQuY2hpbGRyZW4pKTtcclxuICAgICAgICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9zdWJuYXZDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZihuYXZFbHQuYWN0aW9uKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbmF2RWx0LmFjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKG5hdkVsdC5hY3Rpb24pID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuYXZFbHQuYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdWwuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdWw7XHJcbiAgICB9XHJcblxyXG4gICAgX2dvKGRpclVwLCBhY3RpdmUsIG9wZW4pIHtcclxuICAgICAgICBjb25zdCBnZXROZXh0ID0gbmV4dCA9PiB7XHJcbiAgICAgICAgICAgIGlmKGRpclVwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHQubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgYWN0aXZlLmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBuZXh0ID0gKGFjdGl2ZSAmJiBnZXROZXh0KGFjdGl2ZSkpIHx8IG9wZW4uY2hpbGRyZW5bZGlyVXAgPyAob3Blbi5jaGlsZHJlbi5sZW5ndGggLSAxKSA6IDBdO1xyXG4gICAgICAgIHdoaWxlKG5leHQgJiYgbmV4dC5jbGFzc0xpc3QuY29udGFpbnMoRHJvcGRvd24uX2Rpc2FibGVkQ2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICBuZXh0ID0gZ2V0TmV4dChuZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobmV4dCkge1xyXG4gICAgICAgICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUga2V5Ym9hcmQgbmF2aWdhdGlvbiBldmVudCBoYW5kbGVyXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gVGhlIGtleWJvYXJkIGV2ZW50IHRoYXQgdHJpZ2dlcmQgdGhpcyBoYW5kbGVyXHJcbiAgICAgKi9cclxuICAgIF9rZXlib2FyZE5hdmlnYXRpb24oZSkge1xyXG4gICAgICAgIGxldCBvcGVuID0gdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtEcm9wZG93bi5fb3BlbkNsYXNzTmFtZX0gPiB1bGApO1xyXG4gICAgICAgIGlmKG9wZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBvcGVuID0gb3BlbltvcGVuLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wZW4gPSB0aGlzLnVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYWN0aXZlID0gb3Blbi5xdWVyeVNlbGVjdG9yKGBsaS4ke0Ryb3Bkb3duLl9hY3RpdmVDbGFzc05hbWV9YCk7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIob3Blbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGtleSA9IGAke2Uua2V5Q29kZX1gO1xyXG4gICAgICAgIGlmKHRoaXMuX2tleWJvYXJkSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2tleWJvYXJkSGFuZGxlcnNba2V5XShhY3RpdmUsIG9wZW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQdWJsaWMgbWV0aG9kc1xyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBhIGRyb3Bkb3duIGFuZCByZW1vdmUgYWxsIGV2ZW50IGxpc3RlbmVycyBvbiBpdFxyXG4gICAgICovXHJcbiAgICBkaXNtaXNzKCkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyKCdkaXNtaXNzJyk7XHJcbiAgICAgICAgdGhpcy51bC5jbGFzc0xpc3QucmVtb3ZlKERyb3Bkb3duLl9vcGVuQ2xhc3NOYW1lKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fa2V5Ym9hcmROYXZpZ2F0aW9uKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGlzbWlzcyk7XHJcblxyXG4gICAgICAgIHRoaXMudWwucXVlcnlTZWxlY3RvckFsbCgnbGknKS5mb3JFYWNoKHN1Ym5hdiA9PiB7XHJcbiAgICAgICAgICAgIHN1Ym5hdi5jbGFzc0xpc3QucmVtb3ZlKERyb3Bkb3duLl9vcGVuQ2xhc3NOYW1lLERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBmdW5jdGlvbiB3aWxsIHRha2UgYW4gZXZlbnQgYW5kIHRyeSB0byBvcGVuIGFuZCBwb3NpdGlvbiB0aGUgZHJvcGRvd24gbmV4dCB0byB0aGUgbW91c2UgcG9pbnRlciBvciB0aGVcclxuICAgICAqIGVsZW1lbnQgdGhlIGV2ZW50IHRyaWdnZXJlZCBvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldnQgLSBUaGUgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhpcyBjbGlja1xyXG4gICAgICovXHJcbiAgICBvcGVuQ2xpY2soZXZ0KSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIoZXZ0KTtcclxuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgaWYoZXZ0LmNsaWVudFggJiYgZXZ0LmNsaWVudFkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3Blbih3aW5kb3cucGFnZVhPZmZzZXQgKyBldnQuY2xpZW50WCwgd2luZG93LnBhZ2VZT2Zmc2V0ICsgZXZ0LmNsaWVudFksIHRydWUpO1xyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wZW4od2luZG93LnBhZ2VYT2Zmc2V0ICsgcmVjdC5yaWdodCwgd2luZG93LnBhZ2VZT2Zmc2V0ICsgcmVjdC5ib3R0b20sIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT3BlbiB0aGUgZHJvcGRvd24gcm9vdGVkIGluIHRoZSBnaXZlbiBwb3NpdGlvbi4gSXQgd2lsbCBleHBhbmQgZG93biBhbmQgdG8gdGhlIHJpZ2h0IGJ5IGRlZmF1bHQsIGJ1dCBjaGFuZ2VcclxuICAgICAqIGV4cGFuc2lvbiBkaXJlY3Rpb24gaWYgaXQgZG9lcyBub3QgaGF2ZSBlbm91Z2ggc3BhY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgICAgICAgICAgICAgICAgICAtIEhvdyBtYW55IHBpeGVscyBmcm9tIHRoZSBsZWZ0IHRoZSBlbGVtZW50IHNob3VsZCBiZSBwb3NpdGlvbmVkXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdG9wICAgICAgICAgICAgICAgICAgIC0gSG93IG1hbnkgcGl4ZWxzIGZyb20gdGhlIHRvcCB0aGUgZWxlbWVudCBzaG91bGQgYmUgcG9zaXRpb25lZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbYXV0b0V4cGFuZERpcj10cnVlXSAtIElmIHRydWUgd2Ugd2lsbCBhdXRvbWF0aWNhbGx5IGV4cGFuZCB0aGUgZHJvcGRvd24gdG93YXJkcyB0aGUgdG9wIG9yXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCBpZiB3ZSBkb24ndCBoYXZlIGFueSBzcGFjZSBmb3IgaXQgYmVsb3cgb3IgdG8gdGhlIHJpZ2h0LiBJZiBmYWxzZSB3ZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgb25seSBleHBhbmQgZG93biBhbmQgdG8gdGhlIHJpZ2h0LlxyXG4gICAgICovXHJcbiAgICBvcGVuKGxlZnQsIHRvcCwgYXV0b0V4cGFuZERpciA9IHRydWUpIHtcclxuICAgICAgICB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke0Ryb3Bkb3duLl9vcGVuQ2xhc3NOYW1lfSwuJHtEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lfWApLmZvckVhY2goZWx0ID0+IHtcclxuICAgICAgICAgICAgZWx0LmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX29wZW5DbGFzc05hbWUsRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51bC5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9vcGVuQ2xhc3NOYW1lKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVjdCA9IHRoaXMudWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdGhpcy51bC5zdHlsZS5sZWZ0ID0gYCR7bGVmdH1weGA7XHJcbiAgICAgICAgdGhpcy51bC5zdHlsZS50b3AgPSBgJHt0b3B9cHhgO1xyXG4gICAgICAgIGlmKGF1dG9FeHBhbmREaXIpIHtcclxuICAgICAgICAgICAgaWYoKGxlZnQgKyByZWN0LndpZHRoKSA+PSAod2luZG93LnBhZ2VYT2Zmc2V0ICsgd2luZG93LmlubmVyV2lkdGgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVsLnN0eWxlLmxlZnQgPSBgJHtsZWZ0IC0gcmVjdC53aWR0aH1weGA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoKHRvcCArIHJlY3QuaGVpZ2h0KSA+PSAod2luZG93LnBhZ2VZT2Zmc2V0ICsgd2luZG93LmlubmVySGVpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bC5zdHlsZS50b3AgPSBgJHt0b3AgLSByZWN0LmhlaWdodH1weGA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlib2FyZE5hdmlnYXRpb24pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kaXNtaXNzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudWw7XHJcbiAgICB9XHJcbn1cclxuIl19