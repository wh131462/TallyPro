import sequelize from '../config/database';
import { User } from './User';
import { Workshop } from './Workshop';
import { WorkshopMember } from './WorkshopMember';
import { Sku } from './Sku';
import { Step } from './Step';
import { PriceHistory } from './PriceHistory';
import { WorkRecord } from './WorkRecord';
import { Settlement } from './Settlement';
import { SettlementItem } from './SettlementItem';
import { OperationLog } from './OperationLog';
import { Notification } from './Notification';
import { Feedback } from './Feedback';

// ===================== Initialize Models =====================
User.initModel(sequelize);
Workshop.initModel(sequelize);
WorkshopMember.initModel(sequelize);
Sku.initModel(sequelize);
Step.initModel(sequelize);
PriceHistory.initModel(sequelize);
WorkRecord.initModel(sequelize);
Settlement.initModel(sequelize);
SettlementItem.initModel(sequelize);
OperationLog.initModel(sequelize);
Notification.initModel(sequelize);
Feedback.initModel(sequelize);

// ===================== Define Associations =====================

// User <-> Workshop (ownership)
User.hasMany(Workshop, { foreignKey: 'owner_id', as: 'ownedWorkshops' });
Workshop.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User <-> WorkshopMember
User.hasMany(WorkshopMember, { foreignKey: 'user_id', as: 'memberships' });
WorkshopMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Workshop <-> WorkshopMember
Workshop.hasMany(WorkshopMember, { foreignKey: 'workshop_id', as: 'members' });
WorkshopMember.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// Workshop <-> Sku
Workshop.hasMany(Sku, { foreignKey: 'workshop_id', as: 'skus' });
Sku.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// Sku <-> Step
Sku.hasMany(Step, { foreignKey: 'sku_id', as: 'steps' });
Step.belongsTo(Sku, { foreignKey: 'sku_id', as: 'sku' });

// Step <-> PriceHistory
Step.hasMany(PriceHistory, { foreignKey: 'step_id', as: 'priceHistories' });
PriceHistory.belongsTo(Step, { foreignKey: 'step_id', as: 'step' });

// Step <-> WorkRecord
Step.hasMany(WorkRecord, { foreignKey: 'step_id', as: 'workRecords' });
WorkRecord.belongsTo(Step, { foreignKey: 'step_id', as: 'step' });

// Workshop <-> WorkRecord
Workshop.hasMany(WorkRecord, { foreignKey: 'workshop_id', as: 'workRecords' });
WorkRecord.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// User <-> WorkRecord (as worker)
User.hasMany(WorkRecord, { foreignKey: 'worker_id', as: 'workRecords' });
WorkRecord.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

// Workshop <-> Settlement
Workshop.hasMany(Settlement, { foreignKey: 'workshop_id', as: 'settlements' });
Settlement.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// User <-> Settlement (as worker)
User.hasMany(Settlement, { foreignKey: 'worker_id', as: 'settlements' });
Settlement.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

// Settlement <-> WorkRecord
Settlement.hasMany(WorkRecord, { foreignKey: 'settlement_id', as: 'workRecords' });
WorkRecord.belongsTo(Settlement, { foreignKey: 'settlement_id', as: 'settlement' });

// Settlement <-> SettlementItem
Settlement.hasMany(SettlementItem, { foreignKey: 'settlement_id', as: 'items' });
SettlementItem.belongsTo(Settlement, { foreignKey: 'settlement_id', as: 'settlement' });

// SettlementItem <-> WorkRecord (as record)
SettlementItem.belongsTo(WorkRecord, { foreignKey: 'record_id', as: 'record' });

// OperationLog associations
OperationLog.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });
OperationLog.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(Workshop, { foreignKey: 'workshop_id', as: 'workshop' });

// Feedback associations
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  User,
  Workshop,
  WorkshopMember,
  Sku,
  Step,
  PriceHistory,
  WorkRecord,
  Settlement,
  SettlementItem,
  OperationLog,
  Notification,
  Feedback,
};
