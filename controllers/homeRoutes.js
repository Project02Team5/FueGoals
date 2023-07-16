require("dotenv").config();
const router = require("express").Router();
const { User, Activity } = require("../models");
const withAuth = require("../utils/auth");
const { Sequelize, Op } = require("sequelize");
const request = require("request");

// sets time period as user defined interval deducted from today
const intervalDate = (interval) => {
  var date = new Date();
  var formatDate = date.setDate(date.getDate() - interval);
  return formatDate;
};

// Prevent non logged in users from viewing the homepage
router.get("/", async (req, res) => {
  const interval = req.query.interval || 30;
  // http://localhost:3001/?interval=1
  if (!req.session.logged_in) {
    try {
      const activityData = await Activity.findAll({
        limit: 1,
        attributes: [
          [
            Sequelize.literal(
              '(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'
            ),
            "cardioCount",
          ],
          [
            Sequelize.literal(
              '(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "strength")'
            ),
            "strengthCount",
          ],
          [
            Sequelize.literal(
              '(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'
            ),
            "flexibilityCount",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'
            ),
            "cardioDuration",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "strength")'
            ),
            "strengthDuration",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'
            ),
            "flexibilityDuration",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_sets) * SUM(strength_weight) FROM activity WHERE workout_completed = true AND activity_type = "strength")'
            ),
            "poundsLifted",
          ],
        ],
      });

      const activities = activityData.map((activity) =>
        activity.get({ plain: true })
      );
      res.render("homepage", {
        activities,
        logged_in: req.session.logged_in,
      });
      // res.send(activities);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    try {
      const activityData = await Activity.findAll({
        limit: 1,
        attributes: [
          [
            Sequelize.literal(
              '(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'
            ),
            "cardioCount",
          ],
          [
            Sequelize.literal(
              '(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "strength")'
            ),
            "strengthCount",
          ],
          [
            Sequelize.literal(
              '(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'
            ),
            "flexibilityCount",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'
            ),
            "cardioDuration",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "strength")'
            ),
            "strengthDuration",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'
            ),
            "flexibilityDuration",
          ],
          [
            Sequelize.literal(
              '(SELECT SUM(activity_sets) * SUM(strength_weight) FROM activity WHERE workout_completed = true AND activity_type = "strength")'
            ),
            "poundsLifted",
          ],
        ],
        include: {
          model: User,
          attributes: ["activity_interval", "name"],
        },
        where: {
          [Op.and]: [
            { user_id: req.session.user_id },
            {
              createdAt: {
                [Op.gt]: intervalDate(interval),
              },
            },
          ],
        },
      });

      const activities = activityData.map((activity) =>
        activity.get({ plain: true })
      );

      res.render("homepage", {
        activities,
        logged_in: req.session.logged_in,
      });
      // res.send(activities);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

// If a session exists, redirect the request to the homepage
router.get("/login", (req, res) => {
  if (req.session.logged_in) {
    res.redirect("/");
    return;
  }

  res.render("login");
});

router.get("/dashboard", async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      include: { model: Activity },
    });

    let users = [];
    if (userData) {
      users = userData.get({ plain: true });
    }

    res.render("dashboard", {
      users,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

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
router.post("/exercises", async (req, res) => {
  try {
    // available varialbes
    var muscle = req.body.muscle;
    var difficulty = req.body.difficulty;
    var type = req.body.type;
    var offset = "";

    const exerciseData = await request.get(
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
        else {
          exercises = JSON.stringify(body);
          // res.render("homepage", {
          //   exercises,
          // });
          res.send(exercises);
        }
      }
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// creates new activity from selections
router.post("/", async (req, res) => {
  try {
    const newActivity = await Activity.create({
      activity_type: req.body.activity_type,
      activity_performed: req.body.activity_performed,
      workout_completed: req.body.workout_completed,
      user_id: 4,
    });
    // res.redirect("/");
    res.send({ message: "Activity Created" });
  } catch (err) {
    res.status(400).json(err);
  }
});

// retrieve pending workouts for user
router.get("/exercises", async (req, res) => {
  try {
    const activityData = await Activity.findAll({
      where: {
        workout_completed: false,
        user_id: 4
      },
    });
    const activities = activityData.map((activity) =>
      activity.get({ plain: true })
    );
    res.send(activities);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update completed workouts
router.put("/exercises", async (req, res) => {
  try {
    const updateActivity = await Activity.update(
      { workout_completed: true},
      { where: { id: req.body.id } }
    );
    res.send({ message: "Activity Updated"});
  } catch (err) {
    res.status(500).json(err);
  }
})

module.exports = router;
