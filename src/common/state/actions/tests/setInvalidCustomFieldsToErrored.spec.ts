import { SET_INVALID_CUSTOM_FIELDS_TO_ERRORED } from '../../constants'
import setInvalidCustomFieldsToErrored from '../setInvalidCustomFieldsToErrored'

describe('setInvalidCustomFieldsToErrored', () => {
    it('should return the action object', () => {
        expect(setInvalidCustomFieldsToErrored([1])).toEqual({
            payload: [1],
            type: SET_INVALID_CUSTOM_FIELDS_TO_ERRORED,
        })
    })
})
