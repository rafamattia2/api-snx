import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Post extends Model {
    static associate(models) {
      Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        onDelete: 'CASCADE',
      });
    }
  }

  Post.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING, // MongoDB ObjectId
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      underscored: true,
    }
  );

  return Post;
};
