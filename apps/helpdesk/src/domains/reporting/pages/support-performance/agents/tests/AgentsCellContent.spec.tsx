import { ReactElement } from 'react'

import { screen } from '@testing-library/react'

import { User } from 'config/types/user'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { AgentsCellContent } from 'domains/reporting/pages/support-performance/agents/AgentsCellContent'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Tooltip: () => <div />,
        }) as typeof import('@gorgias/merchant-ui-kit'),
)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModalTrigger.tsx')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

const MOCK_SKELETON_TEST_ID = 'skeleton'
jest.mock('@gorgias/merchant-ui-kit', () => ({
    Skeleton: () => <div data-testid={MOCK_SKELETON_TEST_ID} />,
}))

const renderWithTable = (element: ReactElement, state: Partial<RootState>) =>
    renderWithStore(
        <table>
            <tbody>
                <tr>{element}</tr>
            </tbody>
        </table>,
        state,
    )

describe('<AgentsCellContent />', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const closedTicketsValue = 1234
    const userTimezone = 'UTC'
    const statsFilters = defaultStatsFilters

    const defaultState = {
        stats: { filters: statsFilters },
        ui: {
            stats: { filters: uiStatsInitialState },
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
                () => useClosedTicketsMetricPerAgentMockReturnValue,
            )

        renderWithTable(
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
                }}
            />,
            defaultState,
        )

        expect(metricHook).toHaveBeenCalledWith(
            expect.objectContaining({
                period: defaultState.stats.filters.period,
            }),
            expect.anything(),
            undefined,
            String(agent.id),
        )
        expect(
            screen.getByText(
                formatMetricValue(
                    closedTicketsValue,
                    metricFormat,
                    NOT_AVAILABLE_PLACEHOLDER,
                ),
            ),
        ).toBeInTheDocument()
    })

    it('should render value in heatmap mode', () => {
        const metricFormat = 'decimal'
        const metricHook = jest
            .fn()
            .mockImplementation(
                () => useClosedTicketsMetricPerAgentMockReturnValue,
            )

        renderWithTable(
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
                }}
            />,
            defaultState,
        )

        const elementWithHeatmap = document.querySelector(
            `.p${useClosedTicketsMetricPerAgentMockReturnValue.data.decile}`,
        )
        expect(elementWithHeatmap).toBeInTheDocument()
        expect(
            screen.getByText(
                formatMetricValue(
                    closedTicketsValue,
                    metricFormat,
                    NOT_AVAILABLE_PLACEHOLDER,
                ),
            ),
        ).toBeInTheDocument()
    })

    it('should not render value in heatmap mode if no value', () => {
        const metricFormat = 'decimal'
        const metricHook = jest.fn().mockImplementation(() => ({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            data: {
                ...useClosedTicketsMetricPerAgentMockReturnValue.data,
                value: null,
            },
        }))

        renderWithTable(
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
                }}
            />,
            defaultState,
        )

        const elementWithHeatmap = document.querySelector(
            `.p${useClosedTicketsMetricPerAgentMockReturnValue.data.decile}`,
        )
        expect(elementWithHeatmap).toBeNull()
    })

    it('should not apply heatmap class when decile is null', () => {
        const decile = null
        const metricHook = jest.fn().mockImplementation(() => ({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            data: {
                ...useClosedTicketsMetricPerAgentMockReturnValue.data,
                value: closedTicketsValue,
                decile,
            },
        }))

        renderWithTable(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={'decimal'}
                drillDownMetricData={null}
                isHeatmapMode={true}
                isSortingMetricLoading={false}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                }}
            />,
            defaultState,
        )

        const elementWithHeatmap = document.querySelector(`.p${decile}`)
        expect(elementWithHeatmap).toBeNull()
    })

    it('should render skeleton when fetching', () => {
        const metricHook = jest.fn().mockImplementation(() => ({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            isFetching: true,
        }))
        renderWithTable(
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
                }}
            />,
            defaultState,
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
                () => useClosedTicketsMetricPerAgentMockReturnValue,
            )
        renderWithTable(
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
                }}
            />,
            defaultState,
        )

        expect(DrillDownModalTriggerMock).toHaveBeenCalled()
    })

    it('should handle null data', () => {
        const metricHook = jest.fn().mockImplementation(() => ({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            data: null,
        }))

        renderWithTable(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={'decimal'}
                drillDownMetricData={null}
                isHeatmapMode={true}
                isSortingMetricLoading={false}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                }}
            />,
            defaultState,
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('should apply custom innerClassName from bodyCellProps', () => {
        const customInnerClassName = 'custom-inner-class'
        const metricHook = jest
            .fn()
            .mockImplementation(
                () => useClosedTicketsMetricPerAgentMockReturnValue,
            )

        renderWithTable(
            <AgentsCellContent
                agent={agent}
                useMetricPerAgentQueryHook={metricHook}
                metricFormat={'decimal'}
                drillDownMetricData={null}
                isHeatmapMode={false}
                isSortingMetricLoading={false}
                bodyCellProps={{
                    innerClassName: customInnerClassName,
                }}
                statsFilters={{
                    cleanStatsFilters: statsFilters,
                    userTimezone,
                }}
            />,
            defaultState,
        )

        const cellElement = document.querySelector(`.${customInnerClassName}`)
        expect(cellElement).toBeInTheDocument()
    })
})
