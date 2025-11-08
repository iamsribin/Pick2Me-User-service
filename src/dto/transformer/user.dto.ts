import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  mobile!: string;

  @Expose()
  user_image!: string;

  @Expose()
  referral_code!: string;

  @Expose()
  account_status!: string;

  @Expose()
  joining_date!: string;

  @Expose()
  wallet_balance?: number;

  @Expose()
  cancel_ride_count?: number;

  @Expose()
  completed_ride_count?: number;
}

// Pagination DTO
export class PaginationTransformerDto {
  @Expose()
  currentPage!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  totalItems!: number;

  @Expose()
  itemsPerPage!: number;

  @Expose()
  hasNextPage!: boolean;

  @Expose()
  hasPreviousPage!: boolean;
}

// Original DTO for backward compatibility
export class UserListDTO {
  Users!: UserDto[];
}

// New paginated response DTO
export class PaginatedUserListDTO {
  @Expose()
  users!: UserDto[];

  @Expose()
  pagination!: PaginationTransformerDto;
}

