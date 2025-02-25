import React from 'react'

import { render, screen, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { agents } from 'fixtures/agents'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import { TicketMessagesMeasure } from 'models/reporting/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { SHOUTOUT_NO_VALUE_PLACEHOLDER } from 'pages/stats/common/components/Shoutout/Shoutout'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'
import { TableLabels } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { TopClosedTicketsPerformers } from 'pages/stats/support-performance/agents/TopClosedTicketsPerformers'
import { TopCsatPerformers } from 'pages/stats/support-performance/agents/TopCsatPerformers'
import { TopFirstResponseTimePerformers } from 'pages/stats/support-performance/agents/TopFirstResponseTimePerformers'
import { TopResponseTimePerformers } from 'pages/stats/support-performance/agents/TopResponseTimePerformers'
import { initialState } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'state/ui/stats/types'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
const useMedianFirstResponseTimeMetricPerAgentMock = assumeMock(
    useMedianFirstResponseTimeMetricPerAgent,
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent,
)
const useCustomerSatisfactionMetricPerAgentMock = assumeMock(
    useCustomerSatisfactionMetricPerAgent,
)
const useMedianResolutionTimeMetricPerAgentMock = assumeMock(
    useMedianResolutionTimeMetricPerAgent,
)

describe('<AgentsShoutouts />', () => {
    const tableLabels = [
        TableLabels[AgentsTableColumn.CustomerSatisfaction],
        TableLabels[AgentsTableColumn.MedianFirstResponseTime],
        TableLabels[AgentsTableColumn.MedianResolutionTime],
        TableLabels[AgentsTableColumn.ClosedTickets],
    ]

    const defaultState = {
        agents: fromJS({
            all: agents,
        }),
        stats: initialState,
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    const allDataMockedMetric: MetricWithDecile = {
        isError: false,
        isFetching: false,
        data: {
            value: null,
            decile: 5,
            allData: agents.map((agent, idx) => ({
                [TicketDimension.AssigneeUserId]: String(agent.id),
                [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: String(
                    10 + idx,
                ),
                [TicketMessagesMeasure.MedianFirstResponseTime]: String(
                    10 + idx,
                ),
                [TicketMessagesMeasure.MedianResolutionTime]: String(10 + idx),
                [TicketMeasure.TicketCount]: String(10 + idx),
            })),
        },
    }

    const noDataMockedMetric: MetricWithDecile = {
        isError: false,
        isFetching: false,
        data: {
            value: null,
            decile: null,
            allData: [],
        },
    }

    it('should render all shoutouts for users if they have data', () => {
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric,
        )
        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric,
        )
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric,
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(allDataMockedMetric)

        render(
            <Provider store={mockStore(defaultState as any)}>
                <TopClosedTicketsPerformers />
                <TopResponseTimePerformers />
                <TopFirstResponseTimePerformers />
                <TopCsatPerformers />
            </Provider>,
        )

        tableLabels.forEach((label) => {
            const metricName = screen.getByText(label)

            expect(metricName).toBeInTheDocument()
        })
    })

    it('should show the name of the user if there is only one to shoutout and {count} agents if there are more with the same value', () => {
        const mockedMetric: MetricWithDecile = {
            isError: false,
            isFetching: false,
            data: {
                value: null,
                decile: 5,
                allData: agents.map((agent, idx) => ({
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                    /**
                     * have it the same for all agents
                     */
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '777',
                    /**
                     * this will be different for every agent
                     */
                    [TicketMessagesMeasure.MedianFirstResponseTime]: String(
                        10 + idx,
                    ),
                })),
            },
        }
        const loadingMetric: MetricWithDecile = {
            isError: false,
            isFetching: true,
            data: null,
        }

        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(mockedMetric)
        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            mockedMetric,
        )

        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(loadingMetric)
        useClosedTicketsMetricPerAgentMock.mockReturnValue(loadingMetric)

        render(
            <Provider store={mockStore(defaultState as any)}>
                <TopClosedTicketsPerformers />
                <TopResponseTimePerformers />
                <TopFirstResponseTimePerformers />
                <TopCsatPerformers />
            </Provider>,
        )
        const satisfactionShoutout = within(
            screen.getByLabelText(
                `Agents' information for ${AgentsShoutOutsConfig[TopPerformersChart.TopCSATPerformers].metricName}`,
            ),
        )

        const agentsElement = satisfactionShoutout.getByText(
            `${agents.length} agents`,
        )
        agents.forEach((agent) => {
            const agentName = within(agentsElement).queryByText(agent.name)
            expect(agentName).not.toBeInTheDocument()
        })

        const frtShoutout = within(
            screen.getByLabelText(
                `Agents' information for ${AgentsShoutOutsConfig[TopPerformersChart.TopFirstResponseTimePerformers].metricName}`,
            ),
        )
        const shoutoutedAgent = frtShoutout.queryByText(agents[0].name)
        const otherAgent = frtShoutout.queryByText(agents[1].name)

        expect(shoutoutedAgent).toBeInTheDocument()
        expect(otherAgent).not.toBeInTheDocument()
    })

    it('should show no data placeholders when there is no available data for some metric', () => {
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
            noDataMockedMetric,
        )

        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric,
        )
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric,
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(allDataMockedMetric)

        render(
            <Provider store={mockStore(defaultState as any)}>
                <TopClosedTicketsPerformers />
                <TopResponseTimePerformers />
                <TopFirstResponseTimePerformers />
                <TopCsatPerformers />
            </Provider>,
        )

        expect(screen.getAllByText(SHOUTOUT_NO_VALUE_PLACEHOLDER)).toHaveLength(
            3,
        )
    })
})
