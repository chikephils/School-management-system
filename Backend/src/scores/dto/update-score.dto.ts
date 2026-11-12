import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateScoreDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(30)
  caScore!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(70)
  examScore!: number;
}
