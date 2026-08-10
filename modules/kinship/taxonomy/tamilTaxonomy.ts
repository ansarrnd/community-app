import { RelationshipConfig } from '../domain/types';

export const TAMIL_RELATIONSHIPS: Record<string, RelationshipConfig> = {
  // Nuclear
  FATHER: {
    label: 'Father (அப்பா)',
    labelTa: 'அப்பா',
    inverse: 'CHILD',
    category: 'NUCLEAR',
    description: 'Direct paternal lineage',
  },
  MOTHER: {
    label: 'Mother (அம்மா)',
    labelTa: 'அம்மா',
    inverse: 'CHILD',
    category: 'NUCLEAR',
    description: 'Direct maternal lineage',
  },
  ELDER_BROTHER: {
    label: 'Elder Brother (அண்ணன்)',
    labelTa: 'அண்ணன்',
    inverse: 'YOUNGER_SIBLING',
    category: 'NUCLEAR',
    description: 'Older brother relative to Ego',
  },
  YOUNGER_BROTHER: {
    label: 'Younger Brother (தம்பி)',
    labelTa: 'தம்பி',
    inverse: 'ELDER_SIBLING',
    category: 'NUCLEAR',
    description: 'Younger brother relative to Ego',
  },
  ELDER_SISTER: {
    label: 'Elder Sister (அக்கா)',
    labelTa: 'அக்கா',
    inverse: 'YOUNGER_SIBLING',
    category: 'NUCLEAR',
    description: 'Older sister relative to Ego',
  },
  YOUNGER_SISTER: {
    label: 'Younger Sister (தங்கச்சி)',
    labelTa: 'தங்கச்சி',
    inverse: 'ELDER_SIBLING',
    category: 'NUCLEAR',
    description: 'Younger sister relative to Ego',
  },
  SPOUSE: {
    label: 'Spouse (கணவன் / மனைவி)',
    labelTa: 'கணவன் / மனைவி',
    inverse: 'SPOUSE',
    category: 'NUCLEAR',
    description: 'Husband or Wife',
  },

  // Paternal Lineage (Thanthai Valhi)
  PATERNAL_GRANDPARENT: {
    label: 'Paternal Grandparent (அப்பப்பா / அப்பத்தா)',
    labelTa: 'அப்பப்பா / அப்பத்தா',
    inverse: 'GRANDCHILD',
    category: 'PATERNAL',
    description: "Father's parents",
  },
  PATERNAL_UNCLE_ELDER: {
    label: 'Periyappa (பெரியப்பா)',
    labelTa: 'பெரியப்பா',
    inverse: 'NIECE_NEPHEW',
    category: 'PATERNAL',
    description: "Father's older brother",
  },
  PATERNAL_UNCLE_YOUNGER: {
    label: 'Chithappa (சித்தப்பா)',
    labelTa: 'சித்தப்பா',
    inverse: 'NIECE_NEPHEW',
    category: 'PATERNAL',
    description: "Father's younger brother",
  },
  PATERNAL_AUNT: {
    label: 'Athai (அத்தை)',
    labelTa: 'அத்தை',
    inverse: 'NIECE_NEPHEW',
    category: 'PATERNAL',
    description: "Father's sister",
  },

  // Maternal Lineage (Thaai Valhi)
  MATERNAL_GRANDPARENT: {
    label: 'Maternal Grandparent (அம்மம்மா / ஆயா)',
    labelTa: 'அம்மம்மா / ஆயா',
    inverse: 'GRANDCHILD',
    category: 'MATERNAL',
    description: "Mother's parents",
  },
  MATERNAL_UNCLE: {
    label: 'Mama (மாமா)',
    labelTa: 'மாமா',
    inverse: 'NIECE_NEPHEW',
    category: 'MATERNAL',
    description: "Mother's brother (crucial alliance tie)",
  },
  MATERNAL_AUNT_ELDER: {
    label: 'Periyaatha / Periyamma (பெரியாயி / பெரியம்மா)',
    labelTa: 'பெரியாயி / பெரியம்மா',
    inverse: 'NIECE_NEPHEW',
    category: 'MATERNAL',
    description: "Mother's older sister",
  },
  MATERNAL_AUNT_YOUNGER: {
    label: 'Chinnatha / Chithi (சின்னாயி / சித்தி)',
    labelTa: 'சின்னாயி / சித்தி',
    inverse: 'NIECE_NEPHEW',
    category: 'MATERNAL',
    description: "Mother's younger sister",
  },

  // Cousins
  CROSS_COUSIN_MALE: {
    label: 'Machan / Maithunan (மச்சான் / மைத்துனன்)',
    labelTa: 'மச்சான் / மைத்துனன்',
    inverse: 'CROSS_COUSIN',
    category: 'COUSIN',
    description: "Mother's brother's son / Father's sister's son",
  },
  CROSS_COUSIN_FEMALE: {
    label: 'Machi / Murai Penn (மச்சி / முறை பெண்)',
    labelTa: 'மச்சி / முறை பெண்',
    inverse: 'CROSS_COUSIN',
    category: 'COUSIN',
    description: "Mother's brother's daughter / Father's sister's daughter",
  },
  PARALLEL_COUSIN: {
    label: 'Parallel Cousin (பங்காளி சகோதரன்/சகோதரி)',
    labelTa: 'பங்காளி சகோதரன் / சகோதரி',
    inverse: 'PARALLEL_COUSIN',
    category: 'COUSIN',
    description: "Parent's same-gender sibling's child (treated as sibling)",
  },

  // In-Law / Affinal (Marumurai)
  FATHER_IN_LAW: {
    label: 'Father-in-law (மாமனாார்)',
    labelTa: 'மாமனாார்',
    inverse: 'CHILD_IN_LAW',
    category: 'AFFINAL',
    description: "Spouse's father",
  },
  MOTHER_IN_LAW: {
    label: 'Mother-in-law (மாமியார்)',
    labelTa: 'மாமியார்',
    inverse: 'CHILD_IN_LAW',
    category: 'AFFINAL',
    description: "Spouse's mother",
  },
  BROTHER_IN_LAW: {
    label: 'Brother-in-law (கொழுந்தனார் / மச்சான்)',
    labelTa: 'கொழுந்தனார் / மச்சான்',
    inverse: 'IN_LAW',
    category: 'AFFINAL',
    description: "Spouse's brother",
  },
  SISTER_IN_LAW: {
    label: 'Sister-in-law (நாத்தனார் / கொழுந்தியாள்)',
    labelTa: 'நாத்தனார் / கொழுந்தியாள்',
    inverse: 'IN_LAW',
    category: 'AFFINAL',
    description: "Spouse's sister",
  },
  CO_BROTHER: {
    label: 'Sagalai (சகலை)',
    labelTa: 'சகலை',
    inverse: 'CO_BROTHER',
    category: 'AFFINAL',
    description: "Wife's sister's husband",
  },
  CO_SISTER: {
    label: 'Anni / Oragathi (அண்ணி / ஒரகத்தி)',
    labelTa: 'அண்ணி / ஒரகத்தி',
    inverse: 'CO_SISTER',
    category: 'AFFINAL',
    description: "Elder brother's wife / Husband's brother's wife",
  },

  // External / Social
  MIGRATED_TO: {
    label: 'Migrated To (வெளியூர்)',
    labelTa: 'வெளியூர்',
    inverse: 'MIGRATION_LINK',
    category: 'EXTERNAL',
    description: 'Links a person to an Out-Village location',
  },
  BUSINESS_PARTNER: {
    label: 'Business Partner (வியாபார உறவு)',
    labelTa: 'வியாபார உறவு',
    inverse: 'BUSINESS_PARTNER',
    category: 'SOCIAL',
    description: 'Trade, credit, or agricultural labor links',
  },
};

// Key Aliases for convenient lookups
TAMIL_RELATIONSHIPS.PERIYAPPA = TAMIL_RELATIONSHIPS.PATERNAL_UNCLE_ELDER;
TAMIL_RELATIONSHIPS.CHITHAPPA = TAMIL_RELATIONSHIPS.PATERNAL_UNCLE_YOUNGER;
TAMIL_RELATIONSHIPS.ATHAI = TAMIL_RELATIONSHIPS.PATERNAL_AUNT;
TAMIL_RELATIONSHIPS.MAMA = TAMIL_RELATIONSHIPS.MATERNAL_UNCLE;
TAMIL_RELATIONSHIPS.SAGALAI = TAMIL_RELATIONSHIPS.CO_BROTHER;
TAMIL_RELATIONSHIPS.MACHAI_MACHAN = TAMIL_RELATIONSHIPS.CROSS_COUSIN_MALE;

