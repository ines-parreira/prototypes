import { CustomField } from 'custom-fields/types'

import getFieldSchemaDefinitionKey from '../getFieldSchemaDefinitionKey'
import { mockCustomField } from './mocks'

describe('getFieldSchemaDefinitionKey', () => {
    it('should return the field schema definition key', () => {
        expect(getFieldSchemaDefinitionKey(mockCustomField)).toBe('text')
    })

    it('should return dropdown key for a dropdown custom field', () => {
        const mockDropdownCustomField = {
            definition: {
                data_type: 'text',
                input_settings: { input_type: 'dropdown' },
            },
        } as CustomField

        expect(getFieldSchemaDefinitionKey(mockDropdownCustomField)).toBe(
            'dropdown',
        )
    })
})
