export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export const roleRedirectMap: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.TEACHER]: '/teacher',
  [UserRole.STUDENT]: '/student',
};
