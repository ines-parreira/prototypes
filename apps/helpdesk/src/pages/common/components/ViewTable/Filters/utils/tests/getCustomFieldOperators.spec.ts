import { fromJS } from 'immutable'

import { BASIC_OPERATORS } from 'config'

import getCustomFieldOperators from '../getCustomFieldOperators'
import { mockCustomField, mockSchemas } from './mocks'

describe('getCustomFieldOperators', () => {
    it('should return basic operators if no custom field is provided or no field schema exists', () => {
        expect(getCustomFieldOperators(fromJS({ definitions: {} }))).toEqual(
            BASIC_OPERATORS,
        )
    })

    it('should provide the operators for a custom field', () => {
        expect(getCustomFieldOperators(mockSchemas, mockCustomField)).toEqual({
            eq: {
                label: 'is',
            },
        })
    })
})
