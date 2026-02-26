import { Model, DataTypes, Sequelize } from 'sequelize';

export class WorkRecord extends Model {
  declare id: number;
  declare workshop_id: number;
  declare worker_id: number;
  declare step_id: number;
  declare work_date: string;
  declare quantity: number;
  declare unit_price: number;
  declare status: 'pending' | 'confirmed' | 'modified' | 'settled';
  declare confirmed_quantity: number | null;
  declare modifier_id: number | null;
  declare modify_reason: string | null;
  declare settlement_id: number | null;
  declare version: number;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    WorkRecord.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        workshop_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        worker_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        step_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        work_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        unit_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'confirmed', 'modified', 'settled'),
          defaultValue: 'pending',
        },
        confirmed_quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        modifier_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        modify_reason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        settlement_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        version: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        tableName: 'work_records',
        timestamps: true,
        underscored: true,
      }
    );
  }
}
