import { useState, useEffect, useCallback } from 'react';
import { Person, Relationship, LineageCategory, ContextTag } from '../domain/types';
import { RelationshipRepository } from '../database/RelationshipRepository';
import { KinshipModuleConfig } from '../config/kinshipOptions';

export function useKinshipNetwork(
  repository: RelationshipRepository,
  personId?: string,
  config?: Partial<KinshipModuleConfig>
) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshNetwork = useCallback(async () => {
    if (!personId) {
      setRelationships([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (config) {
        repository.setConfig(config);
      }
      const rels = await repository.getRelationshipsForPerson(personId);
      setRelationships(rels);
    } catch (e) {
      console.warn('[useKinshipNetwork] Error fetching relationships:', e);
    } finally {
      setLoading(false);
    }
  }, [repository, personId, config]);

  useEffect(() => {
    refreshNetwork();
  }, [refreshNetwork]);

  const addRelationship = async (
    targetPersonId: string,
    relationshipType: string,
    contextTag: ContextTag = 'In-Village'
  ) => {
    if (!personId) return [];
    const added = await repository.addRelationship(personId, targetPersonId, relationshipType, contextTag);
    await refreshNetwork();
    return added;
  };

  const getOutVillageNetwork = async () => {
    if (!personId) return [];
    return repository.getOutVillageNetwork(personId);
  };

  const getLineageNetwork = async (category: LineageCategory, contextTag?: ContextTag) => {
    if (!personId) return [];
    return repository.getLineageNetwork(personId, category, contextTag);
  };

  return {
    relationships,
    loading,
    refreshNetwork,
    addRelationship,
    getOutVillageNetwork,
    getLineageNetwork,
  };
}
