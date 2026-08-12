import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import { UserRole } from '../../domain/models/User';

export async function callGrantRole(targetUid: string, role: UserRole): Promise<void> {
  const grantRoleFn = httpsCallable<{ uid: string; role: UserRole }, { success: boolean }>(
    functions,
    'grantRole'
  );
  await grantRoleFn({ uid: targetUid, role });
}
