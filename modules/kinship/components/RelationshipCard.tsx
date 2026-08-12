import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Relationship, Person } from '../domain/types';
import { TAMIL_RELATIONSHIPS } from '../taxonomy/tamilTaxonomy';
import { useTheme } from '@/context/ThemeContext';

export interface RelationshipCardProps {
  relationship: Relationship;
  targetPerson?: Person;
  onPress?: () => void;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({
  relationship,
  targetPerson,
  onPress,
}) => {
  const { theme } = useTheme();
  const { colors, kinship } = theme;

  const relConfig = TAMIL_RELATIONSHIPS[relationship.relationshipType] || {
    label: relationship.relationshipType,
    category: relationship.lineageCategory || 'GENERAL',
    description: '',
  };

  const borderColor =
    kinship.lineageBorders[relationship.lineageCategory as keyof typeof kinship.lineageBorders] ||
    kinship.lineageBorders.GENERAL;

  const isInVillage = relationship.contextTag === 'In-Village';
  const isAffinal = relationship.lineageCategory === 'AFFINAL';

  const badgeBg = isAffinal
    ? kinship.tags.affinalBg
    : isInVillage
      ? kinship.tags.inVillageBg
      : kinship.tags.outVillageBg;

  const badgeTextColor = isAffinal
    ? kinship.tags.affinalText
    : isInVillage
      ? kinship.tags.inVillageText
      : kinship.tags.outVillageText;

  const badgeLabel = isAffinal ? 'Affinal / In-Law' : relationship.contextTag;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bgCardSolid,
          borderColor: colors.borderCard,
          borderLeftColor: borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={[styles.dotIndicator, { backgroundColor: borderColor }]} />
          <Text style={[styles.personName, { color: colors.textPrimary }]}>
            {(relConfig as { labelTa?: string }).labelTa || relConfig.label.split(' ')[0]} -{' '}
            {targetPerson?.fullName || 'Family Relative'}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>{badgeLabel}</Text>
        </View>
      </View>

      <Text style={[styles.descriptionText, { color: colors.textMuted }]}>
        └─ {relConfig.description || `${relConfig.label} (${relationship.lineageCategory})`}
      </Text>

      {(targetPerson?.phone || targetPerson?.notes) && (
        <View style={[styles.footerRow, { borderTopColor: colors.borderCard }]}>
          {targetPerson?.phone && (
            <Text style={[styles.footerItem, { color: colors.textMuted }]}>📞 {targetPerson.phone}</Text>
          )}
          {targetPerson?.notes && (
            <Text style={[styles.footerItem, { color: colors.textMuted }]}>📍 {targetPerson.notes}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginVertical: 6,
    borderLeftWidth: 5,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  personName: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    marginLeft: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerItem: {
    fontSize: 12,
    marginRight: 16,
  },
});
