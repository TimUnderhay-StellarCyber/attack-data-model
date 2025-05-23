import { describe, beforeEach, it, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { type DataSource, dataSourceSchema } from '../../src/schemas/sdo/data-source.schema';
import {
  type StixCreatedTimestamp,
  type StixModifiedTimestamp,
  type ExternalReferences,
  xMitreIdentity,
} from '../../src/schemas/common/index';

describe('dataSourceSchema', () => {
  let minimalDataSource: DataSource;

  beforeEach(() => {
    minimalDataSource = {
      type: 'x-mitre-data-source',
      id: `x-mitre-data-source--${uuidv4()}`,
      description: 'Test data source description',
      spec_version: '2.1',
      created: '2017-06-01T00:00:00.000Z' as StixCreatedTimestamp,
      created_by_ref: `identity--${uuidv4()}`,
      modified: '2017-06-01T00:00:00.000Z' as StixModifiedTimestamp,
      name: 'Network Connection Creation',
      object_marking_refs: ['marking-definition--fa42a846-8d90-4e51-bc29-71d5b4802168'],
      x_mitre_modified_by_ref: xMitreIdentity,
      external_references: [
        {
          source_name: 'mitre-attack',
          url: 'https://attack.mitre.org/datasources/DS0014',
          external_id: 'DS0014',
        },
      ],
      x_mitre_attack_spec_version: '2.1.0',
      x_mitre_domains: ['enterprise-attack'],
      x_mitre_version: '1.0',
      x_mitre_collection_layers: ['Host'],
    };
  });

  describe('Valid Inputs', () => {
    it('should accept minimal valid object (only required fields)', () => {
      expect(() => dataSourceSchema.parse(minimalDataSource)).not.toThrow();
    });

    it('should accept fully populated valid object (required + optional ATT&CK fields)', () => {
      const fullDataSource: DataSource = {
        ...minimalDataSource,
        x_mitre_platforms: ['Windows'],
        x_mitre_contributors: ['Contributor'],
        x_mitre_deprecated: false,
      };
      expect(() => dataSourceSchema.parse(fullDataSource)).not.toThrow();
    });
  });

  describe('Field-Specific Tests', () => {
    const testField = (fieldName: keyof DataSource, invalidValue: any, isRequired = true) => {
      it(`should reject invalid values for ${fieldName}`, () => {
        const invalidObject = { ...minimalDataSource, [fieldName]: invalidValue };
        expect(() => dataSourceSchema.parse(invalidObject)).toThrow();
      });

      if (isRequired) {
        it(`should reject omission of ${fieldName}`, () => {
          const { [fieldName]: omitted, ...objectWithoutField } = minimalDataSource;
          expect(() => dataSourceSchema.parse(objectWithoutField)).toThrow();
        });
      }
    };

    describe('id', () => {
      testField('id', 'invalid-id');
    });

    describe('type', () => {
      testField('type', 'invalid-type');
    });

    describe('created_by_ref', () => {
      testField('created_by_ref', 'invalid-created-by-ref');
    });

    describe('description', () => {
      testField('description', 123);
    });

    describe('external_references', () => {
      testField('external_references', 'not-an-array' as unknown as ExternalReferences);
    });

    describe('object_marking_refs', () => {
      testField('object_marking_refs', ['invalid-object-marking-refs']);
    });

    describe('x_mitre_domains', () => {
      testField('x_mitre_domains', ['invalid-mitre-domains']);
    });

    describe('x_mitre_modified_by_ref', () => {
      testField('x_mitre_modified_by_ref', 'invalid-modified-by-ref');
    });

    // Optional Fields Testing
    describe('x_mitre_platforms', () => {
      testField('x_mitre_platforms', ['invalid-mitre-platforms'], false);
    });

    describe('x_mitre_contributors', () => {
      testField('x_mitre_contributors', 'not-an-array', false);
    });

    describe('x_mitre_collection_layers', () => {
      testField('x_mitre_collection_layers', ['invalid-mitre-collection-layers']);
    });

    describe('x_mitre_deprecated', () => {
      testField('x_mitre_deprecated', 'not-a-boolean', false);
    });
  });

  describe('Schema Refinements', () => {
    describe('External References Validation', () => {
      it('should reject when ATT&CK ID is missing', () => {
        const invalidDataSource = {
          ...minimalDataSource,
          external_references: [{ source_name: 'mitre-attack' }],
        };
        expect(() => dataSourceSchema.parse(invalidDataSource)).toThrow(
          /ATT&CK ID must be defined/,
        );
      });

      it('should reject invalid ATT&CK ID format', () => {
        const invalidDataSource = {
          ...minimalDataSource,
          external_references: [{ source_name: 'mitre-attack', external_id: 'DS123' }],
        };
        expect(() => dataSourceSchema.parse(invalidDataSource)).toThrow(
          `The first external_reference must match the ATT&CK ID format DS####.`,
        );
      });
    });
  });

  describe('Schema-Level Tests', () => {
    it('should reject unknown properties', () => {
      const invalidDataSource = {
        ...minimalDataSource,
        unknown_property: true,
      } as DataSource;
      expect(() => dataSourceSchema.parse(invalidDataSource)).toThrow();
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle special case X', () => {
      // Test any schema-specific special cases
    });
  });
});
