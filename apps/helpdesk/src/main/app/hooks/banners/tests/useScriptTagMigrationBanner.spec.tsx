import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import useStoresRequiringScriptTagMigration from 'pages/common/components/ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration'
import { getCurrentUser } from 'state/currentUser/selectors'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import { useScriptTagMigrationBanner } from '../useScriptTagMigrationBanner'

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

jest.mock('state/integrations/selectors', () => ({
    makeGetRedirectUri: jest.fn(() => () => '/redirect-uri/{shop_name}'),
}))
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock(
    'pages/common/components/ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration',
)
jest.mock('utils', () => ({
    isAdmin: () => true,
}))

const mockedAddBanner = jest.fn()
const mockedRemoveBanner = jest.fn()

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

describe('useScriptTagMigrationBanner', () => {
    beforeEach(() => {
        mockedAddBanner.mockReset()
        mockedRemoveBanner.mockReset()
        mockUseFlag.mockReset()
        getCurrentUserMock.mockReturnValue(
            fromJS({ role: { name: UserRole.Admin } }),
        )
    })

    it('should not call addBanner if FF is not enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    scriptTagMigrationBanner: false,
                }
            }
        })

        renderHook(useScriptTagMigrationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).not.toHaveBeenCalled()
    })

    it('should not call addBanner if useStoresRequiringScriptTagMigration is not present', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    scriptTagMigrationBanner: true,
                }
            }
        })

        renderHook(useScriptTagMigrationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).not.toHaveBeenCalled()
    })

    it('should call addBanner with proper data when conditions are met', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return '2024-12-31'
            }
            if (flag === FeatureFlagKey.ChatScopeUpdateBanner) {
                return true
            }
            if (flag === FeatureFlagKey.ChatScopeReinstallOnShopifyCallback) {
                return true
            }
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    scriptTagMigrationBanner: true,
                }
            }
            return false
        })
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
            ],
        )

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === makeGetRedirectUri) {
                return () => '/redirect-uri/{shop_name}'
            }
            if (selector === getCurrentUser) {
                return { isAdmin: true }
            }
            return null
        })

        renderHook(useScriptTagMigrationBanner)

        expect(mockedAddBanner).toHaveBeenCalled()
    })

    it('should remove banner if showMigrationBanner is false', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    scriptTagMigrationBanner: true,
                }
            }
            if (flag === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return ''
            }
        })
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
            ],
        )

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === makeGetRedirectUri) {
                return () => '/redirect-uri/{shop_name}'
            }
            if (selector === getCurrentUser) {
                return { isAdmin: true }
            }
            return null
        })

        renderHook(useScriptTagMigrationBanner)

        expect(mockedAddBanner).not.toHaveBeenCalled()
        expect(mockedRemoveBanner).toHaveBeenCalled()
    })

    it('should show static link when multiple stores need permission updates', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return '2024-12-31'
            }
            if (flag === FeatureFlagKey.ChatScopeUpdateBanner) {
                return true
            }
            if (flag === FeatureFlagKey.ChatScopeReinstallOnShopifyCallback) {
                return true
            }
            if (flag === FeatureFlagKey.GlobalBannerRefactor) {
                return {
                    scriptTagMigrationBanner: true,
                }
            }
            return false
        })
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: {
                        meta: { shop_name: 'test-shop-name-2' },
                    },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id-2' }),
                    gorgiasChatRequiresReinstall: true,
                },
            ],
        )

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === makeGetRedirectUri) {
                return () => '/redirect-uri/{shop_name}'
            }
            if (selector === getCurrentUser) {
                return { isAdmin: true }
            }
            return null
        })

        renderHook(useScriptTagMigrationBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining(
                    '/app/settings/channels/gorgias_chat',
                ),
            }),
        )
    })

    it('should show onclick handler when single store needs permission updates', () => {
        mockUseFlag.mockReturnValue({ scriptTagMigrationBanner: true })
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockReturnValue([
            {
                storeIntegration: { meta: { shop_name: 'store-1' } },
                storeRequiresPermissionUpdates: true,
            },
        ])

        renderHook(useScriptTagMigrationBanner)

        expect(mockedAddBanner).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('onclick='),
            }),
        )
    })
})
