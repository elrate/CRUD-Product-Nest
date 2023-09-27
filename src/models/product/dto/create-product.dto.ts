import { IsString, IsNumber, IsNotEmpty, IsDecimal } from 'class-validator';

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
  unitOfMeasure: string;

  @IsNumber()
  @IsNotEmpty()
  currentStock: number;

  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  supplier: string;
}
