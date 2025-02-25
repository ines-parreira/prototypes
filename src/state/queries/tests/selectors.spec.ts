import * as queryClient from 'api/queryClient'
import { RootState } from 'state/types'

import { getQueriesState, getQueryData, getQueryTimestamp } from '../selectors'

describe('queries selectors', () => {
    const state = {
        queries: {
            timestamp: {
                '["QK"]': 123,
            },
        },
    } as unknown as RootState

    it('should return queries state', () => {
        expect(getQueriesState(state)).toEqual(state.queries)
    })

    it('should return query timestamp', () => {
        expect(getQueryTimestamp(['QK'])(state)).toEqual(123)
    })

    it('should return queryData', () => {
        jest.spyOn(queryClient.appQueryClient, 'getQueryData').mockReturnValue(
            'data',
        )
        expect(getQueryData(['QK'])(state)).toEqual('data')
    })
})
