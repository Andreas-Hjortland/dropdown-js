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
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, Dropdown);

            this.logger = options.logger ? options.logger : console.log.bind(console); // eslint-disable-line no-console
            this.ul = this._createList(navList);
            this.ul.classList.add('dropdown');

            (options.context ? options.context : document.body).appendChild(this.ul);

            this._keyboardNavigation = this._keyboardNavigation.bind(this);

            this.dismiss = this.dismiss.bind(this);
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
                var _this = this;

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
                            _this.logger('mouseleave', e);
                            clearTimeout(_this.timeout);
                            e.target.classList.remove(Dropdown._activeClassName);
                        });
                        li.addEventListener('mouseenter', function (e) {
                            _this.logger('mouseenter', e);

                            e.target.classList.add(Dropdown._activeClassName);

                            clearTimeout(_this.timeout);
                            if (navElt.children) {
                                _this.timeout = setTimeout(Dropdown._openNested.bind(null, e.target), 500);
                            } else {
                                _this.timeout = setTimeout(Dropdown._closeRelated.bind(null, e.target), 500);
                            }
                        });

                        if (navElt.children) {
                            li.addEventListener('click', function (e) {
                                Dropdown._openNested(li);
                                e.preventDefault();
                                e.stopPropagation();
                            });
                            li.appendChild(_this._createList(navElt.children));
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
                var next = void 0;
                switch (e.keyCode) {
                    case 38:
                        // up arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            next = active.previousElementSibling;
                            while (next && next.classList.contains(Dropdown._disabledClassName)) {
                                next = next.previousElementSibling;
                            }
                            active.classList.remove(Dropdown._activeClassName);
                        }
                        if (!next) {
                            next = open.children[open.children.length - 1];
                            while (next && next.classList.contains(Dropdown._disabledClassName)) {
                                next = next.previousElementSibling;
                            }
                        }
                        if (next) {
                            next.classList.add(Dropdown._activeClassName);
                        }
                        break;
                    case 40:
                        // down arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            next = active.nextElementSibling;
                            while (next && next.classList.contains(Dropdown._disabledClassName)) {
                                next = next.nextElementSibling;
                            }
                            active.classList.remove(Dropdown._activeClassName);
                        }
                        if (!next) {
                            next = open.children[0];
                            while (next && next.classList.contains(Dropdown._disabledClassName)) {
                                next = next.nextElementSibling;
                            }
                        }
                        next.classList.add(Dropdown._activeClassName);
                        break;
                    case 37:
                        // left arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            active.classList.remove(Dropdown._activeClassName);
                            active.parentElement.parentElement.classList.remove(Dropdown._openClassName);
                            active.parentElement.parentElement.classList.add(Dropdown._activeClassName);
                        } else {
                            if (open && open !== this.ul) {
                                Dropdown._closeRelated(open.parentElement);
                            }
                        }
                        break;
                    case 39:
                        // right arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active && active.classList.contains(Dropdown._subnavClassName)) {
                            Dropdown._openNested(active);
                            active.querySelector('li').classList.add(Dropdown._activeClassName);
                        }
                        break;
                    case 13:
                        // enter
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            active.click();
                        }
                        break;
                    case 27:
                        this.dismiss();
                        break;
                }
            }
        }, {
            key: 'dismiss',
            value: function dismiss() {
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

//# sourceMappingURL=data:application/json;base64,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QUFvRTtBQUNoRSw2QkFBSyxFQUFMLENBQVEsS0FBUixDQUFjLElBQWQsR0FBd0IsT0FBTyxLQUFLLEtBQXBDO0FBQ0g7QUFDRCx3QkFBSSxNQUFNLEtBQUssTUFBWixJQUF3QixPQUFPLFdBQVAsR0FBcUIsT0FBTyxXQUF2RCxFQUFxRTtBQUNqRSw2QkFBSyxFQUFMLENBQVEsS0FBUixDQUFjLEdBQWQsR0FBdUIsTUFBTSxLQUFLLE1BQWxDO0FBQ0g7QUFDSjs7QUFFRCx5QkFBUyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxLQUFLLG1CQUExQztBQUNBLHlCQUFTLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLEtBQUssT0FBeEM7O0FBRUEsdUJBQU8sS0FBSyxFQUFaO0FBQ0g7Ozs7OztzQkF0V2dCLFEiLCJmaWxlIjoiZHJvcGRvd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSAqL1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGRyb3Bkb3duXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wZG93biB7XHJcbiAgICAvLyBHZW5lcmFsIGRvY3VtZW50YXRpb24gb2YgdGhlIHR5cGVzXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IERyb3Bkb3dufk5hdkl0ZW1cclxuICAgICAqIFRoaXMgaXMgdGhlIHN0cnVjdHVyZSBvZiBhIG5hdmlnYXRpb24gaXRlbVxyXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGxhYmVsICAgICAgICAgICAgICAgICAgIC0gVGhlIGxhYmVsIHdoaWNoIGlzIHVzZWQgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Rpc2FibGVkPWZhbHNlXSAgICAgICAtIElmIHRoaXMgaXMgdHJ1ZSB0aGUgaXRlbSBpcyBkaXNhYmxlZC4gSWYgdGhpcyBpcyB0cnVlIHdlIHdpbGwgbm90XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZSBhY2NvcmRpbmcgdG8gdGhlIGFjdGlvbiBwYXJhbWV0ZXIgb3IgcnVuIHRoZSBhY3Rpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLlxyXG4gICAgICogQHByb3BlcnR5IHsoc3RyaW5nfERyb3Bkb3dufmFjdGlvbkNhbGxiYWNrKX0gYWN0aW9uIC0gV2hhdCB0byBkbyB3aGVuIHdlIHNlbGVjdCB0aGlzIG5hdiBpdGVtLiBJZiB0aGlzIGlzIGEgc3RyaW5nIHdlIHdpbGxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRlIGxpa2UgYW4gJmx0O2EmZ3Q7IHRhZ1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBEcm9wZG93bn5OYXZNZW51XHJcbiAgICAgKiBUaGlzIGlzIHRoZSBzdHJ1Y3R1cmUgb2YgYSBuYXZpZ2F0aW9uIHN1Ym1lbnVcclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsYWJlbCAgICAgICAgICAgICAgICAgICAgLSBUaGUgbGFiZWwgd2hpY2ggaXMgdXNlZCBpbiB0aGUgbWVudVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBbZGlzYWJsZWQ9ZmFsc2VdICAgICAgICAtIElmIHRoaXMgaXMgdHJ1ZSB0aGUgaXRlbSBpcyBkaXNhYmxlZC4gV2hlbiBkaXNhYmxlZCBpdCB3aWxsIG5vdCBiZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkXHJcbiAgICAgKiBAcHJvcGVydHkge0FycmF5PERyb3Bkb3dufk5hdkl0ZW18RHJvcGRvd25+TmF2TWVudT59IGNoaWxkcmVuIC0gVGhlIGNoaWxkcmVuIG9mIHRoaXMgbWVudVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgRHJvcGRvd25+YWN0aW9uQ2FsbGJhY2tcclxuICAgICAqIFRoaXMgaXMgdGhlIGFjdGlvbiBjYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBUaGlzIGlzIHRoZSBldmVudCAoZWl0aGVyIGNsaWNrIG9yIGtleXByZXNzKSB3aGljaCB0cmlnZ2VyZWQgdGhpcyBoYW5kbGVyXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IERyb3Bkb3dufk9wdGlvbnNcclxuICAgICAqIFRoaXMgaXMgdGhlIHN0cnVjdHVyZSBvZiB0aGUgb3B0aW9ucyBvYmplY3RcclxuICAgICAqIEBwcm9wZXJ0eSB7RHJvcGRvd25+bG9nZ2VyfSBbbG9nZ2VyPWNvbnNvbGUubG9nXSAtIFRoZSBsb2dnZXIgdG8gdXNlXHJcbiAgICAgKiBAcHJvcGVydHkge0VsZW1lbnR9IFtlbGVtZW50PWRvY3VtZW50LmJvZHldIC0gVGhlIGVsZW1lbnQgdG8gYXR0YWNoIHRoZSBkcm9wZG93biB0b1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgRHJvcGRvd25+bG9nZ2VyXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBsb2dnaW5nIGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0gey4uLip9IGxvZ0l0ZW1zIC0gVGhpcyBzaG91bGQgd29yayBzaW1pbGFybHkgdG8gaG93IGNvbnNvbGUubG9nIHVzZXMgbXVsdGlwbGUgcGFyYW1ldGVyc1xyXG4gICAgICovXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBtZW1iZXJzXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgb2YgYSBzdWJuYXZcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IF9zdWJuYXZDbGFzc05hbWUoKSB7IHJldHVybiAnc3VibmF2JzsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgbmFtZSBvZiBhbiBvcGVuIHN1Ym5hdlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX29wZW5DbGFzc05hbWUoKSB7IHJldHVybiAnb3Blbic7ICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDbGFzcyBuYW1lIG9mIGFuIGFjdGl2ZSBpdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBfYWN0aXZlQ2xhc3NOYW1lKCkgeyByZXR1cm4gJ2FjdGl2ZSc7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgb2YgYSBkaXNhYmxlZCBpdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBfZGlzYWJsZWRDbGFzc05hbWUoKSB7IHJldHVybiAnZGlzYWJsZWQnOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBYLXBvc2l0aW9uIChlaXRoZXIgcG9zaXRpdmUgb3IgbmVnYXRpdmUgZGVwZW5kZWluZyBvbiBzcGFjZSBhdmFpbGFibGUpIG9mIGEgc3VibWVudS4gUmVsYXRpdmUgdG8gdGhlIHBhcmVudCBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX25lc3RlZFhQb3MoKSB7IHJldHVybiAnOTUlJzsgICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogWS1wb3NpdGlvbiAoZWl0aGVyIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIGRlcGVuZGluZyBvbiBzcGFjZSBhdmFpbGFibGUpIG9mIGEgc3VibWVudS4gUmVsYXRpdmUgdG8gdGhlIHBhcmVudCBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX25lc3RlZFlQb3MoKSB7IHJldHVybiAnLTAuMmVtJzsgfVxyXG5cclxuICAgIC8vIFByaXZhdGUgc3RhdGljIG1ldGhvZHNcclxuICAgIC8qKlxyXG4gICAgICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY2xvc2UgYWxsIHN1Ym1lbnVzIG9uIGEgZ2l2ZW4gbGV2ZWwuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHN1Ym5hdiAtIEFuIGVsZW1lbnQgb24gdGhlIGxldmVsIHdlIHdhbnQgdG8gY2xvc2UgYWxsIHRoZSBvcGVuIHN1Ym5hdnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9jbG9zZVJlbGF0ZWQoc3VibmF2KSB7XHJcbiAgICAgICAgc3VibmF2LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgLiR7RHJvcGRvd24uX29wZW5DbGFzc05hbWV9YCkuZm9yRWFjaChzdWJuYXYgPT4ge1xyXG4gICAgICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIG9wZW4gYSBzcGVjaWZpYyBzdWJtZW51XHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHN1Ym5hdiAtIFRoZSBlbGVtZW50IG9mIHRoZSBzdWJuYXYgaXRlbSB3ZSB3YW50IHRvIG9wZW5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9vcGVuTmVzdGVkKHN1Ym5hdikge1xyXG4gICAgICAgIERyb3Bkb3duLl9jbG9zZVJlbGF0ZWQoc3VibmF2KTtcclxuICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgY29uc3QgdWwgPSBzdWJuYXYucXVlcnlTZWxlY3RvcigndWwnKTtcclxuICAgICAgICBjb25zdCByZWN0ID0gc3VibmF2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHVsUmVjdCA9IHVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBpZigocmVjdC5yaWdodCArIHVsUmVjdC53aWR0aCkgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnJpZ2h0ID0gRHJvcGRvd24uX25lc3RlZFhQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUucmlnaHQgPSAnJztcclxuICAgICAgICAgICAgdWwuc3R5bGUubGVmdCA9IERyb3Bkb3duLl9uZXN0ZWRYUG9zO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZigocmVjdC50b3AgKyB1bFJlY3QuaGVpZ2h0KSA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS50b3AgPSAnJztcclxuICAgICAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gRHJvcGRvd24uX25lc3RlZFlQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gJyc7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnRvcCA9IERyb3Bkb3duLl9uZXN0ZWRZUG9zO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7QXJyYXk8RHJvcGRvd25+TmF2SXRlbXxEcm9wZG93bn5OYXZNZW51Pn0gbmF2TGlzdCAtIE9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29udGV4dCBtZW51LlxyXG4gICAgICogQHBhcmFtIHtEcm9wZG93bn5PcHRpb25zfSBvcHRpb25zIC0gT3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhpcyBpbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihuYXZMaXN0LCBvcHRpb25zID0ge30pIHsgXHJcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlciA/IG9wdGlvbnMubG9nZ2VyIDogY29uc29sZS5sb2cuYmluZChjb25zb2xlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcbiAgICAgICAgdGhpcy51bCA9IHRoaXMuX2NyZWF0ZUxpc3QobmF2TGlzdCk7XHJcbiAgICAgICAgdGhpcy51bC5jbGFzc0xpc3QuYWRkKCdkcm9wZG93bicpO1xyXG5cclxuICAgICAgICAob3B0aW9ucy5jb250ZXh0ID8gb3B0aW9ucy5jb250ZXh0IDogZG9jdW1lbnQuYm9keSkuYXBwZW5kQ2hpbGQodGhpcy51bCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2tleWJvYXJkTmF2aWdhdGlvbiA9IHRoaXMuX2tleWJvYXJkTmF2aWdhdGlvbi5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmRpc21pc3MgPSB0aGlzLmRpc21pc3MuYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZG9tIHN0cnVjdHVyZSBvZiB0aGUgZHJvcGRvd25cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZSBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbmF2TGlzdCB7QXJyYXk8RHJvcGRvd25+TmF2SXRlbXxEcm9wZG93bn5OYXZNZW51Pn0gVGhlIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29udGV4dCBtZW51XHJcbiAgICAgKi9cclxuICAgIF9jcmVhdGVMaXN0KG5hdkxpc3QpIHtcclxuICAgICAgICBjb25zdCB1bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgbmF2TGlzdC5mb3JFYWNoKG5hdkVsdCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgbGkuaW5uZXJUZXh0ID0gbmF2RWx0LmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYobmF2RWx0LmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9kaXNhYmxlZENsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIoJ21vdXNlbGVhdmUnLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIoJ21vdXNlZW50ZXInLCBlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobmF2RWx0LmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoRHJvcGRvd24uX29wZW5OZXN0ZWQuYmluZChudWxsLCBlLnRhcmdldCksIDUwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChEcm9wZG93bi5fY2xvc2VSZWxhdGVkLmJpbmQobnVsbCwgZS50YXJnZXQpLCA1MDApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKG5hdkVsdC5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERyb3Bkb3duLl9vcGVuTmVzdGVkKGxpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKHRoaXMuX2NyZWF0ZUxpc3QobmF2RWx0LmNoaWxkcmVuKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fc3VibmF2Q2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YobmF2RWx0LmFjdGlvbikgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG5hdkVsdC5hY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZihuYXZFbHQuYWN0aW9uKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmF2RWx0LmFjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUga2V5Ym9hcmQgbmF2aWdhdGlvbiBldmVudCBoYW5kbGVyXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlIC0gVGhlIGtleWJvYXJkIGV2ZW50IHRoYXQgdHJpZ2dlcmQgdGhpcyBoYW5kbGVyXHJcbiAgICAgKi9cclxuICAgIF9rZXlib2FyZE5hdmlnYXRpb24oZSkge1xyXG4gICAgICAgIGxldCBvcGVuID0gdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtEcm9wZG93bi5fb3BlbkNsYXNzTmFtZX0gPiB1bGApO1xyXG4gICAgICAgIGlmKG9wZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBvcGVuID0gb3BlbltvcGVuLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wZW4gPSB0aGlzLnVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYWN0aXZlID0gb3Blbi5xdWVyeVNlbGVjdG9yKGBsaS4ke0Ryb3Bkb3duLl9hY3RpdmVDbGFzc05hbWV9YCk7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIob3Blbik7XHJcbiAgICAgICAgbGV0IG5leHQ7XHJcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cCBhcnJvd1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBhY3RpdmUucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZShuZXh0ICYmIG5leHQuY2xhc3NMaXN0LmNvbnRhaW5zKERyb3Bkb3duLl9kaXNhYmxlZENsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG5leHQucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZighbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBvcGVuLmNoaWxkcmVuW29wZW4uY2hpbGRyZW4ubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUobmV4dCAmJiBuZXh0LmNsYXNzTGlzdC5jb250YWlucyhEcm9wZG93bi5fZGlzYWJsZWRDbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBuZXh0LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYobmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duIGFycm93XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGFjdGl2ZS5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUobmV4dCAmJiBuZXh0LmNsYXNzTGlzdC5jb250YWlucyhEcm9wZG93bi5fZGlzYWJsZWRDbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBuZXh0Lm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZighbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBvcGVuLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKG5leHQgJiYgbmV4dC5jbGFzc0xpc3QuY29udGFpbnMoRHJvcGRvd24uX2Rpc2FibGVkQ2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gbmV4dC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbmV4dC5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnQgYXJyb3dcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX29wZW5DbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYob3BlbiAmJiBvcGVuICE9PSB0aGlzLnVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERyb3Bkb3duLl9jbG9zZVJlbGF0ZWQob3Blbi5wYXJlbnRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHQgYXJyb3dcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUgJiYgYWN0aXZlLmNsYXNzTGlzdC5jb250YWlucyhEcm9wZG93bi5fc3VibmF2Q2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERyb3Bkb3duLl9vcGVuTmVzdGVkKGFjdGl2ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLnF1ZXJ5U2VsZWN0b3IoJ2xpJykuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDEzOiAvLyBlbnRlclxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc21pc3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQdWJsaWMgbWV0aG9kc1xyXG4gICAgLyoqXHJcbiAgICAgKiBDbG9zZSBhIGRyb3Bkb3duIGFuZCByZW1vdmUgYWxsIGV2ZW50IGxpc3RlbmVycyBvbiBpdFxyXG4gICAgICovXHJcbiAgICBkaXNtaXNzKCkge1xyXG4gICAgICAgIHRoaXMudWwuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWJvYXJkTmF2aWdhdGlvbik7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRpc21pc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJykuZm9yRWFjaChzdWJuYXYgPT4ge1xyXG4gICAgICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSxEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgZnVuY3Rpb24gd2lsbCB0YWtlIGFuIGV2ZW50IGFuZCB0cnkgdG8gb3BlbiBhbmQgcG9zaXRpb24gdGhlIGRyb3Bkb3duIG5leHQgdG8gdGhlIG1vdXNlIHBvaW50ZXIgb3IgdGhlXHJcbiAgICAgKiBlbGVtZW50IHRoZSBldmVudCB0cmlnZ2VyZWQgb24uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZ0IC0gVGhlIGV2ZW50IHRoYXQgdHJpZ2dlcmVkIHRoaXMgY2xpY2tcclxuICAgICAqL1xyXG4gICAgb3BlbkNsaWNrKGV2dCkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyKGV2dCk7XHJcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGlmKGV2dC5jbGllbnRYICYmIGV2dC5jbGllbnRZKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wZW4od2luZG93LnBhZ2VYT2Zmc2V0ICsgZXZ0LmNsaWVudFgsIHdpbmRvdy5wYWdlWU9mZnNldCArIGV2dC5jbGllbnRZLCB0cnVlKTtcclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gZXZ0LnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcGVuKHdpbmRvdy5wYWdlWE9mZnNldCArIHJlY3QucmlnaHQsIHdpbmRvdy5wYWdlWU9mZnNldCArIHJlY3QuYm90dG9tLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW4gdGhlIGRyb3Bkb3duIHJvb3RlZCBpbiB0aGUgZ2l2ZW4gcG9zaXRpb24uIEl0IHdpbGwgZXhwYW5kIGRvd24gYW5kIHRvIHRoZSByaWdodCBieSBkZWZhdWx0LCBidXQgY2hhbmdlXHJcbiAgICAgKiBleHBhbnNpb24gZGlyZWN0aW9uIGlmIGl0IGRvZXMgbm90IGhhdmUgZW5vdWdoIHNwYWNlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0ICAgICAgICAgICAgICAgICAgLSBIb3cgbWFueSBwaXhlbHMgZnJvbSB0aGUgbGVmdCB0aGUgZWxlbWVudCBzaG91bGQgYmUgcG9zaXRpb25lZFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRvcCAgICAgICAgICAgICAgICAgICAtIEhvdyBtYW55IHBpeGVscyBmcm9tIHRoZSB0b3AgdGhlIGVsZW1lbnQgc2hvdWxkIGJlIHBvc2l0aW9uZWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2F1dG9FeHBhbmREaXI9dHJ1ZV0gLSBJZiB0cnVlIHdlIHdpbGwgYXV0b21hdGljYWxseSBleHBhbmQgdGhlIGRyb3Bkb3duIHRvd2FyZHMgdGhlIHRvcCBvclxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQgaWYgd2UgZG9uJ3QgaGF2ZSBhbnkgc3BhY2UgZm9yIGl0IGJlbG93IG9yIHRvIHRoZSByaWdodC4gSWYgZmFsc2Ugd2VcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIG9ubHkgZXhwYW5kIGRvd24gYW5kIHRvIHRoZSByaWdodC5cclxuICAgICAqL1xyXG4gICAgb3BlbihsZWZ0LCB0b3AsIGF1dG9FeHBhbmREaXIgPSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtEcm9wZG93bi5fb3BlbkNsYXNzTmFtZX0sLiR7RHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZX1gKS5mb3JFYWNoKGVsdCA9PiB7XHJcbiAgICAgICAgICAgIGVsdC5jbGFzc0xpc3QucmVtb3ZlKERyb3Bkb3duLl9vcGVuQ2xhc3NOYW1lLERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudWwuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLnVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHRoaXMudWwuc3R5bGUubGVmdCA9IGAke2xlZnR9cHhgO1xyXG4gICAgICAgIHRoaXMudWwuc3R5bGUudG9wID0gYCR7dG9wfXB4YDtcclxuICAgICAgICBpZihhdXRvRXhwYW5kRGlyKSB7XHJcbiAgICAgICAgICAgIGlmKChsZWZ0ICsgcmVjdC53aWR0aCkgPj0gKHdpbmRvdy5wYWdlWE9mZnNldCArIHdpbmRvdy5pbm5lcldpZHRoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bC5zdHlsZS5sZWZ0ID0gYCR7bGVmdCAtIHJlY3Qud2lkdGh9cHhgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKCh0b3AgKyByZWN0LmhlaWdodCkgPj0gKHdpbmRvdy5wYWdlWU9mZnNldCArIHdpbmRvdy5pbm5lckhlaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudWwuc3R5bGUudG9wID0gYCR7dG9wIC0gcmVjdC5oZWlnaHR9cHhgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fa2V5Ym9hcmROYXZpZ2F0aW9uKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGlzbWlzcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnVsO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==