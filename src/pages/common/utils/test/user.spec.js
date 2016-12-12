import expect from 'expect'
import * as user from '../user'
import {fromJS} from 'immutable'

describe('components utils : user', () => {
    it('hasRole()', () => {
        const roles = fromJS([{
            name: 'agent'
        }])
        expect(user.hasRole(roles, 'agent')).toEqual(true)
        expect(user.hasRole(roles, 'admin')).toEqual(false)
    })
})
