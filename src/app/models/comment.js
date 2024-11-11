import { Model } from 'sequelize';

export default class Comment extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
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
  }

  static associate(models) {
    this.belongsTo(models.Post, {
      foreignKey: 'postId',
      as: 'post',
      onDelete: 'CASCADE',
    });
  }
}
