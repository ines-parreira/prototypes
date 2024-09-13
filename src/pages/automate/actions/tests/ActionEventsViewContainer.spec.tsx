import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {screen} from '@testing-library/react'
import {UseQueryResult, QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import _range from 'lodash/range'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {Paths} from 'rest_api/workflows_api/client.generated'
import {billingState} from 'fixtures/billing'
import {shopifyIntegration} from 'fixtures/integrations'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {account, automationSubscriptionProductPrices} from 'fixtures/account'
import {statsFilters} from 'fixtures/stats'
import {renderWithRouter, assumeMock} from 'utils/testing'
import {
    useGetConfigurationExecutions,
    useGetWorkflowConfiguration,
} from 'models/workflows/queries'
import ActionEventsViewContainer from '../ActionEventsViewContainer'

jest.mock('models/workflows/queries')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()
const useGetConfigurationExecutionsMocked = assumeMock(
    useGetConfigurationExecutions
)
const useGetWorkflowConfigurationMocked = assumeMock(
    useGetWorkflowConfiguration
)

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
    stats: {filters: fromLegacyStatsFilters(statsFilters)},
})

describe('ActionEventsViewContainer', () => {
    beforeEach(() => {
        useGetWorkflowConfigurationMocked.mockReturnValue({
            isFetching: false,
            data: {
                internal_id: '1',
            },
        } as UseQueryResult<Paths.WfConfigurationControllerGet.Responses.$200>)
    })

    it('redirect if has no automate subscription', () => {
        const defaultStore = mockStore({
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {},
                },
            }),
            billing: fromJS(billingState),
            integrations: fromJS([shopifyIntegration]),
        })

        const component = renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsViewContainer />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )

        expect(component.container).toBeEmptyDOMElement()
    })
    it('renders loading page', () => {
        useGetWorkflowConfigurationMocked.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        } as UseQueryResult<any>)

        useGetConfigurationExecutionsMocked.mockReturnValueOnce({
            isFetching: false,
            isError: false,
            data: undefined,
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
            }
        )

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(component.container.querySelector('i')).toHaveClass(
            'icon-custom icon-circle-o-notch md-spin'
        )
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
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('LAST UPDATED')).toBeInTheDocument()
        expect(screen.getByText('TICKET ID')).toBeInTheDocument()
        expect(screen.getByText('STATUS')).toBeInTheDocument()
        expect(component.container.querySelector('td')).toBeNull()
        expect(
            component.container.querySelector('[aria-label="previous"]')
        ).toBeNull()
        expect(
            screen.getByText('No events found for the selected time period')
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
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )
        expect(component.container.querySelectorAll('td').length).toBe(40)
        expect(
            component.container.querySelector('[aria-label="previous"]')
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
            }
        )
        expect(component.container.querySelectorAll('td').length).toBe(80)
        expect(
            component.container.querySelector('[aria-label="previous"]')
        ).not.toBeNull()
    })
})
