import {
    canEnableMetaSetting,
    FacebookRole,
    FACEBOOK_USER_TYPES,
    getFacebookUserTypeByRoles,
    hasFacebookRole,
    PERMISSIONS_PER_INTEGRATION_META_SETTING,
} from '../utils'

describe('facebook roles and permissions utils', () => {
    describe('getFacebookUserTypeByRoles', () => {
        it.each([
            ...FACEBOOK_USER_TYPES,
            {
                name: 'Custom/Unknown',
                roles: [FacebookRole.Advertise],
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
        it('should return true because it has role', () => {
            const userRoles: FacebookRole[] = [
                FacebookRole.Advertise,
                FacebookRole.Moderate,
            ]

            const hasRole = hasFacebookRole(userRoles, FacebookRole.Moderate)

            expect(hasRole).toBeTruthy()
        })

        it('should return false because it does not have the role', () => {
            const userRoles = [FacebookRole.Advertise]

            const hasRole = hasFacebookRole(userRoles, FacebookRole.Moderate)

            expect(hasRole).toBeFalsy()
        })
    })

    describe('canEnableMetaSetting', () => {
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
