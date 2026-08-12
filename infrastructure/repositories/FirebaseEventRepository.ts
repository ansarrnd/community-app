import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  startAfter,
  QueryConstraint,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CommunityEvent, CreateEventInput, EventStatus, RSVP } from '../../domain/models/Event';
import { DEFAULT_PAGE_SIZE } from '../../domain/models/Pagination';
import { IEventRepository } from '../../domain/repositories/IEventRepository';

export class FirebaseEventRepository implements IEventRepository {
  private eventsCollection = collection(db, 'events');
  private rsvpsCollection = collection(db, 'rsvps');

  async getApprovedEvents(
    categoryFilter?: string,
    searchQuery?: string,
    pagination?: { cursor?: string; limit?: number }
  ) {
    try {
      const pageSize = pagination?.limit ?? DEFAULT_PAGE_SIZE;
      const constraints: QueryConstraint[] = [where('status', '==', 'APPROVED')];

      if (categoryFilter && categoryFilter !== 'ALL') {
        constraints.push(where('category', '==', categoryFilter));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      if (pagination?.cursor) {
        const cursorSnap = await getDoc(doc(db, 'events', pagination.cursor));
        if (cursorSnap.exists()) {
          constraints.push(startAfter(cursorSnap as DocumentSnapshot));
        }
      }

      constraints.push(limit(pageSize + 1));

      const q = query(this.eventsCollection, ...constraints);
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CommunityEvent));

      if (searchQuery && searchQuery.trim() !== '') {
        const queryStr = searchQuery.toLowerCase();
        results = results.filter(
          (e) => e.title.toLowerCase().includes(queryStr) || e.venue.toLowerCase().includes(queryStr)
        );
      }

      const hasMore = results.length > pageSize;
      const items = hasMore ? results.slice(0, pageSize) : results;
      const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

      return { items, nextCursor };
    } catch (e) {
      console.warn('[FirebaseEventRepository] Firestore fetch error:', e);
      return { items: [], nextCursor: null };
    }
  }

  async getPendingEvents(): Promise<CommunityEvent[]> {
    const q = query(this.eventsCollection, where('status', '==', 'PENDING'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CommunityEvent));
  }

  async getEventById(id: string): Promise<CommunityEvent | null> {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as CommunityEvent;
  }

  async createEvent(input: CreateEventInput): Promise<CommunityEvent> {
    const docData = {
      ...input,
      status: 'PENDING',
      rsvpCount: 0,
      attendingCount: 0,
      declinedCount: 0,
      version: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(this.eventsCollection, docData);
    return {
      id: docRef.id,
      ...input,
      status: 'PENDING',
      rsvpCount: 0,
      attendingCount: 0,
      declinedCount: 0,
      version: 1,
    };
  }

  async updateEventStatus(id: string, status: EventStatus, moderatorId: string): Promise<void> {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, {
      status,
      moderatedBy: moderatorId,
      updatedAt: serverTimestamp(),
    });
  }

  async rsvpToEvent(eventId: string, userId: string, status: 'ATTENDING' | 'DECLINED'): Promise<RSVP> {
    const rsvpData = {
      eventId,
      userId,
      status,
      timestamp: serverTimestamp(),
    };
    const docRef = await addDoc(this.rsvpsCollection, rsvpData);
    return {
      id: docRef.id,
      eventId,
      userId,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  async getUserRsvps(userId: string): Promise<Record<string, 'ATTENDING' | 'DECLINED'>> {
    const q = query(this.rsvpsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const map: Record<string, 'ATTENDING' | 'DECLINED'> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      map[data.eventId] = data.status;
    });
    return map;
  }
}
