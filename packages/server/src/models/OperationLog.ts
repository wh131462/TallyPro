import { Model, DataTypes, Sequelize } from 'sequelize';

export class OperationLog extends Model {
  declare id: number;
  declare operator_id: number;
  declare workshop_id: number;
  declare action: string;
  declare target_type: string;
  declare target_id: number;
  declare before_data: object | null;
  declare after_data: object | null;
  declare remark: string | null;
  declare created_at: Date;

  static initModel(sequelize: Sequelize) {
    OperationLog.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        operator_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        workshop_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        action: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        target_type: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        target_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        before_data: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        after_data: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'operation_logs',
        timestamps: true,
        underscored: true,
        updatedAt: false,
      }
    );
  }
}
