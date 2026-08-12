import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Relationship, Person, LineageCategory } from '../domain/types';
import { RelationshipCard } from './RelationshipCard';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  const filteredRels = relationships.filter((r) => r.lineageCategory === category);

  if (filteredRels.length === 0) return null;

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.accentTeal,
            marginBottom: theme.spacing.xs,
            borderBottomColor: theme.colors.borderCard,
          },
        ]}
      >
        {title}
      </Text>
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
  container: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    borderBottomWidth: 2,
    paddingBottom: 4,
  },
});
