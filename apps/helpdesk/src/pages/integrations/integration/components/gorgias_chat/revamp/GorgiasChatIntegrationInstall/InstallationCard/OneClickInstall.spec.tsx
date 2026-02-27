import { act, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    ButtonIntent,
    ButtonVariant,
    IconName,
    IconSize,
    ModalSize,
    TextSize,
    TextVariant,
} from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'

import OneClickInstall from './OneClickInstall'

const mockButton = jest.fn(({ children }: any) => children)
const mockIcon = jest.fn((__props: any) => null)
const mockModal = jest.fn(({ children }: any) => children)
const mockOverlayHeader = jest.fn((__props: any) => null)
const mockOverlayContent = jest.fn(({ children }: any) => children)
const mockOverlayFooter = jest.fn(({ children }: any) => children)
const mockText = jest.fn(({ children }: any) => children)
const mockSkeletonLoader = jest.fn((__props: any) => null)
const mockVisibilityControls = jest.fn((__props: any) => null)

const mockUseAppDispatch = jest.fn(() => jest.fn())
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

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: (props: any) => mockButton(props),
    Icon: (props: any) => mockIcon(props),
    Modal: (props: any) => mockModal(props),
    OverlayHeader: (props: any) => mockOverlayHeader(props),
    OverlayContent: (props: any) => mockOverlayContent(props),
    OverlayFooter: (props: any) => mockOverlayFooter(props),
    Text: (props: any) => mockText(props),
}))

jest.mock('pages/common/components/SkeletonLoader', () => ({
    __esModule: true,
    default: (props: any) => mockSkeletonLoader(props),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/VisibilityControls',
    () => {
        const { forwardRef: reactForwardRef } = jest.requireActual('react')
        return {
            __esModule: true,
            default: reactForwardRef((props: any, __ref: any) => {
                mockVisibilityControls(props)
                return null
            }),
        }
    },
)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockUseAppDispatch(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: (selector: any) => mockUseAppSelector(selector),
}))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        ChatShowOrHideOnSelectedUrls: 'ChatShowOrHideOnSelectedUrls',
        ChatScopeInstallOnShopifyCallback: 'ChatScopeInstallOnShopifyCallback',
    },
    useFlag: (key: any) => mockUseFlag(key),
}))

jest.mock('@repo/hooks', () => ({
    useAsyncFn: (fn: any) => mockUseAsyncFn(fn),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation',
    () => ({
        __esModule: true,
        default: (storeIntegration: any) =>
            mockUseThemeAppExtensionInstallation(storeIntegration),
        getGorgiasMainThemeAppExtensionId: jest.fn(() => 'test-app-uuid'),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyThemeAppExtension',
    () => ({
        __esModule: true,
        default: (params: any) => mockUseShopifyThemeAppExtension(params),
    }),
)

jest.mock('state/integrations/actions', () => ({
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
        updateOrCreateIntegration: jest.fn(),
        themeAppExtensionInstallation: false,
        themeAppExtensionInstallationUrl: null,
        isConnected: true,
        isInstalled: false,
        hasShopifyScriptTagScope: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
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

            const textCalls = mockText.mock.calls as any[]
            const headerText = textCalls.find(
                (call) => call[0].children === 'Quick installation for Shopify',
            )

            expect(headerText).toBeDefined()
            expect(headerText[0].size).toBe(TextSize.Md)
            expect(headerText[0].variant).toBe(TextVariant.Medium)
        })

        it('should render "1-click installation for Shopify" when theme app extension is not enabled', () => {
            renderComponent({
                themeAppExtensionInstallation: false,
            })

            const textCalls = mockText.mock.calls as any[]
            const headerText = textCalls.find(
                (call) =>
                    call[0].children === '1-click installation for Shopify',
            )

            expect(headerText).toBeDefined()
            expect(headerText[0].size).toBe(TextSize.Md)
            expect(headerText[0].variant).toBe(TextVariant.Medium)
        })
    })

    describe('Subtext rendering', () => {
        it('should render default subtext when theme app extension is not enabled', () => {
            renderComponent({
                themeAppExtensionInstallation: false,
            })

            const textCalls = mockText.mock.calls as any[]
            const subtext = textCalls.find(
                (call) =>
                    call[0].children ===
                    'Add the chat widget to your Shopify store in one click.',
            )

            expect(subtext).toBeDefined()
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

            const textCalls = mockText.mock.calls as any[]
            const subtext = textCalls.find(
                (call) =>
                    call[0].children ===
                    'To add Chat, click Install then Save in the new Shopify window without editing anything.',
            )

            expect(subtext).toBeDefined()
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

            const textCalls = mockText.mock.calls as any[]
            const subtext = textCalls.find(
                (call) =>
                    call[0].children ===
                    'To add Chat to your Shopify store, click Install.',
            )

            expect(subtext).toBeDefined()
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

            const textCalls = mockText.mock.calls as any[]
            const subtext = textCalls.find(
                (call) =>
                    call[0].children ===
                    'To add Chat, click Reinstall then Save in the new Shopify window without editing anything.',
            )

            expect(subtext).toBeDefined()
        })
    })

    describe('Icon rendering', () => {
        it('should render CircleCheck icon when installed', () => {
            renderComponent({
                isInstalled: true,
            })

            expect(mockIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: IconName.CircleCheck,
                    color: 'green',
                    size: IconSize.Lg,
                }),
            )
        })

        it('should not render CircleCheck icon when not installed', () => {
            renderComponent({
                isInstalled: false,
            })

            expect(mockIcon).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    name: IconName.CircleCheck,
                }),
            )
        })
    })

    describe('Install button', () => {
        it('should render Install button when not installed', () => {
            renderComponent({
                isInstalled: false,
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const installButton = buttonCalls.find(
                (call) => call[0].children === 'Install',
            )

            expect(installButton).toBeDefined()
            expect(installButton[0].intent).toBe(ButtonIntent.Regular)
            expect(installButton[0].variant).toBe(ButtonVariant.Primary)
        })

        it('should disable Install button when not connected', () => {
            renderComponent({
                isInstalled: false,
                isConnected: false,
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const installButton = buttonCalls.find(
                (call) => call[0].children === 'Install',
            )

            expect(installButton[0].isDisabled).toBe(true)
            expect(installButton[0].variant).toBe(ButtonVariant.Secondary)
        })

        it('should show loading state on Install button', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent({
                isInstalled: false,
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const installButton = buttonCalls.find(
                (call) => call[0].children === 'Install',
            )

            expect(installButton[0].isLoading).toBe(true)
        })
    })

    describe('Uninstall button', () => {
        it('should render Uninstall button when installed', () => {
            renderComponent({
                isInstalled: true,
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const uninstallButton = buttonCalls.find(
                (call) => call[0].children === 'Uninstall',
            )

            expect(uninstallButton).toBeDefined()
            expect(uninstallButton[0].intent).toBe(ButtonIntent.Regular)
            expect(uninstallButton[0].variant).toBe(ButtonVariant.Secondary)
        })

        it('should show loading state on Uninstall button', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent({
                isInstalled: true,
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const uninstallButton = buttonCalls.find(
                (call) => call[0].children === 'Uninstall',
            )

            expect(uninstallButton[0].isLoading).toBe(true)
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

            const buttonCalls = mockButton.mock.calls as any[]
            const reinstallButton = buttonCalls.find(
                (call) => call[0].children === 'Reinstall',
            )

            expect(reinstallButton).toBeDefined()
            expect(reinstallButton[0].intent).toBe(ButtonIntent.Regular)
            expect(reinstallButton[0].variant).toBe(ButtonVariant.Primary)
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

            const buttonCalls = mockButton.mock.calls as any[]
            const reinstallButton = buttonCalls.find(
                (call) => call[0].children === 'Reinstall',
            )

            expect(reinstallButton[0].isDisabled).toBe(true)
        })
    })

    describe('Expand/Collapse button', () => {
        it('should render expand button when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const expandButton = buttonCalls.find(
                (call) => call[0].icon === IconName.ArrowChevronDown,
            )

            expect(expandButton).toBeDefined()
            expect(expandButton[0].variant).toBe(ButtonVariant.Secondary)
            expect(expandButton[0].intent).toBe(ButtonIntent.Regular)
        })

        it('should change to collapse icon when opened', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatShowOrHideOnSelectedUrls') return true
                return false
            })

            renderComponent()

            const expandButton = mockButton.mock.calls.find(
                (call: any) => call[0].icon === IconName.ArrowChevronDown,
            )

            act(() => {
                expandButton![0].onClick()
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const collapseButton = buttonCalls.find(
                (call) => call[0].icon === IconName.ArrowChevronUp,
            )

            expect(collapseButton).toBeDefined()
        })

        it('should not render expand button when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const expandButton = buttonCalls.find(
                (call) =>
                    call[0].icon === IconName.ArrowChevronDown ||
                    call[0].icon === IconName.ArrowChevronUp,
            )

            expect(expandButton).toBeUndefined()
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
        it('should render modal when feature flag is enabled', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent()

            expect(mockModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    size: ModalSize.Md,
                    isOpen: false,
                }),
            )
        })

        it('should not render modal when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(mockModal).not.toHaveBeenCalled()
        })

        it('should render modal content with correct text', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent()

            expect(mockOverlayHeader).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Update Shopify permissions?',
                }),
            )

            const textCalls = mockText.mock.calls as any[]
            const modalText = textCalls.find(
                (call) =>
                    call[0].children ===
                    'Please update Shopify permissions before installing your chat to ensure better stability.',
            )

            expect(modalText).toBeDefined()
        })

        it('should render Close and Update buttons in modal', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const closeButton = buttonCalls.find(
                (call) => call[0].children === 'Close',
            )
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update',
            )

            expect(closeButton).toBeDefined()
            expect(closeButton[0].intent).toBe(ButtonIntent.Regular)
            expect(closeButton[0].variant).toBe(ButtonVariant.Secondary)

            expect(updateButton).toBeDefined()
        })

        it('should open modal when Install is clicked and scope permission is missing', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent({
                isInstalled: false,
                hasShopifyScriptTagScope: false,
            })

            const installButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Install',
            )

            act(() => {
                installButton![0].onClick()
            })

            const modalCalls = mockModal.mock.calls as any[]
            const lastModalCall = modalCalls[modalCalls.length - 1]

            expect(lastModalCall[0].isOpen).toBe(true)
        })

        it('should not open modal when hasShopifyScriptTagScope is true', () => {
            mockUseFlag.mockImplementation((key: string) => {
                if (key === 'ChatScopeInstallOnShopifyCallback') return true
                return false
            })

            renderComponent({
                isInstalled: false,
                hasShopifyScriptTagScope: true,
            })

            const modalCalls = mockModal.mock.calls as any[]
            const initialModalCall = modalCalls[0]

            expect(initialModalCall[0].isOpen).toBe(false)
        })
    })
})
