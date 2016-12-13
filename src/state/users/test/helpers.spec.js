import expect from 'expect'

import {fromJS} from 'immutable'

import * as helpers from '../helpers'

describe('helpers', () => {
    describe('users', () => {
        it('getDisplayName', () => {
            const name = 'Cedric'
            const email = 'cedric@gmail.com'

            expect(
                helpers.getDisplayName(name)
            ).toBe(name)

            expect(
                helpers.getDisplayName({name})
            ).toBe(name)

            expect(
                helpers.getDisplayName(fromJS({name}))
            ).toBe(name)

            expect(
                helpers.getDisplayName({name, email})
            ).toBe(name)

            expect(
                helpers.getDisplayName({email})
            ).toBe(email)
        })
    })
})
