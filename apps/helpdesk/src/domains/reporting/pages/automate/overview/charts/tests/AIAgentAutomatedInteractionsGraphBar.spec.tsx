import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAIAgentInteractionsBySkillTimeSeries } from 'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries'
import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    AI_AGENT_AUTOMATED_INTERACTIONS_LABEL,
    AI_AGENT_CHART_FIELDS,
    AIAgentAutomatedInteractionsGraphBar,
    AutomateCustomColors,
} from 'domains/reporting/pages/automate/overview/charts/AIAgentAutomatedInteractionsGraphBar'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'

jest.mock('domains/reporting/pages/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart)
jest.mock(
    'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries',
)
const useAIAgentInteractionsBySkillTimeSeriesMock = assumeMock(
    useAIAgentInteractionsBySkillTimeSeries,
)
jest.mock('pages/aiAgent/Overview/hooks/useAiAgentType')
const useAiAgentTypeForAccountMock = assumeMock(useAiAgentTypeForAccount)

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
        BarChartMock.mockReturnValue(<div />)
        useAIAgentInteractionsBySkillTimeSeriesMock.mockReturnValue({
            data: exampleData,
            isLoading: false,
        } as any)
        useAiAgentTypeForAccountMock.mockReturnValue({
            aiAgentType: 'mixed',
            isLoading: false,
        })
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
                        label: AI_AGENT_CHART_FIELDS[0].label,
                        values: [
                            { x: 'Feb 3rd, 2021', y: 123 },
                            { x: 'Feb 4th, 2021', y: 456 },
                            { x: 'Feb 5th, 2021', y: 789 },
                        ],
                        isDisabled: false,
                    },
                    {
                        label: AI_AGENT_CHART_FIELDS[1].label,
                        values: [
                            { x: 'Feb 3rd, 2021', y: 654 },
                            { x: 'Feb 4th, 2021', y: 987 },
                            { x: 'Feb 5th, 2021', y: 321 },
                        ],
                        isDisabled: false,
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
                        label: AI_AGENT_CHART_FIELDS[0].label,
                        values: [],
                        isDisabled: false,
                    },
                    {
                        label: AI_AGENT_CHART_FIELDS[1].label,
                        values: [],
                        isDisabled: false,
                    },
                ],
                displayLegend: true,
                hasBackground: true,
                isLoading: false,
                isStacked: true,
                legendOnLeft: true,
                toggleLegend: true,
                withTooltipTotal: true,
                defaultDatasetVisibility: {
                    0: true,
                    1: true,
                },
            },
            {},
        )
    })

    it('should disable sales data when aiAgentType is support', () => {
        useAiAgentTypeForAccountMock.mockReturnValue({
            aiAgentType: 'support',
            isLoading: false,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <AIAgentAutomatedInteractionsGraphBar />
            </Provider>,
        )

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                defaultDatasetVisibility: {
                    0: true,
                    1: false,
                },
            }),
            {},
        )
    })

    it('should show loading state correctly', () => {
        useAIAgentInteractionsBySkillTimeSeriesMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <AIAgentAutomatedInteractionsGraphBar />
            </Provider>,
        )

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })

    it('should handle missing data gracefully', () => {
        useAIAgentInteractionsBySkillTimeSeriesMock.mockReturnValue({
            data: {
                [AIAgentSkills.AIAgentSupport]: [
                    [
                        {
                            dateTime: '2021-02-03T00:00:00.000Z',
                            value: 123,
                        },
                    ],
                ],
            },
            isLoading: false,
        } as any)

        render(
            <Provider store={mockStore(defaultState)}>
                <AIAgentAutomatedInteractionsGraphBar />
            </Provider>,
        )

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [
                    {
                        label: AI_AGENT_CHART_FIELDS[0].label,
                        values: [{ x: 'Feb 3rd, 2021', y: 123 }],
                        isDisabled: false,
                    },
                    {
                        label: AI_AGENT_CHART_FIELDS[1].label,
                        values: [],
                        isDisabled: false,
                    },
                ],
            }),
            {},
        )
    })

    it('should include total in tooltip when withTooltipTotal is true', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AIAgentAutomatedInteractionsGraphBar />
            </Provider>,
        )

        expect(BarChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                withTooltipTotal: true,
                data: [
                    {
                        label: AI_AGENT_CHART_FIELDS[0].label,
                        values: [
                            { x: 'Feb 3rd, 2021', y: 123 },
                            { x: 'Feb 4th, 2021', y: 456 },
                            { x: 'Feb 5th, 2021', y: 789 },
                        ],
                        isDisabled: false,
                    },
                    {
                        label: AI_AGENT_CHART_FIELDS[1].label,
                        values: [
                            { x: 'Feb 3rd, 2021', y: 654 },
                            { x: 'Feb 4th, 2021', y: 987 },
                            { x: 'Feb 5th, 2021', y: 321 },
                        ],
                        isDisabled: false,
                    },
                ],
            }),
            {},
        )
    })
})
