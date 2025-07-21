import getDefaultCustomFieldOperator from '../getDefaultCustomFieldOperator'
import { mockCustomField, mockSchemas } from './mocks'

describe('getDefaultCustomFieldOperator', () => {
    it('should return the default operator for a custom field', () => {
        expect(
            getDefaultCustomFieldOperator(mockSchemas, mockCustomField),
        ).toBe('eq')
    })
})
