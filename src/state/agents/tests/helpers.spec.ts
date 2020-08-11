import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as helpers from '../helpers'
import {UserRole} from '../../../config/types/user'

jest.addMatchers(immutableMatchers)

describe('agents helpers', () => {
    it('getHighestRole', () => {
        expect(
            (helpers as {getHighestRole: () => Maybe<string>}).getHighestRole()
        ).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({}))).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({roles: []}))).toEqualImmutable(
            null
        )
        expect(
            helpers.getHighestRole(
                fromJS({roles: [{name: UserRole.ObserverAgent}]})
            )
        ).toEqualImmutable(UserRole.ObserverAgent)
        expect(
            helpers.getHighestRole(fromJS({roles: [{name: UserRole.Admin}]}))
        ).toEqualImmutable(UserRole.Admin)
        expect(
            helpers.getHighestRole(
                fromJS({
                    roles: [{name: UserRole.Agent}, {name: UserRole.Admin}],
                })
            )
        ).toEqualImmutable(UserRole.Admin)
    })
})
