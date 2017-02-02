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
            key: 'closeRelated',
            value: function closeRelated(subnav) {
                subnav.parentElement.querySelectorAll('.open').forEach(function (subnav) {
                    subnav.classList.remove('open');
                });
            }
        }, {
            key: 'openNested',
            value: function openNested(subnav) {
                var xPos = '95%';
                var yPos = '-0.2em';
                Dropdown.closeRelated(subnav);
                subnav.classList.add('open');
                var ul = subnav.querySelector('ul');
                var rect = subnav.getBoundingClientRect();
                var ulRect = ul.getBoundingClientRect();

                ul.style.top = '';
                ul.style.bottom = '';
                ul.style.left = '';
                ul.style.right = '';
                if (rect.right + ulRect.width > window.innerWidth) {
                    ul.style.right = xPos;
                } else {
                    ul.style.left = xPos;
                }
                if (rect.top + ulRect.height > window.innerHeight) {
                    ul.style.bottom = yPos;
                } else {
                    ul.style.top = yPos;
                }
            }
        }, {
            key: 'createList',
            value: function createList(navList) {
                var ul = document.createElement('ul');
                navList.forEach(function (navElt) {
                    var li = document.createElement('li');
                    li.innerText = navElt.label;

                    if (navElt.disabled) {
                        li.classList.add('disabled');
                        li.addEventListener('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    } else if (typeof navElt.action === 'string') {
                        li.addEventListener('click', function () {
                            return window.location.href = navElt.action;
                        });
                    } else if (typeof navElt.action === 'function') {
                        li.addEventListener('click', navElt.action);
                    }

                    if (navElt.children) {
                        li.appendChild(Dropdown.createList(navElt.children));
                        li.classList.add('subnav');
                    }

                    ul.appendChild(li);
                });

                return ul;
            }
        }]);

        function Dropdown(navList) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { logger: console.log.bind(console) };

            _classCallCheck(this, Dropdown);

            // eslint-disable-line no-console
            this.logger = options.logger;
            this.navList = navList;
            this.ul = Dropdown.createList(this.navList);
            this.ul.classList.add('dropdown');
            document.body.appendChild(this.ul);

            this.mouseEnter = this.mouseEnter.bind(this);
            this.mouseLeave = this.mouseLeave.bind(this);
            this.dismiss = this.dismiss.bind(this);
            this.keyboardNavigation = this.keyboardNavigation.bind(this);
            this.navClick = this.navClick.bind(this);
        }

        _createClass(Dropdown, [{
            key: 'mouseLeave',
            value: function mouseLeave(e) {
                clearTimeout(this.timeout);
                e.target.classList.remove('active');
                this.logger('mouseleave', e.target);
            }
        }, {
            key: 'mouseEnter',
            value: function mouseEnter(e) {
                this.logger('mouseenter', e.target);

                e.target.classList.add('active');

                clearTimeout(this.timeout);
                if (e.target.classList.contains('subnav')) {
                    this.timeout = setTimeout(Dropdown.openNested.bind(null, e.target), 500);
                } else {
                    this.timeout = setTimeout(Dropdown.closeRelated.bind(null, e.target), 500);
                }
            }
        }, {
            key: 'navClick',
            value: function navClick(e) {
                this.logger(e.target);
                if (e.target.classList.contains('subnav')) {
                    Dropdown.openNested(e.target);
                    e.stopPropagation();
                }
            }
        }, {
            key: 'handleClick',
            value: function handleClick(elt, evt) {
                evt.stopPropagation();
                if (evt.clientX && evt.clientY) {
                    this.open(window.pageXOffset + evt.clientX, window.pageYOffset + evt.clientY);
                } else {
                    var rect = elt.getBoundingClientRect();
                    this.open(rect.right, rect.bottom);
                }
            }
        }, {
            key: 'open',
            value: function open(left, top) {
                var _this = this;

                this.ul.querySelectorAll('.open,.active').forEach(function (elt) {
                    elt.classList.remove('open', 'active');
                });
                this.ul.classList.add('opened');

                var rect = this.ul.getBoundingClientRect();
                this.ul.style.left = left + rect.width < window.innerWidth ? left + 'px' : left - rect.width + 'px';
                this.ul.style.top = top + rect.height < window.innerHeight ? top + 'px' : top - rect.height + 'px';

                this.ul.querySelectorAll('li').forEach(function (subnav) {
                    subnav.addEventListener('mouseenter', _this.mouseEnter);
                    subnav.addEventListener('mouseleave', _this.mouseLeave);
                });
                this.ul.addEventListener('click', this.navClick);
                document.addEventListener('keydown', this.keyboardNavigation);
                document.addEventListener('click', this.dismiss);
            }
        }, {
            key: 'keyboardNavigation',
            value: function keyboardNavigation(e) {
                var open = this.ul.querySelectorAll('.open > ul');
                if (open.length > 0) {
                    open = open[open.length - 1];
                } else {
                    open = this.ul;
                }
                var active = open.querySelector('li.active');
                this.logger(open);
                var next = void 0;
                switch (e.keyCode) {
                    case 38:
                        // up arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            next = active.previousElementSibling;
                            active.classList.remove('active');
                        }
                        if (!next) {
                            next = open.children[open.children.length - 1];
                        }
                        next.classList.add('active');
                        break;
                    case 40:
                        // down arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            next = active.nextElementSibling;
                            active.classList.remove('active');
                        }
                        if (!next) {
                            next = open.children[0];
                        }
                        next.classList.add('active');
                        break;
                    case 37:
                        // left arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active) {
                            active.classList.remove('active');
                            active.parentElement.parentElement.classList.remove('open');
                            active.parentElement.parentElement.classList.add('active');
                        } else {
                            if (open && open !== this.ul) {
                                Dropdown.closeRelated(open.parentElement);
                            }
                        }
                        break;
                    case 39:
                        // right arrow
                        e.stopPropagation();
                        e.preventDefault();
                        if (active && active.classList.contains('subnav')) {
                            Dropdown.openNested(active);
                            active.querySelector('li').classList.add('active');
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
                var _this2 = this;

                this.ul.classList.remove('opened');
                document.removeEventListener('keydown', this.keyboardNavigation);
                document.removeEventListener('click', this.dismiss);

                this.ul.removeEventListener('click', this.navClick);

                this.ul.querySelectorAll('li').forEach(function (subnav) {
                    subnav.classList.remove('open', 'active');
                    subnav.removeEventListener('mouseenter', _this2.mouseEnter);
                    subnav.removeEventListener('mouseleave', _this2.mouseLeave);
                });
            }
        }]);

        return Dropdown;
    }();

    exports.default = Dropdown;
});

//# sourceMappingURL=data:application/json;base64,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UCxDQUFpQixRQUFqQixDQUEwQixRQUExQixDQUFiLEVBQWtEO0FBQzlDLHFDQUFTLFVBQVQsQ0FBb0IsTUFBcEI7QUFDQSxtQ0FBTyxhQUFQLENBQXFCLElBQXJCLEVBQTJCLFNBQTNCLENBQXFDLEdBQXJDLENBQXlDLFFBQXpDO0FBQ0g7QUFDRDtBQUNKLHlCQUFLLEVBQUw7QUFBUztBQUNMLDBCQUFFLGVBQUY7QUFDQSwwQkFBRSxjQUFGO0FBQ0EsNEJBQUcsTUFBSCxFQUFXO0FBQ1AsbUNBQU8sS0FBUDtBQUNIO0FBQ0Q7QUFDSix5QkFBSyxFQUFMO0FBQ0ksNkJBQUssT0FBTDtBQUNBO0FBdkRSO0FBeURIOzs7c0NBRVM7QUFBQTs7QUFDTixxQkFBSyxFQUFMLENBQVEsU0FBUixDQUFrQixNQUFsQixDQUF5QixRQUF6QjtBQUNBLHlCQUFTLG1CQUFULENBQTZCLFNBQTdCLEVBQXdDLEtBQUssa0JBQTdDO0FBQ0EseUJBQVMsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBc0MsS0FBSyxPQUEzQzs7QUFFQSxxQkFBSyxFQUFMLENBQVEsbUJBQVIsQ0FBNEIsT0FBNUIsRUFBcUMsS0FBSyxRQUExQzs7QUFFQSxxQkFBSyxFQUFMLENBQVEsZ0JBQVIsQ0FBeUIsSUFBekIsRUFBK0IsT0FBL0IsQ0FBdUMsa0JBQVU7QUFDN0MsMkJBQU8sU0FBUCxDQUFpQixNQUFqQixDQUF3QixNQUF4QixFQUFnQyxRQUFoQztBQUNBLDJCQUFPLG1CQUFQLENBQTJCLFlBQTNCLEVBQXlDLE9BQUssVUFBOUM7QUFDQSwyQkFBTyxtQkFBUCxDQUEyQixZQUEzQixFQUF5QyxPQUFLLFVBQTlDO0FBQ0gsaUJBSkQ7QUFLSDs7Ozs7O3NCQW5OZ0IsUSIsImZpbGUiOiJkcm9wZG93bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIERyb3Bkb3duIHtcclxuICAgIHN0YXRpYyBjbG9zZVJlbGF0ZWQoc3VibmF2KSB7XHJcbiAgICAgICAgc3VibmF2LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm9wZW4nKS5mb3JFYWNoKHN1Ym5hdiA9PiB7XHJcbiAgICAgICAgICAgIHN1Ym5hdi5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgb3Blbk5lc3RlZChzdWJuYXYpIHtcclxuICAgICAgICBjb25zdCB4UG9zID0gJzk1JSc7XHJcbiAgICAgICAgY29uc3QgeVBvcyA9ICctMC4yZW0nO1xyXG4gICAgICAgIERyb3Bkb3duLmNsb3NlUmVsYXRlZChzdWJuYXYpO1xyXG4gICAgICAgIHN1Ym5hdi5jbGFzc0xpc3QuYWRkKCdvcGVuJyk7XHJcbiAgICAgICAgY29uc3QgdWwgPSBzdWJuYXYucXVlcnlTZWxlY3RvcigndWwnKTtcclxuICAgICAgICBjb25zdCByZWN0ID0gc3VibmF2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGNvbnN0IHVsUmVjdCA9IHVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICB1bC5zdHlsZS50b3AgPSAnJztcclxuICAgICAgICB1bC5zdHlsZS5ib3R0b20gPSAnJztcclxuICAgICAgICB1bC5zdHlsZS5sZWZ0ID0gJyc7XHJcbiAgICAgICAgdWwuc3R5bGUucmlnaHQgPSAnJztcclxuICAgICAgICBpZigocmVjdC5yaWdodCArIHVsUmVjdC53aWR0aCkgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS5yaWdodCA9IHhQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUubGVmdCA9IHhQb3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKChyZWN0LnRvcCArIHVsUmVjdC5oZWlnaHQpID4gd2luZG93LmlubmVySGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLmJvdHRvbSA9IHlQb3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUudG9wID0geVBvcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNyZWF0ZUxpc3QobmF2TGlzdCkge1xyXG4gICAgICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcclxuICAgICAgICBuYXZMaXN0LmZvckVhY2gobmF2RWx0ID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgICAgICBsaS5pbm5lclRleHQgPSBuYXZFbHQubGFiZWw7XHJcblxyXG4gICAgICAgICAgICBpZihuYXZFbHQuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YobmF2RWx0LmFjdGlvbikgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbmF2RWx0LmFjdGlvbik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YobmF2RWx0LmFjdGlvbikgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmF2RWx0LmFjdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICBpZihuYXZFbHQuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGxpLmFwcGVuZENoaWxkKERyb3Bkb3duLmNyZWF0ZUxpc3QobmF2RWx0LmNoaWxkcmVuKSk7XHJcbiAgICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKCdzdWJuYXYnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdWwuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdWw7XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3RvcihuYXZMaXN0LCBvcHRpb25zID0geyBsb2dnZXIgOiBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpIH0pIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXHJcbiAgICAgICAgdGhpcy5sb2dnZXIgPSBvcHRpb25zLmxvZ2dlcjtcclxuICAgICAgICB0aGlzLm5hdkxpc3QgPSBuYXZMaXN0O1xyXG4gICAgICAgIHRoaXMudWwgPSBEcm9wZG93bi5jcmVhdGVMaXN0KHRoaXMubmF2TGlzdCk7XHJcbiAgICAgICAgdGhpcy51bC5jbGFzc0xpc3QuYWRkKCdkcm9wZG93bicpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy51bCk7XHJcblxyXG4gICAgICAgIHRoaXMubW91c2VFbnRlciA9IHRoaXMubW91c2VFbnRlci5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMubW91c2VMZWF2ZSA9IHRoaXMubW91c2VMZWF2ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZGlzbWlzcyA9IHRoaXMuZGlzbWlzcy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMua2V5Ym9hcmROYXZpZ2F0aW9uID0gdGhpcy5rZXlib2FyZE5hdmlnYXRpb24uYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLm5hdkNsaWNrID0gdGhpcy5uYXZDbGljay5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoZSkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyKCdtb3VzZWxlYXZlJywgZS50YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlRW50ZXIoZSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyKCdtb3VzZWVudGVyJywgZS50YXJnZXQpO1xyXG5cclxuICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgaWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWJuYXYnKSkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KERyb3Bkb3duLm9wZW5OZXN0ZWQuYmluZChudWxsLCBlLnRhcmdldCksIDUwMCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChEcm9wZG93bi5jbG9zZVJlbGF0ZWQuYmluZChudWxsLCBlLnRhcmdldCksIDUwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5hdkNsaWNrKGUpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlcihlLnRhcmdldCk7XHJcbiAgICAgICAgaWYoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWJuYXYnKSkge1xyXG4gICAgICAgICAgICBEcm9wZG93bi5vcGVuTmVzdGVkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2xpY2soZWx0LCBldnQpIHtcclxuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgaWYoZXZ0LmNsaWVudFggJiYgZXZ0LmNsaWVudFkpIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKHdpbmRvdy5wYWdlWE9mZnNldCArIGV2dC5jbGllbnRYLCB3aW5kb3cucGFnZVlPZmZzZXQgKyBldnQuY2xpZW50WSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKHJlY3QucmlnaHQsIHJlY3QuYm90dG9tKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3BlbihsZWZ0LCB0b3ApIHtcclxuICAgICAgICB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcGVuLC5hY3RpdmUnKS5mb3JFYWNoKGVsdCA9PiB7XHJcbiAgICAgICAgICAgIGVsdC5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJywgJ2FjdGl2ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMudWwuY2xhc3NMaXN0LmFkZCgnb3BlbmVkJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLnVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHRoaXMudWwuc3R5bGUubGVmdCA9IChsZWZ0ICsgcmVjdC53aWR0aCkgPCB3aW5kb3cuaW5uZXJXaWR0aCA/IGAke2xlZnR9cHhgIDogYCR7bGVmdCAtIHJlY3Qud2lkdGh9cHhgO1xyXG4gICAgICAgIHRoaXMudWwuc3R5bGUudG9wID0gKHRvcCArIHJlY3QuaGVpZ2h0KSA8IHdpbmRvdy5pbm5lckhlaWdodCA/IGAke3RvcH1weGAgIDogYCR7dG9wIC0gcmVjdC5oZWlnaHR9cHhgO1xyXG5cclxuICAgICAgICB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJykuZm9yRWFjaChzdWJuYXYgPT4ge1xyXG4gICAgICAgICAgICBzdWJuYXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMubW91c2VFbnRlcik7XHJcbiAgICAgICAgICAgIHN1Ym5hdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5tb3VzZUxlYXZlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5uYXZDbGljayk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5Ym9hcmROYXZpZ2F0aW9uKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGlzbWlzcyk7XHJcbiAgICB9XHJcblxyXG4gICAga2V5Ym9hcmROYXZpZ2F0aW9uKGUpIHtcclxuICAgICAgICBsZXQgb3BlbiA9IHRoaXMudWwucXVlcnlTZWxlY3RvckFsbCgnLm9wZW4gPiB1bCcpO1xyXG4gICAgICAgIGlmKG9wZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBvcGVuID0gb3BlbltvcGVuLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wZW4gPSB0aGlzLnVsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYWN0aXZlID0gb3Blbi5xdWVyeVNlbGVjdG9yKCdsaS5hY3RpdmUnKTtcclxuICAgICAgICB0aGlzLmxvZ2dlcihvcGVuKTtcclxuICAgICAgICBsZXQgbmV4dDtcclxuICAgICAgICBzd2l0Y2goZS5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMzg6IC8vIHVwIGFycm93XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGFjdGl2ZS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKCFuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG9wZW4uY2hpbGRyZW5bb3Blbi5jaGlsZHJlbi5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5leHQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0MDogLy8gZG93biBhcnJvd1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBhY3RpdmUubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKCFuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG9wZW4uY2hpbGRyZW5bMF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnQgYXJyb3dcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYob3BlbiAmJiBvcGVuICE9PSB0aGlzLnVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERyb3Bkb3duLmNsb3NlUmVsYXRlZChvcGVuLnBhcmVudEVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM5OiAvLyByaWdodCBhcnJvd1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSAmJiBhY3RpdmUuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWJuYXYnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERyb3Bkb3duLm9wZW5OZXN0ZWQoYWN0aXZlKTtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUucXVlcnlTZWxlY3RvcignbGknKS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDEzOiAvLyBlbnRlclxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5jbGljaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc21pc3MoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNtaXNzKCkge1xyXG4gICAgICAgIHRoaXMudWwuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbmVkJyk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5Ym9hcmROYXZpZ2F0aW9uKTtcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZGlzbWlzcyk7XHJcblxyXG4gICAgICAgIHRoaXMudWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm5hdkNsaWNrKTtcclxuXHJcbiAgICAgICAgdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLmZvckVhY2goc3VibmF2ID0+IHtcclxuICAgICAgICAgICAgc3VibmF2LmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nLCAnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIHN1Ym5hdi5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5tb3VzZUVudGVyKTtcclxuICAgICAgICAgICAgc3VibmF2LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufVxyXG4iXX0=