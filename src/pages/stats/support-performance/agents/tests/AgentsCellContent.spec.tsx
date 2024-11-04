import {screen} from '@testing-library/react'
import React from 'react'

import {User} from 'config/types/user'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {AgentsCellContent} from 'pages/stats/support-performance/agents/AgentsCellContent'
import {defaultStatsFilters} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Tooltip: () => <div />,
}))

jest.mock('pages/stats/DrillDownModalTrigger.tsx')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

const MOCK_SKELETON_TEST_ID = 'skeleton'
jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

describe('<AgentsCellContent />', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const closedTicketsValue = 1234
    const userTimezone = 'UTC'
    const statsFilters = defaultStatsFilters

    const defaultState = {
        stats: {filters: statsFilters},
        ui: {
            stats: {filters: uiStatsInitialState},
        },
    } as RootState

    const useClosedTicketsMetricPerAgentMockReturnValue = {
        data: {
            value: closedTicketsValue,
            decile: 5,
            allData: [
                {
                    [TicketMeasure.TicketCount]: String(closedTicketsValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        DrillDownModalTriggerMock.mockImplementation(() => <div />)
    })

    it('should render value as decimal', () => {
        const metricFormat = 'decimal'
        const metricHook = jest
            .fn()
            .mockImplementation(
                () => useClosedTicketsMetricPerAgentMockReturnValue
            )

        renderWithStore(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={metricFormat}
                drillDownMetricData={null}
                isHeatmapMode={false}
                isSortingMetricLoading={false}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                    isAnalyticsNewFilters: true,
                }}
            />,
            defaultState
        )

        expect(metricHook).toHaveBeenCalledWith(
            expect.objectContaining({
                period: defaultState.stats.filters.period,
            }),
            expect.anything(),
            undefined,
            String(agent.id)
        )
        expect(
            screen.getByText(
                formatMetricValue(
                    closedTicketsValue,
                    metricFormat,
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render value in heatmap mode', () => {
        const metricFormat = 'decimal'
        const metricHook = jest
            .fn()
            .mockImplementation(
                () => useClosedTicketsMetricPerAgentMockReturnValue
            )

        renderWithStore(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={metricFormat}
                drillDownMetricData={null}
                isHeatmapMode={true}
                isSortingMetricLoading={false}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                    isAnalyticsNewFilters: true,
                }}
            />,
            defaultState
        )

        const elementWithHeatmap = document.querySelector(
            `.p${useClosedTicketsMetricPerAgentMockReturnValue.data.decile}`
        )
        expect(elementWithHeatmap).toBeInTheDocument()
        expect(
            screen.getByText(
                formatMetricValue(
                    closedTicketsValue,
                    metricFormat,
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        const metricHook = jest.fn().mockImplementation(() => ({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            isFetching: true,
        }))
        renderWithStore(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={'decimal'}
                drillDownMetricData={null}
                isHeatmapMode={false}
                isSortingMetricLoading={false}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                    isAnalyticsNewFilters: true,
                }}
            />,
            defaultState
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })

    it('should render DrillDown when metricData passed', () => {
        const drillDownMetricData: DrillDownMetric = {
            metricName: AgentsTableColumn.ClosedTickets,
            perAgentId: agent.id,
        }
        const metricHook = jest
            .fn()
            .mockImplementation(
                () => useClosedTicketsMetricPerAgentMockReturnValue
            )
        renderWithStore(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={'decimal'}
                drillDownMetricData={drillDownMetricData}
                isHeatmapMode={false}
                isSortingMetricLoading={false}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                    isAnalyticsNewFilters: true,
                }}
            />,
            defaultState
        )

        expect(DrillDownModalTriggerMock).toHaveBeenCalled()
    })
})
