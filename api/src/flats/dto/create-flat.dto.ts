import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFlatDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsOptional()
  @IsString()
  description?: string;
}
