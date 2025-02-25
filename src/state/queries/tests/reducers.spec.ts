import { GorgiasAction } from 'state/types'

import * as constants from '../constants'
import reducer, { initialState } from '../reducers'

jest.mock('utils/date', () => ({
    getMoment: () => ({
        unix: () => 1234567890,
    }),
}))

describe('queries reducers', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqual(initialState)
    })

    it('should update timestamp', () => {
        const queryKey = 'queryKey'
        expect(
            reducer(undefined, {
                type: constants.UPDATE_QUERY_TIMESTAMP,
                queryKey,
            }),
        ).toEqual({
            ...initialState,
            timestamp: {
                [queryKey]: 1234567890,
            },
        })
    })
})
