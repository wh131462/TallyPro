import { Model, DataTypes, Sequelize } from 'sequelize';

export class Workshop extends Model {
  declare id: number;
  declare owner_id: number;
  declare name: string;
  declare description: string;
  declare invite_code: string;
  declare invite_expires_at: Date | null;
  declare status: 'active' | 'inactive';
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    Workshop.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        owner_id: {
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
        invite_code: {
          type: DataTypes.STRING(32),
          unique: true,
          allowNull: false,
        },
        invite_expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          defaultValue: 'active',
        },
      },
      {
        sequelize,
        tableName: 'workshops',
        timestamps: true,
        underscored: true,
      }
    );
  }
}
