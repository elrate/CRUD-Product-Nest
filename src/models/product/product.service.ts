import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entitie/product';
import { ReturnProductDto } from './dto/return-product.dto';
import { validate } from 'class-validator';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const errors = await validate(createProductDto);

    if (errors.length > 0) {
      // Se houver erros de validação, lance uma exceção com detalhes
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    // Verifique se já existe um produto com base em algumas colunas iguais
    const existingProduct = await this.productRepository.findOne({
      where: {
        name: createProductDto.name, // Verifique a coluna 'name' (ou outra que você desejar)
        brand: createProductDto.brand, // Verifique a coluna 'brand' (ou outra que você desejar)
      },
    });
    if (existingProduct) {
      // Se um produto com valores semelhantes já existe, lance uma exceção ou retorne uma mensagem de erro
      throw new HttpException(
        'Product with similar values already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Se não existir um produto com valores semelhantes, crie o novo produto
    // Trunque o valor do campo price para duas casas decimais
    const truncatedPrice = Math.floor(createProductDto.price * 100) / 100;

    // Crie o objeto Product com o preço truncado
    const newProduct = this.productRepository.create({
      ...createProductDto,
      price: truncatedPrice,
    });
    return await this.productRepository.save(newProduct);
  }

  async findAllProducts(): Promise<ReturnProductDto[]> {
    // Busque todos os produtos e mapeie-os para o DTO de retorno
    const products = await this.productRepository.find();
    return products.map((product) => this.mapToReturnDto(product));
  }

  async findProductById(id: number): Promise<ReturnProductDto> {
    // Busque um produto por ID e mapeie-o para o DTO de retorno
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    //console.log(product);
    return this.mapToReturnDto(product);
  }

  async updateProduct(
    id: number,
    updateProductDto: CreateProductDto,
  ): Promise<Product> {
    const product = await this.findProductById(id);
    const errors = await validate(updateProductDto);

    if (errors.length > 0) {
      // Se houver erros de validação, lance uma exceção com detalhes
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    // Verifique se o nome ou a marca do produto estão sendo atualizados
    if (
      updateProductDto.name !== product.name ||
      updateProductDto.brand !== product.brand
    ) {
      // Verifique se já existe um produto com a mesma combinação de nome e marca
      const existingProduct = await this.productRepository.findOne({
        where: {
          name: updateProductDto.name,
          brand: updateProductDto.brand,
        },
      });

      if (existingProduct) {
        // Se um produto com a mesma combinação de nome e marca já existe, lance uma exceção ou retorne uma mensagem de erro
        throw new HttpException(
          'Product with similar values already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  private mapToReturnDto(product: Product): ReturnProductDto {
    const returnDto = new ReturnProductDto();
    returnDto.name = product.name;
    returnDto.brand = product.brand;
    returnDto.description = product.description;
    returnDto.price = product.price;
    returnDto.unitOfMeasure = product.unit;
    returnDto.currentStock = product.stock;
    returnDto.supplier = product.supplier;
    return returnDto;
  }
}
