import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'description', nullable: false }) // Adicione a descrição do produto
  description: string;

  @Column({ name: 'brand', nullable: false }) // Adicione a marca do produto
  brand: string;

  @Column({ name: 'unit', nullable: false }) // Adicione a unidade de medida
  unit: string;

  @Column({ name: 'stock', nullable: false }) // Adicione o estoque atual
  stock: number;

  @Column({ name: 'price', type: 'decimal', nullable: false })
  price: number;

  @Column({ name: 'supplier', nullable: false }) // Adicione o fornecedor
  supplier: string;

  @CreateDateColumn({ name: 'created_at', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
