import { Model, DataTypes, Sequelize } from 'sequelize';

export class SettlementItem extends Model {
  declare id: number;
  declare settlement_id: number;
  declare record_id: number;
  declare step_name: string;
  declare sku_name: string;
  declare quantity: number;
  declare unit_price: number;
  declare amount: number;

  static initModel(sequelize: Sequelize) {
    SettlementItem.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        settlement_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        record_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        step_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        sku_name: {
          type: DataTypes.STRING(100),
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
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'settlement_items',
        timestamps: false,
        underscored: true,
      }
    );
  }
}
