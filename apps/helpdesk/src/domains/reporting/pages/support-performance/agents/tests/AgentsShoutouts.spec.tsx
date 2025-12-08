import { assumeMock } from '@repo/testing'
import { render, screen, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { TicketsFirstAgentResponseTimeMeasure } from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import { SHOUTOUT_NO_VALUE_PLACEHOLDER } from 'domains/reporting/pages/common/components/Shoutout/Shoutout'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'
import { TableLabels } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { TopClosedTicketsPerformers } from 'domains/reporting/pages/support-performance/agents/TopClosedTicketsPerformers'
import { TopCsatPerformers } from 'domains/reporting/pages/support-performance/agents/TopCsatPerformers'
import { TopFirstResponseTimePerformers } from 'domains/reporting/pages/support-performance/agents/TopFirstResponseTimePerformers'
import { TopResponseTimePerformers } from 'domains/reporting/pages/support-performance/agents/TopResponseTimePerformers'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/metricsPerAgent')
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

    const allDataMockedMetric: ReturnType<
        typeof useCustomerSatisfactionMetricPerAgent
    > = {
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
                [TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime]:
                    String(10 + idx),
                [TicketMessagesMeasure.MedianResolutionTime]: String(10 + idx),
                [TicketMeasure.TicketCount]: String(10 + idx),
            })),
            dimensions: [TicketDimension.AssigneeUserId],
            measures: [
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
                TicketMessagesMeasure.MedianResolutionTime,
                TicketMeasure.TicketCount,
            ],
        },
    }

    const noDataMockedMetric: ReturnType<
        typeof useCustomerSatisfactionMetricPerAgent
    > = {
        isError: false,
        isFetching: false,
        data: {
            value: null,
            decile: null,
            allData: [],
            dimensions: [TicketDimension.AssigneeUserId],
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
        },
    }

    it('should render all shoutouts for users if they have data', () => {
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useCustomerSatisfactionMetricPerAgent
            >,
        )
        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useMedianFirstResponseTimeMetricPerAgent
            >,
        )
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useMedianResolutionTimeMetricPerAgent
            >,
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useClosedTicketsMetricPerAgent
            >,
        )

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
        const mockedMetricSatisfaction: ReturnType<
            typeof useCustomerSatisfactionMetricPerAgent
        > = {
            isError: false,
            isFetching: false,
            data: {
                value: null,
                decile: 5,
                allData: agents.map((agent) => ({
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                    /**
                     * have it the same for all agents
                     */
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '777',
                })),
                dimensions: [TicketDimension.AssigneeUserId],
                measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            },
        }
        const mockedMetricFRT: ReturnType<
            typeof useMedianFirstResponseTimeMetricPerAgent
        > = {
            isError: false,
            isFetching: false,
            data: {
                value: null,
                decile: 5,
                allData: agents.map((agent, idx) => ({
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                    /**
                     * this will be different for every agent
                     */
                    [TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime]:
                        String(10 + idx),
                })),
                dimensions: [TicketDimension.AssigneeUserId],
                measures: [
                    TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
                ],
            },
        }
        const loadingMetric: ReturnType<
            typeof useCustomerSatisfactionMetricPerAgent
        > = {
            isError: false,
            isFetching: true,
            data: null,
        }

        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
            mockedMetricSatisfaction,
        )
        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            mockedMetricFRT,
        )

        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            loadingMetric as ReturnType<
                typeof useMedianResolutionTimeMetricPerAgent
            >,
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(
            loadingMetric as ReturnType<typeof useClosedTicketsMetricPerAgent>,
        )

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
            noDataMockedMetric as ReturnType<
                typeof useCustomerSatisfactionMetricPerAgent
            >,
        )

        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useMedianFirstResponseTimeMetricPerAgent
            >,
        )
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useMedianResolutionTimeMetricPerAgent
            >,
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric as ReturnType<
                typeof useClosedTicketsMetricPerAgent
            >,
        )

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
