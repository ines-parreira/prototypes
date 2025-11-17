import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { useShoutoutTopResults } from 'domains/reporting/hooks/useShoutoutTopResults'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { AgentsShoutOutsConfig } from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'
import { agents } from 'fixtures/agents'
import type { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

describe('useShoutoutTopResults', () => {
    const agentId = agents[0].id
    const metricValue = 10
    const idField = TicketDimension.AssigneeUserId

    const allDataMockedMetric = (
        measure: string,
        agentIdField: string,
    ): MetricWithDecile => ({
        isError: false,
        isFetching: false,
        data: {
            value: null,
            decile: 5,
            allData: [
                {
                    [agentIdField]: String(agentId),
                    [measure]: String(metricValue),
                },
            ],
        },
    })

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
        ui: { stats: { filters: { cleanStatsFilters: null } } },
    } as RootState

    it.each(Object.values(AgentsShoutOutsConfig))(
        'should pick the best result per metric $measure',
        ({ formatValue, measure }) => {
            const { result } = renderHook(
                () =>
                    useShoutoutTopResults(
                        allDataMockedMetric(measure, idField),
                        formatValue,
                        measure,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                agents: [agents[0]],
                metricValue: formatValue(metricValue),
            })
        },
    )
})
