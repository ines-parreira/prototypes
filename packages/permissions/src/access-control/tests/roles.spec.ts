import { filterUserByRole, hasRole, UserRole } from '../roles'

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

describe('filterUserByRole', () => {
    it('returns true when item has no requiredRole', () => {
        expect(filterUserByRole(undefined, {})).toBe(true)
    })

    it('returns false when item has requiredRole but currentUser is undefined', () => {
        expect(
            filterUserByRole(undefined, { requiredRole: UserRole.Admin }),
        ).toBe(false)
    })

    it('returns true when user has the required role', () => {
        const user = { role: { name: UserRole.Admin } }
        expect(filterUserByRole(user, { requiredRole: UserRole.Admin })).toBe(
            true,
        )
    })

    it('returns true when user has a higher role than required', () => {
        const user = { role: { name: UserRole.Admin } }
        expect(filterUserByRole(user, { requiredRole: UserRole.Agent })).toBe(
            true,
        )
    })

    it('returns false when user does not have the required role', () => {
        const user = { role: { name: UserRole.Agent } }
        expect(filterUserByRole(user, { requiredRole: UserRole.Admin })).toBe(
            false,
        )
    })
})
