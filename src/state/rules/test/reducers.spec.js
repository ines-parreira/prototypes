import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)


describe('rules reducer', () => {
    it('should return the initial state', () => {
        expect(
            reducer(undefined, {})
        ).toEqualImmutable(
            initialState
        )
    })
})
