import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import { EMAIL_REGEX } from '../../core/constants';
import { UserRowStatus } from '../../core/enums';

@Table({ modelName: 'users' })
export class User extends Model<User> {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  })
  id: number;

  @Column({ type: DataTypes.STRING(150), validate: { len: [0, 150] } })
  full_name: string;

  @Column({
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { notNull: true, is: EMAIL_REGEX, len: [0, 150] },
  })
  email: string;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    validate: {
      isIn: [
        [UserRowStatus.PENDING, UserRowStatus.ACTIVE, UserRowStatus.DEACTIVATE],
      ],
    },
    defaultValue: UserRowStatus.PENDING,
    comment: 'pending=  0, active= 1, deactivate = 99',
  })
  row_status: number;

  @Column({
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notNull: true },
  })
  password: string;
}
