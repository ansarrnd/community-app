import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCreateEventMutation } from '../../application/hooks/useEventsQuery';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { useNetworkGuard } from '../../application/hooks/useNetworkGuard';
import { EventCategory } from '../../domain/models/Event';
import { LiquidGlassCard } from '../../components/LiquidGlassCard';
import { EventImage } from '../../components/EventImage';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { useLayoutInsets } from '../../application/hooks/useLayoutInsets';
import { platformShadow } from '../../constants/theme';
import { Image as ImageIcon, Send, Sparkles, UserPlus, Users, Trash2 } from 'lucide-react-native';
import { KinshipMemberPicker } from '../../modules/kinship';



const CATEGORY_OPTIONS: { id: EventCategory; label: string }[] = [
  { id: 'MARRIAGE', label: '💍 Marriage' },
  { id: 'CULTURAL', label: '🎉 Cultural' },
  { id: 'MEETING', label: '📋 Meeting' },
];

const KINSHIP_OPTIONS = [
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


export default function CreateEventScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { checkConnection } = useNetworkGuard();
  const createMutation = useCreateEventMutation();
  const { theme } = useTheme();
  const { contentBottomPadding } = useLayoutInsets();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('MARRIAGE');
  const [date, setDate] = useState('2026-10-24');
  const [time, setTime] = useState('06:00 PM');
  const [venue, setVenue] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [details, setDetails] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Category specific template variables
  const [groomName, setGroomName] = useState('Rahul Kapoor');
  const [brideName, setBrideName] = useState('Priya Sharma');
  const [agenda, setAgenda] = useState('1. Project Plan\n2. Q&A Session');

  // Family & Kinship Attached Members state
  const [attachedMembers, setAttachedMembers] = useState<
    {
      fullName: string;
      gender: 'M' | 'F';
      roleInEvent: string;
      relationshipTypeToOrganizer: string;
      contextTag: 'In-Village' | 'Out-Village';
    }[]
  >([]);

  const handleAddMember = () => {
    setAttachedMembers((prev) => [
      ...prev,
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
    setAttachedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMember = (index: number, key: string, value: any) => {
    setAttachedMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('[ImagePicker] Error picking image:', e);
    }
  };

  const handleSubmit = () => {
    if (!checkConnection('Host Event')) return;

    if (!title.trim() || !venue.trim() || !details.trim()) {
      if (Platform.OS === 'web') alert('Please fill in title, venue, and description fields.');
      else Alert.alert('Missing Fields', 'Please fill in title, venue, and description fields.');
      return;
    }

    // Filter valid attached members
    const validMembers = attachedMembers.filter((m) => m.fullName.trim().length > 0);

    createMutation.mutate(
      {
        input: {
          title,
          category,
          date,
          time,
          venue,
          googleMapsUrl,
          details,
          inviteCardUrl: imageUri,
          organizerId: user.uid,
          organizerName: user.displayName,
          groomName: category === 'MARRIAGE' ? groomName : undefined,
          brideName: category === 'MARRIAGE' ? brideName : undefined,
          agenda: category === 'MEETING' ? agenda : undefined,
          attachedMembers: validMembers.length > 0 ? validMembers : undefined,
        },
        userRole: user.role,
      },
      {
        onSuccess: (createdEvent) => {
          const statusNotice =
            createdEvent.status === 'APPROVED'
              ? 'Event auto-approved and published with family network members!'
              : 'Event submitted! Pending Moderator review.';
          if (Platform.OS === 'web') alert(statusNotice);
          else Alert.alert('Success', statusNotice);
          router.replace('/(tabs)/');
        },
        onError: (err: any) => {
          if (Platform.OS === 'web') alert(`Error: ${err.message}`);
          else Alert.alert('Submission Failed', err.message);
        },
      }
    );
  };


  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.bgInput,
      borderColor: theme.colors.borderInput,
      color: theme.colors.textPrimary,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: contentBottomPadding }]}
    >
      <ThemedText variant="h2" bold style={{ marginBottom: 4 }}>
        Host a Community Event
      </ThemedText>
      <ThemedText variant="body" secondary style={{ marginBottom: 16 }}>
        Fill in event details to publish or submit to moderators for group forwarding.
      </ThemedText>

      {/* Category Selector Segment */}
      <ThemedText variant="caption" bold style={styles.label}>
        Select Event Category
      </ThemedText>
      <View style={styles.categoryRow}>
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = category === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              style={[
                styles.catBtn,
                isActive
                  ? {
                      backgroundColor: theme.isDark ? 'rgba(0, 242, 254, 0.22)' : 'rgba(0, 122, 255, 0.16)',
                      borderColor: theme.colors.accentTeal,
                    }
                  : {
                      backgroundColor: theme.colors.bgInput,
                      borderColor: theme.colors.borderInput,
                    },
              ]}
            >
              <ThemedText
                variant="caption"
                bold={isActive}
                style={{ color: isActive ? theme.colors.accentTeal : theme.colors.textSecondary }}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Input Fields */}
      <ThemedText variant="caption" bold style={styles.label}>
        Event Title *
      </ThemedText>
      <TextInput
        style={inputStyle}
        placeholder="e.g. Royal Wedding / Diwali Night / Welfare Meeting"
        placeholderTextColor={theme.colors.textMuted}
        value={title}
        onChangeText={setTitle}
        testID="input-event-title"
      />

      {category === 'MARRIAGE' && (
        <View style={styles.rowTwoInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <ThemedText variant="caption" bold style={styles.label}>
              Groom Name
            </ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="Groom Name"
              placeholderTextColor={theme.colors.textMuted}
              value={groomName}
              onChangeText={setGroomName}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="caption" bold style={styles.label}>
              Bride Name
            </ThemedText>
            <TextInput
              style={inputStyle}
              placeholder="Bride Name"
              placeholderTextColor={theme.colors.textMuted}
              value={brideName}
              onChangeText={setBrideName}
            />
          </View>
        </View>
      )}

      {category === 'MEETING' && (
        <>
          <ThemedText variant="caption" bold style={styles.label}>
            Agenda Outline
          </ThemedText>
          <TextInput
            style={[inputStyle, { height: 64 }]}
            placeholder="1. Park budget 2. Solar lighting"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            value={agenda}
            onChangeText={setAgenda}
          />
        </>
      )}

      <View style={styles.rowTwoInputs}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <ThemedText variant="caption" bold style={styles.label}>
            Date *
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textMuted}
            value={date}
            onChangeText={setDate}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="caption" bold style={styles.label}>
            Time *
          </ThemedText>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 06:00 PM"
            placeholderTextColor={theme.colors.textMuted}
            value={time}
            onChangeText={setTime}
          />
        </View>
      </View>

      <ThemedText variant="caption" bold style={styles.label}>
        Venue Location *
      </ThemedText>
      <TextInput
        style={inputStyle}
        placeholder="e.g. Royal Palace Hall, Main Community Park"
        placeholderTextColor={theme.colors.textMuted}
        value={venue}
        onChangeText={setVenue}
        testID="input-event-venue"
      />

      <ThemedText variant="caption" bold style={styles.label}>
        Google Maps URL (Optional)
      </ThemedText>
      <TextInput
        style={inputStyle}
        placeholder="https://maps.google.com/?q=..."
        placeholderTextColor={theme.colors.textMuted}
        value={googleMapsUrl}
        onChangeText={setGoogleMapsUrl}
      />

      <ThemedText variant="caption" bold style={styles.label}>
        Event Details & Description *
      </ThemedText>
      <TextInput
        style={[inputStyle, { height: 94 }]}
        placeholder="Provide complete information about schedule, parking, food..."
        placeholderTextColor={theme.colors.textMuted}
        multiline
        value={details}
        onChangeText={setDetails}
      />

      {/* Modular Kinship Network Member Picker Component */}
      <KinshipMemberPicker
        members={attachedMembers}
        onChange={setAttachedMembers}
        isDark={theme.isDark}
        inputBgColor={theme.colors.bgInput}
        borderColor={theme.colors.borderInput}
        textColor={theme.colors.textPrimary}
        mutedTextColor={theme.colors.textMuted}
      />



      {/* Image Picker Button */}
      <ThemedText variant="caption" bold style={styles.label}>
        Upload Invitation Card Image
      </ThemedText>
      <Pressable
        onPress={handlePickImage}
        style={[
          styles.imagePickerBtn,
          {
            backgroundColor: theme.isDark ? 'rgba(0, 242, 254, 0.12)' : 'rgba(0, 122, 255, 0.08)',
            borderColor: theme.colors.accentTeal,
          },
        ]}
      >
        <ImageIcon size={18} color={theme.colors.accentTeal} style={{ marginRight: 8 }} />
        <ThemedText variant="button" style={{ color: theme.colors.accentTeal }}>
          {imageUri ? 'Change Image' : 'Pick Image from Gallery'}
        </ThemedText>
      </Pressable>

      {/* Live Frosted Glass Invitation Card Preview */}
      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <Sparkles size={16} color={theme.colors.accentGold} style={{ marginRight: 6 }} />
          <ThemedText variant="subtitle" bold style={{ color: theme.colors.accentGold }}>
            Live Card Preview
          </ThemedText>
        </View>
        <LiquidGlassCard glowColor="rgba(255, 184, 0, 0.4)">
          <EventImage uri={imageUri} height={140} />
          <ThemedText variant="h3" style={{ marginBottom: 4 }}>
            {title || 'Event Title Preview'}
          </ThemedText>
          <ThemedText variant="caption" secondary style={{ marginBottom: 2 }}>
            📅 {date} | ⏰ {time}
          </ThemedText>
          <ThemedText variant="caption" secondary>
            📍 {venue || 'Venue Location'}
          </ThemedText>
          {category === 'MARRIAGE' && (
            <ThemedText variant="caption" bold style={{ color: theme.colors.accentTeal, marginTop: 4 }}>
              💍 Bride & Groom: {groomName} & {brideName}
            </ThemedText>
          )}
        </LiquidGlassCard>
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={createMutation.isPending}
        style={({ pressed }) => [
          styles.submitBtn,
          platformShadow('button'),
          { backgroundColor: theme.colors.buttonPrimaryBg },
          pressed && { opacity: 0.88 },
        ]}
        testID="btn-submit-event"
      >
        <Send size={18} color={theme.colors.buttonPrimaryText} style={{ marginRight: 8 }} />
        <ThemedText variant="button" style={{ color: theme.colors.buttonPrimaryText }}>
          {createMutation.isPending ? 'Publishing Event...' : 'Submit Event'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 16,
  },
  label: {
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: undefined,
  },
  rowTwoInputs: {
    flexDirection: 'row',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  previewSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
  },
});
