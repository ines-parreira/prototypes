import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as helpers from '../helpers'
import {ADMIN_ROLE, AGENT_ROLE, OBSERVER_AGENT_ROLE} from '../../../config/user'

jest.addMatchers(immutableMatchers)

describe('agents helpers', () => {
    it('getHighestRole', () => {
        expect(helpers.getHighestRole()).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({}))).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({roles: []}))).toEqualImmutable(
            null
        )
        expect(
            helpers.getHighestRole(
                fromJS({roles: [{name: OBSERVER_AGENT_ROLE}]})
            )
        ).toEqualImmutable(OBSERVER_AGENT_ROLE)
        expect(
            helpers.getHighestRole(fromJS({roles: [{name: ADMIN_ROLE}]}))
        ).toEqualImmutable(ADMIN_ROLE)
        expect(
            helpers.getHighestRole(
                fromJS({roles: [{name: AGENT_ROLE}, {name: ADMIN_ROLE}]})
            )
        ).toEqualImmutable(ADMIN_ROLE)
    })
})
