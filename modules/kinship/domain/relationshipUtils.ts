import { TAMIL_RELATIONSHIPS } from '../taxonomy/tamilTaxonomy';
import { Relationship, ContextTag } from './types';
import { KinshipModuleConfig, defaultConfig } from '../config/kinshipOptions';

export function getRelationshipConfig(relKey: string, config: KinshipModuleConfig = defaultConfig) {
  if (config.taxonomyMode === 'TAMIL_VILLAGE') {
    return TAMIL_RELATIONSHIPS[relKey];
  }
  // Generic fallback if TAMIL_VILLAGE mode is disabled
  return TAMIL_RELATIONSHIPS[relKey] || {
    label: relKey,
    inverse: 'UNKNOWN',
    category: 'GENERAL',
  };
}

export function createRelationshipPayload(
  sourceId: string,
  targetId: string,
  relKey: string,
  contextTag: ContextTag = 'In-Village',
  config: KinshipModuleConfig = defaultConfig
): Relationship {
  const relConfig = getRelationshipConfig(relKey, config);
  
  return {
    id: `${sourceId}_${targetId}_${relKey}`,
    sourcePersonId: sourceId,
    targetPersonId: targetId,
    relationshipType: relKey,
    inverseType: relConfig?.inverse || 'UNKNOWN',
    lineageCategory: relConfig?.category || 'GENERAL',
    contextTag: config.enableMigrationTracking ? contextTag : 'In-Village',
    isActive: true,
  };
}

export function createInverseRelationshipPayload(
  relationship: Relationship,
  config: KinshipModuleConfig = defaultConfig
): Relationship | null {
  if (!config.enableBiDirectionalAutoMapping || relationship.inverseType === 'UNKNOWN') {
    return null;
  }

  return {
    id: `${relationship.targetPersonId}_${relationship.sourcePersonId}_${relationship.inverseType}`,
    sourcePersonId: relationship.targetPersonId,
    targetPersonId: relationship.sourcePersonId,
    relationshipType: relationship.inverseType,
    inverseType: relationship.relationshipType,
    lineageCategory: relationship.lineageCategory,
    contextTag: relationship.contextTag,
    isActive: true,
  };
}
