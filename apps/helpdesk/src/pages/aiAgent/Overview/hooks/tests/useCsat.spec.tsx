import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { IntegrationType } from 'models/integration/constants'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('models/aiAgent/queries')

jest.mock('pages/aiAgent/hooks/useStoreConfigurationForAccount')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

describe('useCsat', () => {
    const aiAgentUserId = 4000
    const timezone = 'UTC'
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-02-06T16:55:37.914Z',
            end_datetime: '2025-01-09T16:56:07.727Z',
        },
    }
    const defaultState = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        integrations: fromJS({
            integrations: [
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.Magento2),
            ],
        }),
    } as RootState

    beforeEach(() => {
        // Mock useStoreConfigurationForAccount hook
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [],
        })

        // Mock useGetCustomTicketsFieldsDefinitionData hook
        const { useGetCustomTicketsFieldsDefinitionData } = jest.requireMock(
            'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
        )
        useGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
            sentimentCustomFieldId: 3,
        })

        // Mock useCustomFieldDefinitions hook
        const { useCustomFieldDefinitions } = jest.requireMock(
            'custom-fields/hooks/queries/useCustomFieldDefinitions',
        )
        useCustomFieldDefinitions.mockReturnValue({
            data: { data: [] },
        })
    })

    const renderUseCsat = (
        filters: StatsFilters,
        timezone: string,
        integrationIds?: string[],
    ) =>
        renderHook(
            () => useCsat(filters, timezone, aiAgentUserId, integrationIds),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

    it('useCsat return correct metric data when the query resolves', () => {
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [
                {
                    emailChannelDeactivatedDatetime: null,
                    storeName: 'My Phone Integration 1',
                },
                {
                    emailChannelDeactivatedDatetime: '2025-02-25T11:17:10Z',
                    storeName: 'My Phone Integration 2',
                },
            ],
        })

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 3.1,
                    prevValue: 3.5,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseCsat(filters, timezone)

        expect(result.current).toEqual({
            'data-candu-id': 'ai-agent-overview-kpi-csat',
            title: 'CSAT',
            hint: {
                title: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            },
            metricFormat: 'decimal-precision-1',
            value: 3.1,
            prevValue: 3.5,
            isLoading: false,
            hidden: false,
        })
    })

    it('useCsat should be hidden when all store have an emailChannelDeactivatedDatetime', () => {
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [
                {
                    emailChannelDeactivatedDatetime: '2025-02-25T11:17:10Z',
                    storeName: 'My Phone Integration 1',
                },
                {
                    emailChannelDeactivatedDatetime: '2025-02-25T11:17:10Z',
                    storeName: 'My Phone Integration 2',
                },
            ],
        })

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 3.1,
                    prevValue: 3.5,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseCsat(filters, timezone)

        expect(result.current.hidden).toBe(true)
    })

    it('useCsat should not be hidden when some store have a null emailChannelDeactivatedDatetime', () => {
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [
                {
                    emailChannelDeactivatedDatetime: null,
                    storeName: 'My Phone Integration 1',
                },
                {
                    emailChannelDeactivatedDatetime: '2025-02-25T11:17:10Z',
                    storeName: 'My Phone Integration 2',
                },
            ],
        })

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 3.1,
                    prevValue: 3.5,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseCsat(filters, timezone)

        expect(result.current.hidden).toBe(false)
    })

    it.each([
        { analyticsLoading: true, storeIntegrationsLoading: true },
        { analyticsLoading: true, storeIntegrationsLoading: false },
        { analyticsLoading: false, storeIntegrationsLoading: true },
    ])(
        'should return loading state when analytics loading $analyticsLoading and store integrations loading $storeIntegrationsLoading',
        ({ storeIntegrationsLoading, analyticsLoading }) => {
            const { useStoreConfigurationForAccount } = jest.requireMock(
                'pages/aiAgent/hooks/useStoreConfigurationForAccount',
            )
            useStoreConfigurationForAccount.mockReturnValue({
                isLoading: storeIntegrationsLoading,
                storeConfigurations: [
                    {
                        emailChannelDeactivatedDatetime: null,
                        storeName: 'My Phone Integration 1',
                    },
                    {
                        emailChannelDeactivatedDatetime: '2025-02-25T11:17:10Z',
                        storeName: 'My Phone Integration 2',
                    },
                ],
            })

            useMultipleMetricsTrendsMock.mockReturnValue({
                isFetching: analyticsLoading,
            } as any)

            const { result } = renderUseCsat(filters, timezone)

            expect(result.current).toEqual({
                'data-candu-id': 'ai-agent-overview-kpi-csat',
                title: 'CSAT',
                hint: {
                    title: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
                },
                metricFormat: 'decimal-precision-1',
                isLoading: true,
                hidden: false,
            })
        },
    )

    it('should return correct metric when integrationIds are provided', () => {
        const integrationIds = ['integration1', 'integration2']
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [
                {
                    emailChannelDeactivatedDatetime: null,
                    storeName: 'My Store',
                },
            ],
        })

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 4.2,
                    prevValue: 4.0,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseCsat(filters, timezone, integrationIds)

        expect(result.current).toEqual({
            'data-candu-id': 'ai-agent-overview-kpi-csat',
            title: 'CSAT',
            hint: {
                title: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            },
            metricFormat: 'decimal-precision-1',
            value: 4.2,
            prevValue: 4.0,
            isLoading: false,
            hidden: false,
        })
    })

    it('should handle empty store configurations', () => {
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [],
        })

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'TicketSatisfactionSurveyEnriched.avgSurveyScore': {
                    value: 3.8,
                    prevValue: 3.9,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseCsat(filters, timezone)

        expect(result.current.hidden).toBe(true)
    })

    it('should handle undefined store configurations', () => {
        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: undefined,
        })

        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {},
            isFetching: false,
        } as any)

        const { result } = renderUseCsat(filters, timezone)

        expect(result.current.hidden).toBe(true)
    })
})
