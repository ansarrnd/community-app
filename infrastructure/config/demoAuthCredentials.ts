import { UserRole } from '../../domain/models/User';

export interface DemoAuthCredential {
  uid: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  phoneNumber: string;
}

const demoAuthPassword = process.env.EXPO_PUBLIC_DEMO_AUTH_PASSWORD ?? process.env.DEMO_AUTH_PASSWORD ?? 'dev-demo-password-change-me';

export const DEMO_AUTH_CREDENTIALS: DemoAuthCredential[] = [
  {
    uid: 'demo-user-resident',
    email: 'resident@demo.community',
    password: demoAuthPassword,
    role: 'USER',
    displayName: 'Alex Mercer',
    phoneNumber: '+15550192834',
  },
  {
    uid: 'demo-user-mod',
    email: 'mod@demo.community',
    password: demoAuthPassword,
    role: 'MOD',
    displayName: 'Maya Moderator',
    phoneNumber: '+15550192835',
  },
  {
    uid: 'demo-user-admin',
    email: 'admin@demo.community',
    password: demoAuthPassword,
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
