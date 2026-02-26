import { Model, DataTypes, Sequelize } from 'sequelize';

export class WorkshopMember extends Model {
  declare id: number;
  declare workshop_id: number;
  declare user_id: number | null;
  declare role: 'owner' | 'worker';
  declare display_name: string;
  declare status: 'pending' | 'approved' | 'rejected' | 'removed';
  declare invited_phone: string;
  declare created_at: Date;
  declare updated_at: Date;

  static initModel(sequelize: Sequelize) {
    WorkshopMember.init(
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
        user_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM('owner', 'worker'),
          allowNull: false,
        },
        display_name: {
          type: DataTypes.STRING(50),
          defaultValue: '',
        },
        status: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected', 'removed'),
          defaultValue: 'pending',
        },
        invited_phone: {
          type: DataTypes.STRING(20),
          defaultValue: '',
        },
      },
      {
        sequelize,
        tableName: 'workshop_members',
        timestamps: true,
        underscored: true,
      }
    );
  }
}
