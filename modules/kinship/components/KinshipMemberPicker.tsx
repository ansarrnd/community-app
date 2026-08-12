import React from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { Users, UserPlus, Trash2 } from 'lucide-react-native';
import { EventMemberInput } from '../domain/types';
import { SegmentPill, ActionChip } from '@/components/ui';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';

export const KINSHIP_OPTIONS = [
  { id: 'MAMA', label: 'Mama / Mother Brother (மாமா)' },
  { id: 'ATHAI', label: 'Athai / Father Sister (அத்தை)' },
  { id: 'PERIYAPPA', label: 'Periyappa / Father Elder Brother (பெரியப்பா)' },
  { id: 'CHITHAPPA', label: 'Chithappa / Father Younger Brother (சித்தப்பா)' },
  { id: 'SAGALAI', label: 'Sagalai / Wife Sister Husband (சகலை)' },
  { id: 'MACHAI_MACHAN', label: 'Machan / Cross Cousin (மச்சான்)' },
  { id: 'FATHER', label: 'Father (அப்பா)' },
  { id: 'MOTHER', label: 'Mother (அம்மா)' },
  { id: 'ELDER_BROTHER', label: 'Elder Brother (அண்ணன்)' },
  { id: 'YOUNGER_BROTHER', label: 'Younger Brother (தம்பி)' },
  { id: 'ELDER_SISTER', label: 'Elder Sister (அக்கா)' },
  { id: 'YOUNGER_SISTER', label: 'Younger Sister (தங்கச்சி)' },
];

export interface KinshipMemberPickerProps {
  members: EventMemberInput[];
  onChange: (members: EventMemberInput[]) => void;
}

export const KinshipMemberPicker: React.FC<KinshipMemberPickerProps> = ({ members, onChange }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const accentColor = colors.accentTeal;

  const handleAddMember = () => {
    onChange([
      ...members,
      {
        fullName: '',
        gender: 'M',
        roleInEvent: 'GUEST',
        relationshipTypeToOrganizer: 'MAMA',
        contextTag: 'In-Village',
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    onChange(members.filter((_, i) => i !== index));
  };

  const handleUpdateMember = (index: number, key: keyof EventMemberInput, value: EventMemberInput[keyof EventMemberInput]) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Users size={18} color={accentColor} style={{ marginRight: 6 }} />
          <ThemedText variant="bodyBold" style={{ color: accentColor }}>
            Family & Village Members (Kinship Mapping)
          </ThemedText>
        </View>
        <Pressable onPress={handleAddMember} style={[styles.addBtn, { backgroundColor: accentColor + '22' }]}>
          <UserPlus size={14} color={accentColor} style={{ marginRight: 4 }} />
          <ThemedText variant="caption" bold style={{ color: accentColor }}>
            Add Member
          </ThemedText>
        </Pressable>
      </View>

      {members.length === 0 ? (
        <ThemedText variant="caption" muted style={styles.emptyHint}>
          No kinship members attached yet. Tap &quot;+ Add Member&quot; to link family & ritual relations (e.g. Mama,
          Athai, Periyappa).
        </ThemedText>
      ) : (
        members.map((member, index) => (
          <View
            key={index}
            style={[
              styles.card,
              {
                borderColor: colors.borderInput,
                backgroundColor: colors.bgInput,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <ThemedText variant="caption" bold style={{ color: accentColor }}>
                Member #{index + 1}
              </ThemedText>
              <Pressable onPress={() => handleRemoveMember(index)} accessibilityLabel="Remove member">
                <Trash2 size={16} color="#FF3B30" />
              </Pressable>
            </View>

            <ThemedText variant="caption" bold style={styles.fieldLabel}>
              Full Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderInput,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Kandasamy / Valliammai"
              placeholderTextColor={colors.textMuted}
              value={member.fullName}
              onChangeText={(val) => handleUpdateMember(index, 'fullName', val)}
            />

            <View style={styles.relationSection}>
              <ThemedText variant="caption" bold style={styles.fieldLabel}>
                Kinship Relation
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {KINSHIP_OPTIONS.map((opt) => (
                  <SegmentPill
                    key={opt.id}
                    label={opt.label}
                    compact
                    selected={member.relationshipTypeToOrganizer === opt.id}
                    onPress={() => handleUpdateMember(index, 'relationshipTypeToOrganizer', opt.id)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.contextRow}>
              <ThemedText variant="caption" style={{ marginRight: 6 }}>
                Context:
              </ThemedText>
              <ActionChip
                label={member.contextTag || 'In-Village'}
                variant={member.contextTag === 'In-Village' ? 'success' : 'accent'}
                selected
                compact
                onPress={() =>
                  handleUpdateMember(
                    index,
                    'contextTag',
                    member.contextTag === 'In-Village' ? 'Out-Village' : 'In-Village'
                  )
                }
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emptyHint: {
    marginTop: 6,
    fontStyle: 'italic',
  },
  card: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  relationSection: {
    marginTop: 6,
  },
  contextRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
});
