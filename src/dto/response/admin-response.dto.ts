import { UserDto } from '../transformer/user.dto';

export interface AdminUserListDto {
  users: UserDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
}
