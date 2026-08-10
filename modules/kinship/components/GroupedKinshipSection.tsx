import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Relationship, Person, LineageCategory } from '../domain/types';
import { RelationshipCard } from './RelationshipCard';
import { VillageTheme } from '../theme/villageTheme';

export interface GroupedKinshipSectionProps {
  title: string;
  category: LineageCategory;
  relationships: Relationship[];
  personMap?: Map<string, Person>;
  onSelectRelationship?: (rel: Relationship) => void;
}

export const GroupedKinshipSection: React.FC<GroupedKinshipSectionProps> = ({
  title,
  category,
  relationships,
  personMap,
  onSelectRelationship,
}) => {
  const filteredRels = relationships.filter((r) => r.lineageCategory === category);

  if (filteredRels.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {filteredRels.map((rel) => (
        <RelationshipCard
          key={rel.id}
          relationship={rel}
          targetPerson={personMap?.get(rel.targetPersonId)}
          onPress={() => onSelectRelationship?.(rel)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: VillageTheme.spacing.lg,
  },
  sectionTitle: {
    ...VillageTheme.typography.screenTitle,
    fontSize: 18,
    color: VillageTheme.colors.primary,
    marginBottom: VillageTheme.spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: VillageTheme.colors.border,
    paddingBottom: 4,
  },
});
