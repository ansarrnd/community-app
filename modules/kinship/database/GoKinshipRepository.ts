import { Person, Relationship, Village, LineageCategory, ContextTag } from '../domain/types';
import { createRelationshipPayload, createInverseRelationshipPayload } from '../domain/relationshipUtils';
import { KinshipModuleConfig, defaultConfig } from '../config/kinshipOptions';
import { goFetch } from '../../../infrastructure/http/goApiClient';

export class GoKinshipRepository {
  private config: KinshipModuleConfig;

  constructor(config: KinshipModuleConfig = defaultConfig) {
    this.config = config;
  }

  public setConfig(newConfig: Partial<KinshipModuleConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async addPerson(person: Person): Promise<void> {
    await goFetch('/v1/kinship/persons', { method: 'POST', body: JSON.stringify(person) });
  }

  public async getPerson(id: string): Promise<Person | undefined> {
    try {
      return await goFetch<Person>(`/v1/kinship/persons/${id}`);
    } catch {
      return undefined;
    }
  }

  public async addVillage(village: Village): Promise<void> {
    await goFetch('/v1/kinship/villages', { method: 'POST', body: JSON.stringify(village) });
  }

  public async addRelationship(
    sourceId: string,
    targetId: string,
    relKey: string,
    contextTag: ContextTag = 'In-Village'
  ): Promise<Relationship[]> {
    const rel = createRelationshipPayload(sourceId, targetId, relKey, contextTag, this.config);
    await goFetch('/v1/kinship/relationships', { method: 'POST', body: JSON.stringify(rel) });
    const created: Relationship[] = [rel];
    if (this.config.enableBiDirectionalAutoMapping) {
      const inverse = createInverseRelationshipPayload(rel, this.config);
      if (inverse) {
        await goFetch('/v1/kinship/relationships', { method: 'POST', body: JSON.stringify(inverse) });
        created.push(inverse);
      }
    }
    return created;
  }

  public async getRelationshipsForPerson(personId: string): Promise<Relationship[]> {
    return goFetch<Relationship[]>(`/v1/kinship/persons/${personId}/relationships`);
  }

  public async getOutVillageNetwork(personId: string): Promise<Relationship[]> {
    return goFetch<Relationship[]>(`/v1/kinship/persons/${personId}/relationships?outVillage=true`);
  }

  public async getLineageNetwork(
    personId: string,
    lineageCategory: LineageCategory,
    contextTag?: ContextTag
  ): Promise<Relationship[]> {
    const params = new URLSearchParams({ lineage: lineageCategory });
    if (contextTag) params.set('contextTag', contextTag);
    return goFetch<Relationship[]>(`/v1/kinship/persons/${personId}/relationships?${params}`);
  }
}
