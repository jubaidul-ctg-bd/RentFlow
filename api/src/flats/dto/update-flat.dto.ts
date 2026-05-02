import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateFlatDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsNumber() @Min(0) monthlyRent?: number;
  @IsOptional() @IsString() description?: string;
}
