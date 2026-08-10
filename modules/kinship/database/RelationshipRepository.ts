import { Person, Relationship, Village, LineageCategory, ContextTag } from '../domain/types';
import { createRelationshipPayload, createInverseRelationshipPayload } from '../domain/relationshipUtils';
import { KinshipModuleConfig, defaultConfig } from '../config/kinshipOptions';

export class RelationshipRepository {
  private persons: Map<string, Person> = new Map();
  private villages: Map<string, Village> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private config: KinshipModuleConfig;

  constructor(config: KinshipModuleConfig = defaultConfig) {
    this.config = config;
  }

  public setConfig(newConfig: Partial<KinshipModuleConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async addPerson(person: Person): Promise<void> {
    this.persons.set(person.id, person);
  }

  public async getPerson(id: string): Promise<Person | undefined> {
    return this.persons.get(id);
  }

  public async addVillage(village: Village): Promise<void> {
    this.villages.set(village.id, village);
  }

  public async addRelationship(
    sourceId: string,
    targetId: string,
    relKey: string,
    contextTag: ContextTag = 'In-Village'
  ): Promise<Relationship[]> {
    const rel = createRelationshipPayload(sourceId, targetId, relKey, contextTag, this.config);
    this.relationships.set(rel.id, rel);

    const created: Relationship[] = [rel];

    if (this.config.enableBiDirectionalAutoMapping) {
      const inverse = createInverseRelationshipPayload(rel, this.config);
      if (inverse) {
        this.relationships.set(inverse.id, inverse);
        created.push(inverse);
      }
    }

    return created;
  }

  public async getRelationshipsForPerson(personId: string): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter(
      (r) => r.sourcePersonId === personId && r.isActive
    );
  }

  public async getOutVillageNetwork(personId: string): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter(
      (r) =>
        r.sourcePersonId === personId &&
        r.contextTag === 'Out-Village' &&
        r.isActive
    );
  }

  public async getLineageNetwork(
    personId: string,
    lineageCategory: LineageCategory,
    contextTag?: ContextTag
  ): Promise<Relationship[]> {
    return Array.from(this.relationships.values()).filter((r) => {
      const matchesPerson = r.sourcePersonId === personId;
      const matchesCategory = r.lineageCategory === lineageCategory;
      const matchesContext = contextTag ? r.contextTag === contextTag : true;
      return matchesPerson && matchesCategory && matchesContext && r.isActive;
    });
  }

  public async clear(): Promise<void> {
    this.persons.clear();
    this.villages.clear();
    this.relationships.clear();
  }
}
