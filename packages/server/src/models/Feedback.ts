import { Model, DataTypes, Sequelize } from 'sequelize';

export class Feedback extends Model {
  declare id: number;
  declare user_id: number;
  declare type: 'bug' | 'feature' | 'other';
  declare content: string;
  declare contact: string;
  declare images: string[] | null;
  declare status: 'pending' | 'replied' | 'closed';
  declare reply_content: string | null;
  declare reply_at: Date | null;
  declare created_at: Date;

  static initModel(sequelize: Sequelize) {
    Feedback.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('bug', 'feature', 'other'),
          allowNull: false,
          defaultValue: 'other',
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        contact: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: '',
        },
        images: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: null,
        },
        status: {
          type: DataTypes.ENUM('pending', 'replied', 'closed'),
          allowNull: false,
          defaultValue: 'pending',
        },
        reply_content: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        reply_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: 'feedbacks',
        timestamps: true,
        underscored: true,
        updatedAt: false,
      }
    );
  }
}
