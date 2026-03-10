// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { assumeMock } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import _range from 'lodash/range'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { shopifyIntegration } from 'fixtures/integrations'
import { statsFilters } from 'fixtures/stats'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import {
    useGetConfigurationExecution,
    useGetConfigurationExecutionLogs,
    useGetConfigurationExecutions,
    useGetWorkflowConfiguration,
    useGetWorkflowConfigurationTemplates,
} from 'models/workflows/queries'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SUPPORT_ACTIONS } from 'pages/aiAgent/constants'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import type { Paths } from 'rest_api/workflows_api/client.generated'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ActionEventsViewContainer from '../ActionEventsViewContainer'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useGetAppImageUrl')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('pages/aiAgent/Activation/hooks/useActivation')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations.ts')
jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: ({
        children,
        isLoading,
        title,
    }: {
        children: any
        isLoading?: boolean
        title: string
    }) => (
        <div data-testid="ai-agent-layout">
            <h1>{title}</h1>
            {isLoading ? <div>Loading...</div> : children}
        </div>
    ),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const mockUseGetAppImageUrl = jest.mocked(useGetAppImageUrl)
const queryClient = mockQueryClient()
const useGetConfigurationExecutionsMocked = assumeMock(
    useGetConfigurationExecutions,
)
const useGetWorkflowConfigurationMocked = assumeMock(
    useGetWorkflowConfiguration,
)
const useGetConfigurationExecutionLogsMocked = assumeMock(
    useGetConfigurationExecutionLogs,
)
const useGetConfigurationExecutionMocked = assumeMock(
    useGetConfigurationExecution,
)
const useGetWorkflowConfigurationTemplatesMocked = assumeMock(
    useGetWorkflowConfigurationTemplates,
)
const mockUseEnableAiAgent = assumeMock(useAiAgentEnabled)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
mockUseGetAppImageUrl.mockReturnValue('https://example.com/app.png')
const useStoreActivationsMock = assumeMock(useStoreActivations)
const useStoreConfigurationsMock = assumeMock(useStoreConfigurations)
useStoreConfigurationsMock.mockReturnValue({
    storeConfigurations: [],
} as any)
useStoreActivationsMock.mockReturnValue({
    storeActivations: {},
} as any)

const defaultStore = mockStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: automationSubscriptionProductPrices,
            status: 'active',
        },
    }),
    billing: fromJS(billingState),
    integrations: fromJS([shopifyIntegration]),
    stats: { filters: fromLegacyStatsFilters(statsFilters) },
})

describe('ActionEventsViewContainer', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })

        useGetWorkflowConfigurationMocked.mockReturnValue({
            isFetching: false,
            data: {
                internal_id: 'internal_configuration_id',
                id: 'configuration_id',
                name: 'Action configuration',
                template_internal_id: 'template_internal_id',
            },
        } as UseQueryResult<Paths.WfConfigurationControllerGet.Responses.$200>)

        useGetConfigurationExecutionsMocked.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        } as UseQueryResult<Paths.WfConfigurationControllerGetExecutions.Responses.$200>)

        useGetConfigurationExecutionLogsMocked.mockReturnValue({
            isFetching: false,
            data: [
                {
                    id: '1',
                    step_id: '1',
                    request_datetime: new Date().toISOString(),
                    request_method: 'GET',
                    request_url: 'http://example.com',
                    response_status_code: 200,
                    request_body: 'request body',
                    request_headers: JSON.stringify({ key: 'value' }),
                    response_body: 'response body',
                    response_headers: JSON.stringify({ key: 'value' }),
                },
            ],
        } as UseQueryResult<Paths.WfConfigurationControllerExportExecutionLogs.Responses.$200>)

        useGetConfigurationExecutionMocked.mockReturnValue({
            isFetching: false,
            data: {
                id: '1',
                configuration_id: '1',
                configuration_internal_id: '1',
                success: true,
                state: {
                    trigger: 'llm-prompt',
                    steps_state: {
                        '1': {
                            kind: 'cancel-order',
                            success: true,
                            at: Date.now(),
                        },
                    },
                },
            },
        } as unknown as UseQueryResult<Paths.WfConfigurationControllerGetExecution.Responses.$200>)

        useGetWorkflowConfigurationTemplatesMocked.mockReturnValue({
            isFetching: false,
            data: [
                {
                    id: 'template_id',
                    internal_id: 'template_internal_id',
                    name: 'Template configuration',
                    apps: [
                        { app_id: 'app_id', api_key: 'api_key', type: 'app' },
                    ],
                },
            ],
        } as UseQueryResult<Paths.WfConfigurationTemplateControllerList.Responses.$200>)
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
    })

    it('redirects to automation when access is denied', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        const { history } = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/configuration_id',
            },
        )

        expect(history.location.pathname).toBe('/app/automation')
    })
    it('renders loading page', () => {
        useGetWorkflowConfigurationMocked.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        } as UseQueryResult<any>)

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions/events/:id',
                route: '/app/ai-agent/shopify/my-shop/actions/events/configuration_id',
            },
        )

        expect(screen.getByText(SUPPORT_ACTIONS)).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders empty list of events', () => {
        const executionsResponse: Awaited<Paths.WfConfigurationControllerGetExecutions.Responses.$200> =
            {
                data: [],
                meta: {
                    pagination: {
                        current_page: 1,
                        page_limit: 15,
                        page_size: 0,
                        total_pages: 0,
                        total_size: 0,
                        next_page: null,
                    },
                },
            }

        useGetConfigurationExecutionsMocked.mockReturnValue({
            isFetching: false,
            isError: false,
            data: executionsResponse,
        } as UseQueryResult<Paths.WfConfigurationControllerGetExecutions.Responses.$200>)

        const component = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/configuration_id',
            },
        )

        expect(screen.getByText(SUPPORT_ACTIONS)).toBeInTheDocument()
        expect(screen.getByText('LAST UPDATED')).toBeInTheDocument()
        expect(screen.getByText('TICKET ID')).toBeInTheDocument()
        expect(screen.getByText('STATUS')).toBeInTheDocument()
        expect(component.container.querySelector('td')).toBeNull()
        expect(
            component.container.querySelector('[aria-label="previous"]'),
        ).toBeNull()
        expect(
            screen.getByText('No events found for the selected time period'),
        ).toBeInTheDocument()
    })

    it('renders list of events wihout pagination', () => {
        const executionsResponse: Awaited<Paths.WfConfigurationControllerGetExecutions.Responses.$200> =
            {
                data: _range(10).map((i) => ({
                    id: i.toString(),
                    state: {
                        trigger: 'llm-prompt',
                    },
                    awaited_callbacks: [],
                    channel_actions: [],
                    configuration_id: '1',
                    configuration_internal_id: '1',
                    current_step_id: '1',
                    created_datetime: new Date().toISOString(),
                })),
                meta: {
                    pagination: {
                        current_page: 1,
                        page_limit: 15,
                        page_size: 10,
                        total_pages: 1,
                        total_size: 1,
                        next_page: null,
                    },
                },
            }
        useGetConfigurationExecutionsMocked.mockReturnValue({
            isFetching: false,
            isError: false,
            data: executionsResponse,
        } as UseQueryResult<Paths.WfConfigurationControllerGetExecutions.Responses.$200>)

        const component = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/configuration_id',
            },
        )
        expect(component.container.querySelectorAll('td').length).toBe(40)
        expect(
            component.container.querySelector('[aria-label="previous"]'),
        ).toBeNull()
    })

    it('renders list of events pagination numbered', () => {
        const executionsResponse: Awaited<Paths.WfConfigurationControllerGetExecutions.Responses.$200> =
            {
                data: _range(20).map((i) => ({
                    id: i.toString(),
                    state: {
                        trigger: 'llm-prompt',
                    },
                    awaited_callbacks: [],
                    channel_actions: [],
                    configuration_id: '1',
                    configuration_internal_id: '1',
                    current_step_id: '1',
                    created_datetime: new Date().toISOString(),
                })),
                meta: {
                    pagination: {
                        current_page: 1,
                        page_limit: 15,
                        page_size: 15,
                        total_pages: 2,
                        total_size: 20,
                        next_page: 2,
                    },
                },
            }
        useGetConfigurationExecutionsMocked.mockReturnValue({
            isFetching: false,
            isError: false,
            data: executionsResponse,
        } as UseQueryResult<Paths.WfConfigurationControllerGetExecutions.Responses.$200>)

        const component = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            },
        )
        expect(component.container.querySelectorAll('td').length).toBe(80)
        expect(
            component.container.querySelector('[aria-label="previous"]'),
        ).not.toBeNull()
        expect(screen.getByLabelText('Event details')).not.toHaveClass('opened')
    })
    it('opens events side panel from query param', () => {
        const executionId = 'execution_id'

        useGetConfigurationExecutionMocked.mockReturnValue({
            isFetching: false,
            data: {
                id: executionId,
                configuration_id: '1',
                configuration_internal_id: '1',
                state: {
                    trigger: 'llm-prompt',
                },
            },
        } as UseQueryResult<Paths.WfConfigurationControllerGetExecution.Responses.$200>)

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: `/shopify/my-shop/ai-agent/actions/events/configuration_id?execution_id=${executionId}`,
            },
        )
        expect(screen.queryAllByRole('table')).toHaveLength(1)
        expect(screen.queryAllByRole('cell')).toHaveLength(0)

        expect(screen.getByLabelText('Event details')).toHaveClass('opened')
        fireEvent.click(screen.getByText('keyboard_tab'))
        expect(screen.getByLabelText('Event details')).not.toHaveClass('opened')
    })

    it('hydrates the ticket filter from the URL and requests executions for that ticket', async () => {
        const startDatetime = '2023-12-31T00:00:00.000Z'
        const endDatetime = '2024-01-02T23:59:59.999Z'

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: `/shopify/my-shop/ai-agent/actions/events/configuration_id?ticket=563832433&start_datetime=${encodeURIComponent(startDatetime)}&end_datetime=${encodeURIComponent(endDatetime)}`,
            },
        )

        await waitFor(() => {
            expect(useGetConfigurationExecutionsMocked.mock.calls).toEqual(
                expect.arrayContaining([
                    [
                        expect.objectContaining({
                            from: new Date(startDatetime),
                            to: new Date(endDatetime),
                            userJourneyId: 563832433,
                        }),
                        expect.any(Object),
                    ],
                ]),
            )
        })

        expect(screen.getByLabelText('Ticket ID')).toHaveValue(563832433)
    })

    it('open side panel for success execution', () => {
        useGetConfigurationExecutionMocked.mockReturnValue({
            isFetching: false,
            data: {
                id: 'configuration id',
                configuration_id: '1',
                configuration_internal_id: '1',
                success: true,
                state: {
                    trigger: 'llm-prompt',
                    objects: {
                        order: {
                            name: 'order name',
                            number: 'order number',
                            status: 'order status',
                        },
                        customer: {
                            id: 1,
                            name: 'customer name',
                            email: 'customer@email.com',
                        },
                    },
                    custom_inputs: {
                        variable: 'value 1',
                    },
                    steps_state: {
                        '1': {
                            kind: 'cancel-order',
                            success: true,
                            at: Date.now(),
                        },
                    },
                },
            },
        } as unknown as UseQueryResult<Paths.WfConfigurationControllerGetExecution.Responses.$200>)

        useGetConfigurationExecutionsMocked.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                data: [
                    {
                        id: '1',
                        state: {
                            trigger: 'llm-prompt',
                        },
                        awaited_callbacks: [],
                        channel_actions: [],
                        configuration_id: '1',
                        configuration_internal_id: '1',
                        current_step_id: '1',
                        created_datetime: new Date().toISOString(),
                    },
                ],
                meta: {
                    pagination: {
                        current_page: 1,
                        page_limit: 15,
                        page_size: 10,
                        total_pages: 1,
                        total_size: 1,
                        next_page: null,
                    },
                },
            },
        } as unknown as UseQueryResult<Paths.WfConfigurationControllerGetExecutions.Responses.$200>)

        useGetWorkflowConfigurationTemplatesMocked.mockReturnValue({
            isFetching: false,
            data: [
                {
                    id: 'template id',
                    internal_id: 'template internal id',
                    name: 'template configuration',
                    apps: [
                        { app_id: 'app_id', api_key: 'api_key', type: 'app' },
                    ],
                },
            ],
        } as UseQueryResult<Paths.WfConfigurationTemplateControllerList.Responses.$200>)

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/configuration_id',
            },
        )

        expect(screen.getByLabelText('Event details')).not.toHaveClass('opened')
        fireEvent.click(screen.getAllByRole('cell')[0])
        expect(screen.getByLabelText('Event details')).toHaveClass('opened')
        expect(screen.getByText('Action configuration')).toBeInTheDocument()

        expect(screen.getByText(/customer name/)).toBeInTheDocument()
        expect(screen.queryByText(/order name/)).toBeInTheDocument()
        expect(screen.queryByText(/value 1/)).toBeInTheDocument()
        expect(screen.queryByText(/http:\/\/example.com/)).toBeInTheDocument()
        expect(screen.queryByText(/response body/)).toBeInTheDocument()

        fireEvent.click(screen.getByText('keyboard_tab'))
        expect(screen.getByLabelText('Event details')).not.toHaveClass('opened')

        // open side panel again
        fireEvent.click(screen.getAllByRole('cell')[0])
        expect(screen.getByLabelText('Event details')).toHaveClass('opened')
        fireEvent.keyDown(screen.getByLabelText('Event details'), {
            key: 'Escape',
        })
        expect(screen.getByLabelText('Event details')).not.toHaveClass('opened')
    })
})
