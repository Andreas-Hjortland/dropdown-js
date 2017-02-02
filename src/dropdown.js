export default class Dropdown {
    static closeRelated(subnav) {
        subnav.parentElement.querySelectorAll('.open').forEach(subnav => {
            subnav.classList.remove('open');
        });
    }
    static openNested(subnav) {
        const xPos = '95%';
        const yPos = '-0.2em';
        Dropdown.closeRelated(subnav);
        subnav.classList.add('open');
        const ul = subnav.querySelector('ul');
        const rect = subnav.getBoundingClientRect();
        const ulRect = ul.getBoundingClientRect();

        ul.style.top = '';
        ul.style.bottom = '';
        ul.style.left = '';
        ul.style.right = '';
        if((rect.right + ulRect.width) > window.innerWidth) {
            ul.style.right = xPos;
        } else {
            ul.style.left = xPos;
        }
        if((rect.top + ulRect.height) > window.innerHeight) {
            ul.style.bottom = yPos;
        } else {
            ul.style.top = yPos;
        }
    }

    static createList(navList) {
        const ul = document.createElement('ul');
        navList.forEach(navElt => {
            const li = document.createElement('li');
            li.innerText = navElt.label;

            if(navElt.disabled) {
                li.classList.add('disabled');
                li.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            } else if(typeof(navElt.action) === 'string') {
                li.addEventListener('click', () => window.location.href = navElt.action);
            } else if(typeof(navElt.action) === 'function') {
                li.addEventListener('click', navElt.action);
            }


            if(navElt.children) {
                li.appendChild(Dropdown.createList(navElt.children));
                li.classList.add('subnav');
            }

            ul.appendChild(li);
        });

        return ul;
    }
    constructor(navList, options = { logger : console.log.bind(console) }) { // eslint-disable-line no-console
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

    mouseLeave(e) {
        clearTimeout(this.timeout);
        e.target.classList.remove('active');
        this.logger('mouseleave', e.target);
    }

    mouseEnter(e) {
        this.logger('mouseenter', e.target);

        e.target.classList.add('active');

        clearTimeout(this.timeout);
        if(e.target.classList.contains('subnav')) {
            this.timeout = setTimeout(Dropdown.openNested.bind(null, e.target), 500);
        } else {
            this.timeout = setTimeout(Dropdown.closeRelated.bind(null, e.target), 500);
        }
    }

    navClick(e) {
        this.logger(e.target);
        if(e.target.classList.contains('subnav')) {
            Dropdown.openNested(e.target);
            e.stopPropagation();
        }
    }

    handleClick(elt, evt) {
        evt.stopPropagation();
        if(evt.clientX && evt.clientY) {
            this.open(window.pageXOffset + evt.clientX, window.pageYOffset + evt.clientY);
        } else {
            const rect = elt.getBoundingClientRect();
            this.open(rect.right, rect.bottom);
        }
    }

    open(left, top) {
        this.ul.querySelectorAll('.open,.active').forEach(elt => {
            elt.classList.remove('open', 'active');
        });
        this.ul.classList.add('opened');

        const rect = this.ul.getBoundingClientRect();
        this.ul.style.left = (left + rect.width) < window.innerWidth ? `${left}px` : `${left - rect.width}px`;
        this.ul.style.top = (top + rect.height) < window.innerHeight ? `${top}px`  : `${top - rect.height}px`;

        this.ul.querySelectorAll('li').forEach(subnav => {
            subnav.addEventListener('mouseenter', this.mouseEnter);
            subnav.addEventListener('mouseleave', this.mouseLeave);
        });
        this.ul.addEventListener('click', this.navClick);
        document.addEventListener('keydown', this.keyboardNavigation);
        document.addEventListener('click', this.dismiss);
    }

    keyboardNavigation(e) {
        let open = this.ul.querySelectorAll('.open > ul');
        if(open.length > 0) {
            open = open[open.length - 1];
        } else {
            open = this.ul;
        }
        let active = open.querySelector('li.active');
        this.logger(open);
        let next;
        switch(e.keyCode) {
            case 38: // up arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    next = active.previousElementSibling;
                    active.classList.remove('active');
                }
                if(!next) {
                    next = open.children[open.children.length - 1];
                }
                next.classList.add('active');
                break;
            case 40: // down arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    next = active.nextElementSibling;
                    active.classList.remove('active');
                }
                if(!next) {
                    next = open.children[0];
                }
                next.classList.add('active');
                break;
            case 37: // left arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    active.classList.remove('active');
                    active.parentElement.parentElement.classList.remove('open');
                    active.parentElement.parentElement.classList.add('active');
                } else {
                    if(open && open !== this.ul) {
                        Dropdown.closeRelated(open.parentElement);
                    }
                }
                break;
            case 39: // right arrow
                e.stopPropagation();
                e.preventDefault();
                if(active) {
                    Dropdown.openNested(active);
                    active.querySelector('li').classList.add('active');
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

    dismiss() {
        this.ul.classList.remove('opened');
        document.removeEventListener('keydown', this.keyboardNavigation);
        document.removeEventListener('click', this.dismiss);

        this.ul.removeEventListener('click', this.navClick);

        this.ul.querySelectorAll('li').forEach(subnav => {
            subnav.classList.remove('open', 'active');
            subnav.removeEventListener('mouseenter', this.mouseEnter);
            subnav.removeEventListener('mouseleave', this.mouseLeave);
        });
    }

}
