const getRefresh = async () => {
    const response = await fetch("/dashboard", {
        method: "GET",
    }).then(document.location.reload());
};


const incompleteWorkout = async (id) => {
const updateExercise = await fetch("/dashboard", {
    method: "PUT",
    body: JSON.stringify({ id: id}),
    headers: { "Content-Type": "application/json" },
  }).then(getRefresh());
  document.location.reload();
};