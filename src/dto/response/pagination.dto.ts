import { UserDto } from '../transformer/user.dto';

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status: 'Good' | 'Block';
}

export interface PaginatedUserListDTO {
  Users: UserDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
