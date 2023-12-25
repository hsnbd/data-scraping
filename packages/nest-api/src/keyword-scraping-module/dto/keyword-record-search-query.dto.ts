import { ApiProperty } from '@nestjs/swagger';

export class KeywordRecordSearchQueryDto {
  @ApiProperty({
    required: false,
    format: '1',
  })
  page: number;

  @ApiProperty({ required: false, format: '10' })
  limit: number;

  @ApiProperty({
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    required: false,
  })
  search?: string;
}
