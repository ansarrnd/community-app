export const CREATE_VILLAGES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS villages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT,
    state TEXT,
    is_home_village BOOLEAN DEFAULT 0
);
`;

export const CREATE_PERSONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    gender TEXT,
    birth_year INTEGER,
    home_village_id TEXT,
    current_location_tag TEXT,
    phone TEXT,
    notes TEXT,
    FOREIGN KEY (home_village_id) REFERENCES villages(id)
);
`;

export const CREATE_RELATIONSHIPS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    source_person_id TEXT NOT NULL,
    target_person_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    inverse_type TEXT,
    lineage_category TEXT,
    context_tag TEXT DEFAULT 'In-Village',
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (source_person_id) REFERENCES persons(id),
    FOREIGN KEY (target_person_id) REFERENCES persons(id)
);
`;

export const WATERMELON_KINSHIP_SCHEMA = {
  version: 1,
  tables: [
    {
      name: 'villages',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'district', type: 'string', isOptional: true },
        { name: 'state', type: 'string', isOptional: true },
        { name: 'is_home_village', type: 'boolean' },
      ],
    },
    {
      name: 'persons',
      columns: [
        { name: 'full_name', type: 'string' },
        { name: 'gender', type: 'string' },
        { name: 'birth_year', type: 'number', isOptional: true },
        { name: 'home_village_id', type: 'string', isOptional: true },
        { name: 'current_location_tag', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
      ],
    },
    {
      name: 'relationships',
      columns: [
        { name: 'source_person_id', type: 'string', isIndexed: true },
        { name: 'target_person_id', type: 'string', isIndexed: true },
        { name: 'relationship_type', type: 'string' },
        { name: 'inverse_type', type: 'string', isOptional: true },
        { name: 'lineage_category', type: 'string', isIndexed: true },
        { name: 'context_tag', type: 'string', isIndexed: true },
        { name: 'is_active', type: 'boolean' },
      ],
    },
  ],
};
