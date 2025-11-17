import type { CustomFieldCondition } from '@gorgias/helpdesk-types'

import type { CustomField } from 'custom-fields/types'

import { populateConditionalFieldIds } from '../add-conditional-custom-field-ids-based-on-conditions.util'

type Expression = { field: string }
type Requirement = { field_id: CustomField['id'] }

describe('populateConditionalFieldIds', () => {
    it('returns an empty array when no conditions are provided', () => {
        const result = populateConditionalFieldIds([], [1, 2, 3])
        expect(result).toEqual([])
    })

    it('returns an empty array when no expressions match form value IDs', () => {
        const conditions: CustomFieldCondition[] = [
            {
                expression: [
                    { field: '10' },
                    { field: '20' },
                ] as any as Expression[],
                requirements: [{ field_id: 30 }] as any as Requirement[],
            } as CustomFieldCondition,
        ]
        const formValueIds: CustomField['id'][] = [1, 2]
        const result = populateConditionalFieldIds(conditions, formValueIds)
        expect(result).toEqual([])
    })

    it('returns requirement field_ids when an expression field matches a form value ID', () => {
        const conditions: CustomFieldCondition[] = [
            {
                expression: [
                    { field: '5' },
                    { field: '8' },
                ] as any as Expression[],
                requirements: [
                    { field_id: 100 },
                    { field_id: 200 },
                ] as any as Requirement[],
            } as CustomFieldCondition,
        ]
        const formValueIds: CustomField['id'][] = [5]
        const result = populateConditionalFieldIds(conditions, formValueIds)
        expect(result).toEqual([100, 200])
    })

    it('accumulates field_ids from multiple matching conditions', () => {
        const conditions: CustomFieldCondition[] = [
            {
                expression: [{ field: '1' }] as any as Expression[],
                requirements: [{ field_id: 10 }] as any as Requirement[],
            },
            {
                expression: [{ field: '2' }] as any as Expression[],
                requirements: [
                    { field_id: 20 },
                    { field_id: 30 },
                ] as any as Requirement[],
            },
            {
                expression: [{ field: '3' }] as any as Expression[],
                requirements: [{ field_id: 40 }] as any as Requirement[],
            },
        ] as CustomFieldCondition[]
        const formValueIds: CustomField['id'][] = [1, 3]
        const result = populateConditionalFieldIds(conditions, formValueIds)
        expect(result).toEqual([10, 40])
    })

    it('handles duplicate field_ids across conditions', () => {
        const conditions: CustomFieldCondition[] = [
            {
                expression: [{ field: '7' }] as any as Expression[],
                requirements: [
                    { field_id: 50 },
                    { field_id: 60 },
                ] as any as Requirement[],
            },
            {
                expression: [{ field: '7' }] as any as Expression[],
                requirements: [
                    { field_id: 60 },
                    { field_id: 70 },
                ] as any as Requirement[],
            },
        ] as CustomFieldCondition[]
        const formValueIds: CustomField['id'][] = [7]
        const result = populateConditionalFieldIds(conditions, formValueIds)
        // duplicates are preserved
        expect(result).toEqual([50, 60, 60, 70])
    })
})
