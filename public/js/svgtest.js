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

// save workouts to database
const saveWorkouts = () => {
  var exChecks = document.querySelectorAll('.bodyViewR input[type="checkbox"]:checked');
  var selectedExs = [];
  var newActivity = {};
  for (let i = 0; i < exChecks.length; i++) {
      newActivity = {
        activity_type: exChecks[i].value,
        activity_performed: exChecks[i].id,
        workout_completed: false
      };
      const createExercise = fetch("/", {
        method: "POST",
        body: JSON.stringify(newActivity),
        headers: {"Content-Type": "application/json"},
      });
      selectedExs.push(newActivity);
  };
  console.log(selectedExs);
  const initPending = fetch("/exercises", {
    method: "GET",
  }).then((response) => {
    return response.json();
  });
  initPending.then((e) => {
    const recPending = e;
    const pending = []
    for (let i=0; i < recPending.length; i++) {
        pending.push(`<input type='checkbox' id='${recPending[i].id}' class='pending-exercises' name='exPending' unchecked><label id='lblfor${recPending[i].id}' for='${recPending[i].id}'>`+recPending[i].activity_performed+"</label></br>");
    }
  leftEl.innerHTML = "<h3 id='pendingworkouts'>Pending Workouts</h3></br><button id='btnsaveworkouts' onClick='updateWorkouts()'>Complete Checked Workouts</button></br>" + pending.join(' ');
  });
  getExercises();
};

// save workouts to database
const updateWorkouts = () => {
  var exChecks = document.querySelectorAll('.bodyViewL input[type="checkbox"]:checked');
  var updateActivity = {};
  for (let i = 0; i < exChecks.length; i++) {
      updateActivity = {
        id: exChecks[i].id
      };
      const updateExercise = fetch("/exercises", {
        method: "PUT",
        body: JSON.stringify(updateActivity),
        headers: {"Content-Type": "application/json"},
      });
  };
  const initPending = fetch("/exercises", {
    method: "GET",
  }).then((response) => {
    return response.json();
  });
  initPending.then((e) => {
    const recPending = e;
    const pending = []
    for (let i=0; i < recPending.length; i++) {
        pending.push(`<input type='checkbox' id='${recPending[i].id}' class='pending-exercises' name='exPending' unchecked><label id='lblfor${recPending[i].id}' for='${recPending[i].id}'>`+recPending[i].activity_performed+"</label></br>");
    }
  leftEl.innerHTML = "<h3 id='pendingworkouts'>Pending Workouts</h3></br><button id='btnsaveworkouts' onClick='updateWorkouts()'>Complete Checked Workouts</button></br>" + pending.join(' ');
  });
  getExercises();
};

// get a list of exercise options to select and a list of pending exercises for user (if any exist)
const getExercises = (m, t) => {
  // retrieve options
  const initAPI = fetch("/exercises", {
    method: "POST",
    body: JSON.stringify({
      muscle: m,
      difficulty: '',
      type: t,
    }),
    headers: { "Content-Type": "application/json" },
  })
  .then((response) => {
    return response.json();
  });
   initAPI.then((e) => {
    const recExercises = JSON.parse(e);
    const exercises = []
    for (let i=0; i < recExercises.length; i++) {
        exercises.push(`<input type='checkbox' id='${recExercises[i].name}' value='${recExercises[i].type}' class='exercise-options' name='exChoices' unchecked><label id='lblfor${[i]}' for='${recExercises[i].name}'>`+recExercises[i].name+"</label></br>");
    }
    rightEl.innerHTML = "<h3 id='exercisechoices'>Exercise Choices</h3></br><button id='btnsaveworkouts' onClick='saveWorkouts()'>Save Workouts</button></br>" + exercises.join(' ');
  });

  // retrieve pending
  const initPending = fetch("/exercises", {
    method: "GET",
  }).then((response) => {
    return response.json();
  });
  initPending.then((e) => {
    const recPending = e;
    const pending = []
    for (let i=0; i < recPending.length; i++) {
        pending.push(`<input type='checkbox' id='${recPending[i].id}' class='pending-exercises' name='exPending' unchecked><label id='lblfor${recPending[i].id}' for='${recPending[i].id}'>`+recPending[i].activity_performed+"</label></br>");
    }
  leftEl.innerHTML = "<h3 id='pendingworkouts'>Pending Workouts</h3></br><button id='btnsaveworkouts' onClick='updateWorkouts()'>Complete Checked Workouts</button></br>" + pending.join(' ');
  });
};

function bodyPartSelector(event) {
  //   console.log(event.target.id);
  //   stats can be added here eventually
  // TODO: add if that checks for logged out button - display stats based on body area clicks if logged out else retrieve options for user
  if (event.target.id === "head") {
    leftEl.textContent = "cardio";
  } else if (event.target.id === "upperBody") {
    leftEl.textContent = "Upper Body";
  } else if (event.target.id === "legs") {
    leftEl.textContent = "Legs";
  } else if (event.target.id === "core") {
    leftEl.textContent = "Core";
  }

  //   can use this to generate exercises on the right *modals for when you choose the exercise give it the correct params? maybe the params can be set by type as cardio usually is duration and other exercises are reps based.
  // TODO: add if that checks for logged out button - display stats based on body area clicks if logged out else retrieve options for user
  if (event.target.id === "head") {
    getExercises('', 'cardio');
  } else if (event.target.id === "upperBody") {
    getExercises('biceps', 'strength');
  } else if (event.target.id === "legs") {
    getExercises('glutes', 'strength');
  } else if (event.target.id === "core") {
    getExercises('abdominals', 'strength');
  }
}

headEl.addEventListener("click", bodyPartSelector);
legsEl.addEventListener("click", bodyPartSelector);
upperBodyEl.addEventListener("click", bodyPartSelector);
coreEl.addEventListener("click", bodyPartSelector);
