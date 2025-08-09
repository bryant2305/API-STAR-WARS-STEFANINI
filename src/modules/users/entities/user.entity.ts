import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  created_at?: string;
  updated_at?: string;
  delete_at?: string;
}
