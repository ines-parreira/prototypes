import { hasRole, UserRole } from '../roles'

describe('hasRole', () => {
    it('should determine if user has required role (observer agent)', () => {
        const user = { role: { name: UserRole.ObserverAgent } }
        expect(hasRole(user, UserRole.ObserverAgent)).toEqual(true)
        expect(hasRole(user, UserRole.LiteAgent)).toEqual(false)
        expect(hasRole(user, UserRole.BasicAgent)).toEqual(false)
        expect(hasRole(user, UserRole.Agent)).toEqual(false)
        expect(hasRole(user, UserRole.Admin)).toEqual(false)
    })
    it('should determine if user has required role (agent)', () => {
        const user = { role: { name: UserRole.Agent } }
        expect(hasRole(user, UserRole.ObserverAgent)).toEqual(true)
        expect(hasRole(user, UserRole.LiteAgent)).toEqual(true)
        expect(hasRole(user, UserRole.BasicAgent)).toEqual(true)
        expect(hasRole(user, UserRole.Agent)).toEqual(true)
        expect(hasRole(user, UserRole.Admin)).toEqual(false)
    })

    it('should determine if user has required role (admin)', () => {
        const user = { role: { name: UserRole.Admin } }
        expect(hasRole(user, UserRole.ObserverAgent)).toEqual(true)
        expect(hasRole(user, UserRole.LiteAgent)).toEqual(true)
        expect(hasRole(user, UserRole.BasicAgent)).toEqual(true)
        expect(hasRole(user, UserRole.Agent)).toEqual(true)
        expect(hasRole(user, UserRole.Admin)).toEqual(true)
    })
})
