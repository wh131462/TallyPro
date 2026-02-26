import { Model, DataTypes, Sequelize } from 'sequelize';

export class Settlement extends Model {
  declare id: number;
  declare workshop_id: number;
  declare worker_id: number;
  declare period_start: string;
  declare period_end: string;
  declare total_amount: number;
  declare status: 'draft' | 'confirmed';
  declare created_at: Date;

  static initModel(sequelize: Sequelize) {
    Settlement.init(
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
        period_start: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        period_end: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        total_amount: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('draft', 'confirmed'),
          defaultValue: 'draft',
        },
      },
      {
        sequelize,
        tableName: 'settlements',
        timestamps: true,
        underscored: true,
        updatedAt: false,
      }
    );
  }
}
