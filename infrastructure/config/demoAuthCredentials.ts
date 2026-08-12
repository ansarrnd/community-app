import { UserRole } from '../../domain/models/User';

export interface DemoAuthCredential {
  uid: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  phoneNumber: string;
}

export const DEMO_AUTH_CREDENTIALS: DemoAuthCredential[] = [
  {
    uid: 'demo-user-resident',
    email: 'resident@demo.community',
    password: 'DemoPass123!',
    role: 'USER',
    displayName: 'Alex Mercer',
    phoneNumber: '+15550192834',
  },
  {
    uid: 'demo-user-mod',
    email: 'mod@demo.community',
    password: 'DemoPass123!',
    role: 'MOD',
    displayName: 'Maya Moderator',
    phoneNumber: '+15550192835',
  },
  {
    uid: 'demo-user-admin',
    email: 'admin@demo.community',
    password: 'DemoPass123!',
    role: 'ADMIN',
    displayName: 'Arun Administrator',
    phoneNumber: '+15550192836',
  },
];

export const DEMO_CREDENTIALS_BY_ROLE: Record<UserRole, DemoAuthCredential> = {
  USER: DEMO_AUTH_CREDENTIALS[0],
  MOD: DEMO_AUTH_CREDENTIALS[1],
  ADMIN: DEMO_AUTH_CREDENTIALS[2],
};
