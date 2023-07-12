require("dotenv").config();
const router = require("express").Router();
const request = require("request");

// arrays for query parameters
const exerciseTypes = [
  "cardio",
  "olympic_weightlifting",
  "plyometrics",
  "powerlifting",
  "strength",
  "stretching",
  "strongman",
];

const muscleTypes = [
  "abdominals",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "chest",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "lower_back",
  "middle_back",
  "neck",
  "quadriceps",
  "traps",
  "triceps",
];

const difficultyTypes = ["beginner", "intermediate", "expert"];

// get request for /exercises route. GETs exercise api data based on user input
router.get("/", async (req, res) => {
  try {
    // available varialbes
    var muscle = req.body.muscle;
    var difficulty = req.body.difficulty;
    var type = req.body.type;
    var offset = "";
    request.get(
      {
        url:
          "https://api.api-ninjas.com/v1/exercises?muscle=" +
          muscle +
          "&difficulty=" +
          difficulty +
          "&type=" +
          type +
          "&offset=" +
          offset,
        headers: {
          "X-Api-Key": process.env.API_KEY,
        },
      },
      function (error, response, body) {
        if (error) return console.error("Request failed:", error);
        else if (response.statusCode != 200)
          return console.error(
            "Error:",
            response.statusCode,
            body.toString("utf8")
          );
        else res.send(body);
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
