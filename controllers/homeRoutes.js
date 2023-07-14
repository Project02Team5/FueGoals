const router = require("express").Router();
const { User, Activity } = require("../models");
const withAuth = require("../utils/auth");
const { Op } = require("sequelize");

const intervalDate = (interval) => {
  var date = new Date();
  var formatDate =  date.setDate(date.getDate() - interval);
  return formatDate;
};

// Prevent non logged in users from viewing the homepage
router.get("/", withAuth, async (req, res) => {

  const interval = req.query.interval || 30
  // http://localhost:3001/?interval=1

  try {
    const userData = await Activity.findAll({
      include: {
        model: User,
        attributes: ["activity_interval"],
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

    const users = userData.map((project) => project.get({ plain: true }));

    res.render('homepage', {
      users,
      // Pass the logged in flag to the template
      logged_in: req.session.logged_in,
      user_name: req.session.user_name,
      user_id: req.session.user_id,
    });
    // res.send(users);
  } catch (err) {
    res.status(500).json(err);
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

module.exports = router;
