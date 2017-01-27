# Dropdown JS
**Note that this is still a work in progress, have no proper API yet, and does
not play nice with IE yet.**

This is a simple pure javascript library to create dropdowns which manages
nested dropdowns better than most.

It supports every evergreen browser without transpiling. It also works with
IE11/10 with babel and a polyfill for `NodeList.prototype.forEach`. The simplest
working polyfill for `NodeList.prototype.forEach` is `NodeList.prototype.forEach
= Array.prototype.forEach`. If you need IE9 support you also need to add a
polyfill for the `classList` property of `DOMElement`. I have had success using
[classList.js](https://github.com/eligrey/classList.js).

