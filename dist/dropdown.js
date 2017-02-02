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
                        if (active) {
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

//# sourceMappingURL=data:application/json;base64,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UCxxQ0FBUyxVQUFULENBQW9CLE1BQXBCO0FBQ0EsbUNBQU8sYUFBUCxDQUFxQixJQUFyQixFQUEyQixTQUEzQixDQUFxQyxHQUFyQyxDQUF5QyxRQUF6QztBQUNIO0FBQ0Q7QUFDSix5QkFBSyxFQUFMO0FBQVM7QUFDTCwwQkFBRSxlQUFGO0FBQ0EsMEJBQUUsY0FBRjtBQUNBLDRCQUFHLE1BQUgsRUFBVztBQUNQLG1DQUFPLEtBQVA7QUFDSDtBQUNEO0FBQ0oseUJBQUssRUFBTDtBQUNJLDZCQUFLLE9BQUw7QUFDQTtBQXZEUjtBQXlESDs7O3NDQUVTO0FBQUE7O0FBQ04scUJBQUssRUFBTCxDQUFRLFNBQVIsQ0FBa0IsTUFBbEIsQ0FBeUIsUUFBekI7QUFDQSx5QkFBUyxtQkFBVCxDQUE2QixTQUE3QixFQUF3QyxLQUFLLGtCQUE3QztBQUNBLHlCQUFTLG1CQUFULENBQTZCLE9BQTdCLEVBQXNDLEtBQUssT0FBM0M7O0FBRUEscUJBQUssRUFBTCxDQUFRLG1CQUFSLENBQTRCLE9BQTVCLEVBQXFDLEtBQUssUUFBMUM7O0FBRUEscUJBQUssRUFBTCxDQUFRLGdCQUFSLENBQXlCLElBQXpCLEVBQStCLE9BQS9CLENBQXVDLGtCQUFVO0FBQzdDLDJCQUFPLFNBQVAsQ0FBaUIsTUFBakIsQ0FBd0IsTUFBeEIsRUFBZ0MsUUFBaEM7QUFDQSwyQkFBTyxtQkFBUCxDQUEyQixZQUEzQixFQUF5QyxPQUFLLFVBQTlDO0FBQ0EsMkJBQU8sbUJBQVAsQ0FBMkIsWUFBM0IsRUFBeUMsT0FBSyxVQUE5QztBQUNILGlCQUpEO0FBS0g7Ozs7OztzQkFuTmdCLFEiLCJmaWxlIjoiZHJvcGRvd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wZG93biB7XHJcbiAgICBzdGF0aWMgY2xvc2VSZWxhdGVkKHN1Ym5hdikge1xyXG4gICAgICAgIHN1Ym5hdi5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcGVuJykuZm9yRWFjaChzdWJuYXYgPT4ge1xyXG4gICAgICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIG9wZW5OZXN0ZWQoc3VibmF2KSB7XHJcbiAgICAgICAgY29uc3QgeFBvcyA9ICc5NSUnO1xyXG4gICAgICAgIGNvbnN0IHlQb3MgPSAnLTAuMmVtJztcclxuICAgICAgICBEcm9wZG93bi5jbG9zZVJlbGF0ZWQoc3VibmF2KTtcclxuICAgICAgICBzdWJuYXYuY2xhc3NMaXN0LmFkZCgnb3BlbicpO1xyXG4gICAgICAgIGNvbnN0IHVsID0gc3VibmF2LnF1ZXJ5U2VsZWN0b3IoJ3VsJyk7XHJcbiAgICAgICAgY29uc3QgcmVjdCA9IHN1Ym5hdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBjb25zdCB1bFJlY3QgPSB1bC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgdWwuc3R5bGUudG9wID0gJyc7XHJcbiAgICAgICAgdWwuc3R5bGUuYm90dG9tID0gJyc7XHJcbiAgICAgICAgdWwuc3R5bGUubGVmdCA9ICcnO1xyXG4gICAgICAgIHVsLnN0eWxlLnJpZ2h0ID0gJyc7XHJcbiAgICAgICAgaWYoKHJlY3QucmlnaHQgKyB1bFJlY3Qud2lkdGgpID4gd2luZG93LmlubmVyV2lkdGgpIHtcclxuICAgICAgICAgICAgdWwuc3R5bGUucmlnaHQgPSB4UG9zO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLmxlZnQgPSB4UG9zO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZigocmVjdC50b3AgKyB1bFJlY3QuaGVpZ2h0KSA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xyXG4gICAgICAgICAgICB1bC5zdHlsZS5ib3R0b20gPSB5UG9zO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVsLnN0eWxlLnRvcCA9IHlQb3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjcmVhdGVMaXN0KG5hdkxpc3QpIHtcclxuICAgICAgICBjb25zdCB1bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XHJcbiAgICAgICAgbmF2TGlzdC5mb3JFYWNoKG5hdkVsdCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcclxuICAgICAgICAgICAgbGkuaW5uZXJUZXh0ID0gbmF2RWx0LmxhYmVsO1xyXG5cclxuICAgICAgICAgICAgaWYobmF2RWx0LmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKG5hdkVsdC5hY3Rpb24pID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG5hdkVsdC5hY3Rpb24pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKG5hdkVsdC5hY3Rpb24pID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG5hdkVsdC5hY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYobmF2RWx0LmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5hcHBlbmRDaGlsZChEcm9wZG93bi5jcmVhdGVMaXN0KG5hdkVsdC5jaGlsZHJlbikpO1xyXG4gICAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZCgnc3VibmF2Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVsLmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVsO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IobmF2TGlzdCwgb3B0aW9ucyA9IHsgbG9nZ2VyIDogY29uc29sZS5sb2cuYmluZChjb25zb2xlKSB9KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxyXG4gICAgICAgIHRoaXMubG9nZ2VyID0gb3B0aW9ucy5sb2dnZXI7XHJcbiAgICAgICAgdGhpcy5uYXZMaXN0ID0gbmF2TGlzdDtcclxuICAgICAgICB0aGlzLnVsID0gRHJvcGRvd24uY3JlYXRlTGlzdCh0aGlzLm5hdkxpc3QpO1xyXG4gICAgICAgIHRoaXMudWwuY2xhc3NMaXN0LmFkZCgnZHJvcGRvd24nKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudWwpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdXNlRW50ZXIgPSB0aGlzLm1vdXNlRW50ZXIuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLm1vdXNlTGVhdmUgPSB0aGlzLm1vdXNlTGVhdmUuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmRpc21pc3MgPSB0aGlzLmRpc21pc3MuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmtleWJvYXJkTmF2aWdhdGlvbiA9IHRoaXMua2V5Ym9hcmROYXZpZ2F0aW9uLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5uYXZDbGljayA9IHRoaXMubmF2Q2xpY2suYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUxlYXZlKGUpIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgICAgICB0aGlzLmxvZ2dlcignbW91c2VsZWF2ZScsIGUudGFyZ2V0KTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUVudGVyKGUpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlcignbW91c2VlbnRlcicsIGUudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgIGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc3VibmF2JykpIHtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChEcm9wZG93bi5vcGVuTmVzdGVkLmJpbmQobnVsbCwgZS50YXJnZXQpLCA1MDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoRHJvcGRvd24uY2xvc2VSZWxhdGVkLmJpbmQobnVsbCwgZS50YXJnZXQpLCA1MDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuYXZDbGljayhlKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIoZS50YXJnZXQpO1xyXG4gICAgICAgIGlmKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc3VibmF2JykpIHtcclxuICAgICAgICAgICAgRHJvcGRvd24ub3Blbk5lc3RlZChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUNsaWNrKGVsdCwgZXZ0KSB7XHJcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGlmKGV2dC5jbGllbnRYICYmIGV2dC5jbGllbnRZKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3Blbih3aW5kb3cucGFnZVhPZmZzZXQgKyBldnQuY2xpZW50WCwgd2luZG93LnBhZ2VZT2Zmc2V0ICsgZXZ0LmNsaWVudFkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbihyZWN0LnJpZ2h0LCByZWN0LmJvdHRvbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9wZW4obGVmdCwgdG9wKSB7XHJcbiAgICAgICAgdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKCcub3BlbiwuYWN0aXZlJykuZm9yRWFjaChlbHQgPT4ge1xyXG4gICAgICAgICAgICBlbHQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicsICdhY3RpdmUnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnVsLmNsYXNzTGlzdC5hZGQoJ29wZW5lZCcpO1xyXG5cclxuICAgICAgICBjb25zdCByZWN0ID0gdGhpcy51bC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB0aGlzLnVsLnN0eWxlLmxlZnQgPSAobGVmdCArIHJlY3Qud2lkdGgpIDwgd2luZG93LmlubmVyV2lkdGggPyBgJHtsZWZ0fXB4YCA6IGAke2xlZnQgLSByZWN0LndpZHRofXB4YDtcclxuICAgICAgICB0aGlzLnVsLnN0eWxlLnRvcCA9ICh0b3AgKyByZWN0LmhlaWdodCkgPCB3aW5kb3cuaW5uZXJIZWlnaHQgPyBgJHt0b3B9cHhgICA6IGAke3RvcCAtIHJlY3QuaGVpZ2h0fXB4YDtcclxuXHJcbiAgICAgICAgdGhpcy51bC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLmZvckVhY2goc3VibmF2ID0+IHtcclxuICAgICAgICAgICAgc3VibmF2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLm1vdXNlRW50ZXIpO1xyXG4gICAgICAgICAgICBzdWJuYXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMubW91c2VMZWF2ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy51bC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMubmF2Q2xpY2spO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWJvYXJkTmF2aWdhdGlvbik7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRpc21pc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGtleWJvYXJkTmF2aWdhdGlvbihlKSB7XHJcbiAgICAgICAgbGV0IG9wZW4gPSB0aGlzLnVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcGVuID4gdWwnKTtcclxuICAgICAgICBpZihvcGVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgb3BlbiA9IG9wZW5bb3Blbi5sZW5ndGggLSAxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvcGVuID0gdGhpcy51bDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGFjdGl2ZSA9IG9wZW4ucXVlcnlTZWxlY3RvcignbGkuYWN0aXZlJyk7XHJcbiAgICAgICAgdGhpcy5sb2dnZXIob3Blbik7XHJcbiAgICAgICAgbGV0IG5leHQ7XHJcbiAgICAgICAgc3dpdGNoKGUua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cCBhcnJvd1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGlmKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBhY3RpdmUucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZighbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBvcGVuLmNoaWxkcmVuW29wZW4uY2hpbGRyZW4ubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd24gYXJyb3dcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gYWN0aXZlLm5leHRFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZighbmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBvcGVuLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbmV4dC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0IGFycm93XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKG9wZW4gJiYgb3BlbiAhPT0gdGhpcy51bCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBEcm9wZG93bi5jbG9zZVJlbGF0ZWQob3Blbi5wYXJlbnRFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHQgYXJyb3dcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBEcm9wZG93bi5vcGVuTmVzdGVkKGFjdGl2ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlLnF1ZXJ5U2VsZWN0b3IoJ2xpJykuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxMzogLy8gZW50ZXJcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBpZihhY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI3OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNtaXNzKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzbWlzcygpIHtcclxuICAgICAgICB0aGlzLnVsLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW5lZCcpO1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWJvYXJkTmF2aWdhdGlvbik7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRpc21pc3MpO1xyXG5cclxuICAgICAgICB0aGlzLnVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5uYXZDbGljayk7XHJcblxyXG4gICAgICAgIHRoaXMudWwucXVlcnlTZWxlY3RvckFsbCgnbGknKS5mb3JFYWNoKHN1Ym5hdiA9PiB7XHJcbiAgICAgICAgICAgIHN1Ym5hdi5jbGFzc0xpc3QucmVtb3ZlKCdvcGVuJywgJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBzdWJuYXYucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMubW91c2VFbnRlcik7XHJcbiAgICAgICAgICAgIHN1Ym5hdi5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5tb3VzZUxlYXZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuIl19