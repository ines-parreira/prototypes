import React from 'react'

import { renderHook } from '@testing-library/react-hooks/dom'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { account } from 'fixtures/account'
import { ticketFieldDefinitions } from 'fixtures/customField'
import { user } from 'fixtures/users'
import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { StatsFilters, StatType } from 'models/stat/types'
import { useAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAutomationRate'
import { RootState } from 'state/types'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}
const timezone = 'UTC'

describe('useAutomationRate', () => {
    const defaultState = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        integrations: fromJS({
            integrations: [],
        }),
    } as RootState

    const renderUseAutomatedInteractions = (
        filters: StatsFilters,
        timezone: string,
    ) =>
        renderHook(() => useAutomationRate(filters, timezone), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as any)
    })

    it('should return correct metric data when the query resolves', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            data: {
                'AutomationDataset.automatedInteractions': {
                    value: 3.1,
                    prevValue: 3.5,
                },
                'TicketEnriched.ticketCount': {
                    value: 2,
                    prevValue: 1,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseAutomatedInteractions(filters, timezone)

        expect(result.current).toEqual({
            title: 'Automation Rate',
            hint: 'Automated interactions as a percent of all customer interactions.',
            metricType: StatType.Number,
            metricFormat: 'decimal-to-percent',
            isLoading: false,
            prevValue: 3.5,
            value: 1.55,
        })
    })

    it('should return correct metric data when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValue({
            isFetching: true,
        } as any)

        const { result } = renderUseAutomatedInteractions(filters, timezone)

        expect(result.current).toEqual({
            title: 'Automation Rate',
            hint: 'Automated interactions as a percent of all customer interactions.',
            metricType: StatType.Number,
            metricFormat: 'decimal-to-percent',
            isLoading: true,
            value: 0,
            prevValue: 0,
        })
    })
})
