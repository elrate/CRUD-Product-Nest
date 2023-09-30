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
import { format } from 'date-fns';
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

    // Formate a data de criação para o formato "DD/MM/YYYY"
    const createdAt = format(new Date(), 'dd/MM/yyyy - HH:mm:ss');
    const updatedAt = format(new Date(), 'dd/MM/yyyy - HH:mm:ss');

    // Crie o objeto Product com o preço truncado
    const newProduct = this.productRepository.create({
      ...createProductDto,
      price: truncatedPrice,
      createdAt,
      updatedAt,
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
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
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

    // Atualize os campos do produto existente com os valores do DTO
    updateProductDto.price = Math.floor(updateProductDto.price * 100) / 100;

    Object.assign(product, updateProductDto);

    // Formate a data de atualização para o formato "DD/MM/YYYY"
    const updatedAt = format(new Date(), 'dd/MM/yyyy - HH:mm:ss');
    product.updatedAt = updatedAt;
    // Salve o produto atualizado no banco de dados
    return await this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async updateStock(id: number, quantitySold: number): Promise<void> {
    // Verifique se o produto com o ID fornecido existe
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Verifique se há estoque disponível suficiente para a quantidade vendida
    if (product.stock < quantitySold) {
      throw new HttpException(
        'Insufficient stock for this quantity sold',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Atualize o estoque do produto
    product.stock -= quantitySold;

    // Salve o produto atualizado no banco de dados
    await this.productRepository.save(product);
  }

  private mapToReturnDto(product: Product): ReturnProductDto {
    const returnDto = new ReturnProductDto();
    returnDto.name = product.name;
    returnDto.brand = product.brand;
    returnDto.description = product.description;
    returnDto.price = product.price;
    returnDto.unit = product.unit;
    returnDto.stock = product.stock;
    returnDto.supplier = product.supplier;
    return returnDto;
  }
}
