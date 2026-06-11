import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/constants'

import { OneClickInstall } from './OneClickInstall'

const mockSkeletonLoader = jest.fn((__props: any) => null)
const mockVisibilityControls = jest.fn((__props: any) => null)

const mockDispatch = jest.fn().mockResolvedValue(undefined)
const mockUseAppDispatch = jest.fn(() => mockDispatch)
const mockUseAppSelector = jest.fn()
const mockUseFlag = jest.fn((__key) => false)
const mockUseAsyncFn = jest.fn((fn: any) => [{ loading: false }, fn])
const mockUseThemeAppExtensionInstallation = jest.fn((__storeIntegration) => ({
    shouldUseThemeAppExtensionInstallation: false,
}))
const mockUseShopifyThemeAppExtension = jest.fn(
    (__params): { isInstalled: boolean | undefined; isLoaded: boolean } => ({
        isInstalled: undefined,
        isLoaded: false,
    }),
)

jest.mock('pages/common/components/SkeletonLoader', () => ({
    __esModule: true,
    SkeletonLoader: (props: any) => mockSkeletonLoader(props),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/components/InstallationCard/VisibilityControls',
    () => {
        const { forwardRef: reactForwardRef } = jest.requireActual('react')
        return {
            __esModule: true,
            DefaultExportVisibilityControls: reactForwardRef(
                (props: any, __ref: any) => {
                    mockVisibilityControls(props)
                    return null
                },
            ),
        }
    },
)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    useAppDispatch: () => mockUseAppDispatch(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    useAppSelector: (selector: any) => mockUseAppSelector(selector),
}))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        ChatShowOrHideOnSelectedUrls: 'ChatShowOrHideOnSelectedUrls',
        ChatScopeInstallOnShopifyCallback: 'ChatScopeInstallOnShopifyCallback',
    },
    useFlag: (key: any) => mockUseFlag(key),
}))

jest.mock('@gorgias/toolkit-react', () => ({
    useAsyncFn: (fn: any) => mockUseAsyncFn(fn),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation',
    () => ({
        __esModule: true,
        useThemeAppExtensionInstallation: (storeIntegration: any) =>
            mockUseThemeAppExtensionInstallation(storeIntegration),
        getGorgiasMainThemeAppExtensionId: jest.fn(() => 'test-app-uuid'),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyThemeAppExtension',
    () => ({
        __esModule: true,
        useShopifyThemeAppExtension: (params: any) =>
            mockUseShopifyThemeAppExtension(params),
    }),
)

jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn((form: any) => ({
        type: 'UPDATE_INTEGRATION',
        payload: form,
    })),
    updateOrCreateIntegrationRequest: jest.fn((form: any) => ({
        type: 'UPDATE_INTEGRATION_REQUEST',
        payload: form,
    })),
}))

jest.mock('state/integrations/selectors', () => ({
    getStoreIntegrations: jest.fn(() => []),
    makeGetPreRedirectUri: jest.fn(() => jest.fn()),
}))

describe('OneClickInstall', () => {
    const mockStoreIntegration = {
        id: 1,
        type: IntegrationType.Shopify,
        shop: 'test-shop.myshopify.com',
    }

    const defaultIntegration = fromJS({
        id: 100,
        type: IntegrationType.GorgiasChat,
        meta: {
            shop_integration_id: 1,
            shop_name: 'test-shop.myshopify.com',
            shopify_integration_ids: [],
        },
    })

    const defaultProps = {
        integration: defaultIntegration,
        themeAppExtensionInstallation: false,
        themeAppExtensionInstallationUrl: null,
        isConnected: true,
        isInstalled: false,
        hasShopifyScriptTagScope: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockDispatch.mockResolvedValue(undefined)
        mockUseAppSelector.mockReturnValue([mockStoreIntegration])
        mockUseFlag.mockReturnValue(false)
        mockUseAsyncFn.mockImplementation((fn: any) => [{ loading: false }, fn])
        mockUseThemeAppExtensionInstallation.mockReturnValue({
            shouldUseThemeAppExtensionInstallation: false,
        })
        mockUseShopifyThemeAppExtension.mockReturnValue({
            isInstalled: undefined,
            isLoaded: false,
        })
    })

    const renderComponent = (props = {}) => {
        return render(<OneClickInstall {...defaultProps} {...props} />)
    }

    describe('Loading state', () => {
        it('should render SkeletonLoader when theme app extension status is not loaded', () => {
            renderComponent({
                themeAppExtensionInstallation: true,
            })

            expect(mockSkeletonLoader).toHaveBeenCalledWith(
                expect.objectContaining({
                    length: 1,
                }),
            )
        })

        it('should not render SkeletonLoader when theme app extension is not enabled', () => {
            renderComponent({
                themeAppExtensionInstallation: false,
            })

            expect(mockSkeletonLoader).not.toHaveBeenCalled()
        })

        it('should render component when theme app extension status is loaded', () => {
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: false,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
            })

            expect(mockSkeletonLoader).not.toHaveBeenCalled()
        })
    })

    describe('Header text', () => {
        it('should render "Quick installation for Shopify" when theme app extension is enabled', () => {
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: false,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
            })

            expect(
                screen.getByText('Quick installation for Shopify'),
            ).toBeInTheDocument()
        })

        it('should render "1-click installation for Shopify" when theme app extension is not enabled', () => {
            renderComponent({
                themeAppExtensionInstallation: false,
            })

            expect(
                screen.getByText('1-click installation for Shopify'),
            ).toBeInTheDocument()
        })
    })

    describe('Subtext rendering', () => {
        it('should render default subtext when theme app extension is not enabled', () => {
            renderComponent({
                themeAppExtensionInstallation: false,
            })

            expect(
                screen.getByText(
                    'Add the chat widget to your Shopify store in one click.',
                ),
            ).toBeInTheDocument()
        })

        it('should render "To add Chat, click Install then Save" when theme app extension is enabled but not installed', () => {
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: false,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
                isInstalled: false,
            })

            expect(
                screen.getByText(
                    'To add Chat, click Install then Save in the new Shopify window without editing anything.',
                ),
            ).toBeInTheDocument()
        })

        it('should render "To add Chat to your Shopify store, click Install" when theme app extension is installed', () => {
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: true,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
                isInstalled: false,
            })

            expect(
                screen.getByText(
                    'To add Chat to your Shopify store, click Install.',
                ),
            ).toBeInTheDocument()
        })

        it('should render "To add Chat, click Reinstall then Save" when installed but theme app extension is not', () => {
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: false,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
                isInstalled: true,
            })

            expect(
                screen.getByText(
                    'To add Chat, click Reinstall then Save in the new Shopify window without editing anything.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Icon rendering', () => {
        it('should render CircleCheck icon when installed', () => {
            renderComponent({
                isInstalled: true,
            })

            expect(
                screen.getByRole('img', { name: 'check-circle' }),
            ).toBeInTheDocument()
        })

        it('should not render CircleCheck icon when not installed', () => {
            renderComponent({
                isInstalled: false,
            })

            expect(
                screen.queryByRole('img', { name: 'check-circle' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Install button', () => {
        it('should render Install button when not installed', () => {
            renderComponent({
                isInstalled: false,
            })

            expect(
                screen.getByRole('button', { name: 'Install' }),
            ).toBeInTheDocument()
        })

        it('should disable Install button when not connected', () => {
            renderComponent({
                isInstalled: false,
                isConnected: false,
            })

            expect(
                screen.getByRole('button', { name: 'Install' }),
            ).toBeDisabled()
        })

        it('should show loading state on Install button', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent({
                isInstalled: false,
            })

            expect(
                screen.queryByRole('button', { name: 'Install' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Uninstall button', () => {
        it('should render Uninstall button when installed', () => {
            renderComponent({
                isInstalled: true,
            })

            expect(
                screen.getByRole('button', { name: 'Uninstall' }),
            ).toBeInTheDocument()
        })

        it('should show loading state on Uninstall button', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent({
                isInstalled: true,
            })

            expect(
                screen.queryByRole('button', { name: 'Uninstall' }),
            ).not.toBeInTheDocument()
        })

        it('should dispatch and show success toast when Uninstall is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({
                isInstalled: true,
            })

            await user.click(screen.getByRole('button', { name: 'Uninstall' }))

            expect(mockDispatch).toHaveBeenCalled()
            expect(await screen.findByRole('status')).toHaveTextContent(
                'Integration successfully updated',
            )
        })

        it('should dispatch and show success toast when Install is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({
                isInstalled: false,
            })

            await user.click(screen.getByRole('button', { name: 'Install' }))

            expect(mockDispatch).toHaveBeenCalled()
            expect(await screen.findByRole('status')).toHaveTextContent(
                'Integration successfully updated',
            )
        })

        it('should show error toast when Uninstall fails', async () => {
            const user = userEvent.setup()
            mockDispatch.mockRejectedValueOnce({
                response: { data: { error: { msg: 'Uninstall failed' } } },
            })

            renderComponent({
                isInstalled: true,
            })

            await user.click(screen.getByRole('button', { name: 'Uninstall' }))

            expect(await screen.findByRole('status')).toHaveTextContent(
                'Uninstall failed',
            )
        })

        it('should show error toast when Install fails', async () => {
            const user = userEvent.setup()
            mockDispatch.mockRejectedValueOnce({
                response: { data: { error: { msg: 'Install failed' } } },
            })

            renderComponent({
                isInstalled: false,
            })

            await user.click(screen.getByRole('button', { name: 'Install' }))

            expect(await screen.findByRole('status')).toHaveTextContent(
                'Install failed',
            )
        })
    })

    describe('Reinstall button', () => {
        it('should render Reinstall button when theme app extension is enabled, installed, but extension not installed', () => {
            mockUseThemeAppExtensionInstallation.mockReturnValue({
                shouldUseThemeAppExtensionInstallation: true,
            })
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: false,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
                isInstalled: true,
            })

            expect(
                screen.getByRole('button', { name: 'Reinstall' }),
            ).toBeInTheDocument()
        })

        it('should disable Reinstall button when not connected', () => {
            mockUseThemeAppExtensionInstallation.mockReturnValue({
                shouldUseThemeAppExtensionInstallation: true,
            })
            mockUseShopifyThemeAppExtension.mockReturnValue({
                isInstalled: false,
                isLoaded: true,
            })

            renderComponent({
                themeAppExtensionInstallation: true,
                isInstalled: true,
                isConnected: false,
            })

            expect(
                screen.getByRole('button', { name: 'Reinstall' }),
            ).toBeDisabled()
        })
    })

    describe('Expand/Collapse button', () => {
        it('should render expand button when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            renderComponent()

            expect(
                screen.getByRole('img', { name: 'arrow-chevron-down' }),
            ).toBeInTheDocument()
        })

        it('should change to collapse icon when opened', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            renderComponent()

            await user.click(
                screen.getByRole('img', { name: 'arrow-chevron-down' }),
            )

            expect(
                await screen.findByRole('img', {
                    name: 'arrow-chevron-up',
                }),
            ).toBeInTheDocument()
        })

        it('should not render expand button when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByRole('img', { name: 'arrow-chevron-down' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('img', { name: 'arrow-chevron-up' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('VisibilityControls', () => {
        it('should render VisibilityControls when feature flag is enabled and integration loaded', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            renderComponent()

            expect(mockVisibilityControls).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: defaultIntegration,
                    isOpen: false,
                    isUpdate: false,
                    canSubmit: true,
                }),
            )
        })

        it('should pass isUpdate true when installed', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            renderComponent({
                isInstalled: true,
            })

            expect(mockVisibilityControls).toHaveBeenCalledWith(
                expect.objectContaining({
                    isUpdate: true,
                }),
            )
        })

        it('should not render VisibilityControls when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(mockVisibilityControls).not.toHaveBeenCalled()
        })

        it('should not render VisibilityControls when integration is not loaded', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            const integrationWithoutId = fromJS({
                type: IntegrationType.GorgiasChat,
                meta: {},
            })

            renderComponent({
                integration: integrationWithoutId,
            })

            expect(mockVisibilityControls).not.toHaveBeenCalled()
        })
    })

    describe('Shopify permissions modal', () => {
        it('should not show modal initially when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should not show modal when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('should open modal with correct content when Install is clicked and scope permission is missing', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent({
                isInstalled: false,
                hasShopifyScriptTagScope: false,
            })

            await user.click(screen.getByRole('button', { name: 'Install' }))

            const dialog = await screen.findByRole('dialog')
            expect(dialog).toHaveTextContent('Update Shopify permissions?')
            expect(dialog).toHaveTextContent(
                'Please update Shopify permissions before installing your chat to ensure better stability.',
            )
            expect(
                screen.getByRole('button', { name: 'Close' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Update' }),
            ).toBeInTheDocument()
        })

        it('should not open modal when hasShopifyScriptTagScope is true', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent({
                isInstalled: false,
                hasShopifyScriptTagScope: true,
            })

            await user.click(screen.getByRole('button', { name: 'Install' }))

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
