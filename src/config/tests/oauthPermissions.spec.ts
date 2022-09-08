import {scopesToPermissions} from '../oauthPermissions'

describe('Config: oauthPermissions', () => {
    describe('scopesToPermissions', () => {
        it('returns an empty array when passed an empty array', () => {
            expect(scopesToPermissions([])).toEqual([])
        })

        it('ignores invalid and ignored scopes', () => {
            const scopes = ['openid', 'email', 'unknown_scope']
            expect(scopesToPermissions(scopes)).toEqual([])
        })

        it('converts scopes to a list of permissions and verbs', () => {
            const scopes = ['users:read', 'users:write', 'account:read']
            expect(scopesToPermissions(scopes)).toMatchSnapshot()
        })

        it('can handle the legacy "write:all" scope', () => {
            expect(scopesToPermissions(['write:all'])).toMatchSnapshot()
        })
    })
})
