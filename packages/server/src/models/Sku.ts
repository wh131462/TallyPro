import { Model, DataTypes, Sequelize } from 'sequelize';

export class Sku extends Model {
  declare id: number;
  declare workshop_id: number;
  declare name: string;
  declare description: string;
  declare image_url: string;
  declare sort_order: number;
  declare is_active: boolean;
  declare deleted_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    Sku.init(
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
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING(500),
          defaultValue: '',
        },
        image_url: {
          type: DataTypes.STRING(255),
          defaultValue: '',
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
        tableName: 'skus',
        timestamps: true,
        underscored: true,
        paranoid: true,
      }
    );
  }
}
