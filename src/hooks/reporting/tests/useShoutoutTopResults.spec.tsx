import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {agents} from 'fixtures/agents'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {useShoutoutTopResults} from 'hooks/reporting/useShoutoutTopResults'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {agentsShoutoutsConfig} from 'pages/stats/support-performance/agents/AgentsShoutoutsConfig'
import {RootState} from 'state/types'

const mockStore = configureMockStore([thunk])

describe('useShoutoutTopResults', () => {
    const agentId = agents[0].id
    const metricValue = 10
    const idField = TicketDimension.AssigneeUserId

    const allDataMockedMetric = (
        measure: string,
        agentIdField: string
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
        ui: {stats: {cleanStatsFilters: null}},
    } as RootState

    it.each(agentsShoutoutsConfig)(
        'should pick the best result per metric $measure',
        ({formatValue, measure}) => {
            const {result} = renderHook(
                () =>
                    useShoutoutTopResults(
                        allDataMockedMetric(measure, idField),
                        formatValue,
                        measure
                    ),
                {
                    wrapper: ({children}) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                }
            )

            expect(result.current).toEqual({
                agents: [agents[0]],
                metricValue: formatValue(metricValue),
            })
        }
    )
})
