import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAIAgentInteractionsBySkillTimeSeries } from 'hooks/reporting/automate/useAIAgentInteractionsBySkillTimeSeries'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { AIAgentSkills } from 'models/reporting/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    AI_AGENT_AUTOMATED_INTERACTIONS_LABEL,
    AIAgentAutomatedInteractionsGraphBar,
    AUTOMATE_CHART_FIELDS,
    AutomateCustomColors,
} from 'pages/stats/automate/overview/charts/AIAgentAutomatedInteractionsGraphBar'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import { initialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart)
jest.mock('hooks/reporting/automate/useAIAgentInteractionsBySkillTimeSeries')
const useAIAgentInteractionsBySkillTimeSeriesMock = assumeMock(
    useAIAgentInteractionsBySkillTimeSeries,
)

const mockStore = configureMockStore([thunk])

describe('AIAgentAutomatedInteractionsGraphBar', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-07T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: { filters: initialState },
        },
    }

    const exampleData: Record<string, TimeSeriesDataItem[][]> = {
        [AIAgentSkills.AIAgentSupport]: [
            [
                {
                    dateTime: '2021-02-03T00:00:00.000Z',
                    value: 123,
                },
                {
                    dateTime: '2021-02-04T00:00:00.000Z',
                    value: 456,
                },
                {
                    dateTime: '2021-02-05T00:00:00.000Z',
                    value: 789,
                },
            ],
        ],
        [AIAgentSkills.AIAgentSales]: [
            [
                {
                    dateTime: '2021-02-03T00:00:00.000Z',
                    value: 654,
                },
                {
                    dateTime: '2021-02-04T00:00:00.000Z',
                    value: 987,
                },
                {
                    dateTime: '2021-02-05T00:00:00.000Z',
                    value: 321,
                },
            ],
        ],
    }

    beforeEach(() => {
        BarChartMock.mockReturnValue(<div>BarChart</div>)
        useAIAgentInteractionsBySkillTimeSeriesMock.mockReturnValue({
            data: exampleData,
            isLoading: false,
        } as any)
    })

    it('should render the AIAgentAutomatedInteractionsGraphBar with the right data', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AIAgentAutomatedInteractionsGraphBar />
            </Provider>,
        )
        expect(
            screen.getByText(AI_AGENT_AUTOMATED_INTERACTIONS_LABEL),
        ).toBeInTheDocument()
        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [
                    {
                        label: AUTOMATE_CHART_FIELDS[0].label,
                        values: [
                            { x: 'Feb 3rd, 2021', y: 123 },
                            { x: 'Feb 4th, 2021', y: 456 },
                            { x: 'Feb 5th, 2021', y: 789 },
                        ],
                    },
                    {
                        label: AUTOMATE_CHART_FIELDS[1].label,
                        values: [
                            { x: 'Feb 3rd, 2021', y: 654 },
                            { x: 'Feb 4th, 2021', y: 987 },
                            { x: 'Feb 5th, 2021', y: 321 },
                        ],
                    },
                ],
            }),
            {},
        )
    })

    it('should render an empty AIAgentAutomatedInteractionsGraphBar with the right props', () => {
        useAIAgentInteractionsBySkillTimeSeriesMock.mockReturnValue({
            data: {},
            isLoading: false,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <AIAgentAutomatedInteractionsGraphBar />
            </Provider>,
        )

        expect(
            screen.getByText(AI_AGENT_AUTOMATED_INTERACTIONS_LABEL),
        ).toBeInTheDocument()
        expect(BarChartMock).toHaveBeenCalledWith(
            {
                customColors: AutomateCustomColors,
                data: [
                    {
                        label: AUTOMATE_CHART_FIELDS[0].label,
                        values: [],
                    },
                    {
                        label: AUTOMATE_CHART_FIELDS[1].label,
                        values: [],
                    },
                ],
                displayLegend: true,
                hasBackground: true,
                isLoading: false,
                isStacked: true,
                legendOnLeft: true,
                toggleLegend: true,
            },
            {},
        )
    })
})
