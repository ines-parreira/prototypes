import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { agents } from 'fixtures/agents'
import { formatMetricValue } from 'pages/stats/common/utils'
import {
    AGENT_SUMMARY_CELL_LABEL,
    AgentsTableAverageCell,
} from 'pages/stats/support-performance/agents/AgentsTableAverageCell'
import { AgentsColumnConfig } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as agentPerformanceInitialState } from 'state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'state/ui/stats/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentsTableSummaryCell', () => {
    const defaultState = {
        ui: {
            stats: {
                filters: uiStatsInitialState,
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
        agents: fromJS({
            all: agents,
        }),
    } as RootState

    const metricValue = 123

    const data = { value: metricValue }

    it('should render the table summary cel', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableAverageCell
                    data={data}
                    column={AgentsTableColumn.AgentName}
                    agentsLength={agents.length}
                />
            </Provider>,
        )

        expect(screen.getByText(AGENT_SUMMARY_CELL_LABEL)).toBeInTheDocument()
    })

    it('should call the useMetric hook and render formatted value', () => {
        const simpleMetric = AgentsTableColumn.CustomerSatisfaction

        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableAverageCell
                    data={data}
                    column={simpleMetric}
                    agentsLength={agents.length}
                />
            </Provider>,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    metricValue,
                    AgentsColumnConfig[simpleMetric].format,
                ),
            ),
        )
    })

    it('should divide metric by number of agents', () => {
        const simpleMetric = AgentsTableColumn.MessagesSent
        const metricValue = 123

        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableAverageCell
                    data={data}
                    column={simpleMetric}
                    agentsLength={agents.length}
                />
            </Provider>,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    metricValue / agents.length,
                    AgentsColumnConfig[simpleMetric].format,
                ),
            ),
        )
    })
})
