import { updateQueryTimestamp } from '../actions'
import * as constants from '../constants'

describe('queries actions', () => {
    it('updateQueryTimestamp returns correct payload', () => {
        expect(updateQueryTimestamp(['ticket', 123])).toEqual({
            type: constants.UPDATE_QUERY_TIMESTAMP,
            queryKey: '["ticket",123]',
        })
    })
})
