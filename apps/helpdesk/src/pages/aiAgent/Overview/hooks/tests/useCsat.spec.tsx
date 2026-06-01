import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import useStatsMetricTrend from 'domains/reporting/hooks/useStatsMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { IntegrationType } from 'models/integration/constants'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import type { RootState } from 'state/types'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(() => ({ value: false, isLoading: false })),
}))

jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('domains/reporting/hooks/useStatsMetricTrend')
const useStatsMetricTrendMock = assumeMock(useStatsMetricTrend)

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
        const { useFlagWithLoading } = jest.requireMock('@repo/feature-flags')
        useFlagWithLoading.mockReturnValue({ value: false, isLoading: false })

        useStatsMetricTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        const { useStoreConfigurationForAccount } = jest.requireMock(
            'pages/aiAgent/hooks/useStoreConfigurationForAccount',
        )
        useStoreConfigurationForAccount.mockReturnValue({
            isLoading: false,
            storeConfigurations: [],
        })

        const { useGetCustomTicketsFieldsDefinitionData } = jest.requireMock(
            'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
        )
        useGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
            sentimentCustomFieldId: 3,
        })

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
        v2IntegrationIds?: number[],
    ) =>
        renderHook(
            () =>
                useCsat(
                    filters,
                    timezone,
                    aiAgentUserId,
                    integrationIds,
                    v2IntegrationIds,
                ),
            {
                storeState: defaultState,
            },
        )

    describe('v1 path (flag off)', () => {
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
                title: 'Average CSAT',
                hint: {
                    title: 'Average satisfaction (CSAT) score for interactions handled during the selected period.',
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
                            emailChannelDeactivatedDatetime:
                                '2025-02-25T11:17:10Z',
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
                    title: 'Average CSAT',
                    hint: {
                        title: 'Average satisfaction (CSAT) score for interactions handled during the selected period.',
                    },
                    metricFormat: 'decimal-precision-1',
                    isLoading: true,
                    hidden: false,
                    value: null,
                    prevValue: null,
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
                title: 'Average CSAT',
                hint: {
                    title: 'Average satisfaction (CSAT) score for interactions handled during the selected period.',
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

    describe('v2 path (flag on)', () => {
        beforeEach(() => {
            const { useFlagWithLoading } = jest.requireMock(
                '@repo/feature-flags',
            )
            useFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

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
        })

        it('should return v2 data when flag is on', () => {
            useStatsMetricTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
                data: { value: 4.5, prevValue: 4.0 },
            })

            const { result } = renderUseCsat(
                filters,
                timezone,
                undefined,
                [123],
            )

            expect(result.current).toEqual({
                'data-candu-id': 'ai-agent-overview-kpi-csat',
                title: 'Average CSAT',
                hint: {
                    title: 'Average satisfaction (CSAT) score for interactions handled during the selected period.',
                },
                metricFormat: 'decimal-precision-1',
                value: 4.5,
                prevValue: 4.0,
                isLoading: false,
                hidden: false,
            })
        })

        it('should return loading when v2 query is fetching', () => {
            useStatsMetricTrendMock.mockReturnValue({
                isFetching: true,
                isError: false,
                data: undefined,
            })

            const { result } = renderUseCsat(filters, timezone)

            expect(result.current.isLoading).toBe(true)
            expect(result.current.value).toBeNull()
            expect(result.current.prevValue).toBeNull()
        })
    })
})
