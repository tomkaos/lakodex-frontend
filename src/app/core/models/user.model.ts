import { Profile } from './profile.model';

export interface User {
  email: string;
  token: string;
  first_name: string;
  last_name: string;
  profile?: Profile;
}
