# Dropdown JS
This is a simple and small (6k minified, 1.7k gzip + 0.9k css) vanilla
javascript library to create dropdowns and context-menus and manages nested
menus in a sane manner.

It supports every evergreen browser without transpiling anything other than the
module exports. It also works with IE11/10 with babel and a polyfill for
`NodeList.prototype.forEach`. The simplest working polyfill for
`NodeList.prototype.forEach` is `NodeList.prototype.forEach =
Array.prototype.forEach`. If you need IE9 support you also need to add a
polyfill for the `classList` property of `DOMElement`. I have had success using
[classList.js](https://github.com/eligrey/classList.js).

