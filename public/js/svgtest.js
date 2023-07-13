var fullBodyEl = document.querySelector('#bodyDiagram');
var headEl = document.querySelector('#head');
var legsEl = document.querySelector('#legs');
var upperBodyEl = document.querySelector('#upperBody');
var coreEl = document.querySelector('#core');
var rightEl = document.querySelector('.bodyViewR');
var leftEl = document.querySelector('.bodyViewL');

function bodyPartSelector(event) {
    console.log(event.target.id);
    //   stats can be added here eventually
    leftEl.textContent = event.target.id;

    //   can use this to generate exercises on the right *modals for when you choose the exercise give it the correct params? maybe the params can be set by type as cardio usually is duration and other exercises are reps based.
    if (event.target.id === 'head') {
        rightEl.textContent = "Running";
    } else if (event.target.id === 'upperBody') {
        rightEl.textContent = "Bench Press";
    } else if (event.target.id === 'legs') {
        rightEl.textContent = "Squats";
    } else if (event.target.id === 'core') {
        rightEl.textContent = "Sit Ups";
    }
}

headEl.addEventListener('click', bodyPartSelector);
legsEl.addEventListener('click', bodyPartSelector);
upperBodyEl.addEventListener('click', bodyPartSelector);
coreEl.addEventListener('click', bodyPartSelector);