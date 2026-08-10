import {
  TAMIL_RELATIONSHIPS,
  createRelationshipPayload,
  createInverseRelationshipPayload,
  RelationshipRepository,
  KinshipModuleConfig,
} from '../../modules/kinship';

describe('Kinship Module Unit Tests', () => {
  let repo: RelationshipRepository;

  beforeEach(() => {
    repo = new RelationshipRepository();
  });

  test('TAMIL_RELATIONSHIPS taxonomy contains expected Tamil terms & categories', () => {
    expect(TAMIL_RELATIONSHIPS.PERIYAPPA).toBeDefined();
    expect(TAMIL_RELATIONSHIPS.PERIYAPPA.labelTa).toBe('பெரியப்பா');
    expect(TAMIL_RELATIONSHIPS.PERIYAPPA.category).toBe('PATERNAL');
    expect(TAMIL_RELATIONSHIPS.MAMA.category).toBe('MATERNAL');
    expect(TAMIL_RELATIONSHIPS.SAGALAI.category).toBe('AFFINAL');
    expect(TAMIL_RELATIONSHIPS.CROSS_COUSIN_MALE.category).toBe('COUSIN');
  });

  test('createRelationshipPayload builds valid payload for In-Village context', () => {
    const payload = createRelationshipPayload('person_1', 'person_2', 'PERIYAPPA', 'In-Village');
    expect(payload).toEqual({
      id: 'person_1_person_2_PERIYAPPA',
      sourcePersonId: 'person_1',
      targetPersonId: 'person_2',
      relationshipType: 'PERIYAPPA',
      inverseType: 'NIECE_NEPHEW',
      lineageCategory: 'PATERNAL',
      contextTag: 'In-Village',
      isActive: true,
    });
  });

  test('createInverseRelationshipPayload generates correct inverse relationship edge', () => {
    const rel = createRelationshipPayload('person_1', 'person_2', 'PERIYAPPA', 'In-Village');
    const inverse = createInverseRelationshipPayload(rel);
    expect(inverse).toBeDefined();
    expect(inverse?.sourcePersonId).toBe('person_2');
    expect(inverse?.targetPersonId).toBe('person_1');
    expect(inverse?.relationshipType).toBe('NIECE_NEPHEW');
    expect(inverse?.inverseType).toBe('PERIYAPPA');
  });

  test('RelationshipRepository adds relationships and auto-creates inverse edges when enabled', async () => {
    const created = await repo.addRelationship('ego_1', 'relative_1', 'MAMA', 'In-Village');
    expect(created.length).toBe(2);

    const egoRel = await repo.getRelationshipsForPerson('ego_1');
    expect(egoRel.length).toBe(1);
    expect(egoRel[0].relationshipType).toBe('MAMA');

    const relRel = await repo.getRelationshipsForPerson('relative_1');
    expect(relRel.length).toBe(1);
    expect(relRel[0].relationshipType).toBe('NIECE_NEPHEW');
  });

  test('RelationshipRepository queries Out-Village migrated network correctly', async () => {
    await repo.addRelationship('ego_1', 'relative_local', 'PERIYAPPA', 'In-Village');
    await repo.addRelationship('ego_1', 'relative_migrated', 'MIGRATED_TO', 'Out-Village');

    const outVillage = await repo.getOutVillageNetwork('ego_1');
    expect(outVillage.length).toBe(1);
    expect(outVillage[0].targetPersonId).toBe('relative_migrated');
  });

  test('RelationshipRepository queries lineage network filtered by category and context', async () => {
    await repo.addRelationship('ego_1', 'father_brother', 'PERIYAPPA', 'In-Village');
    await repo.addRelationship('ego_1', 'mother_brother', 'MAMA', 'In-Village');

    const paternal = await repo.getLineageNetwork('ego_1', 'PATERNAL', 'In-Village');
    expect(paternal.length).toBe(1);
    expect(paternal[0].relationshipType).toBe('PERIYAPPA');

    const maternal = await repo.getLineageNetwork('ego_1', 'MATERNAL', 'In-Village');
    expect(maternal.length).toBe(1);
    expect(maternal[0].relationshipType).toBe('MAMA');
  });

  test('Module configuration toggles bi-directional auto mapping', async () => {
    const customConfig: KinshipModuleConfig = {
      taxonomyMode: 'TAMIL_VILLAGE',
      enableMigrationTracking: true,
      enableBiDirectionalAutoMapping: false,
      defaultLanguage: 'ta',
    };
    const customRepo = new RelationshipRepository(customConfig);

    const created = await customRepo.addRelationship('ego_1', 'relative_1', 'ATHAI', 'In-Village');
    expect(created.length).toBe(1);

    const inverseRel = await customRepo.getRelationshipsForPerson('relative_1');
    expect(inverseRel.length).toBe(0);
  });
});
