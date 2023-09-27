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

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
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
        'Produto com valores semelhantes já existe.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Se não existir um produto com valores semelhantes, crie o novo produto
    const newProduct = this.productRepository.create(createProductDto);
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
    console.log(product);
    return this.mapToReturnDto(product);
  }

  async updateProduct(
    id: number,
    updateProductDto: CreateProductDto,
  ): Promise<Product> {
    const product = await this.findProductById(id);
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
    // Mapeie uma instância de produto para o DTO de retorno
    const returnDto = new ReturnProductDto();
    returnDto.id = product.id;
    returnDto.name = product.name;
    // Mapeie outras propriedades conforme necessário
    return returnDto;
  }
}
