export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export const WRITE_ROLES = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTRIBUTOR];
export const DELETE_ROLES = [UserRole.ADMIN, UserRole.MANAGER];
