import type { ImportMetafieldsResult } from '../ImportMetafieldFlow/hooks/useImportMetafields'
import type { Field } from '../MetafieldsTable/types'
import { getImportResultMessage } from './getImportResultMessage'

const createField = (name: string): Field =>
    ({
        id: `field-${name}`,
        name,
        type: 'single_line_text_field',
        category: 'Customer',
    }) as Field

describe('getImportResultMessage', () => {
    it('should return success message when all fields are imported successfully', () => {
        const result: ImportMetafieldsResult = {
            successful: [createField('Field 1'), createField('Field 2')],
            failed: [],
        }

        const message = getImportResultMessage(result, 2)

        expect(message).toEqual({
            message: 'Success! 2 metafields added',
            type: 'success',
        })
    })

    it('should return success message with singular form for single field', () => {
        const result: ImportMetafieldsResult = {
            successful: [createField('Field 1')],
            failed: [],
        }

        const message = getImportResultMessage(result, 1)

        expect(message).toEqual({
            message: 'Success! 1 metafield added',
            type: 'success',
        })
    })

    it('should return error message when all fields fail to import', () => {
        const result: ImportMetafieldsResult = {
            successful: [],
            failed: [createField('Field 1'), createField('Field 2')],
        }

        const message = getImportResultMessage(result, 2)

        expect(message).toEqual({
            message: 'Failed to import metafields. Please try again.',
            type: 'error',
        })
    })

    it('should return partial success message with failed field names when some fields fail', () => {
        const result: ImportMetafieldsResult = {
            successful: [createField('Field 1')],
            failed: [createField('Field 2'), createField('Field 3')],
        }

        const message = getImportResultMessage(result, 3)

        expect(message).toEqual({
            message: '1 of 3 metafields added. Failed: Field 2, Field 3',
            type: 'error',
        })
    })

    it('should handle single failed field in partial success', () => {
        const result: ImportMetafieldsResult = {
            successful: [createField('Field 1'), createField('Field 2')],
            failed: [createField('Field 3')],
        }

        const message = getImportResultMessage(result, 3)

        expect(message).toEqual({
            message: '2 of 3 metafields added. Failed: Field 3',
            type: 'error',
        })
    })
})
