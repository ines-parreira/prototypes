import {
    ADVERTISE_ROLE,
    canEnableMetaSetting,
    hasFacebookRole,
    MODERATE_ROLE,
    PERMISSIONS_PER_INTEGRATION_META_SETTING,
} from '../utils.tsx'

const {FACEBOOK_USER_TYPES} = require('../utils')
const {getFacebookUserTypeByRoles} = require('../utils')

describe('facebook roles and permissions utils', () => {
    describe('getFacebookUserTypeByRoles', () => {
        it('should return nothing because no userRoles', () => {
            const userType = getFacebookUserTypeByRoles(undefined)

            expect(userType).toBeUndefined()
        })
        it.each([
            ...FACEBOOK_USER_TYPES,
            {
                name: 'Custom/Unknown',
                roles: [ADVERTISE_ROLE],
            },
        ])(
            'should return the correct user type based on roles',
            (facebookUserType) => {
                const userType = getFacebookUserTypeByRoles(
                    facebookUserType.roles
                )

                expect(userType).toBe(facebookUserType.name)
            }
        )
    })

    describe('hasFacebookRole', () => {
        it('should return nothing because no userRoles', () => {
            const hasRole = getFacebookUserTypeByRoles(undefined)

            expect(hasRole).toBeUndefined()
        })

        it('should return true because it has role', () => {
            const userRoles = [ADVERTISE_ROLE, MODERATE_ROLE]

            const hasRole = hasFacebookRole(userRoles, MODERATE_ROLE)

            expect(hasRole).toBeTruthy()
        })

        it('should return false because it does not have the role', () => {
            const userRoles = [ADVERTISE_ROLE]

            const hasRole = hasFacebookRole(userRoles, MODERATE_ROLE)

            expect(hasRole).toBeFalsy()
        })
    })

    describe('canEnableMetaSetting', () => {
        it('should return false because no userPermissions', () => {
            const canEnable = canEnableMetaSetting(undefined)

            expect(canEnable).toBe(false)
        })

        it('should return false because no meta setting property', () => {
            const canEnable = canEnableMetaSetting([], 'foo')

            expect(canEnable).toBe(false)
        })

        it.each([
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.messenger_enabled,
                'messenger_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.messenger_enabled.slice(
                    0,
                    -1
                ),
                'messenger_enabled',
                false,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.posts_enabled,
                'posts_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.posts_enabled.slice(
                    0,
                    -1
                ),
                'posts_enabled',
                false,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.mentions_enabled,
                'mentions_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.mentions_enabled.slice(
                    0,
                    -1
                ),
                'mentions_enabled',
                false,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.instagram_comments_enabled,
                'instagram_comments_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.instagram_comments_enabled.slice(
                    0,
                    -1
                ),
                'instagram_comments_enabled',
                false,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.instagram_mentions_enabled,
                'instagram_mentions_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.instagram_mentions_enabled.slice(
                    0,
                    -1
                ),
                'instagram_mentions_enabled',
                false,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.instagram_ads_enabled,
                'instagram_ads_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.instagram_ads_enabled.slice(
                    0,
                    -1
                ),
                'instagram_ads_enabled',
                false,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.recommendations_enabled,
                'recommendations_enabled',
                true,
            ],
            [
                PERMISSIONS_PER_INTEGRATION_META_SETTING.recommendations_enabled.slice(
                    0,
                    -1
                ),
                'recommendations_enabled',
                false,
            ],
        ])(
            'should return true or false based on conditions',
            (permissions, metaSettingToCheck, expectedValue) => {
                const canEnable = canEnableMetaSetting(
                    permissions,
                    metaSettingToCheck
                )

                expect(canEnable).toBe(expectedValue)
            }
        )
    })
})
