export interface KinshipModuleConfig {
  taxonomyMode: 'TAMIL_VILLAGE' | 'STANDARD_GENERIC';
  enableMigrationTracking: boolean; // Out-Village vs In-Village context tags
  enableBiDirectionalAutoMapping: boolean; // Auto generate inverse relationship records
  defaultLanguage: 'ta' | 'en';
}

export const defaultConfig: KinshipModuleConfig = {
  taxonomyMode: 'TAMIL_VILLAGE',
  enableMigrationTracking: true,
  enableBiDirectionalAutoMapping: true,
  defaultLanguage: 'en',
};
