import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import AppActionsTab from 'pages/integrations/integration/components/app/AppActionsTab'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)

const APP_ID = 'klaviyo'
const APP_NAME = 'Klaviyo'
const SHOP_NAME = 'ahmed-test-store-1'

const shopifyState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                meta: { shop_name: SHOP_NAME },
            },
        ],
    }),
}

const noShopifyState = {
    billing: fromJS(billingState),
    integrations: fromJS({ integrations: [] }),
}

const buildTemplates = () =>
    [
        {
            id: 'template-klaviyo',
            internal_id: 'template-internal-klaviyo',
            name: 'Send Klaviyo email',
            apps: [{ type: 'app', app_id: APP_ID }],
        },
        {
            id: 'template-shopify',
            internal_id: 'template-internal-shopify',
            name: 'Get Shopify order',
            apps: [{ type: 'shopify' }],
        },
    ] as unknown as ReturnType<
        typeof useGetWorkflowConfigurationTemplates
    >['data']

describe('AppActionsTab', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('renders the banner with the app-specific title and links to per-store actions when a Shopify store is connected', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
            storeState: shopifyState,
        })

        expect(
            screen.getByRole('heading', {
                name: `Gorgias <> ${APP_NAME} actions`,
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Go to actions' }),
        ).toHaveAttribute('href', `/app/ai-agent/shopify/${SHOP_NAME}/actions`)
        expect(
            screen.getByRole('link', { name: 'Learn more' }),
        ).toHaveAttribute(
            'href',
            'https://docs.gorgias.com/en-US/articles/connect-ai-agent-with-other-apps-184201',
        )
    })

    it('falls back to the global actions platform URL when no Shopify store is connected', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
            storeState: noShopifyState,
        })

        expect(
            screen.getByRole('link', { name: 'Go to actions' }),
        ).toHaveAttribute('href', '/app/ai-agent/actions-platform')
    })

    it('renders the loader while fetching templates', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: true,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
            storeState: shopifyState,
        })

        expect(
            screen.getByRole('progressbar', { name: 'Loading actions' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('heading', { name: 'No actions for this app' }),
        ).not.toBeInTheDocument()
    })

    it('renders the empty state when no templates match the app', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [
                {
                    id: 'template-shopify',
                    internal_id: 'template-internal-shopify',
                    name: 'Get Shopify order',
                    apps: [{ type: 'shopify' }],
                },
            ],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
            storeState: shopifyState,
        })

        expect(
            screen.getByRole('heading', { name: 'No actions for this app' }),
        ).toBeInTheDocument()
    })

    it('renders one row per matching action step with the app icon and name', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: buildTemplates(),
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        const { container } = render(
            <AppActionsTab
                appId={APP_ID}
                appName={APP_NAME}
                appIcon="https://example.com/klaviyo.png"
            />,
            { storeState: shopifyState },
        )

        expect(screen.getByText('Send Klaviyo email')).toBeInTheDocument()
        expect(screen.queryByText('Get Shopify order')).not.toBeInTheDocument()
        expect(
            container.querySelector(
                'img[src="https://example.com/klaviyo.png"]',
            ),
        ).toBeInTheDocument()
    })

    it('matches templates whose app type equals the appId (e.g. shopify)', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: buildTemplates(),
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        render(<AppActionsTab appId="shopify" appName="Shopify" />, {
            storeState: shopifyState,
        })

        expect(screen.getByText('Get Shopify order')).toBeInTheDocument()
        expect(screen.queryByText('Send Klaviyo email')).not.toBeInTheDocument()
    })

    it('hides the banner when the dismiss button is clicked', async () => {
        const user = userEvent.setup()
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)

        render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
            storeState: shopifyState,
        })

        expect(
            screen.getByRole('heading', {
                name: `Gorgias <> ${APP_NAME} actions`,
            }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Dismiss' }))

        expect(
            screen.queryByRole('heading', {
                name: `Gorgias <> ${APP_NAME} actions`,
            }),
        ).not.toBeInTheDocument()
    })
})
