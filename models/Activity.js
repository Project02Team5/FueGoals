const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Activity extends Model {}

Activity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
        unique: false,
      },
    },
    activity_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activity_performed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activity_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    activity_sets: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    strength_weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    workout_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    }
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: "activity",
  }
);

module.exports = Activity;
