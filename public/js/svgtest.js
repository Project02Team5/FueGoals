var fullBodyEl = document.querySelector("#bodyDiagram");
var headEl = document.querySelector("#head");
var legsEl = document.querySelector("#legs");
var upperBodyEl = document.querySelector("#upperBody");
var coreEl = document.querySelector("#core");
var rightEl = document.querySelector(".bodyViewR");
var leftEl = document.querySelector(".bodyViewL");

// function to retrieve exercise options from API
const getRefresh = async () => {
  const response = await fetch("/", {
    method: "GET",
  }).then(document.location.reload());
};




const initAPI = fetch("/exercises", {
  method: "POST",
  body: JSON.stringify({
    muscle: '',
    difficulty: '',
    type: 'cardio',
  }),
  headers: { "Content-Type": "application/json" },
}).then((response) => {
  return response.json();
});


const getExercises = () => {
   initAPI.then((e) => {
    const recExercises = JSON.parse(e);
    const exercises = []
    for (let i=0; i < recExercises.length; i++) {
        exercises.push(`<p id='eo${[i]}' class='exercise-options'>`+recExercises[i].name+"</p>"+"</br>");
    }
    console.log(exercises);
    leftEl.innerHTML = exercises.join(' ');
  });
};

function bodyPartSelector(event) {
  //   console.log(event.target.id);
  //   stats can be added here eventually
  if (event.target.id === "head") {
    getExercises();
  } else if (event.target.id === "upperBody") {
    leftEl.textContent = "Upper Body";
  } else if (event.target.id === "legs") {
    leftEl.textContent = "Legs";
  } else if (event.target.id === "core") {
    leftEl.textContent = "Core";
  }

  //   can use this to generate exercises on the right *modals for when you choose the exercise give it the correct params? maybe the params can be set by type as cardio usually is duration and other exercises are reps based.
  if (event.target.id === "head") {
    rightEl.textContent = "Running";
  } else if (event.target.id === "upperBody") {
    rightEl.textContent = "Bench Press";
  } else if (event.target.id === "legs") {
    rightEl.textContent = "Squats";
  } else if (event.target.id === "core") {
    rightEl.textContent = "Sit Ups";
  }
}

headEl.addEventListener("click", bodyPartSelector);
legsEl.addEventListener("click", bodyPartSelector);
upperBodyEl.addEventListener("click", bodyPartSelector);
coreEl.addEventListener("click", bodyPartSelector);
