if(!NodeList.prototype.forEach) {
	NodeList.prototype.forEach = Array.prototype.forEach;
}

const debug = () => {};// console.log.bind(console);
function closeRelated(subnav) {
	subnav.parentElement.querySelectorAll('.open').forEach(function(subnav) {
		subnav.classList.remove('open')
	});
}
function openNested(subnav) {
	const xPos = '95%';
	const yPos = '-0.2em';
	closeRelated(subnav);
	subnav.classList.add('open');
	const ul = subnav.querySelector('ul')
	const rect = subnav.getBoundingClientRect();
	const ulRect = ul.getBoundingClientRect();
	if((rect.top + ulRect.height) > window.innerHeight) {
		ul.style.top = '';
		ul.style.bottom = yPos;
	} else {
		ul.style.top = yPos;
		ul.style.bottom = '';
	}
	if((rect.right + ulRect.width) > window.innerWidth) {
		ul.style.left = '';
		ul.style.right = xPos;
	} else {
		ul.style.left = xPos;
		ul.style.right = '';
	}
}
function navClick(e) {
	debug(e.target);
	if(e.target.classList.contains('subnav')) {
		openNested(e.target);
		e.stopPropagation();
	}
}

const elts = document.querySelectorAll('[data-dropdown-trigger]');
elts.forEach(elt => elt.addEventListener('click', evt => {
	evt.stopPropagation();
	const id = elt.getAttribute('data-dropdown-trigger');
	const nav = document.getElementById(id);
	nav.querySelectorAll('.open,.active').forEach(elt => {
		elt.classList.remove('open', 'active');
	});
	nav.classList.add('opened');
	if(evt.clientX && evt.clientY) {
		const rect = nav.getBoundingClientRect();
		if((rect.width + evt.clientX) > window.innerWidth) {
			nav.style.left = '';
			nav.style.right = `${window.innerWidth - evt.clientX}px`;
		} else {
			nav.style.left = `${evt.clientX}px`;
			nav.style.right = '';
		}
		nav.style.top = `${window.pageYOffset + evt.clientY}px`;
		nav.style.bottom = '';
		console.log(rect.height + evt.clientY, window.innerHeight);
		nav.style.transform = '';
		if((rect.height + evt.clientY) > window.innerHeight) {
			nav.style.transform = 'translateY(-100%)';
		}
	} else {
		const rect = elt.getBoundingClientRect();
		debug(rect);
		nav.style.top = `${rect.right}px`;
		nav.style.left = `${rect.bottom}px`;
	}
	debug({id, nav});

	let timeout;
	function mouseEnter(e) {
		debug('mouseenter', e.target);

		e.target.classList.add('active');

		clearTimeout(timeout);
		if(e.target.classList.contains('subnav')) {
			timeout = setTimeout(openNested.bind(null, e.target), 500);
		} else {
			timeout = setTimeout(closeRelated.bind(null, e.target), 500);
		}
	}
	function mouseLeave(e) {
		clearTimeout(timeout);
		e.target.classList.remove('active');
		debug('mouseleave', e.target);
	}
	function keyboardNavigation(e) {
		let open = nav.querySelectorAll('.open > ul');
		if(open.length > 0) {
			open = open[open.length - 1];
		} else {
			open = nav;
		}
		let active = open.querySelector('li.active');
		debug(open);
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
					if(open && open !== nav) {
						closeRelated(open.parentElement);
					}
				}
				break;
			case 39: // right arrow
				e.stopPropagation();
				e.preventDefault();
				if(active) {
					openNested(active);
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
				dismiss();
				break;
		}
	}

	function dismiss() {
		nav.classList.remove('opened');
		document.removeEventListener('keypress', keyboardNavigation);
		document.removeEventListener('click', dismiss);

		nav.removeEventListener('click', navClick);

		nav.querySelectorAll('li').forEach(function(subnav) {
			subnav.classList.remove('open', 'active');
			subnav.removeEventListener('mouseenter', mouseEnter);
			subnav.removeEventListener('mouseleave', mouseLeave);
		});
	}

	nav.querySelectorAll('li').forEach(function(subnav) {
		subnav.addEventListener('mouseenter', mouseEnter);
		subnav.addEventListener('mouseleave', mouseLeave);
	});
	nav.addEventListener('click', navClick);
	document.addEventListener('keydown', keyboardNavigation);
	document.addEventListener('click', dismiss);
}));
