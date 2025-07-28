import { DeepPartial } from "typeorm";

export interface IBaseRepository<T> {
  findOne(where: Partial<T>): Promise<T | null>;
  findAll(where?: Partial<T>): Promise<T[]>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}
