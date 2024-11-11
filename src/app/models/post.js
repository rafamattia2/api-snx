import { Model } from 'sequelize';

export default class Post extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
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
          type: DataTypes.STRING,
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
  }

  static associate(models) {
    this.hasMany(models.Comment, {
      foreignKey: 'postId',
      onDelete: 'CASCADE',
    });
  }
}
