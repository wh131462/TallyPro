import { Model, DataTypes, Sequelize } from 'sequelize';

export class PriceHistory extends Model {
  declare id: number;
  declare step_id: number;
  declare price: number;
  declare effective_date: string;
  declare created_at: Date;

  static initModel(sequelize: Sequelize) {
    PriceHistory.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        step_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        effective_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'price_histories',
        timestamps: true,
        underscored: true,
        updatedAt: false,
      }
    );
  }
}
