const router = require("express").Router();
const { User, Activity } = require("../models");
const withAuth = require("../utils/auth");
const { Sequelize, Op } = require("sequelize");

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
            Sequelize.literal('(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'),
            "cardioCount",
          ],
          [
            Sequelize.literal('(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "strength")'),
            "strengthCount",
          ],
          [
            Sequelize.literal('(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'),
            "flexibilityCount",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'),
            "cardioDuration",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "strength")'),
            "strengthDuration",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'),
            "flexibilityDuration",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_sets) * SUM(strength_weight) FROM activity WHERE workout_completed = true AND activity_type = "strength")'),
            "poundsLifted",
          ],
        ],
      });
 
      const activities = activityData.map((activity) => activity.get({ plain: true }));
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
            Sequelize.literal('(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'),
            "cardioCount",
          ],
          [
            Sequelize.literal('(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "strength")'),
            "strengthCount",
          ],
          [
            Sequelize.literal('(SELECT COUNT(workout_completed) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'),
            "flexibilityCount",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "cardio")'),
            "cardioDuration",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "strength")'),
            "strengthDuration",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_duration) * SUM(activity_sets) FROM activity WHERE workout_completed = true AND activity_type = "flexibility")'),
            "flexibilityDuration",
          ],
          [
            Sequelize.literal('(SELECT SUM(activity_sets) * SUM(strength_weight) FROM activity WHERE workout_completed = true AND activity_type = "strength")'),
            "poundsLifted",
          ],
        ],
        include: {
          model: User,
          attributes: ["activity_interval", "name"],
        },
        where: {
          [Op.and]: [
            { user_id: 4 },
            {
              createdAt: {
                [Op.gt]: intervalDate(interval),
              },
            },
          ],
        },
      });

      const activities = activityData.map((activity) => activity.get({ plain: true }));

      res.render("homepage", {
        activities,
        logged_in: req.session.logged_in,
        user_name: req.session.user_name,
        user_id: req.session.user_id,
      });
      // res.send(activities);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

router.get("/login", (req, res) => {
  // If a session exists, redirect the request to the homepage
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

module.exports = router;
