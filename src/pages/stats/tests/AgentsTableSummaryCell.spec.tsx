import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {AgentsColumnConfig} from 'pages/stats/AgentsTableConfig'
import {
    AGENT_SUMMARY_CELL_LABEL,
    AgentsTableSummaryCell,
} from 'pages/stats/AgentsTableSummaryCell'
import {formatMetricValue} from 'pages/stats/common/utils'

import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {
    agentPerformanceSlice,
    initialState,
} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {AgentsTableColumn} from 'state/ui/stats/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentsTableSummaryCell', () => {
    const defaultState = {
        stats: {
            filters: fromLegacyStatsFilters({
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                tags: [1],
                integrations: [integrationsState.integrations[0].id],
            }),
        },
        ui: {
            stats: uiStatsInitialState,
            [agentPerformanceSlice.name]: initialState,
        },
        agents: fromJS({
            all: agents,
        }),
    } as unknown as RootState

    const metricValue = 123
    const metricQuery = () => ({
        isFetching: false,
        isError: false,
        data: {value: metricValue},
    })

    it('should render the table summary cel', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableSummaryCell
                    useMetric={metricQuery}
                    column={AgentsTableColumn.AgentName}
                />
            </Provider>
        )

        expect(screen.getByText(AGENT_SUMMARY_CELL_LABEL)).toBeInTheDocument()
    })

    it('should render the loading skeleton', () => {
        const metricQuery = () => ({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableSummaryCell
                    useMetric={metricQuery}
                    column={AgentsTableColumn.CustomerSatisfaction}
                />
            </Provider>
        )

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should call the useMetric hook and render formatted value', () => {
        const simpleMetric = AgentsTableColumn.CustomerSatisfaction

        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableSummaryCell
                    useMetric={metricQuery}
                    column={simpleMetric}
                />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    metricValue,
                    AgentsColumnConfig[simpleMetric].format
                )
            )
        )
    })

    it('should divide metric by number of agents', () => {
        const simpleMetric = AgentsTableColumn.MessagesSent
        const metricValue = 123
        const metricQuery = () => ({
            isFetching: false,
            isError: false,
            data: {value: metricValue},
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <AgentsTableSummaryCell
                    useMetric={metricQuery}
                    column={simpleMetric}
                />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    metricValue / agents.length,
                    AgentsColumnConfig[simpleMetric].format
                )
            )
        )
    })
})
