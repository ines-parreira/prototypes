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
import { useAutomatedInteractions } from 'pages/aiAgent/Overview/hooks/kpis/useAutomatedInteractions'
import { RootState } from 'state/types'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const timezone = 'UTC'
const filters: StatsFilters = {
    period: {
        start_datetime: '2025-02-06T16:55:37.914Z',
        end_datetime: '2025-01-09T16:56:07.727Z',
    },
}

describe('useAutomatedInteractions', () => {
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
        renderHook(() => useAutomatedInteractions(filters, timezone), {
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
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            data: {
                'AutomationDataset.automatedInteractions': {
                    value: 450,
                    prevValue: 300,
                },
            },
            isFetching: false,
        } as any)

        const { result } = renderUseAutomatedInteractions(filters, timezone)

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            value: 450,
            prevValue: 300,
            isLoading: false,
        })
    })

    it('should return loading state when the query is still loading', () => {
        useMultipleMetricsTrendsMock.mockReturnValueOnce({
            isFetching: true,
        } as any)

        const { result } = renderUseAutomatedInteractions(filters, timezone)

        expect(result.current).toEqual({
            title: 'Automated Interactions',
            hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
            metricType: StatType.Number,
            metricFormat: 'decimal',
            isLoading: true,
        })
    })
})
