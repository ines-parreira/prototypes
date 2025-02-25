import React from 'react'

import { renderHook } from '@testing-library/react-hooks/dom'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { IntegrationType } from 'models/integration/constants'
import { StatsFilters, StatType } from 'models/stat/types'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { RootState } from 'state/types'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('models/aiAgent/queries')
const useGetStoresConfigurationForAccountMock = assumeMock(
    useGetStoresConfigurationForAccount,
)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useCsat', () => {
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

    const renderUseCsat = (filters: StatsFilters, timezone: string) =>
        renderHook(() => useCsat(filters, timezone), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

    it('useCsat return correct metric data when the query resolves', () => {
        useGetStoresConfigurationForAccountMock.mockReturnValue({
            isLoading: false,
            data: [
                {
                    status: 200,
                    data: {
                        storeConfiguration: {
                            emailChannelDeactivatedDatetime: null,
                        },
                    },
                },
                {
                    status: 200,
                    data: {
                        storeConfiguration: {
                            emailChannelDeactivatedDatetime:
                                '2025-02-25T11:17:10Z',
                        },
                    },
                },
            ],
        } as any)

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
            title: 'CSAT (Customer Satisfaction Score)',
            hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            value: 3.1,
            prevValue: 3.5,
            isLoading: false,
            hidden: false,
        })
    })

    it('useCsat should be hidden when all store have an emailChannelDeactivatedDatetime', () => {
        useGetStoresConfigurationForAccountMock.mockReturnValue({
            isLoading: false,
            data: [
                {
                    status: 200,
                    data: {
                        storeConfiguration: {
                            emailChannelDeactivatedDatetime:
                                '2025-02-25T11:17:10Z',
                        },
                    },
                },
                {
                    status: 200,
                    data: {
                        storeConfiguration: {
                            emailChannelDeactivatedDatetime:
                                '2025-02-25T11:17:10Z',
                        },
                    },
                },
            ],
        } as any)

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
        useGetStoresConfigurationForAccountMock.mockReturnValue({
            isLoading: false,
            data: [
                {
                    status: 200,
                    data: {
                        storeConfiguration: {
                            emailChannelDeactivatedDatetime: null,
                        },
                    },
                },
                {
                    status: 200,
                    data: {
                        storeConfiguration: {
                            emailChannelDeactivatedDatetime:
                                '2025-02-25T11:17:10Z',
                        },
                    },
                },
            ],
        } as any)

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
            useGetStoresConfigurationForAccountMock.mockReturnValue({
                isLoading: storeIntegrationsLoading,
                data: [
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                emailChannelDeactivatedDatetime: null,
                            },
                        },
                    },
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                emailChannelDeactivatedDatetime:
                                    '2025-02-25T11:17:10Z',
                            },
                        },
                    },
                ],
            } as any)

            useMultipleMetricsTrendsMock.mockReturnValue({
                isFetching: analyticsLoading,
            } as any)

            const { result } = renderUseCsat(filters, timezone)

            expect(result.current).toEqual({
                title: 'CSAT (Customer Satisfaction Score)',
                hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
                metricType: StatType.Number,
                metricFormat: 'decimal',
                isLoading: true,
                hidden: false,
            })
        },
    )
})
