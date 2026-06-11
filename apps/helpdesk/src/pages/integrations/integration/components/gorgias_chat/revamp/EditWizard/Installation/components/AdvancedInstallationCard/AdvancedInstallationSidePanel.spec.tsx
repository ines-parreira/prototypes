import { render } from '@repo/testing'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { AdvancedInstallationSidePanel } from './AdvancedInstallationSidePanel'

HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])

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
    ShopifyWebsiteContent: ({
        isLoadingInstallationCode,
        installationCode,
    }: any) => (
        <section aria-label="Shopify Website content">
            <p>Loading: {isLoadingInstallationCode.toString()}</p>
            <pre>{installationCode}</pre>
        </section>
    ),
}))

jest.mock('./AnyOtherWebsiteContent', () => ({
    __esModule: true,
    AnyOtherWebsiteContent: ({
        isLoadingInstallationCode,
        installationCode,
    }: any) => (
        <section aria-label="Any Other Website content">
            <p>Loading: {isLoadingInstallationCode.toString()}</p>
            <pre>{installationCode}</pre>
        </section>
    ),
}))

jest.mock('./GoogleTagManagerContent', () => ({
    __esModule: true,
    GoogleTagManagerContent: ({
        isLoadingApplicationKey,
        applicationKey,
    }: any) => (
        <section aria-label="Google Tag Manager content">
            <p>Loading: {isLoadingApplicationKey.toString()}</p>
            <pre>{applicationKey}</pre>
        </section>
    ),
}))

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

        expect(
            screen.queryByRole('heading', { name: 'Advanced Installation' }),
        ).not.toBeInTheDocument()
    })

    it('should render side panel when isOpen is true', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Advanced Installation' }),
        ).toBeInTheDocument()
    })

    it('should render button group with three options', () => {
        renderComponent()

        expect(
            screen.getByRole('radio', { name: 'Shopify Website' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: 'Any Other Website' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: 'Google Tag Manager' }),
        ).toBeInTheDocument()
    })

    it('should render Shopify Website content by default', () => {
        renderComponent()

        expect(
            screen.getByRole('region', { name: 'Shopify Website content' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('region', {
                name: 'Any Other Website content',
            }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('region', {
                name: 'Google Tag Manager content',
            }),
        ).not.toBeInTheDocument()
    })

    it('should switch to Any Other Website content when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('radio', { name: 'Any Other Website' }),
            )
        })

        expect(
            screen.getByRole('region', { name: 'Any Other Website content' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('region', { name: 'Shopify Website content' }),
        ).not.toBeInTheDocument()
    })

    it('should switch to Google Tag Manager content when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('radio', { name: 'Google Tag Manager' }),
            )
        })

        expect(
            screen.getByRole('region', { name: 'Google Tag Manager content' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('region', { name: 'Shopify Website content' }),
        ).not.toBeInTheDocument()
    })

    it('should pass correct props to Shopify Website content', () => {
        renderComponent()

        const shopifyContent = screen.getByRole('region', {
            name: 'Shopify Website content',
        })
        expect(
            within(shopifyContent).getByText('Loading: false'),
        ).toBeInTheDocument()
        expect(
            within(shopifyContent).getByText(
                '<script>console.log("test")</script>',
            ),
        ).toBeInTheDocument()
    })

    it('should pass correct props to Google Tag Manager content', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('radio', { name: 'Google Tag Manager' }),
            )
        })

        const googleContent = screen.getByRole('region', {
            name: 'Google Tag Manager content',
        })
        expect(
            within(googleContent).getByText('Loading: false'),
        ).toBeInTheDocument()
        expect(
            within(googleContent).getByText('test-app-key'),
        ).toBeInTheDocument()
    })

    it('should show loading state when installation snippet is loading', () => {
        mockUseGetInstallationSnippet.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        renderComponent()

        const shopifyContent = screen.getByRole('region', {
            name: 'Shopify Website content',
        })
        expect(
            within(shopifyContent).getByText('Loading: true'),
        ).toBeInTheDocument()
    })

    it('should show loading state when convert bundle is loading', () => {
        mockUseGetConvertBundle.mockReturnValue({
            bundle: undefined,
            isLoading: true,
        })

        renderComponent()

        const shopifyContent = screen.getByRole('region', {
            name: 'Shopify Website content',
        })
        expect(
            within(shopifyContent).getByText('Loading: true'),
        ).toBeInTheDocument()
    })

    it('should append bundle snippet when enabled', () => {
        mockUseConvertBundleInChatSnippetEnabled.mockReturnValue(true)

        renderComponent()

        const shopifyContent = screen.getByRole('region', {
            name: 'Shopify Website content',
        })
        expect(shopifyContent).toHaveTextContent(
            '<script>console.log("test")</script>',
        )
        expect(shopifyContent).toHaveTextContent(
            '<script>console.log("bundle")</script>',
        )
    })

    it('should not append bundle snippet when disabled', () => {
        mockUseConvertBundleInChatSnippetEnabled.mockReturnValue(false)

        renderComponent()

        const shopifyContent = screen.getByRole('region', {
            name: 'Shopify Website content',
        })
        expect(
            within(shopifyContent).getByText(
                '<script>console.log("test")</script>',
            ),
        ).toBeInTheDocument()
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
