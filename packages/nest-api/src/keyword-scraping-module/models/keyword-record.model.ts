import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { KeywordRecordStatus } from '../../core/enums';
import { User } from '../../auth-module/models/user.model';

@Table({ modelName: 'keyword_records' })
export class KeywordRecord extends Model<KeywordRecord> {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    validate: { notNull: true },
  })
  user_id: number;

  @Index('kr_keyword')
  @Column({
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notNull: true, len: [1, 150] },
  })
  keyword: string;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    validate: { isNumeric: true },
  })
  total_advertisers: number;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    validate: { isNumeric: true },
  })
  total_links: number;

  @Column({ type: DataTypes.STRING(150), validate: { len: [0, 150] } })
  total_search_results: string;

  @Column({ type: DataTypes.TEXT })
  html_code: string;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    validate: {
      notNull: true,
      isIn: [
        [
          KeywordRecordStatus.DRAFT,
          KeywordRecordStatus.PROCESSING,
          KeywordRecordStatus.DONE,
        ],
      ],
    },
    defaultValue: KeywordRecordStatus.DRAFT,
    comment: 'draft=  0, processing= 1, done = 2',
  })
  row_status: number;

  @Column({ type: DataTypes.DATE, allowNull: true, validate: { isDate: true } })
  scraped_at: Date;

  @Column({ type: DataTypes.DATE, allowNull: true, validate: { isDate: true } })
  read_at: Date;

  @BelongsTo(() => User)
  user: User;
}
