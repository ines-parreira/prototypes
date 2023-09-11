import {updateQueryTimestamp} from '../actions'
import * as constants from '../constants'
import {QueryKey} from '../types'

describe('queries actions', () => {
    it('updateQueryTimestamp returns correct payload', () => {
        expect(updateQueryTimestamp(QueryKey.TicketVoiceCalls)).toEqual({
            type: constants.UPDATE_QUERY_TIMESTAMP,
            queryKey: QueryKey.TicketVoiceCalls,
        })
    })
})
