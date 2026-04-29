import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { integrationsState } from 'fixtures/integrations'

import useStoresRequiringScriptTagMigration from '../hooks/useStoresRequiringScriptTagMigration'
import ScriptTagMigrationBanner from '../ScriptTagMigrationBanner'

jest.mock('../hooks/useStoresRequiringScriptTagMigration')

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('<ScriptTagMigrationBanner />', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatScopeReinstallOnShopifyCallback) {
                return true
            }
            if (key === FeatureFlagKey.ChatScopeUpdateBanner) {
                return true
            }
            if (key === FeatureFlagKey.ChatScopeUpdateDueDate) {
                return 'Scary Deadline'
            }
            return defaultValue
        })
    })

    it('should contain only re-install link for a single store', () => {
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

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })

    it('should contain only permission update link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: false,
                },
            ],
        )

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })

    it('should contain both re-install and permission update link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
            ],
        )

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })

    it('should contain only re-install link for multiple stores', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
            ],
        )

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })

    it('should contain only permission update link for multiple stores', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: false,
                },
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: false,
                },
            ],
        )

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })

    it('should contain re-install link for a single store and permission update link for multiple stores', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: false,
                },
            ],
        )

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })

    it('should contain re-install link for multiple stores and permission update link for a single store', () => {
        ;(useStoresRequiringScriptTagMigration as jest.Mock).mockImplementation(
            () => [
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: true,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
                {
                    storeIntegration: { meta: { shop_name: 'test-shop-name' } },
                    storeRequiresPermissionUpdates: false,
                    gorgiasChatIntegration: fromJS({ id: 'test-chat-id' }),
                    gorgiasChatRequiresReinstall: true,
                },
            ],
        )

        const { container } = render(<ScriptTagMigrationBanner />, {
            storeState: {
                currentUser: fromJS({ role: { name: UserRole.Admin } }),
                integrations: fromJS(integrationsState),
            },
        })
        expect(container).toMatchSnapshot()
    })
})
