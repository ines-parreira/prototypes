import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as helpers from '../helpers'

jest.addMatchers(immutableMatchers)

describe('agents helpers', () => {
    it('isStaff', () => {
        expect(helpers.isStaff()).toBe(false)
        expect(helpers.isStaff(fromJS({}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: []}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: 'agent'}]}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: 'admin'}]}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: 'staff'}]}))).toBe(true)
        expect(helpers.isStaff(fromJS({roles: [{name: 'agent'}, {name: 'admin'}]}))).toBe(false)
        expect(helpers.isStaff(fromJS({roles: [{name: 'agent'}, {name: 'staff'}]}))).toBe(true)
        expect(helpers.isStaff(fromJS({roles: [{name: 'admin'}, {name: 'staff'}]}))).toBe(true)
    })

    it('getHighestRole', () => {
        expect(helpers.getHighestRole()).toEqualImmutable(fromJS({}))
        expect(helpers.getHighestRole(fromJS({}))).toEqualImmutable(fromJS({}))
        expect(helpers.getHighestRole(fromJS({roles: []}))).toEqualImmutable(fromJS({}))
        expect(helpers.getHighestRole(fromJS({roles: [{name: 'agent'}]}))).toEqualImmutable(fromJS({name: 'agent'}))
        expect(helpers.getHighestRole(fromJS({roles: [{name: 'admin'}]}))).toEqualImmutable(fromJS({name: 'admin'}))
        expect(helpers.getHighestRole(fromJS({roles: [{name: 'staff'}]}))).toEqualImmutable(fromJS({name: 'staff'}))
        expect(helpers.getHighestRole(fromJS({roles: [{name: 'agent'}, {name: 'admin'}]}))).toEqualImmutable(fromJS({name: 'admin'}))
        expect(helpers.getHighestRole(fromJS({roles: [{name: 'agent'}, {name: 'staff'}]}))).toEqualImmutable(fromJS({name: 'staff'}))
        expect(helpers.getHighestRole(fromJS({roles: [{name: 'admin'}, {name: 'staff'}]}))).toEqualImmutable(fromJS({name: 'staff'}))
    })
})
