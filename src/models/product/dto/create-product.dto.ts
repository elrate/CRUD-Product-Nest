import { Transform } from 'class-transformer';
import { IsString, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsInt()
  @IsNotEmpty()
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsString()
  @IsNotEmpty()
  supplier: string;
}
