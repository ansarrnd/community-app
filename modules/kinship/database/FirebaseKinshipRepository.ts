import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Person, Relationship, Village, LineageCategory, ContextTag } from '../domain/types';
import { createRelationshipPayload, createInverseRelationshipPayload } from '../domain/relationshipUtils';
import { KinshipModuleConfig, defaultConfig } from '../config/kinshipOptions';

export class FirebaseKinshipRepository {
  private personsCollection = collection(db, 'persons');
  private villagesCollection = collection(db, 'villages');
  private relationshipsCollection = collection(db, 'relationships');
  private config: KinshipModuleConfig;

  constructor(config: KinshipModuleConfig = defaultConfig) {
    this.config = config;
  }

  public setConfig(newConfig: Partial<KinshipModuleConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async addPerson(person: Person): Promise<void> {
    const docRef = doc(db, 'persons', person.id);
    await setDoc(docRef, {
      ...person,
      updatedAt: serverTimestamp(),
    });
  }

  public async getPerson(id: string): Promise<Person | undefined> {
    const docRef = doc(db, 'persons', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;
    return { id: docSnap.id, ...docSnap.data() } as Person;
  }

  public async addVillage(village: Village): Promise<void> {
    const docRef = doc(db, 'villages', village.id);
    await setDoc(docRef, {
      ...village,
      updatedAt: serverTimestamp(),
    });
  }

  public async addRelationship(
    sourceId: string,
    targetId: string,
    relKey: string,
    contextTag: ContextTag = 'In-Village'
  ): Promise<Relationship[]> {
    const rel = createRelationshipPayload(sourceId, targetId, relKey, contextTag, this.config);
    const docRef = doc(db, 'relationships', rel.id);
    await setDoc(docRef, { ...rel, updatedAt: serverTimestamp() });

    const created: Relationship[] = [rel];

    if (this.config.enableBiDirectionalAutoMapping) {
      const inverse = createInverseRelationshipPayload(rel, this.config);
      if (inverse) {
        const inverseDocRef = doc(db, 'relationships', inverse.id);
        await setDoc(inverseDocRef, { ...inverse, updatedAt: serverTimestamp() });
        created.push(inverse);
      }
    }

    return created;
  }

  public async getRelationshipsForPerson(personId: string): Promise<Relationship[]> {
    try {
      const q = query(
        this.relationshipsCollection,
        where('sourcePersonId', '==', personId),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Relationship));
    } catch (e) {
      console.warn('[FirebaseKinshipRepository] Query error:', e);
      return [];
    }
  }

  public async getOutVillageNetwork(personId: string): Promise<Relationship[]> {
    try {
      const q = query(
        this.relationshipsCollection,
        where('sourcePersonId', '==', personId),
        where('contextTag', '==', 'Out-Village'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Relationship));
    } catch (e) {
      console.warn('[FirebaseKinshipRepository] Query error:', e);
      return [];
    }
  }

  public async getLineageNetwork(
    personId: string,
    lineageCategory: LineageCategory,
    contextTag?: ContextTag
  ): Promise<Relationship[]> {
    try {
      let q = query(
        this.relationshipsCollection,
        where('sourcePersonId', '==', personId),
        where('lineageCategory', '==', lineageCategory),
        where('isActive', '==', true)
      );
      if (contextTag) {
        q = query(
          this.relationshipsCollection,
          where('sourcePersonId', '==', personId),
          where('lineageCategory', '==', lineageCategory),
          where('contextTag', '==', contextTag),
          where('isActive', '==', true)
        );
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Relationship));
    } catch (e) {
      console.warn('[FirebaseKinshipRepository] Query error:', e);
      return [];
    }
  }
}
