import {fromJS} from 'immutable'

import * as helpers from '../helpers'

describe('helpers', () => {
    describe('users', () => {
        it('getDisplayName', () => {
            const name = 'Cedric'
            const email = 'cedric@gmail.com'
            const id = 1234

            expect(helpers.getDisplayName()).toBe('Unknown user')
            expect(helpers.getDisplayName('')).toBe('Unknown user')
            expect(helpers.getDisplayName(name)).toBe(name)
            expect(helpers.getDisplayName({name})).toBe(name)
            expect(helpers.getDisplayName(fromJS({name}))).toBe(name)
            expect(helpers.getDisplayName({name, email})).toBe(name)
            expect(helpers.getDisplayName({email})).toBe(email)
            expect(helpers.getDisplayName({name: `  ${name}   `})).toBe(name)
            expect(helpers.getDisplayName({id})).toBe(`User #${id}`)
            expect(helpers.getDisplayName({name, email, id})).toBe(name)
            expect(helpers.getDisplayName({hello: 'world'})).toBe('Unknown user')
        })
    })
})
