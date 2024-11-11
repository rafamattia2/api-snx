import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
        onDelete: 'CASCADE',
      });
    }
  }

  Comment.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      underscored: true,
    }
  );

  return Comment;
};
