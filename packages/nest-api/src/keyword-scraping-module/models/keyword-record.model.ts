import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import { KeywordRecordStatus } from '../../core/enums';

@Table({ modelName: 'keyword_records' })
export class KeywordRecord extends Model<KeywordRecord> {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  })
  id: number;

  @Column({
    type: DataTypes.INTEGER.UNSIGNED,
  })
  user_id: number;

  @Column({ type: DataTypes.STRING(150), validate: { len: [0, 150] } })
  keyword: string;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
  })
  total_advertisers: number;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
  })
  total_links: number;

  @Column({ type: DataTypes.STRING(150), validate: { len: [0, 150] } })
  total_search_results: string;

  @Column({ type: DataTypes.TEXT })
  html_code: string;

  @Column({
    type: DataTypes.SMALLINT.UNSIGNED,
    validate: {
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

  @Column({ type: DataTypes.DATE, allowNull: true })
  scraped_at: Date;

  @Column({ type: DataTypes.DATE, allowNull: true })
  read_at: Date;
}
