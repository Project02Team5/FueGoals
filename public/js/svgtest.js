var fullBodyEl = document.querySelector("#bodyDiagram");
var headEl = document.querySelector("#head");
var legsEl = document.querySelector("#legs");
var upperBodyEl = document.querySelector("#upperBody");
var coreEl = document.querySelector("#core");
var rightEl = document.querySelector(".bodyViewR");
var leftEl = document.querySelector(".bodyViewL");

// save workouts to database
const saveWorkouts = async () => {
  var exChecks = document.querySelectorAll(
    '.bodyViewR input[type="checkbox"]:checked'
  );
  var selectedExs = [];
  var newActivity = {};
  for (let i = 0; i < exChecks.length; i++) {
    newActivity = {
      activity_type: exChecks[i].value,
      activity_performed: exChecks[i].id,
      workout_completed: false,
    };
    const createExercise = await fetch("/", {
      method: "POST",
      body: JSON.stringify(newActivity),
      headers: { "Content-Type": "application/json" },
    });
    selectedExs.push(newActivity);
  }
  await getExercises();
};

// update workouts in database
const updateWorkouts = async () => {
  var exChecks = document.querySelectorAll(
    '.bodyViewL input[type="checkbox"]:checked'
  );
  var updateActivity = {};
  for (let i = 0; i < exChecks.length; i++) {
    if (!document.getElementById(`lbs${exChecks[i].id}`)) {
      var lbs = null;
    } else {
      var lbs = document.getElementById(`lbs${exChecks[i].id}`).value;
    }
    updateActivity = {
      id: exChecks[i].id,
      activity_duration: document.getElementById(`dur${exChecks[i].id}`).value,
      activity_sets: document.getElementById(`sets${exChecks[i].id}`).value,
      strength_weight: lbs,
    };
    const updateExercise = await fetch("/exercises", {
      method: "PUT",
      body: JSON.stringify(updateActivity),
      headers: { "Content-Type": "application/json" },
    });
  }
  await getExercises();
};

// get a list of exercise options to select and a list of pending exercises for user (if any exist)
const getExercises = (m, t) => {
  // retrieve options
  if (!m && !t) {
    rightEl.innerHTML =
      "<h3 id='exercisechoices'>Workout Choices</h3></br><p>Click a body part to display options</p>";
  } else {
    const initAPI = fetch("/exercises", {
      method: "POST",
      body: JSON.stringify({
        muscle: m,
        difficulty: "",
        type: t,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      return response.json();
    });
    initAPI.then((e) => {
      const recExercises = JSON.parse(e);
      const exercises = [];
      for (let i = 0; i < recExercises.length; i++) {
        exercises.push(
          `<input type='checkbox' id='${recExercises[i].name}' value='${
            recExercises[i].type
          }' class='exercise-options' name='exChoices' unchecked><label id='lblfor${[
            i,
          ]}' for='${recExercises[i].name}'>` +
            recExercises[i].name +
            "</label></br>"
        );
      }
      rightEl.innerHTML =
        "<h3 id='exercisechoices' class='workout-headers'>Workout Choices</h3></br><button class='btnsaveworkouts' onClick='saveWorkouts()'>Save Workouts</button></br>" +
        exercises.join(" ");
    });
  }
  // retrieve pending
  const initPending = fetch("/exercises", {
    method: "GET",
  }).then((response) => {
    return response.json();
  });
  initPending.then((e) => {
    const recPending = e;
    const pending = [];
    for (let i = 0; i < recPending.length; i++) {
      if (
        recPending[i].activity_type != "cardio" &&
        recPending[i].activity_type != "stretching"
      ) {
        var weightInput = `<input id='lbs${recPending[i].id}' class='pending-inputs' type='text' name='lbs' placeholder='total lbs lifted'></br>`;
      } else {
        var weightInput = "";
      }
      pending.push(
        `<input type='checkbox' id='${recPending[i].id}' class='pending-exercises' name='exPending' unchecked><label id='lblfor${recPending[i].id}' for='${recPending[i].id}'>` +
          recPending[i].activity_performed +
          `</label><input id='dur${recPending[i].id}' class='pending-inputs' type='text' name='dur' placeholder='workout time in mins'></br><input id='sets${recPending[i].id}' class='pending-inputs' type='text' name='sets' placeholder='# of sets performed'></br>${weightInput}`
      );
    }
    leftEl.innerHTML =
      "<h3 id='pendingworkouts' class='workout-headers'>Pending Workouts</h3></br><button class='btnsaveworkouts' onClick='updateWorkouts()'>Complete Checked Workouts</button></br>" +
      pending.join(" ");
  });
};

function bodyPartSelector(event) {
  const logoutCheck = document.getElementById("logout");
  if (typeof logoutCheck != "undefined" && logoutCheck != null) {
    if (event.target.id === "head") {
      getExercises("", "cardio");
    } else if (event.target.id === "upperBody") {
      getExercises("biceps", "strength");
    } else if (event.target.id === "legs") {
      getExercises("glutes", "strength");
    } else if (event.target.id === "core") {
      getExercises("abdominals", "strength");
    }
  } else {
    if (event.target.id === "head") {
      leftEl.textContent = "Login to choose workouts!";
    } else if (event.target.id === "upperBody") {
      leftEl.textContent = "Login to choose workouts!";
    } else if (event.target.id === "legs") {
      leftEl.textContent = "Login to choose workouts!";
    } else if (event.target.id === "core") {
      leftEl.textContent = "Login to choose workouts!";
    }
  }
}

headEl.addEventListener("click", bodyPartSelector);
legsEl.addEventListener("click", bodyPartSelector);
upperBodyEl.addEventListener("click", bodyPartSelector);
coreEl.addEventListener("click", bodyPartSelector);
