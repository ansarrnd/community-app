export type LineageCategory =
  | 'PATERNAL'
  | 'MATERNAL'
  | 'AFFINAL'
  | 'NUCLEAR'
  | 'COUSIN'
  | 'EXTERNAL'
  | 'SOCIAL'
  | 'GENERAL';

export type ContextTag = 'In-Village' | 'Out-Village';

export interface Village {
  id: string;
  name: string;
  district?: string;
  state?: string;
  isHomeVillage: boolean;
}

export interface Person {
  id: string;
  fullName: string;
  gender: 'M' | 'F';
  birthYear?: number;
  homeVillageId?: string;
  currentLocationTag: ContextTag | string;
  phone?: string;
  notes?: string;
}

export interface Relationship {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: string;
  inverseType: string;
  lineageCategory: LineageCategory;
  contextTag: ContextTag;
  isActive: boolean;
}

export interface RelationshipConfig {
  label: string;
  labelTa?: string;
  inverse: string;
  category: LineageCategory;
  description?: string;
}

export interface EventMemberInput {
  personId?: string;
  fullName: string;
  gender?: 'M' | 'F';
  roleInEvent?: string; // e.g., 'BRIDE', 'GROOM', 'HOST', 'CHIEF_GUEST', 'MAMA_RITUAL'
  relationshipTypeToOrganizer?: string; // e.g., 'MATERNAL_UNCLE', 'SPOUSE', 'ATHAI'
  contextTag?: ContextTag;
  phone?: string;
}

export interface EventRelationshipInput {
  sourcePersonId?: string;
  sourcePersonName?: string;
  targetPersonId?: string;
  targetPersonName?: string;
  relationshipType: string;
  contextTag?: ContextTag;
}

