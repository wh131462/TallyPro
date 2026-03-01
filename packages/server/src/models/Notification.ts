import { Model, DataTypes, Sequelize } from 'sequelize';

export class Notification extends Model {
  declare id: number;
  declare user_id: number;
  declare workshop_id: number;
  declare type: string;
  declare title: string;
  declare content: string;
  declare is_read: boolean;
  declare created_at: Date;

  static initModel(sequelize: Sequelize) {
    Notification.init(
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
        workshop_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        content: {
          type: DataTypes.STRING(500),
          allowNull: false,
          defaultValue: '',
        },
        is_read: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'notifications',
        timestamps: true,
        underscored: true,
        updatedAt: false,
      }
    );
  }
}
