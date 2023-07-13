var fullBodyEl = document.querySelector('#bodyDiagram');
var headEl = document.querySelector('#head');
var legsEl = document.querySelector('#legs');
var upperBodyEl = document.querySelector('#upperBody');
var coreEl = document.querySelector('#core');

function bodyPartSelector(event) {
    console.log(event.target.id);
}

headEl.addEventListener('click', bodyPartSelector);
legsEl.addEventListener('click', bodyPartSelector);
upperBodyEl.addEventListener('click', bodyPartSelector);
coreEl.addEventListener('click', bodyPartSelector);