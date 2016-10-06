import expect from 'expect'
import expectImmutable from 'expect-immutable'

import reducer, {initialState} from '../reducers'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('currentUser', () => {
        it('should return the initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })
    })
})
