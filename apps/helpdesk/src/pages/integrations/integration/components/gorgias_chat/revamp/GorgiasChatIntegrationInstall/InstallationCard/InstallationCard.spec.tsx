import { Fragment } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    ButtonAs,
    ButtonIntent,
    ButtonVariant,
    Elevation,
    HeadingSize,
    IconName,
    TextSize,
    TextVariant,
} from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-types'

import InstallationCard from './InstallationCard'

const mockCard = jest.fn(({ children }: any) => children)
const mockHeading = jest.fn(({ children }: any) => children)
const mockText = jest.fn(({ children }: any) => children)
const mockIcon = jest.fn((__props: any) => null)
const mockButton = jest.fn(({ children }: any) => children)
const mockStoreController = jest.fn((__props: any) => null)
const mockOneClickInstall = jest.fn((__props: any) => null)

const mockUseAppSelector = jest.fn()
const mockUseShopifyCheckoutChatInstallation = jest.fn(
    (
        __integration,
    ): {
        installedOnShopifyCheckout: boolean
        shopifyCheckoutChatInstallationUrl: null | string
    } => ({
        installedOnShopifyCheckout: false,
        shopifyCheckoutChatInstallationUrl: null,
    }),
)
const mockUseChatMigrationBanner = jest.fn((__integration) => ({
    hasShopifyScriptTagScope: false,
}))
const mockUseThemeAppExtensionInstallation = jest.fn(
    (
        __storeIntegration,
    ): {
        shouldUseThemeAppExtensionInstallation: boolean
        themeAppExtensionInstallationUrl: null | string
    } => ({
        shouldUseThemeAppExtensionInstallation: false,
        themeAppExtensionInstallationUrl: null,
    }),
)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: (props: any) => mockCard(props),
    Heading: (props: any) => mockHeading(props),
    Text: (props: any) => mockText(props),
    Icon: (props: any) => mockIcon(props),
    Button: (props: any) => mockButton(props),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/StoreController',
    () => ({
        __esModule: true,
        default: (props: any) => mockStoreController(props),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/OneClickInstall',
    () => ({
        __esModule: true,
        default: (props: any) => mockOneClickInstall(props),
    }),
)

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: (selector: any) => mockUseAppSelector(selector),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyCheckoutChatInstallation',
    () => ({
        __esModule: true,
        default: (integration: any) =>
            mockUseShopifyCheckoutChatInstallation(integration),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useChatMigrationBanner',
    () => ({
        __esModule: true,
        default: (integration: any) => mockUseChatMigrationBanner(integration),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation',
    () => ({
        __esModule: true,
        default: (storeIntegration: any) =>
            mockUseThemeAppExtensionInstallation(storeIntegration),
    }),
)

jest.mock('state/integrations/selectors', () => ({
    getStoreIntegrations: jest.fn(() => []),
}))

describe('InstallationCard', () => {
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
            shopify_integration_ids: [1],
        },
    })

    const defaultProps = {
        integration: defaultIntegration,
        actions: {
            updateOrCreateIntegration: jest.fn(),
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue([mockStoreIntegration])
        mockUseShopifyCheckoutChatInstallation.mockReturnValue({
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl: null,
        })
        mockUseChatMigrationBanner.mockReturnValue({
            hasShopifyScriptTagScope: false,
        })
        mockUseThemeAppExtensionInstallation.mockReturnValue({
            shouldUseThemeAppExtensionInstallation: false,
            themeAppExtensionInstallationUrl: null,
        })
    })

    const renderComponent = (props = {}) => {
        return render(<InstallationCard {...defaultProps} {...props} />)
    }

    describe('Card', () => {
        it('should render Card with correct elevation', () => {
            renderComponent()

            expect(mockCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    elevation: Elevation.Mid,
                }),
            )
        })
    })

    describe('Heading', () => {
        it('should render heading with correct text', () => {
            renderComponent()

            const headingCalls = mockHeading.mock.calls as any[]
            const heading = headingCalls.find(
                (call) => call[0].children === 'Install on Shopify stores',
            )

            expect(heading).toBeDefined()
            expect(heading[0].size).toBe(HeadingSize.Md)
        })
    })

    describe('StoreController', () => {
        it('should render StoreController with correct props when connected', () => {
            renderComponent()

            expect(mockStoreController).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: defaultIntegration,
                    storeIntegration: mockStoreIntegration,
                    storeIntegrations: [mockStoreIntegration],
                    isOneClickInstallation: true,
                }),
            )
        })

        it('should pass undefined storeIntegration when not connected', () => {
            const integration = fromJS({
                id: 100,
                type: IntegrationType.GorgiasChat,
                meta: {},
            })

            renderComponent({ integration })

            expect(mockStoreController).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeIntegration: undefined,
                    isOneClickInstallation: false,
                }),
            )
        })
    })

    describe('OneClickInstall', () => {
        it('should render OneClickInstall with correct props', () => {
            renderComponent()

            expect(mockOneClickInstall).toHaveBeenCalledWith(
                expect.objectContaining({
                    integration: defaultIntegration,
                    isConnected: true,
                    isInstalled: true,
                    hasShopifyScriptTagScope: false,
                }),
            )
        })

        it('should pass updateOrCreateIntegration action', () => {
            renderComponent()

            expect(mockOneClickInstall).toHaveBeenCalledWith(
                expect.objectContaining({
                    updateOrCreateIntegration:
                        defaultProps.actions.updateOrCreateIntegration,
                }),
            )
        })

        it('should pass theme app extension props when available', () => {
            mockUseThemeAppExtensionInstallation.mockReturnValue({
                shouldUseThemeAppExtensionInstallation: true,
                themeAppExtensionInstallationUrl: 'https://example.com',
            })

            renderComponent()

            expect(mockOneClickInstall).toHaveBeenCalledWith(
                expect.objectContaining({
                    themeAppExtensionInstallation: true,
                    themeAppExtensionInstallationUrl: 'https://example.com',
                }),
            )
        })
    })

    describe('Connect store section', () => {
        it('should render Connect store heading', () => {
            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const connectStoreText = textCalls.find(
                (call) => call[0].children === 'Connect store',
            )

            expect(connectStoreText).toBeDefined()
            expect(connectStoreText[0].size).toBe(TextSize.Md)
            expect(connectStoreText[0].variant).toBe(TextVariant.Medium)
        })

        it('should render Connect store description', () => {
            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const description = textCalls.find(
                (call) =>
                    call[0].children ===
                    'Select your Shopify store and connect it to Gorgias.',
            )

            expect(description).toBeDefined()
            expect(description[0].size).toBe(TextSize.Sm)
            expect(description[0].variant).toBe(TextVariant.Regular)
        })
    })

    describe('Checkout and thank you pages section', () => {
        it('should render section heading', () => {
            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const heading = textCalls.find(
                (call) =>
                    call[0].children === 'Shopify checkout and thank you pages',
            )

            expect(heading).toBeDefined()
            expect(heading[0].size).toBe(TextSize.Md)
            expect(heading[0].variant).toBe(TextVariant.Medium)
        })

        it('should show default description when one-click installed', () => {
            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const description = textCalls.find((call) => {
                const children = call[0].children

                if (Array.isArray(children)) {
                    return children.some(
                        (child: any) =>
                            typeof child === 'string' &&
                            child.includes(
                                'Add Chat to your checkout and thank you pages',
                            ),
                    )
                }

                if (children?.type === Fragment && children?.props?.children) {
                    const fragmentChildren = children.props.children
                    return (
                        Array.isArray(fragmentChildren) &&
                        fragmentChildren.some(
                            (child: any) =>
                                typeof child === 'string' &&
                                child.includes(
                                    'Add Chat to your checkout and thank you pages',
                                ),
                        )
                    )
                }

                return false
            })

            expect(description).toBeDefined()
        })

        it('should show checkout installed message when installed on checkout', () => {
            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: true,
                shopifyCheckoutChatInstallationUrl: 'https://checkout.url',
            })

            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const description = textCalls.find(
                (call) =>
                    call[0].children ===
                    'Manage Chat on the checkout and thank you pages via the Shopify checkout editor.',
            )

            expect(description).toBeDefined()
        })

        it('should show installation requirement message when not one-click installed', () => {
            const integration = fromJS({
                id: 100,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 1,
                    shopify_integration_ids: [],
                },
            })

            renderComponent({ integration })

            const textCalls = mockText.mock.calls as any[]
            const description = textCalls.find(
                (call) =>
                    call[0].children ===
                    'You must use the quick installation method to add Chat to Shopify before you can access this option.',
            )

            expect(description).toBeDefined()
        })
    })

    describe('Checkout button', () => {
        it('should render checkout button when one-click installed and URL available', () => {
            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: false,
                shopifyCheckoutChatInstallationUrl: 'https://checkout.url',
            })

            renderComponent()

            expect(mockButton).toHaveBeenCalledWith(
                expect.objectContaining({
                    intent: ButtonIntent.Regular,
                    variant: ButtonVariant.Secondary,
                    as: ButtonAs.Anchor,
                    trailingSlot: IconName.ExternalLink,
                }),
            )
        })

        it('should show Install text when not installed on checkout', () => {
            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: false,
                shopifyCheckoutChatInstallationUrl: 'https://checkout.url',
            })

            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const buttonText = textCalls.find(
                (call) => call[0].children === 'Install',
            )

            expect(buttonText).toBeDefined()
            expect(buttonText[0].variant).toBe(TextVariant.Bold)
            expect(buttonText[0].size).toBe(TextSize.Md)
        })

        it('should show Manage text when installed on checkout', () => {
            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: true,
                shopifyCheckoutChatInstallationUrl: 'https://checkout.url',
            })

            renderComponent()

            const textCalls = mockText.mock.calls as any[]
            const buttonText = textCalls.find(
                (call) => call[0].children === 'Manage',
            )

            expect(buttonText).toBeDefined()
            expect(buttonText[0].variant).toBe(TextVariant.Bold)
            expect(buttonText[0].size).toBe(TextSize.Md)
        })

        it('should not render checkout button when not one-click installed', () => {
            const integration = fromJS({
                id: 100,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 1,
                    shopify_integration_ids: [],
                },
            })

            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: false,
                shopifyCheckoutChatInstallationUrl: 'https://checkout.url',
            })

            renderComponent({ integration })

            const buttonCalls = mockButton.mock.calls as any[]
            expect(buttonCalls.length).toBe(0)
        })

        it('should not render checkout button when URL not available', () => {
            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: false,
                shopifyCheckoutChatInstallationUrl: null,
            })

            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            expect(buttonCalls.length).toBe(0)
        })
    })

    describe('Learn more link', () => {
        it('should render learn more icon when one-click installed and not installed on checkout', () => {
            renderComponent()

            expect(mockIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: IconName.ExternalLink,
                }),
            )
        })

        it('should not render learn more icon when installed on checkout', () => {
            mockUseShopifyCheckoutChatInstallation.mockReturnValue({
                installedOnShopifyCheckout: true,
                shopifyCheckoutChatInstallationUrl: 'https://checkout.url',
            })

            renderComponent()

            expect(mockIcon).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    name: IconName.ExternalLink,
                }),
            )
        })
    })
})
