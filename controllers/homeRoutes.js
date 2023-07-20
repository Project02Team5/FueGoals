require("dotenv").config();
const router = require("express").Router();
const { User, Activity } = require("../models");
const withAuth = require("../utils/auth");
const { Sequelize, Op } = require("sequelize");
const request = require("request");
const multer = require('multer')
const { s3Uploadv2 } = require('./s3Service.js');

// multer-aws
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname, fieldname } = file;
    cb(null, `${fieldname}-${originalname}`)
  },
});

// filters file type by images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === 'image') {
    cb(null, true)
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// limits at 5mb per image
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }
});

// multiple images by fields posts
const multiUpload = upload.fields([
  { name: "profile" },
  // { name: "progress" },
]);


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
          attributes: ["name"],
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

router.get("/dashboard", withAuth, async (req, res) => {
  try {
    const activityData = await Activity.findAll({
      include: {
        model: User,
        attributes: ["name"],
      },
      where: {
        workout_completed: true,
        user_id: req.session.user_id,
      },
    });

    const userData = await User.findAll({
      attributes: ["name", "display_image"],
      where: {
        id: req.session.user_id,
      },
    });
  
    const activities = activityData.map((activity) =>
      activity.get({ plain: true })
    );
    const users = userData.map((user) =>
      user.get({ plain: true })
    );

    res.render("dashboard", {
      activities,
      users,
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// update incompleted workouts (removes workout from dashboard)
router.put("/dashboard", async (req, res) => {
  try {
    const updateActivity = await Activity.update(
      {
        workout_completed: false,
      },
      { where: { id: req.body.id } }
    );
    res.send({ message: "Activity Updated" });
  } catch (err) {
    res.status(500).json(err);
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
      user_id: req.session.user_id,
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
        user_id: req.session.user_id,
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
      {
        workout_completed: true,
        activity_duration: req.body.activity_duration,
        activity_sets: req.body.activity_sets,
        strength_weight: req.body.strength_weight,
      },
      { where: { id: req.body.id } }
    );
    res.send({ message: "Activity Updated" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// update completed workouts
router.delete("/exercises", async (req, res) => {
  try {
    const updateActivity = await Activity.destroy(
      { where: { id: req.body.id } }
    );
    res.send({ message: "Activity Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post("/upload", multiUpload, async (req, res) => {
  try {
    const result = await s3Uploadv2(req.files);
    const userId = req.session.user_id;

    // Wait for both asynchronous operations to complete
    await Promise.all([
      result, // Wait for the s3Uploadv2 function to complete and return the result
      User.findOne({ where: { id: userId } }) // Wait for the user record to be fetched
    ])
    .then(([result, user]) => {
      if (user) {
        // Update the display_image field with the uploaded image location
        user.display_image = result[0].Location;
        return user.save(); // Save the updated user record
      } else {
        throw new Error("User not found");
      }
    });

    res.json({ status: "success", result });
  } catch (error) {
    console.log('Image upload failed:', error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size is too large"
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "FIle must be an image!"
      });
    }
  }
});

module.exports = router;
