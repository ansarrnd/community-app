import React from 'react';
import { View, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { Users, UserPlus, Trash2 } from 'lucide-react-native';
import { EventMemberInput } from '../domain/types';
import { TAMIL_RELATIONSHIPS } from '../taxonomy/tamilTaxonomy';
import { getVillageTheme } from '../theme/villageTheme';

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
  isDark?: boolean;
  inputBgColor?: string;
  borderColor?: string;
  textColor?: string;
  mutedTextColor?: string;
}

export const KinshipMemberPicker: React.FC<KinshipMemberPickerProps> = ({
  members,
  onChange,
  isDark = false,
  inputBgColor = '#FFFFFF',
  borderColor = '#E6E1DA',
  textColor = '#1E1E1E',
  mutedTextColor = '#706C61',
}) => {
  const theme = getVillageTheme(isDark);

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

  const handleUpdateMember = (index: number, key: keyof EventMemberInput, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Users size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Pressable style={styles.titleText}>
            <View>
              <TextInput
                editable={false}
                value="Family & Village Members (Kinship Mapping)"
                style={{ fontWeight: '700', fontSize: 15, color: theme.colors.primary }}
              />
            </View>
          </Pressable>
        </View>
        <Pressable onPress={handleAddMember} style={[styles.addBtn, { backgroundColor: theme.colors.primary + '22' }]}>
          <UserPlus size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
          <TextInput
            editable={false}
            value="Add Member"
            style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}
          />
        </Pressable>
      </View>

      {members.length === 0 ? (
        <TextInput
          editable={false}
          value='No kinship members attached yet. Tap "+ Add Member" to link family & ritual relations (e.g. Mama, Athai, Periyappa).'
          style={{ fontSize: 12, fontStyle: 'italic', color: mutedTextColor, marginTop: 6 }}
        />
      ) : (
        members.map((member, index) => (
          <View
            key={index}
            style={[
              styles.card,
              {
                borderColor,
                backgroundColor: inputBgColor,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <TextInput
                editable={false}
                value={`Member #${index + 1}`}
                style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}
              />
              <Pressable onPress={() => handleRemoveMember(index)}>
                <Trash2 size={16} color="#FF3B30" />
              </Pressable>
            </View>

            <TextInput
              editable={false}
              value="Full Name"
              style={{ fontSize: 12, fontWeight: '700', marginTop: 6, marginBottom: 2, color: textColor }}
            />
            <TextInput
              style={[styles.input, { backgroundColor: inputBgColor, borderColor, color: textColor }]}
              placeholder="e.g. Kandasamy / Valliammai"
              placeholderTextColor={mutedTextColor}
              value={member.fullName}
              onChangeText={(val) => handleUpdateMember(index, 'fullName', val)}
            />

            <View style={{ marginTop: 6 }}>
              <TextInput
                editable={false}
                value="Kinship Relation"
                style={{ fontSize: 12, fontWeight: '700', marginBottom: 4, color: textColor }}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {KINSHIP_OPTIONS.map((opt) => {
                  const isSel = member.relationshipTypeToOrganizer === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => handleUpdateMember(index, 'relationshipTypeToOrganizer', opt.id)}
                      style={[
                        styles.chip,
                        {
                          borderColor: isSel ? theme.colors.primary : borderColor,
                          backgroundColor: isSel ? theme.colors.primary + '22' : 'transparent',
                        },
                      ]}
                    >
                      <TextInput
                        editable={false}
                        value={opt.label}
                        style={{
                          fontSize: 11,
                          color: isSel ? theme.colors.primary : mutedTextColor,
                          fontWeight: isSel ? '700' : '400',
                        }}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.contextRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput editable={false} value="Context:" style={{ fontSize: 12, color: textColor, marginRight: 6 }} />
                <Pressable
                  onPress={() =>
                    handleUpdateMember(
                      index,
                      'contextTag',
                      member.contextTag === 'In-Village' ? 'Out-Village' : 'In-Village'
                    )
                  }
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor:
                        member.contextTag === 'In-Village'
                          ? theme.colors.tags.inVillageBg
                          : theme.colors.tags.outVillageBg,
                    },
                  ]}
                >
                  <TextInput
                    editable={false}
                    value={member.contextTag || 'In-Village'}
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color:
                        member.contextTag === 'In-Village'
                          ? theme.colors.tags.inVillageText
                          : theme.colors.tags.outVillageText,
                    }}
                  />
                </Pressable>
              </View>
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
  },
  titleText: {
    flexDirection: 'row',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 4,
  },
  contextRow: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
