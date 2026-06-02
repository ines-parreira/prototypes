import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/constants'
import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'
import useGetIsActionStepEnabled from 'pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled'
import AppActionsTab from 'pages/integrations/integration/components/app/AppActionsTab'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurationTemplates: jest.fn(),
}))

jest.mock('pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled')

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseGetIsActionStepEnabled = jest.mocked(useGetIsActionStepEnabled)

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)

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
        mockUseGetIsActionStepEnabled.mockReturnValue(() => true)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
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

    it('filters out templates whose internal_id is not enabled by useGetIsActionStepEnabled', () => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: buildTemplates(),
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseGetIsActionStepEnabled.mockReturnValue(
            (internalId: string) => internalId !== 'template-internal-klaviyo',
        )

        render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
            storeState: shopifyState,
        })

        expect(screen.queryByText('Send Klaviyo email')).not.toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'No actions for this app' }),
        ).toBeInTheDocument()
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

    describe('AI Agent upsell banner', () => {
        beforeEach(() => {
            mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
                data: [],
                isInitialLoading: false,
            } as unknown as ReturnType<
                typeof useGetWorkflowConfigurationTemplates
            >)
        })

        it('renders the upsell instead of the info card when the merchant has no AI Agent access', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
                storeState: shopifyState,
            })

            expect(
                screen.getByRole('heading', { name: /Unlock AI Agent/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('heading', {
                    name: `Gorgias <> ${APP_NAME} actions`,
                }),
            ).not.toBeInTheDocument()
        })

        it('points "Try for free" at the AI Agent overview', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
                storeState: shopifyState,
            })

            expect(
                screen.getByRole('link', { name: /Try for free/i }),
            ).toHaveAttribute('href', '/app/ai-agent/overview')
        })

        it('opens the docs in a new tab from "Learn more"', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
                storeState: shopifyState,
            })

            const learnMore = screen.getByRole('link', { name: /Learn more/i })
            expect(learnMore).toHaveAttribute(
                'href',
                'https://docs.gorgias.com/en-US/articles/connect-ai-agent-with-other-apps-184201',
            )
            expect(learnMore).toHaveAttribute('target', '_blank')
            expect(learnMore).toHaveAttribute(
                'rel',
                expect.stringContaining('noopener'),
            )
        })

        it('dismisses without falling back to the info card', async () => {
            const user = userEvent.setup()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
                storeState: shopifyState,
            })

            await user.click(screen.getByRole('button', { name: 'Dismiss' }))

            expect(
                screen.queryByRole('heading', { name: /Unlock AI Agent/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('heading', {
                    name: `Gorgias <> ${APP_NAME} actions`,
                }),
            ).not.toBeInTheDocument()
        })

        it('renders neither card while access is loading', () => {
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: true,
            })

            render(<AppActionsTab appId={APP_ID} appName={APP_NAME} />, {
                storeState: shopifyState,
            })

            expect(
                screen.queryByRole('heading', { name: /Unlock AI Agent/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('heading', {
                    name: `Gorgias <> ${APP_NAME} actions`,
                }),
            ).not.toBeInTheDocument()
        })
    })
})
