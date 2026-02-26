import { Model, DataTypes, Sequelize } from 'sequelize';

export class User extends Model {
  declare id: number;
  declare openid: string;
  declare phone: string;
  declare nickname: string;
  declare avatar_url: string;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        openid: {
          type: DataTypes.STRING(64),
          unique: true,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(20),
          defaultValue: '',
        },
        nickname: {
          type: DataTypes.STRING(50),
          defaultValue: '',
        },
        avatar_url: {
          type: DataTypes.STRING(255),
          defaultValue: '',
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        underscored: true,
      }
    );
  }
}
