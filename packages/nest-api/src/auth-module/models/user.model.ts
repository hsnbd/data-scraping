import { DataTypes } from 'sequelize';
import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { UserRowStatus } from '../../core/enums';
import { KeywordRecord } from '../../keyword-scraping-module/models/keyword-record.model';

@Table({ modelName: 'users' })
export class User extends Model<User> {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  })
  id: number;

  @Column({
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notNull: true, len: [1, 150] },
  })
  full_name: string;

  @Column({
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { notNull: true, isEmail: true, len: [5, 150] },
  })
  email: string;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    validate: {
      isIn: [
        [UserRowStatus.PENDING, UserRowStatus.ACTIVE, UserRowStatus.DEACTIVATE],
      ],
    },
    defaultValue: UserRowStatus.ACTIVE,
    comment: 'pending= 0, active= 1, deactivate = 99',
  })
  row_status: number;

  @Column({
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notNull: true },
  })
  password: string;

  @HasMany(() => KeywordRecord)
  keywordRecords: KeywordRecord[];
}
