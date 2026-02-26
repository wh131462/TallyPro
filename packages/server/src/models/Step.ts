import { Model, DataTypes, Sequelize } from 'sequelize';

export class Step extends Model {
  declare id: number;
  declare sku_id: number;
  declare name: string;
  declare unit_price: number;
  declare sort_order: number;
  declare is_active: boolean;
  declare deleted_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    Step.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        sku_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        unit_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        sort_order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'steps',
        timestamps: true,
        underscored: true,
        paranoid: true,
      }
    );
  }
}
