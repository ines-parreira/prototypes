import expect from 'expect'
import expectImmutable from 'expect-immutable';

import {Map} from 'immutable'
import {currentUser} from '../currentUser'

expect.extend(expectImmutable)

describe('currentUser', () => {
    it('return the initial state', () => {
        expect(currentUser()).toEqualImmutable(Map())
    })
})
