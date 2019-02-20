import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as helpers from '../helpers'
import {ADMIN_ROLE, AGENT_ROLE, OBSERVER_AGENT_ROLE, STAFF_ROLE} from '../../../config/user'

jest.addMatchers(immutableMatchers)

describe('agents helpers', () => {
    it('isStaff', () => {
        expect(helpers.isStaff()).toBe(false)
        expect(helpers.isStaff(fromJS({}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: []}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: AGENT_ROLE}]}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: ADMIN_ROLE}]}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: STAFF_ROLE}]}))).toBe(true)
        expect(helpers.isStaff(fromJS({roles: [{name: AGENT_ROLE}, {name: ADMIN_ROLE}]}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: AGENT_ROLE}, {name: STAFF_ROLE}]}))).toBe(true)
        expect(helpers.isStaff(fromJS({roles: [{name: ADMIN_ROLE}, {name: STAFF_ROLE}]}))).toBe(true)
    })

    it('getHighestRole', () => {
        expect(helpers.getHighestRole()).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({}))).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({roles: []}))).toEqualImmutable(null)
        expect(helpers.getHighestRole(fromJS({roles: [{name: OBSERVER_AGENT_ROLE}]}))).toEqualImmutable(OBSERVER_AGENT_ROLE)
        expect(helpers.getHighestRole(fromJS({roles: [{name: ADMIN_ROLE}]}))).toEqualImmutable(ADMIN_ROLE)
        expect(helpers.getHighestRole(fromJS({roles: [{name: STAFF_ROLE}]}))).toEqualImmutable(STAFF_ROLE)
        expect(helpers.getHighestRole(fromJS({roles: [{name: AGENT_ROLE}, {name: ADMIN_ROLE}]}))).toEqualImmutable(ADMIN_ROLE)
        expect(helpers.getHighestRole(fromJS({roles: [{name: AGENT_ROLE}, {name: STAFF_ROLE}]}))).toEqualImmutable(STAFF_ROLE)
        expect(helpers.getHighestRole(fromJS({roles: [{name: ADMIN_ROLE}, {name: STAFF_ROLE}]}))).toEqualImmutable(STAFF_ROLE)
    })
})
