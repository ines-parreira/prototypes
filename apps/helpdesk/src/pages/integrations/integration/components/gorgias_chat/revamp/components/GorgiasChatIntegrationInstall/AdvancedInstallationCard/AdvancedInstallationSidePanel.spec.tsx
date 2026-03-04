import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import AdvancedInstallationSidePanel from './AdvancedInstallationSidePanel'

jest.mock('models/integration/queries', () => ({
    useGetInstallationSnippet: jest.fn(),
}))

jest.mock('pages/convert/bundles/hooks/useGetConvertBundle', () => ({
    useGetConvertBundle: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInChatSnippetEnabled',
    () => ({
        useConvertBundleInChatSnippetEnabled: jest.fn(),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInstallationSnippet',
    () => ({
        useConvertBundleInstallationSnippet: jest.fn(),
    }),
)

jest.mock('./ShopifyWebsiteContent', () => ({
    __esModule: true,
    default: ({ isLoadingInstallationCode, installationCode }: any) => (
        <div data-testid="shopify-content">
            <div data-testid="loading-state">
                {isLoadingInstallationCode.toString()}
            </div>
            <div data-testid="installation-code">{installationCode}</div>
        </div>
    ),
}))

jest.mock('./AnyOtherWebsiteContent', () => ({
    __esModule: true,
    default: ({ isLoadingInstallationCode, installationCode }: any) => (
        <div data-testid="any-other-website-content">
            <div data-testid="loading-state">
                {isLoadingInstallationCode.toString()}
            </div>
            <div data-testid="installation-code">{installationCode}</div>
        </div>
    ),
}))

jest.mock('./GoogleTagManagerContent', () => ({
    __esModule: true,
    default: ({ isLoadingApplicationKey, applicationKey }: any) => (
        <div data-testid="google-tag-manager-content">
            <div data-testid="loading-state">
                {isLoadingApplicationKey.toString()}
            </div>
            <div data-testid="application-key">{applicationKey}</div>
        </div>
    ),
}))

jest.mock('@gorgias/axiom', () => {
    let mockOnSelectionChange: any = null

    return {
        ...jest.requireActual('@gorgias/axiom'),
        SidePanel: ({ children, isOpen }: any) =>
            isOpen ? <div data-testid="side-panel">{children}</div> : null,
        OverlayHeader: ({ title }: any) => (
            <div data-testid="overlay-header">{title}</div>
        ),
        OverlayContent: ({ children }: any) => (
            <div data-testid="overlay-content">{children}</div>
        ),
        ButtonGroup: ({ children, selectedKey, onSelectionChange }: any) => {
            mockOnSelectionChange = onSelectionChange
            return (
                <div data-testid="button-group" data-selected-key={selectedKey}>
                    {children}
                </div>
            )
        },
        ButtonGroupItem: ({ children, id }: any) => (
            <button
                data-testid={`button-group-item-${id}`}
                onClick={() => mockOnSelectionChange?.(id)}
            >
                {children}
            </button>
        ),
    }
})

describe('AdvancedInstallationSidePanel', () => {
    const mockUseGetInstallationSnippet = jest.requireMock(
        'models/integration/queries',
    ).useGetInstallationSnippet
    const mockUseGetConvertBundle = jest.requireMock(
        'pages/convert/bundles/hooks/useGetConvertBundle',
    ).useGetConvertBundle
    const mockUseConvertBundleInChatSnippetEnabled = jest.requireMock(
        'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInChatSnippetEnabled',
    ).useConvertBundleInChatSnippetEnabled
    const mockUseConvertBundleInstallationSnippet = jest.requireMock(
        'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useConvertBundleInstallationSnippet',
    ).useConvertBundleInstallationSnippet

    const defaultIntegration = fromJS({
        id: 1,
        meta: {
            shop_integration_id: 'store-123',
            app_id: 'app-123',
        },
    })

    const mockOnOpenChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetInstallationSnippet.mockReturnValue({
            data: {
                snippet: '<script>console.log("test")</script>',
                appKey: 'test-app-key',
            },
            isLoading: false,
        })

        mockUseGetConvertBundle.mockReturnValue({
            bundle: { id: 'bundle-123' },
            isLoading: false,
        })

        mockUseConvertBundleInChatSnippetEnabled.mockReturnValue(false)
        mockUseConvertBundleInstallationSnippet.mockReturnValue(
            '<script>console.log("bundle")</script>',
        )
    })

    const renderComponent = (
        integration = defaultIntegration,
        isOpen = true,
    ) => {
        return render(
            <AdvancedInstallationSidePanel
                integration={integration}
                isOpen={isOpen}
                onOpenChange={mockOnOpenChange}
            />,
        )
    }

    it('should not render when isOpen is false', () => {
        renderComponent(defaultIntegration, false)

        expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument()
    })

    it('should render side panel when isOpen is true', () => {
        renderComponent()

        expect(screen.getByTestId('side-panel')).toBeInTheDocument()
    })

    it('should render with correct title', () => {
        renderComponent()

        expect(screen.getByTestId('overlay-header')).toHaveTextContent(
            'Advanced Installation',
        )
    })

    it('should render button group with three options', () => {
        renderComponent()

        expect(
            screen.getByTestId('button-group-item-shopify-website'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('button-group-item-any-other-website'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('button-group-item-google-tag-manager'),
        ).toBeInTheDocument()
    })

    it('should render Shopify Website content by default', () => {
        renderComponent()

        expect(screen.getByTestId('shopify-content')).toBeInTheDocument()
        expect(
            screen.queryByTestId('any-other-website-content'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('google-tag-manager-content'),
        ).not.toBeInTheDocument()
    })

    it('should switch to Any Other Website content when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const anyOtherWebsiteButton = screen.getByTestId(
            'button-group-item-any-other-website',
        )
        await act(async () => {
            await user.click(anyOtherWebsiteButton)
        })

        expect(
            screen.getByTestId('any-other-website-content'),
        ).toBeInTheDocument()
        expect(screen.queryByTestId('shopify-content')).not.toBeInTheDocument()
    })

    it('should switch to Google Tag Manager content when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const googleTagManagerButton = screen.getByTestId(
            'button-group-item-google-tag-manager',
        )
        await act(async () => {
            await user.click(googleTagManagerButton)
        })

        expect(
            screen.getByTestId('google-tag-manager-content'),
        ).toBeInTheDocument()
        expect(screen.queryByTestId('shopify-content')).not.toBeInTheDocument()
    })

    it('should pass correct props to Shopify Website content', () => {
        renderComponent()

        const shopifyContent = screen.getByTestId('shopify-content')
        expect(
            shopifyContent.querySelector('[data-testid="loading-state"]'),
        ).toHaveTextContent('false')
        expect(
            shopifyContent.querySelector('[data-testid="installation-code"]'),
        ).toHaveTextContent('<script>console.log("test")</script>')
    })

    it('should pass correct props to Google Tag Manager content', async () => {
        const user = userEvent.setup()
        renderComponent()

        const googleTagManagerButton = screen.getByTestId(
            'button-group-item-google-tag-manager',
        )
        await act(async () => {
            await user.click(googleTagManagerButton)
        })

        const googleContent = screen.getByTestId('google-tag-manager-content')
        expect(
            googleContent.querySelector('[data-testid="loading-state"]'),
        ).toHaveTextContent('false')
        expect(
            googleContent.querySelector('[data-testid="application-key"]'),
        ).toHaveTextContent('test-app-key')
    })

    it('should show loading state when installation snippet is loading', () => {
        mockUseGetInstallationSnippet.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        renderComponent()

        const shopifyContent = screen.getByTestId('shopify-content')
        expect(
            shopifyContent.querySelector('[data-testid="loading-state"]'),
        ).toHaveTextContent('true')
    })

    it('should show loading state when convert bundle is loading', () => {
        mockUseGetConvertBundle.mockReturnValue({
            bundle: undefined,
            isLoading: true,
        })

        renderComponent()

        const shopifyContent = screen.getByTestId('shopify-content')
        expect(
            shopifyContent.querySelector('[data-testid="loading-state"]'),
        ).toHaveTextContent('true')
    })

    it('should append bundle snippet when enabled', () => {
        mockUseConvertBundleInChatSnippetEnabled.mockReturnValue(true)

        renderComponent()

        const shopifyContent = screen.getByTestId('shopify-content')
        const installationCodeElement = shopifyContent.querySelector(
            '[data-testid="installation-code"]',
        )
        expect(installationCodeElement).toHaveTextContent(
            '<script>console.log("test")</script>',
        )
        expect(installationCodeElement).toHaveTextContent(
            '<script>console.log("bundle")</script>',
        )
    })

    it('should not append bundle snippet when disabled', () => {
        mockUseConvertBundleInChatSnippetEnabled.mockReturnValue(false)

        renderComponent()

        const shopifyContent = screen.getByTestId('shopify-content')
        expect(
            shopifyContent.querySelector('[data-testid="installation-code"]'),
        ).toHaveTextContent('<script>console.log("test")</script>')
    })

    it('should fetch installation snippet with correct application ID', () => {
        renderComponent()

        expect(mockUseGetInstallationSnippet).toHaveBeenCalledWith(
            { applicationId: 'app-123' },
            { enabled: true },
        )
    })

    it('should fetch convert bundle with correct parameters', () => {
        renderComponent()

        expect(mockUseGetConvertBundle).toHaveBeenCalledWith('store-123', 1, {
            staleTime: 0,
        })
    })

    it('should not enable installation snippet query when app_id is missing', () => {
        const integrationWithoutAppId = fromJS({
            id: 1,
            meta: {
                shop_integration_id: 'store-123',
            },
        })

        renderComponent(integrationWithoutAppId)

        expect(mockUseGetInstallationSnippet).toHaveBeenCalledWith(
            { applicationId: undefined },
            { enabled: false },
        )
    })
})
