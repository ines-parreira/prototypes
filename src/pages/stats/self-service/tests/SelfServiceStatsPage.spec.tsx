import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE,
    SELF_SERVICE_TOP_REPORTED_ISSUES,
    SELF_SERVICE_WORKFLOWS_PERFORMANCE,
} from 'config/stats'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import {
    selfServiceArticleRecommendationPerformance,
    selfServiceArticleRecommendationPerformanceNoData,
    selfServiceFlowsPerformance,
    selfServiceProductsWithMostIssuesAndReturnRequests,
    selfServiceProductsWithMostIssuesAndReturnRequestsNoData,
    selfServiceTopReportedIssues,
    selfServiceTopReportedIssuesNoData,
} from 'fixtures/stats'
import useStatResource from 'hooks/reporting/useStatResource'
import { IntegrationType } from 'models/integration/constants'
import { useGetSelfServiceConfigurations } from 'models/selfServiceConfiguration/queries'
import { downloadStat } from 'models/stat/resources'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import { useGetAIArticles } from 'pages/settings/helpCenter/queries'
import SelfServiceStatsPage from 'pages/stats/self-service/SelfServiceStatsPage'
import { AccountFeature } from 'state/currentAccount/types'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { saveFileAsDownloaded } from 'utils/file'
import { flushPromises, renderWithRouter } from 'utils/testing'

const mockSelfServiceConfigurations = [
    {
        id: 1,
        type: 'shopify' as const,
        shopName: `mystore`,
        createdDatetime: '2021-01-26T00:29:00Z',
        updatedDatetime: '2021-01-26T00:29:30Z',
        deactivatedDatetime: null,
        reportIssuePolicy: {
            enabled: false,
            cases: [],
        },
        trackOrderPolicy: {
            enabled: false,
        },
        cancelOrderPolicy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        returnOrderPolicy: {
            enabled: false,
            eligibilities: [],
            exceptions: [],
        },
        articleRecommendationHelpCenterId: null,
    },
]
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))
jest.mock('hooks/reporting/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock('models/selfServiceConfiguration/queries', () => ({
    useGetSelfServiceConfigurations: jest.fn(() => ({
        data: mockSelfServiceConfigurations,
        isLoading: false,
    })),
}))
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('pages/settings/helpCenter/queries', () => ({
    useGetAIArticles: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
}))
jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))

const downloadData = {
    name: `test-stat.csv`,
    contentType: 'attachment; filename="test-stat.csv"',
    data: `Flow,Drop off,Automation rate,Automated by flow,Served by an agent after flow
1,0,100,1,0
2,0,0,0,1`,
}
jest.mock('models/stat/resources', () => ({
    downloadStat: jest.fn(() => downloadData),
}))
jest.mock('utils/file', () => ({
    saveFileAsDownloaded: jest.fn(),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations,
)

const mockUseGetSelfServiceConfigurations =
    useGetSelfServiceConfigurations as jest.MockedFunction<
        typeof useGetSelfServiceConfigurations
    >
const mockUseGetAIArticles = useGetAIArticles as jest.MockedFunction<
    typeof useGetAIArticles
>

const mockClient = mockQueryClient()

const WFConfigData = [
    {
        internal_id: 'wf-config-1',
        id: '1',
        account_id: 123,
        name: 'Order Management Workflow',
        description: 'Workflow for managing orders',
        is_draft: false,
        initial_step_id: 'step-1',
        entrypoint: {
            label: 'Order Management Entry',
            label_tkey: 'order_management_entry',
        },
        steps: [
            {
                id: 'step-1',
                kind: 'text-input',
                settings: {
                    message: {
                        content: {
                            html: '<p>Enter your order details</p>',
                            html_tkey: 'enter_order_details_html',
                            text: 'Enter your order details',
                            text_tkey: 'enter_order_details_text',
                        },
                    },
                },
            },
            {
                id: 'step-2',
                kind: 'choices',
                settings: {
                    choices: [
                        {
                            event_id: 'choice-1',
                            label: 'Track Order',
                            label_tkey: 'track_order',
                        },
                        {
                            event_id: 'choice-2',
                            label: 'Cancel Order',
                            label_tkey: 'cancel_order',
                        },
                    ],
                    message: {
                        content: {
                            html: '<p>Choose an option</p>',
                            html_tkey: 'choose_option_html',
                            text: 'Choose an option',
                            text_tkey: 'choose_option_text',
                        },
                    },
                },
            },
            {
                id: 'step-3',
                kind: 'handover',
                settings: {
                    ticket_tags: ['order', 'urgent'],
                    ticket_assignee_user_id: 456,
                },
            },
            {
                id: 'step-4',
                kind: 'end',
            },
        ],
        transitions: [
            {
                id: 'trans-1',
                from_step_id: 'step-1',
                to_step_id: 'step-2',
            },
            {
                id: 'trans-2',
                from_step_id: 'step-2',
                to_step_id: 'step-3',
                event: {
                    id: 'choice-1',
                    kind: 'choices',
                },
            },
            {
                id: 'trans-3',
                from_step_id: 'step-2',
                to_step_id: 'step-4',
                event: {
                    id: 'choice-2',
                    kind: 'choices',
                },
            },
        ],
        available_languages: ['en-US', 'fr-FR', 'es-ES'],
        created_datetime: '2023-01-01T12:00:00Z',
        updated_datetime: '2023-02-01T12:00:00Z',
        deleted_datetime: null,
    },
    {
        internal_id: 'wf-config-2',
        id: '2',
        account_id: 456,
        name: 'Customer Support Workflow',
        description: 'Workflow for handling customer support',
        is_draft: true,
        initial_step_id: 'step-a',
        entrypoint: {
            label: 'Customer Support Entry',
            label_tkey: 'customer_support_entry',
        },
        steps: [
            {
                id: 'step-a',
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            html: '<p>Welcome to customer support</p>',
                            html_tkey: 'welcome_support_html',
                            text: 'Welcome to customer support',
                            text_tkey: 'welcome_support_text',
                        },
                    },
                },
            },
            {
                id: 'step-b',
                kind: 'order-selection',
                settings: {
                    message: {
                        content: {
                            html: '<p>Select your order</p>',
                            html_tkey: 'select_order_html',
                            text: 'Select your order',
                            text_tkey: 'select_order_text',
                        },
                    },
                },
            },
            {
                id: 'step-c',
                kind: 'helpful-prompt',
                settings: {
                    ticket_tags: ['support', 'help'],
                    ticket_assignee_user_id: 789,
                },
            },
            {
                id: 'step-d',
                kind: 'end',
            },
        ],
        transitions: [
            {
                id: 'trans-a',
                from_step_id: 'step-a',
                to_step_id: 'step-b',
            },
            {
                id: 'trans-b',
                from_step_id: 'step-b',
                to_step_id: 'step-c',
            },
            {
                id: 'trans-c',
                from_step_id: 'step-c',
                to_step_id: 'step-d',
            },
        ],
        available_languages: ['en-GB', 'de-DE'],
        created_datetime: '2023-03-01T12:00:00Z',
        updated_datetime: '2023-04-01T12:00:00Z',
        deleted_datetime: null,
    },
]

describe('<SelfServiceStatsPage />', () => {
    function getIntegration(id: number, type: IntegrationType) {
        return {
            id,
            type,
            name: `My Phone Integration ${id}`,
            meta: {
                emoji: '',
                phone_number_id: id,
            },
        }
    }

    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters({
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                storeIntegrations: [integrationsState.integrations[0].id],
            }),
        },
        currentAccount: fromJS({
            features: {
                [AccountFeature.AutomationReturnFlow]: { enabled: true },
                [AccountFeature.AutomationCancellationsFlow]: { enabled: true },
                [AccountFeature.AutomationTrackOrderFlow]: { enabled: true },
                [AccountFeature.AutomationReportIssueFlow]: { enabled: true },
                [AccountFeature.AutomationSelfServiceStatistics]: {
                    enabled: true,
                },
            },
            created_datetime: '2021-08-01T00:00:00Z',
            current_subscription: account.current_subscription,
        }),
        entities: entitiesInitialState,
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
        billing: fromJS(billingState),
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, _noop])
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
        mockUseGetAIArticles.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)
        useStatResourceMock.mockReturnValue([null, true, _noop])
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
    })

    it('should display the loader on loading', () => {
        const { container } = render(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the filters and stats when stats filters are defined', async () => {
        useStatResourceMock.mockImplementation(({ resourceName }) => {
            if (
                resourceName === SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
            ) {
                return [
                    selfServiceArticleRecommendationPerformance,
                    false,
                    _noop,
                ]
            } else if (resourceName === SELF_SERVICE_TOP_REPORTED_ISSUES) {
                return [selfServiceTopReportedIssues, false, _noop]
            }
            return [
                selfServiceProductsWithMostIssuesAndReturnRequests,
                false,
                _noop,
            ]
        })

        const { container } = renderWithRouter(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        await flushPromises()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the stats with the feature preview when there is no data and the features are disabled', async () => {
        useStatResourceMock.mockImplementation(({ resourceName }) => {
            if (
                resourceName === SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
            ) {
                return [
                    selfServiceArticleRecommendationPerformanceNoData,
                    false,
                    _noop,
                ]
            } else if (resourceName === SELF_SERVICE_TOP_REPORTED_ISSUES) {
                return [selfServiceTopReportedIssuesNoData, false, _noop]
            }
            return [
                selfServiceProductsWithMostIssuesAndReturnRequestsNoData,
                false,
                _noop,
            ]
        })

        const { container, getByText } = renderWithRouter(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        await flushPromises()

        expect(
            getByText(
                /There is no activity for these features. Your chat or help center may not be properly installed./,
            ),
        ).toBeTruthy()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loader when isWorkflowsFetchPending is true', () => {
        mockedUseWorkflowConfigurations.mockReturnValueOnce({
            data: [],
            isLoading: true,
        } as any)

        render(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByTestId('self-service-loader')).toBeInTheDocument()
    })
    it('should render loader when useGetSelfServiceConfigurations is true', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValueOnce({
            data: [],
            isLoading: true,
        } as any)

        render(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByTestId('self-service-loader')).toBeInTheDocument()
    })
    it('should render loader when useGetSelfServiceConfigurations and isWorkflowsFetchPending is false', () => {
        mockUseGetSelfServiceConfigurations.mockReturnValueOnce({
            data: [],
            isLoading: false,
        } as any)
        mockedUseWorkflowConfigurations.mockReturnValueOnce({
            data: [],
            isLoading: false,
        } as any)

        render(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        expect(
            screen.queryByTestId('self-service-loader'),
        ).not.toBeInTheDocument()
    })
    it('should dispatch notification on workflow configuration fetch error', async () => {
        mockedUseWorkflowConfigurations.mockReturnValueOnce({
            isLoading: false,
            isError: true,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        render(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(mockedDispatch).toHaveBeenCalled()
        })
    })

    it('should call refineDownloadedWorkflows on clicking of CSV', async () => {
        useStatResourceMock.mockImplementation(({ resourceName }) => {
            if (
                resourceName === SELF_SERVICE_ARTICLE_RECOMMENDATION_PERFORMANCE
            ) {
                return [
                    selfServiceArticleRecommendationPerformance,
                    false,
                    _noop,
                ]
            } else if (resourceName === SELF_SERVICE_TOP_REPORTED_ISSUES) {
                return [selfServiceTopReportedIssues, false, _noop]
            } else if (resourceName === SELF_SERVICE_WORKFLOWS_PERFORMANCE) {
                return [selfServiceFlowsPerformance, false, _noop]
            }
            return [
                selfServiceProductsWithMostIssuesAndReturnRequests,
                false,
                _noop,
            ]
        })
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: WFConfigData,
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

        const { getAllByText } = renderWithRouter(
            <QueryClientProvider client={mockClient}>
                <Provider store={mockStore(defaultState)}>
                    <SelfServiceStatsPage />
                </Provider>
            </QueryClientProvider>,
        )

        expect(getAllByText('file_download').length).toBe(4)
        // eslint-disable-next-line @typescript-eslint/require-await
        await act(async () => {
            fireEvent.click(getAllByText('file_download')[0])
        })
        expect(downloadStat).toHaveBeenCalled()

        expect(saveFileAsDownloaded).toHaveBeenCalledWith(
            downloadData.name,
            downloadData.data,
            downloadData.contentType,
        )
    })
})
