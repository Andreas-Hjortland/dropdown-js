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

            this.dismiss = this.dismiss.bind(this);

            this.ul = this._createList(navList);
            this.ul.classList.add('dropdown');

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
                                if (e.target === this) {
                                    Dropdown._openNested(li);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kcm9wZG93bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBS3FCLFE7OzswQ0E0RkksTSxFQUFRO0FBQ3pCLHVCQUFPLGFBQVAsQ0FBcUIsZ0JBQXJCLE9BQTBDLFNBQVMsY0FBbkQsRUFBcUUsT0FBckUsQ0FBNkUsa0JBQVU7QUFDbkYsMkJBQU8sU0FBUCxDQUFpQixNQUFqQixDQUF3QixTQUFTLGNBQWpDO0FBQ0gsaUJBRkQ7QUFHSDs7O3dDQVFrQixNLEVBQVE7QUFDdkIseUJBQVMsYUFBVCxDQUF1QixNQUF2QjtBQUNBLHVCQUFPLFNBQVAsQ0FBaUIsR0FBakIsQ0FBcUIsU0FBUyxjQUE5QjtBQUNBLG9CQUFNLEtBQUssT0FBTyxhQUFQLENBQXFCLElBQXJCLENBQVg7QUFDQSxvQkFBTSxPQUFPLE9BQU8scUJBQVAsRUFBYjtBQUNBLG9CQUFNLFNBQVMsR0FBRyxxQkFBSCxFQUFmOztBQUVBLG9CQUFJLEtBQUssS0FBTCxHQUFhLE9BQU8sS0FBckIsR0FBOEIsT0FBTyxVQUF4QyxFQUFvRDtBQUNoRCx1QkFBRyxLQUFILENBQVMsSUFBVCxHQUFnQixFQUFoQjtBQUNBLHVCQUFHLEtBQUgsQ0FBUyxLQUFULEdBQWlCLFNBQVMsV0FBMUI7QUFDSCxpQkFIRCxNQUdPO0FBQ0gsdUJBQUcsS0FBSCxDQUFTLEtBQVQsR0FBaUIsRUFBakI7QUFDQSx1QkFBRyxLQUFILENBQVMsSUFBVCxHQUFnQixTQUFTLFdBQXpCO0FBQ0g7QUFDRCxvQkFBSSxLQUFLLEdBQUwsR0FBVyxPQUFPLE1BQW5CLEdBQTZCLE9BQU8sV0FBdkMsRUFBb0Q7QUFDaEQsdUJBQUcsS0FBSCxDQUFTLEdBQVQsR0FBZSxFQUFmO0FBQ0EsdUJBQUcsS0FBSCxDQUFTLE1BQVQsR0FBa0IsU0FBUyxXQUEzQjtBQUNILGlCQUhELE1BR087QUFDSCx1QkFBRyxLQUFILENBQVMsTUFBVCxHQUFrQixFQUFsQjtBQUNBLHVCQUFHLEtBQUgsQ0FBUyxHQUFULEdBQWUsU0FBUyxXQUF4QjtBQUNIO0FBQ0o7OztnQ0E5RTZCO0FBQUUsdUJBQU8sUUFBUDtBQUFrQjs7O2dDQU90QjtBQUFFLHVCQUFPLE1BQVA7QUFBa0I7OztnQ0FPbEI7QUFBRSx1QkFBTyxRQUFQO0FBQWtCOzs7Z0NBT2xCO0FBQUUsdUJBQU8sVUFBUDtBQUFvQjs7O2dDQU83QjtBQUFFLHVCQUFPLEtBQVA7QUFBa0I7OztnQ0FPcEI7QUFBRSx1QkFBTyxRQUFQO0FBQWtCOzs7QUE4QzdDOzs7OztBQUtBLDBCQUFZLE9BQVosRUFBbUM7QUFBQSxnQkFBZCxPQUFjLHVFQUFKLEVBQUk7O0FBQUE7O0FBQy9CLGlCQUFLLE1BQUwsR0FBYyxRQUFRLE1BQVIsR0FBaUIsUUFBUSxNQUF6QixHQUFrQyxRQUFRLEdBQVIsQ0FBWSxJQUFaLENBQWlCLE9BQWpCLENBQWhELENBRCtCLENBQzRDOztBQUUzRSxpQkFBSyxPQUFMLEdBQWUsS0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixJQUFsQixDQUFmOztBQUVBLGlCQUFLLEVBQUwsR0FBVSxLQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBVjtBQUNBLGlCQUFLLEVBQUwsQ0FBUSxTQUFSLENBQWtCLEdBQWxCLENBQXNCLFVBQXRCOztBQUVBLGFBQUMsUUFBUSxPQUFSLEdBQWtCLFFBQVEsT0FBMUIsR0FBb0MsU0FBUyxJQUE5QyxFQUFvRCxXQUFwRCxDQUFnRSxLQUFLLEVBQXJFOztBQUVBLGlCQUFLLG1CQUFMLEdBQTJCLEtBQUssbUJBQUwsQ0FBeUIsSUFBekIsQ0FBOEIsSUFBOUIsQ0FBM0I7QUFFSDs7QUFFRDs7Ozs7Ozs7Ozs7d0NBT1ksTyxFQUFTO0FBQUE7O0FBQ2pCLG9CQUFNLEtBQUssU0FBUyxhQUFULENBQXVCLElBQXZCLENBQVg7QUFDQSx3QkFBUSxPQUFSLENBQWdCLGtCQUFVO0FBQ3RCLHdCQUFNLEtBQUssU0FBUyxhQUFULENBQXVCLElBQXZCLENBQVg7QUFDQSx1QkFBRyxTQUFILEdBQWUsT0FBTyxLQUF0Qjs7QUFFQSx3QkFBRyxPQUFPLFFBQVYsRUFBb0I7QUFDaEIsMkJBQUcsU0FBSCxDQUFhLEdBQWIsQ0FBaUIsU0FBUyxrQkFBMUI7QUFDQSwyQkFBRyxnQkFBSCxDQUFvQixPQUFwQixFQUE2QixhQUFLO0FBQzlCLDhCQUFFLGNBQUY7QUFDQSw4QkFBRSxlQUFGO0FBQ0gseUJBSEQ7QUFJSCxxQkFORCxNQU1PO0FBQ0gsMkJBQUcsZ0JBQUgsQ0FBb0IsWUFBcEIsRUFBa0MsYUFBSztBQUNuQyxrQ0FBSyxNQUFMLENBQVksWUFBWixFQUEwQixDQUExQjtBQUNBLHlDQUFhLE1BQUssT0FBbEI7QUFDQSw4QkFBRSxNQUFGLENBQVMsU0FBVCxDQUFtQixNQUFuQixDQUEwQixTQUFTLGdCQUFuQztBQUNILHlCQUpEO0FBS0EsMkJBQUcsZ0JBQUgsQ0FBb0IsWUFBcEIsRUFBa0MsYUFBSztBQUNuQyxrQ0FBSyxNQUFMLENBQVksWUFBWixFQUEwQixDQUExQjs7QUFFQSw4QkFBRSxNQUFGLENBQVMsU0FBVCxDQUFtQixHQUFuQixDQUF1QixTQUFTLGdCQUFoQzs7QUFFQSx5Q0FBYSxNQUFLLE9BQWxCO0FBQ0EsZ0NBQUcsT0FBTyxRQUFWLEVBQW9CO0FBQ2hCLHNDQUFLLE9BQUwsR0FBZSxXQUFXLFNBQVMsV0FBVCxDQUFxQixJQUFyQixDQUEwQixJQUExQixFQUFnQyxFQUFFLE1BQWxDLENBQVgsRUFBc0QsR0FBdEQsQ0FBZjtBQUNILDZCQUZELE1BRU87QUFDSCxzQ0FBSyxPQUFMLEdBQWUsV0FBVyxTQUFTLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBNEIsSUFBNUIsRUFBa0MsRUFBRSxNQUFwQyxDQUFYLEVBQXdELEdBQXhELENBQWY7QUFDSDtBQUNKLHlCQVhEOztBQWFBLDRCQUFHLE9BQU8sUUFBVixFQUFvQjtBQUNoQiwrQkFBRyxnQkFBSCxDQUFvQixPQUFwQixFQUE2QixVQUFTLENBQVQsRUFBWTtBQUNyQyxvQ0FBRyxFQUFFLE1BQUYsS0FBYSxJQUFoQixFQUFzQjtBQUNsQiw2Q0FBUyxXQUFULENBQXFCLEVBQXJCO0FBQ0Esc0NBQUUsY0FBRjtBQUNBLHNDQUFFLGVBQUY7QUFDSDtBQUNKLDZCQU5EO0FBT0EsK0JBQUcsV0FBSCxDQUFlLE1BQUssV0FBTCxDQUFpQixPQUFPLFFBQXhCLENBQWY7QUFDQSwrQkFBRyxTQUFILENBQWEsR0FBYixDQUFpQixTQUFTLGdCQUExQjtBQUNILHlCQVZELE1BVU8sSUFBRyxPQUFPLE9BQU8sTUFBZCxLQUEwQixRQUE3QixFQUF1QztBQUMxQywrQkFBRyxnQkFBSCxDQUFvQixPQUFwQixFQUE2QjtBQUFBLHVDQUFNLE9BQU8sUUFBUCxDQUFnQixJQUFoQixHQUF1QixPQUFPLE1BQXBDO0FBQUEsNkJBQTdCO0FBQ0gseUJBRk0sTUFFQSxJQUFHLE9BQU8sT0FBTyxNQUFkLEtBQTBCLFVBQTdCLEVBQXlDO0FBQzVDLCtCQUFHLGdCQUFILENBQW9CLE9BQXBCLEVBQTZCLE9BQU8sTUFBcEM7QUFDSDtBQUNKOztBQUVELHVCQUFHLFdBQUgsQ0FBZSxFQUFmO0FBQ0gsaUJBL0NEOztBQWlEQSx1QkFBTyxFQUFQO0FBQ0g7OztnREFTbUIsQyxFQUFHO0FBQ25CLG9CQUFJLE9BQU8sS0FBSyxFQUFMLENBQVEsZ0JBQVIsT0FBNkIsU0FBUyxjQUF0QyxXQUFYO0FBQ0Esb0JBQUcsS0FBSyxNQUFMLEdBQWMsQ0FBakIsRUFBb0I7QUFDaEIsMkJBQU8sS0FBSyxLQUFLLE1BQUwsR0FBYyxDQUFuQixDQUFQO0FBQ0gsaUJBRkQsTUFFTztBQUNILDJCQUFPLEtBQUssRUFBWjtBQUNIO0FBQ0Qsb0JBQUksU0FBUyxLQUFLLGFBQUwsU0FBeUIsU0FBUyxnQkFBbEMsQ0FBYjtBQUNBLHFCQUFLLE1BQUwsQ0FBWSxJQUFaO0FBQ0Esb0JBQUksYUFBSjtBQUNBLHdCQUFPLEVBQUUsT0FBVDtBQUNJLHlCQUFLLEVBQUw7QUFBUztBQUNMLDBCQUFFLGVBQUY7QUFDQSwwQkFBRSxjQUFGO0FBQ0EsNEJBQUcsTUFBSCxFQUFXO0FBQ1AsbUNBQU8sT0FBTyxzQkFBZDtBQUNBLG1DQUFNLFFBQVEsS0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixTQUFTLGtCQUFqQyxDQUFkLEVBQW9FO0FBQ2hFLHVDQUFPLEtBQUssc0JBQVo7QUFDSDtBQUNELG1DQUFPLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IsU0FBUyxnQkFBakM7QUFDSDtBQUNELDRCQUFHLENBQUMsSUFBSixFQUFVO0FBQ04sbUNBQU8sS0FBSyxRQUFMLENBQWMsS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUFyQyxDQUFQO0FBQ0EsbUNBQU0sUUFBUSxLQUFLLFNBQUwsQ0FBZSxRQUFmLENBQXdCLFNBQVMsa0JBQWpDLENBQWQsRUFBb0U7QUFDaEUsdUNBQU8sS0FBSyxzQkFBWjtBQUNIO0FBQ0o7QUFDRCw0QkFBRyxJQUFILEVBQVM7QUFDTCxpQ0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixTQUFTLGdCQUE1QjtBQUNIO0FBQ0Q7QUFDSix5QkFBSyxFQUFMO0FBQVM7QUFDTCwwQkFBRSxlQUFGO0FBQ0EsMEJBQUUsY0FBRjtBQUNBLDRCQUFHLE1BQUgsRUFBVztBQUNQLG1DQUFPLE9BQU8sa0JBQWQ7QUFDQSxtQ0FBTSxRQUFRLEtBQUssU0FBTCxDQUFlLFFBQWYsQ0FBd0IsU0FBUyxrQkFBakMsQ0FBZCxFQUFvRTtBQUNoRSx1Q0FBTyxLQUFLLGtCQUFaO0FBQ0g7QUFDRCxtQ0FBTyxTQUFQLENBQWlCLE1BQWpCLENBQXdCLFNBQVMsZ0JBQWpDO0FBQ0g7QUFDRCw0QkFBRyxDQUFDLElBQUosRUFBVTtBQUNOLG1DQUFPLEtBQUssUUFBTCxDQUFjLENBQWQsQ0FBUDtBQUNBLG1DQUFNLFFBQVEsS0FBSyxTQUFMLENBQWUsUUFBZixDQUF3QixTQUFTLGtCQUFqQyxDQUFkLEVBQW9FO0FBQ2hFLHVDQUFPLEtBQUssa0JBQVo7QUFDSDtBQUNKO0FBQ0QsNkJBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsU0FBUyxnQkFBNUI7QUFDQTtBQUNKLHlCQUFLLEVBQUw7QUFBUztBQUNMLDBCQUFFLGVBQUY7QUFDQSwwQkFBRSxjQUFGO0FBQ0EsNEJBQUcsTUFBSCxFQUFXO0FBQ1AsbUNBQU8sU0FBUCxDQUFpQixNQUFqQixDQUF3QixTQUFTLGdCQUFqQztBQUNBLG1DQUFPLGFBQVAsQ0FBcUIsYUFBckIsQ0FBbUMsU0FBbkMsQ0FBNkMsTUFBN0MsQ0FBb0QsU0FBUyxjQUE3RDtBQUNBLG1DQUFPLGFBQVAsQ0FBcUIsYUFBckIsQ0FBbUMsU0FBbkMsQ0FBNkMsR0FBN0MsQ0FBaUQsU0FBUyxnQkFBMUQ7QUFDSCx5QkFKRCxNQUlPO0FBQ0gsZ0NBQUcsUUFBUSxTQUFTLEtBQUssRUFBekIsRUFBNkI7QUFDekIseUNBQVMsYUFBVCxDQUF1QixLQUFLLGFBQTVCO0FBQ0g7QUFDSjtBQUNEO0FBQ0oseUJBQUssRUFBTDtBQUFTO0FBQ0wsMEJBQUUsZUFBRjtBQUNBLDBCQUFFLGNBQUY7QUFDQSw0QkFBRyxVQUFVLE9BQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQixTQUFTLGdCQUFuQyxDQUFiLEVBQW1FO0FBQy9ELHFDQUFTLFdBQVQsQ0FBcUIsTUFBckI7QUFDQSxtQ0FBTyxhQUFQLENBQXFCLElBQXJCLEVBQTJCLFNBQTNCLENBQXFDLEdBQXJDLENBQXlDLFNBQVMsZ0JBQWxEO0FBQ0g7QUFDRDtBQUNKLHlCQUFLLEVBQUw7QUFBUztBQUNMLDBCQUFFLGVBQUY7QUFDQSwwQkFBRSxjQUFGO0FBQ0EsNEJBQUcsTUFBSCxFQUFXO0FBQ1AsbUNBQU8sS0FBUDtBQUNIO0FBQ0Q7QUFDSix5QkFBSyxFQUFMO0FBQ0ksNkJBQUssT0FBTDtBQUNBO0FBckVSO0FBdUVIOzs7c0NBTVM7QUFDTixxQkFBSyxNQUFMLENBQVksU0FBWjtBQUNBLHFCQUFLLEVBQUwsQ0FBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLFNBQVMsY0FBbEM7QUFDQSx5QkFBUyxtQkFBVCxDQUE2QixTQUE3QixFQUF3QyxLQUFLLG1CQUE3QztBQUNBLHlCQUFTLG1CQUFULENBQTZCLE9BQTdCLEVBQXNDLEtBQUssT0FBM0M7O0FBRUEscUJBQUssRUFBTCxDQUFRLGdCQUFSLENBQXlCLElBQXpCLEVBQStCLE9BQS9CLENBQXVDLGtCQUFVO0FBQzdDLDJCQUFPLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IsU0FBUyxjQUFqQyxFQUFnRCxTQUFTLGdCQUF6RDtBQUNILGlCQUZEO0FBR0g7OztzQ0FRUyxHLEVBQUs7QUFDWCxxQkFBSyxNQUFMLENBQVksR0FBWjtBQUNBLG9CQUFJLGVBQUo7QUFDQSxvQkFBSSxjQUFKO0FBQ0Esb0JBQUcsSUFBSSxPQUFKLElBQWUsSUFBSSxPQUF0QixFQUErQjtBQUMzQiwyQkFBTyxLQUFLLElBQUwsQ0FBVSxPQUFPLFdBQVAsR0FBcUIsSUFBSSxPQUFuQyxFQUE0QyxPQUFPLFdBQVAsR0FBcUIsSUFBSSxPQUFyRSxFQUE4RSxJQUE5RSxDQUFQO0FBQ0g7O0FBRUQsb0JBQU0sT0FBTyxJQUFJLE1BQUosQ0FBVyxxQkFBWCxFQUFiO0FBQ0EsdUJBQU8sS0FBSyxJQUFMLENBQVUsT0FBTyxXQUFQLEdBQXFCLEtBQUssS0FBcEMsRUFBMkMsT0FBTyxXQUFQLEdBQXFCLEtBQUssTUFBckUsRUFBNkUsSUFBN0UsQ0FBUDtBQUNIOzs7aUNBWUksSSxFQUFNLEcsRUFBMkI7QUFBQSxvQkFBdEIsYUFBc0IsdUVBQU4sSUFBTTs7QUFDbEMscUJBQUssRUFBTCxDQUFRLGdCQUFSLE9BQTZCLFNBQVMsY0FBdEMsVUFBeUQsU0FBUyxnQkFBbEUsRUFBc0YsT0FBdEYsQ0FBOEYsZUFBTztBQUNqRyx3QkFBSSxTQUFKLENBQWMsTUFBZCxDQUFxQixTQUFTLGNBQTlCLEVBQTZDLFNBQVMsZ0JBQXREO0FBQ0gsaUJBRkQ7QUFHQSxxQkFBSyxFQUFMLENBQVEsU0FBUixDQUFrQixHQUFsQixDQUFzQixTQUFTLGNBQS9COztBQUVBLG9CQUFNLE9BQU8sS0FBSyxFQUFMLENBQVEscUJBQVIsRUFBYjtBQUNBLHFCQUFLLEVBQUwsQ0FBUSxLQUFSLENBQWMsSUFBZCxHQUF3QixJQUF4QjtBQUNBLHFCQUFLLEVBQUwsQ0FBUSxLQUFSLENBQWMsR0FBZCxHQUF1QixHQUF2QjtBQUNBLG9CQUFHLGFBQUgsRUFBa0I7QUFDZCx3QkFBSSxPQUFPLEtBQUssS0FBYixJQUF3QixPQUFPLFdBQVAsR0FBcUIsT0FBTyxVQUF2RCxFQUFvRTtBQUNoRSw2QkFBSyxFQUFMLENBQVEsS0FBUixDQUFjLElBQWQsR0FBd0IsT0FBTyxLQUFLLEtBQXBDO0FBQ0g7QUFDRCx3QkFBSSxNQUFNLEtBQUssTUFBWixJQUF3QixPQUFPLFdBQVAsR0FBcUIsT0FBTyxXQUF2RCxFQUFxRTtBQUNqRSw2QkFBSyxFQUFMLENBQVEsS0FBUixDQUFjLEdBQWQsR0FBdUIsTUFBTSxLQUFLLE1BQWxDO0FBQ0g7QUFDSjs7QUFFRCx5QkFBUyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxLQUFLLG1CQUExQztBQUNBLHlCQUFTLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLEtBQUssT0FBeEM7O0FBRUEsdUJBQU8sS0FBSyxFQUFaO0FBQ0g7Ozs7OztzQkEzV2dCLFEiLCJmaWxlIjoiZHJvcGRvd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSAqL1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGRyb3Bkb3duXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wZG93biB7XHJcbiAgICAvLyBHZW5lcmFsIGRvY3VtZW50YXRpb24gb2YgdGhlIHR5cGVzXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IERyb3Bkb3dufk5hdkl0ZW1cclxuICAgICAqIFRoaXMgaXMgdGhlIHN0cnVjdHVyZSBvZiBhIG5hdmlnYXRpb24gaXRlbVxyXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGxhYmVsICAgICAgICAgICAgICAgICAgIC0gVGhlIGxhYmVsIHdoaWNoIGlzIHVzZWQgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Rpc2FibGVkPWZhbHNlXSAgICAgICAtIElmIHRoaXMgaXMgdHJ1ZSB0aGUgaXRlbSBpcyBkaXNhYmxlZC4gSWYgdGhpcyBpcyB0cnVlIHdlIHdpbGwgbm90XHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZSBhY2NvcmRpbmcgdG8gdGhlIGFjdGlvbiBwYXJhbWV0ZXIgb3IgcnVuIHRoZSBhY3Rpb25cclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLlxyXG4gICAgICogQHByb3BlcnR5IHsoc3RyaW5nfERyb3Bkb3dufmFjdGlvbkNhbGxiYWNrKX0gYWN0aW9uIC0gV2hhdCB0byBkbyB3aGVuIHdlIHNlbGVjdCB0aGlzIG5hdiBpdGVtLiBJZiB0aGlzIGlzIGEgc3RyaW5nIHdlIHdpbGxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRlIGxpa2UgYW4gJmx0O2EmZ3Q7IHRhZ1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBEcm9wZG93bn5OYXZNZW51XHJcbiAgICAgKiBUaGlzIGlzIHRoZSBzdHJ1Y3R1cmUgb2YgYSBuYXZpZ2F0aW9uIHN1Ym1lbnVcclxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBsYWJlbCAgICAgICAgICAgICAgICAgICAgLSBUaGUgbGFiZWwgd2hpY2ggaXMgdXNlZCBpbiB0aGUgbWVudVxyXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBbZGlzYWJsZWQ9ZmFsc2VdICAgICAgICAtIElmIHRoaXMgaXMgdHJ1ZSB0aGUgaXRlbSBpcyBkaXNhYmxlZC4gV2hlbiBkaXNhYmxlZCBpdCB3aWxsIG5vdCBiZVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZGVkXHJcbiAgICAgKiBAcHJvcGVydHkge0FycmF5PERyb3Bkb3dufk5hdkl0ZW18RHJvcGRvd25+TmF2TWVudT59IGNoaWxkcmVuIC0gVGhlIGNoaWxkcmVuIG9mIHRoaXMgbWVudVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgRHJvcGRvd25+YWN0aW9uQ2FsbGJhY2tcclxuICAgICAqIFRoaXMgaXMgdGhlIGFjdGlvbiBjYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBUaGlzIGlzIHRoZSBldmVudCAoZWl0aGVyIGNsaWNrIG9yIGtleXByZXNzKSB3aGljaCB0cmlnZ2VyZWQgdGhpcyBoYW5kbGVyXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IERyb3Bkb3dufk9wdGlvbnNcclxuICAgICAqIFRoaXMgaXMgdGhlIHN0cnVjdHVyZSBvZiB0aGUgb3B0aW9ucyBvYmplY3RcclxuICAgICAqIEBwcm9wZXJ0eSB7RHJvcGRvd25+bG9nZ2VyfSBbbG9nZ2VyPWNvbnNvbGUubG9nXSAtIFRoZSBsb2dnZXIgdG8gdXNlXHJcbiAgICAgKiBAcHJvcGVydHkge0VsZW1lbnR9IFtlbGVtZW50PWRvY3VtZW50LmJvZHldIC0gVGhlIGVsZW1lbnQgdG8gYXR0YWNoIHRoZSBkcm9wZG93biB0b1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY2FsbGJhY2sgRHJvcGRvd25+bG9nZ2VyXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBsb2dnaW5nIGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0gey4uLip9IGxvZ0l0ZW1zIC0gVGhpcyBzaG91bGQgd29yayBzaW1pbGFybHkgdG8gaG93IGNvbnNvbGUubG9nIHVzZXMgbXVsdGlwbGUgcGFyYW1ldGVyc1xyXG4gICAgICovXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBtZW1iZXJzXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgb2YgYSBzdWJuYXZcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IF9zdWJuYXZDbGFzc05hbWUoKSB7IHJldHVybiAnc3VibmF2JzsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xhc3MgbmFtZSBvZiBhbiBvcGVuIHN1Ym5hdlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX29wZW5DbGFzc05hbWUoKSB7IHJldHVybiAnb3Blbic7ICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDbGFzcyBuYW1lIG9mIGFuIGFjdGl2ZSBpdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBfYWN0aXZlQ2xhc3NOYW1lKCkgeyByZXR1cm4gJ2FjdGl2ZSc7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsYXNzIG5hbWUgb2YgYSBkaXNhYmxlZCBpdGVtXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBfZGlzYWJsZWRDbGFzc05hbWUoKSB7IHJldHVybiAnZGlzYWJsZWQnOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBYLXBvc2l0aW9uIChlaXRoZXIgcG9zaXRpdmUgb3IgbmVnYXRpdmUgZGVwZW5kZWluZyBvbiBzcGFjZSBhdmFpbGFibGUpIG9mIGEgc3VibWVudS4gUmVsYXRpdmUgdG8gdGhlIHBhcmVudCBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX25lc3RlZFhQb3MoKSB7IHJldHVybiAnOTUlJzsgICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogWS1wb3NpdGlvbiAoZWl0aGVyIHBvc2l0aXZlIG9yIG5lZ2F0aXZlIGRlcGVuZGluZyBvbiBzcGFjZSBhdmFpbGFibGUpIG9mIGEgc3VibWVudS4gUmVsYXRpdmUgdG8gdGhlIHBhcmVudCBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgX25lc3RlZFlQb3MoKSB7IHJldHVybiAnLTAuMmVtJzsgfVxyXG5cclxuICAgIC8vIFByaXZhdGUgc3RhdGljIG1ldGhvZHNcclxuICAgIC8qKlxyXG4gICAgICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY2xvc2UgYWxsIHN1Ym1lbnVzIG9uIGEgZ2l2ZW4gbGV2ZWwuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHN1Ym5hdiAtIEFuIGVsZW1lbnQgb24gdGhlIGxldmVsIHdlIHdhbnQgdG8gY2xvc2UgYWxsIHRoZSBvcGVuIHN1Ym5hdnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9jbG9zZVJlbGF0ZWQoc3VibmF2KSB7XHJcbiAgICAgICAgc3VibmF2LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChgLiR7RHJvcGRvd24uX29wZW5DbGFzc05hbWV9YCkuZm9yRWFjaChzdWJuYXYgPT4ge1xyXG4gICAgICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIG9wZW4gYSBzcGVjaWZpYyBzdWJtZW51XHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IHN1Ym5hdiAtIFRoZSBlbGVtZW50IG9mIHRoZSBzdWJuYXYgaXRlbSB3ZSB3YW50IHRvIG9wZW5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9vcGVuTmVzdGVkKHN1Ym5hdikge1xyXG4gICAgICAgIERyb3Bkb3duLl9jbG9zZVJlbGF0ZWQoc3VibmF2KTtcclxuICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LmFkZChEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgY29uc3QgdWwgPSBzdWJuYXYucXVlcnlTZWxlY3RvcigndWwnKTtcclxuICAgICAgICBjb25zdCByZWN0ID0gc3VibmF2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHVsUmVjdCA9IHVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBpZigocmVjdC5yaWdodCArIHVsUmVjdC53aWR0aCkgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnJpZ2h0ID0gRHJvcGRvd24uX25lc3RlZFhQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUucmlnaHQgPSAnJztcclxuICAgICAgICAgICAgdWwuc3R5bGUubGVmdCA9IERyb3Bkb3duLl9uZXN0ZWRYUG9zO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZigocmVjdC50b3AgKyB1bFJlY3QuaGVpZ2h0KSA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS50b3AgPSAnJztcclxuICAgICAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gRHJvcGRvd24uX25lc3RlZFlQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gJyc7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnRvcCA9IERyb3Bkb3duLl9uZXN0ZWRZUG9zO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSB7QXJyYXk8RHJvcGRvd25+TmF2SXRlbXxEcm9wZG93bn5OYXZNZW51Pn0gbmF2TGlzdCAtIE9iamVjdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29udGV4dCBtZW51LlxyXG4gICAgICogQHBhcmFtIHtEcm9wZG93bn5PcHRpb25zfSBvcHRpb25zIC0gT3B0aW9uYWwgcGFyYW1ldGVycyBmb3IgdGhpcyBpbnN0YW5jZVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihuYXZMaXN0LCBvcHRpb25zID0ge30pIHsgXHJcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlciA/IG9wdGlvbnMubG9nZ2VyIDogY29uc29sZS5sb2cuYmluZChjb25zb2xlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcblxyXG4gICAgICAgIHRoaXMuZGlzbWlzcyA9IHRoaXMuZGlzbWlzcy5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLnVsID0gdGhpcy5fY3JlYXRlTGlzdChuYXZMaXN0KTtcclxuICAgICAgICB0aGlzLnVsLmNsYXNzTGlzdC5hZGQoJ2Ryb3Bkb3duJyk7XHJcblxyXG4gICAgICAgIChvcHRpb25zLmNvbnRleHQgPyBvcHRpb25zLmNvbnRleHQgOiBkb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZCh0aGlzLnVsKTtcclxuXHJcbiAgICAgICAgdGhpcy5fa2V5Ym9hcmROYXZpZ2F0aW9uID0gdGhpcy5fa2V5Ym9hcmROYXZpZ2F0aW9uLmJpbmQodGhpcyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBkb20gc3RydWN0dXJlIG9mIHRoZSBkcm9wZG93blxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlIFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBuYXZMaXN0IHtBcnJheTxEcm9wZG93bn5OYXZJdGVtfERyb3Bkb3dufk5hdk1lbnU+fSBUaGUgb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb250ZXh0IG1lbnVcclxuICAgICAqL1xyXG4gICAgX2NyZWF0ZUxpc3QobmF2TGlzdCkge1xyXG4gICAgICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcclxuICAgICAgICBuYXZMaXN0LmZvckVhY2gobmF2RWx0ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICBsaS5pbm5lclRleHQgPSBuYXZFbHQubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZihuYXZFbHQuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoRHJvcGRvd24uX2Rpc2FibGVkQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlcignbW91c2VsZWF2ZScsIGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlcignbW91c2VlbnRlcicsIGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZihuYXZFbHQuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChEcm9wZG93bi5fb3Blbk5lc3RlZC5iaW5kKG51bGwsIGUudGFyZ2V0KSwgNTAwKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KERyb3Bkb3duLl9jbG9zZVJlbGF0ZWQuYmluZChudWxsLCBlLnRhcmdldCksIDUwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYobmF2RWx0LmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUudGFyZ2V0ID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBEcm9wZG93bi5fb3Blbk5lc3RlZChsaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYXBwZW5kQ2hpbGQodGhpcy5fY3JlYXRlTGlzdChuYXZFbHQuY2hpbGRyZW4pKTtcclxuICAgICAgICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9zdWJuYXZDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZihuYXZFbHQuYWN0aW9uKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbmF2RWx0LmFjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKG5hdkVsdC5hY3Rpb24pID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuYXZFbHQuYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdWwuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGlzIHRoZSBrZXlib2FyZCBuYXZpZ2F0aW9uIGV2ZW50IGhhbmRsZXJcclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGUgLSBUaGUga2V5Ym9hcmQgZXZlbnQgdGhhdCB0cmlnZ2VyZCB0aGlzIGhhbmRsZXJcclxuICAgICAqL1xyXG4gICAgX2tleWJvYXJkTmF2aWdhdGlvbihlKSB7XHJcbiAgICAgICAgbGV0IG9wZW4gPSB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke0Ryb3Bkb3duLl9vcGVuQ2xhc3NOYW1lfSA+IHVsYCk7XHJcbiAgICAgICAgaWYob3Blbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIG9wZW4gPSBvcGVuW29wZW4ubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3BlbiA9IHRoaXMudWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhY3RpdmUgPSBvcGVuLnF1ZXJ5U2VsZWN0b3IoYGxpLiR7RHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZX1gKTtcclxuICAgICAgICB0aGlzLmxvZ2dlcihvcGVuKTtcclxuICAgICAgICBsZXQgbmV4dDtcclxuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwIGFycm93XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGFjdGl2ZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKG5leHQgJiYgbmV4dC5jbGFzc0xpc3QuY29udGFpbnMoRHJvcGRvd24uX2Rpc2FibGVkQ2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gbmV4dC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKCFuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG9wZW4uY2hpbGRyZW5bb3Blbi5jaGlsZHJlbi5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZShuZXh0ICYmIG5leHQuY2xhc3NMaXN0LmNvbnRhaW5zKERyb3Bkb3duLl9kaXNhYmxlZENsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG5leHQucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dC5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd24gYXJyb3dcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gYWN0aXZlLm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZShuZXh0ICYmIG5leHQuY2xhc3NMaXN0LmNvbnRhaW5zKERyb3Bkb3duLl9kaXNhYmxlZENsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG5leHQubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKCFuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG9wZW4uY2hpbGRyZW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUobmV4dCAmJiBuZXh0LmNsYXNzTGlzdC5jb250YWlucyhEcm9wZG93bi5fZGlzYWJsZWRDbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBuZXh0Lm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzNzogLy8gbGVmdCBhcnJvd1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZihvcGVuICYmIG9wZW4gIT09IHRoaXMudWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRHJvcGRvd24uX2Nsb3NlUmVsYXRlZChvcGVuLnBhcmVudEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodCBhcnJvd1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSAmJiBhY3RpdmUuY2xhc3NMaXN0LmNvbnRhaW5zKERyb3Bkb3duLl9zdWJuYXZDbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRHJvcGRvd24uX29wZW5OZXN0ZWQoYWN0aXZlKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUucXVlcnlTZWxlY3RvcignbGknKS5jbGFzc0xpc3QuYWRkKERyb3Bkb3duLl9hY3RpdmVDbGFzc05hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTM6IC8vIGVudGVyXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyNzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzbWlzcygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFB1YmxpYyBtZXRob2RzXHJcbiAgICAvKipcclxuICAgICAqIENsb3NlIGEgZHJvcGRvd24gYW5kIHJlbW92ZSBhbGwgZXZlbnQgbGlzdGVuZXJzIG9uIGl0XHJcbiAgICAgKi9cclxuICAgIGRpc21pc3MoKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIoJ2Rpc21pc3MnKTtcclxuICAgICAgICB0aGlzLnVsLmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX29wZW5DbGFzc05hbWUpO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9rZXlib2FyZE5hdmlnYXRpb24pO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kaXNtaXNzKTtcclxuXHJcbiAgICAgICAgdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLmZvckVhY2goc3VibmF2ID0+IHtcclxuICAgICAgICAgICAgc3VibmF2LmNsYXNzTGlzdC5yZW1vdmUoRHJvcGRvd24uX29wZW5DbGFzc05hbWUsRHJvcGRvd24uX2FjdGl2ZUNsYXNzTmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgdGFrZSBhbiBldmVudCBhbmQgdHJ5IHRvIG9wZW4gYW5kIHBvc2l0aW9uIHRoZSBkcm9wZG93biBuZXh0IHRvIHRoZSBtb3VzZSBwb2ludGVyIG9yIHRoZVxyXG4gICAgICogZWxlbWVudCB0aGUgZXZlbnQgdHJpZ2dlcmVkIG9uLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2dCAtIFRoZSBldmVudCB0aGF0IHRyaWdnZXJlZCB0aGlzIGNsaWNrXHJcbiAgICAgKi9cclxuICAgIG9wZW5DbGljayhldnQpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlcihldnQpO1xyXG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBpZihldnQuY2xpZW50WCAmJiBldnQuY2xpZW50WSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcGVuKHdpbmRvdy5wYWdlWE9mZnNldCArIGV2dC5jbGllbnRYLCB3aW5kb3cucGFnZVlPZmZzZXQgKyBldnQuY2xpZW50WSwgdHJ1ZSk7XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgY29uc3QgcmVjdCA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3Blbih3aW5kb3cucGFnZVhPZmZzZXQgKyByZWN0LnJpZ2h0LCB3aW5kb3cucGFnZVlPZmZzZXQgKyByZWN0LmJvdHRvbSwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcGVuIHRoZSBkcm9wZG93biByb290ZWQgaW4gdGhlIGdpdmVuIHBvc2l0aW9uLiBJdCB3aWxsIGV4cGFuZCBkb3duIGFuZCB0byB0aGUgcmlnaHQgYnkgZGVmYXVsdCwgYnV0IGNoYW5nZVxyXG4gICAgICogZXhwYW5zaW9uIGRpcmVjdGlvbiBpZiBpdCBkb2VzIG5vdCBoYXZlIGVub3VnaCBzcGFjZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVmdCAgICAgICAgICAgICAgICAgIC0gSG93IG1hbnkgcGl4ZWxzIGZyb20gdGhlIGxlZnQgdGhlIGVsZW1lbnQgc2hvdWxkIGJlIHBvc2l0aW9uZWRcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgICAgICAgICAgICAgICAgICAgLSBIb3cgbWFueSBwaXhlbHMgZnJvbSB0aGUgdG9wIHRoZSBlbGVtZW50IHNob3VsZCBiZSBwb3NpdGlvbmVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFthdXRvRXhwYW5kRGlyPXRydWVdIC0gSWYgdHJ1ZSB3ZSB3aWxsIGF1dG9tYXRpY2FsbHkgZXhwYW5kIHRoZSBkcm9wZG93biB0b3dhcmRzIHRoZSB0b3Agb3JcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0IGlmIHdlIGRvbid0IGhhdmUgYW55IHNwYWNlIGZvciBpdCBiZWxvdyBvciB0byB0aGUgcmlnaHQuIElmIGZhbHNlIHdlXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBvbmx5IGV4cGFuZCBkb3duIGFuZCB0byB0aGUgcmlnaHQuXHJcbiAgICAgKi9cclxuICAgIG9wZW4obGVmdCwgdG9wLCBhdXRvRXhwYW5kRGlyID0gdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMudWwucXVlcnlTZWxlY3RvckFsbChgLiR7RHJvcGRvd24uX29wZW5DbGFzc05hbWV9LC4ke0Ryb3Bkb3duLl9hY3RpdmVDbGFzc05hbWV9YCkuZm9yRWFjaChlbHQgPT4ge1xyXG4gICAgICAgICAgICBlbHQuY2xhc3NMaXN0LnJlbW92ZShEcm9wZG93bi5fb3BlbkNsYXNzTmFtZSxEcm9wZG93bi5fYWN0aXZlQ2xhc3NOYW1lKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVsLmNsYXNzTGlzdC5hZGQoRHJvcGRvd24uX29wZW5DbGFzc05hbWUpO1xyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy51bC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB0aGlzLnVsLnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YDtcclxuICAgICAgICB0aGlzLnVsLnN0eWxlLnRvcCA9IGAke3RvcH1weGA7XHJcbiAgICAgICAgaWYoYXV0b0V4cGFuZERpcikge1xyXG4gICAgICAgICAgICBpZigobGVmdCArIHJlY3Qud2lkdGgpID49ICh3aW5kb3cucGFnZVhPZmZzZXQgKyB3aW5kb3cuaW5uZXJXaWR0aCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudWwuc3R5bGUubGVmdCA9IGAke2xlZnQgLSByZWN0LndpZHRofXB4YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZigodG9wICsgcmVjdC5oZWlnaHQpID49ICh3aW5kb3cucGFnZVlPZmZzZXQgKyB3aW5kb3cuaW5uZXJIZWlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVsLnN0eWxlLnRvcCA9IGAke3RvcCAtIHJlY3QuaGVpZ2h0fXB4YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2tleWJvYXJkTmF2aWdhdGlvbik7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRpc21pc3MpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy51bDtcclxuICAgIH1cclxufVxyXG4iXX0=