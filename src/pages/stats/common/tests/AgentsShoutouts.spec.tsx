import React from 'react'
import {fromJS} from 'immutable'
import {render, screen, within} from '@testing-library/react'
import {Provider} from 'react-redux'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {agents} from 'fixtures/agents'
import {RootState} from 'state/types'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {assumeMock, mockStore} from 'utils/testing'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {initialState} from 'state/stats/statsSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {SHOUTOUT_NO_VALUE_PLACEHOLDER} from 'pages/common/components/Shoutout/Shoutout'
import AgentsShoutouts from 'pages/stats/support-performance/agents/AgentsShoutouts'
import {TableLabels} from 'pages/stats/support-performance/agents/AgentsTableConfig'

jest.mock('hooks/reporting/metricsPerAgent')
const useMedianFirstResponseTimeMetricPerAgentMock = assumeMock(
    useMedianFirstResponseTimeMetricPerAgent
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)
const useCustomerSatisfactionMetricPerAgentMock = assumeMock(
    useCustomerSatisfactionMetricPerAgent
)
const useMedianResolutionTimeMetricPerAgentMock = assumeMock(
    useMedianResolutionTimeMetricPerAgent
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
            stats: uiStatsInitialState,
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
                    10 + idx
                ),
                [TicketMessagesMeasure.MedianFirstResponseTime]: String(
                    10 + idx
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
            allDataMockedMetric
        )
        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric
        )
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(allDataMockedMetric)

        render(
            <Provider store={mockStore(defaultState as any)}>
                <AgentsShoutouts />
            </Provider>
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
                        10 + idx
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
            mockedMetric
        )

        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(loadingMetric)
        useClosedTicketsMetricPerAgentMock.mockReturnValue(loadingMetric)

        render(
            <Provider store={mockStore(defaultState as any)}>
                <AgentsShoutouts />
            </Provider>
        )

        const satisfactionShoutout = within(
            screen.getByTestId(
                `shoutout-for-${TicketSatisfactionSurveyMeasure.AvgSurveyScore}`
            )
        )

        const multipleAgentsLabel = satisfactionShoutout.getByText(
            `${agents.length} agents`
        )
        expect(multipleAgentsLabel).toBeInTheDocument()

        agents.forEach((agent) => {
            const agentName = satisfactionShoutout.queryByText(agent.name)
            expect(agentName).not.toBeInTheDocument()
        })

        const frtShoutout = within(
            screen.getByTestId(
                `shoutout-for-${TicketMessagesMeasure.MedianFirstResponseTime}`
            )
        )
        const shoutoutedAgent = frtShoutout.queryByText(agents[0].name)
        expect(shoutoutedAgent).toBeInTheDocument()
        const otherAgent = frtShoutout.queryByText(agents[1].name)
        expect(otherAgent).not.toBeInTheDocument()
    })

    it('should show no data placeholders when there is no available data for some metric', () => {
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
            noDataMockedMetric
        )

        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric
        )
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
            allDataMockedMetric
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(allDataMockedMetric)

        render(
            <Provider store={mockStore(defaultState as any)}>
                <AgentsShoutouts />
            </Provider>
        )

        const satisfactionShoutout = within(
            screen.getByTestId(
                `shoutout-for-${TicketSatisfactionSurveyMeasure.AvgSurveyScore}`
            )
        )
        expect(
            satisfactionShoutout.getAllByText(SHOUTOUT_NO_VALUE_PLACEHOLDER)
        ).toHaveLength(3)
    })

    it.each([
        {screenWidth: 1800, expectedColumns: 4},
        {screenWidth: 700, expectedColumns: 0},
    ])(
        'it should check the number of grid columns for $screenWidth should be $expectedColumns',
        ({screenWidth, expectedColumns}) => {
            global.innerWidth = screenWidth
            useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
                allDataMockedMetric
            )
            useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(
                allDataMockedMetric
            )
            useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
                allDataMockedMetric
            )
            useClosedTicketsMetricPerAgentMock.mockReturnValue(
                allDataMockedMetric
            )

            const {container} = render(
                <Provider store={mockStore(defaultState as any)}>
                    <AgentsShoutouts />
                </Provider>
            )

            const shoutoutsContainerComputedStyle = getComputedStyle(
                container.querySelector('.grid') as HTMLElement
            )

            expect(
                shoutoutsContainerComputedStyle.getPropertyValue(
                    '--agents-shoutouts-columns'
                )
            ).toEqual(`${expectedColumns}`)
        }
    )
})
