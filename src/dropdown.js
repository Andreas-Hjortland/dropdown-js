/** @module */

/**
 * Class representing a dropdown
 */
export default class Dropdown {
    // General documentation of the types
    /**
     * @typedef {Object} Dropdown~NavItem
     * This is the structure of a navigation item
     * @property {string} label                   - The label which is used in the menu
     * @property {boolean} [disabled=false]       - If this is true the item is disabled. If this is true we will not
     *                                              navigate according to the action parameter or run the action
     *                                              callback.
     * @property {(string|Dropdown~actionCallback)} action - What to do when we select this nav item. If this is a string we will
     *                                              navigate like an &lt;a&gt; tag
     */

    /**
     * @typedef {Object} Dropdown~NavMenu
     * This is the structure of a navigation submenu
     * @property {string} label                    - The label which is used in the menu
     * @property {boolean} [disabled=false]        - If this is true the item is disabled. When disabled it will not be
     *                                               expanded
     * @property {Array<Dropdown~NavItem|Dropdown~NavMenu>} children - The children of this menu
     */

    /**
     * @callback Dropdown~actionCallback
     * This is the action callback
     * @param {Event} event - This is the event (either click or keypress) which triggered this handler
     */

    /**
     * @typedef {Object} Dropdown~Options
     * This is the structure of the options object
     * @property {Dropdown~logger} [logger=console.log] - The logger to use
     * @property {Element} [element=document.body] - The element to attach the dropdown to
     */

    /**
     * @callback Dropdown~logger
     * This is the logging function
     * @param {...*} logItems - This should work similarly to how console.log uses multiple parameters
     */

    // Private members
    /**
     * Class name of a subnav
     *
     * @private
     */
    static get _subnavClassName() { return 'subnav'; }

    /**
     * Class name of an open subnav
     *
     * @private
     */
    static get _openClassName() { return 'open';   }

    /*
     * Class name of an active item
     *
     * @private
     */
    static get _activeClassName() { return 'active'; }

    /**
     * Class name of a disabled item
     *
     * @private
     */
    static get _disabledClassName() { return 'disabled'; }

    /**
     * X-position (either positive or negative dependeing on space available) of a submenu. Relative to the parent item.
     *
     * @private
     */
    static get _nestedXPos() { return '95%';    }

    /**
     * Y-position (either positive or negative depending on space available) of a submenu. Relative to the parent item.
     *
     * @private
     */
    static get _nestedYPos() { return '-0.2em'; }

    // Private static methods
    /**
     * A helper function to close all submenus on a given level.
     *
     * @private
     *
     * @param {Element} subnav - An element on the level we want to close all the open subnavs
     */
    static _closeRelated(subnav) {
        subnav.parentElement.querySelectorAll(`.${Dropdown._openClassName}`).forEach(subnav => {
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
    static _openNested(subnav) {
        Dropdown._closeRelated(subnav);
        subnav.classList.add(Dropdown._openClassName);
        const ul = subnav.querySelector('ul');
        const rect = subnav.getBoundingClientRect();
        const ulRect = ul.getBoundingClientRect();

        if((rect.right + ulRect.width) > window.innerWidth) {
            ul.style.left = '';
            ul.style.right = Dropdown._nestedXPos;
        } else {
            ul.style.right = '';
            ul.style.left = Dropdown._nestedXPos;
        }
        if((rect.top + ulRect.height) > window.innerHeight) {
            ul.style.top = '';
            ul.style.bottom = Dropdown._nestedYPos;
        } else {
            ul.style.bottom = '';
            ul.style.top = Dropdown._nestedYPos;
        }
    }


    /**
     * @constructor
     * @param {Array<Dropdown~NavItem|Dropdown~NavMenu>} navList - Object representation of the context menu.
     * @param {Dropdown~Options} options - Optional parameters for this instance
     */
    constructor(navList, options = {}) { 
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
    _createList(navList) {
        const ul = document.createElement('ul');
        navList.forEach(navElt => {
            const li = document.createElement('li');
            li.innerText = navElt.label;

            if(navElt.disabled) {
                li.classList.add(Dropdown._disabledClassName);
                li.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            } else {
                li.addEventListener('mouseleave', e => {
                    this.logger('mouseleave', e);
                    clearTimeout(this.timeout);
                    e.target.classList.remove(Dropdown._activeClassName);
                });
                li.addEventListener('mouseenter', e => {
                    this.logger('mouseenter', e);

                    e.target.classList.add(Dropdown._activeClassName);

                    clearTimeout(this.timeout);
                    if(navElt.children) {
                        this.timeout = setTimeout(Dropdown._openNested.bind(null, e.target), 500);
                    } else {
                        this.timeout = setTimeout(Dropdown._closeRelated.bind(null, e.target), 500);
                    }
                });

                if(navElt.children) {
                    li.addEventListener('click', function(e) {
                        if(e.target === this) {
                            Dropdown._openNested(li);
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    });
                    li.appendChild(this._createList(navElt.children));
                    li.classList.add(Dropdown._subnavClassName);
                } else if(typeof(navElt.action) === 'string') {
                    li.addEventListener('click', () => window.location.href = navElt.action);
                } else if(typeof(navElt.action) === 'function') {
                    li.addEventListener('click', navElt.action);
                }
            }

            ul.appendChild(li);
        });

        return ul;
    }

    /**
     * This is the keyboard navigation event handler
     *
     * @private
     *
     * @param {Event} e - The keyboard event that triggerd this handler
     */
    _keyboardNavigation(e) {
        let open = this.ul.querySelectorAll(`.${Dropdown._openClassName} > ul`);
        if(open.length > 0) {
            open = open[open.length - 1];
        } else {
            open = this.ul;
        }
        let active = open.querySelector(`li.${Dropdown._activeClassName}`);
        this.logger(open);
        let next;
        switch(e.keyCode) {
            case 38: // up arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    next = active.previousElementSibling;
                    while(next && next.classList.contains(Dropdown._disabledClassName)) {
                        next = next.previousElementSibling;
                    }
                    active.classList.remove(Dropdown._activeClassName);
                }
                if(!next) {
                    next = open.children[open.children.length - 1];
                    while(next && next.classList.contains(Dropdown._disabledClassName)) {
                        next = next.previousElementSibling;
                    }
                }
                if(next) {
                    next.classList.add(Dropdown._activeClassName);
                }
                break;
            case 40: // down arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    next = active.nextElementSibling;
                    while(next && next.classList.contains(Dropdown._disabledClassName)) {
                        next = next.nextElementSibling;
                    }
                    active.classList.remove(Dropdown._activeClassName);
                }
                if(!next) {
                    next = open.children[0];
                    while(next && next.classList.contains(Dropdown._disabledClassName)) {
                        next = next.nextElementSibling;
                    }
                }
                next.classList.add(Dropdown._activeClassName);
                break;
            case 37: // left arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    active.classList.remove(Dropdown._activeClassName);
                    active.parentElement.parentElement.classList.remove(Dropdown._openClassName);
                    active.parentElement.parentElement.classList.add(Dropdown._activeClassName);
                } else {
                    if(open && open !== this.ul) {
                        Dropdown._closeRelated(open.parentElement);
                    }
                }
                break;
            case 39: // right arrow
                e.stopPropagation();
                e.preventDefault();
                if(active && active.classList.contains(Dropdown._subnavClassName)) {
                    Dropdown._openNested(active);
                    active.querySelector('li').classList.add(Dropdown._activeClassName);
                }
                break;
            case 13: // enter
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    active.click();
                }
                break;
            case 27:
                this.dismiss();
                break;
        }
    }

    // Public methods
    /**
     * Close a dropdown and remove all event listeners on it
     */
    dismiss() {
        this.logger('dismiss');
        this.ul.classList.remove(Dropdown._openClassName);
        document.removeEventListener('keydown', this._keyboardNavigation);
        document.removeEventListener('click', this.dismiss);

        this.ul.querySelectorAll('li').forEach(subnav => {
            subnav.classList.remove(Dropdown._openClassName,Dropdown._activeClassName);
        });
    }

    /**
     * This function will take an event and try to open and position the dropdown next to the mouse pointer or the
     * element the event triggered on.
     *
     * @param {Event} evt - The event that triggered this click
     */
    openClick(evt) {
        this.logger(evt);
        evt.stopPropagation();
        evt.preventDefault();
        if(evt.clientX && evt.clientY) {
            return this.open(window.pageXOffset + evt.clientX, window.pageYOffset + evt.clientY, true);
        } 

        const rect = evt.target.getBoundingClientRect();
        return this.open(window.pageXOffset + rect.right, window.pageYOffset + rect.bottom, true);
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
     */
    open(left, top, autoExpandDir = true) {
        this.ul.querySelectorAll(`.${Dropdown._openClassName},.${Dropdown._activeClassName}`).forEach(elt => {
            elt.classList.remove(Dropdown._openClassName,Dropdown._activeClassName);
        });
        this.ul.classList.add(Dropdown._openClassName);

        const rect = this.ul.getBoundingClientRect();
        this.ul.style.left = `${left}px`;
        this.ul.style.top = `${top}px`;
        if(autoExpandDir) {
            if((left + rect.width) >= (window.pageXOffset + window.innerWidth)) {
                this.ul.style.left = `${left - rect.width}px`;
            }
            if((top + rect.height) >= (window.pageYOffset + window.innerHeight)) {
                this.ul.style.top = `${top - rect.height}px`;
            }
        }

        document.addEventListener('keydown', this._keyboardNavigation);
        document.addEventListener('click', this.dismiss);

        return this.ul;
    }
}
