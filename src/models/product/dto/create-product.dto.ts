import { Transform } from 'class-transformer';
import { IsString, IsInt, IsNotEmpty, IsNumber, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 40)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 40)
  brand: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
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
  @Length(1, 40)
  supplier: string;
}
