import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart'
import { NewDashboard } from 'domains/reporting/pages/dashboards/NewDashboard'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { useFiltersFromDashboard } from 'domains/reporting/pages/dashboards/useFiltersFromDashboard'

jest.mock('domains/reporting/hooks/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
)
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

jest.mock(
    'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeChart',
)
const DragAndResizeChartMock = assumeMock(DragAndResizeChart)

jest.mock('domains/reporting/pages/dashboards/useFiltersFromDashboard')
const useFiltersFromDashboardMock = assumeMock(useFiltersFromDashboard)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions', () => ({
    useDashboardActions: jest.fn(() => ({
        updateDashboardHandler: jest.fn(),
        isUpdateMutationLoading: false,
        isUpdateMutationError: false,
    })),
}))

const PIN_FILTER_BUTTON = 'pin filter'

describe('NewDashboard', () => {
    const dashboard: DashboardSchema = {
        id: 1,
        name: 'Test Dashboard',
        analytics_filter_id: null,
        emoji: null,
        children: [
            {
                type: DashboardChildType.Row,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'customer_satisfaction_trend_card',
                    },
                ],
            },
        ],
    }

    const mockPersistentFilters: StaticFilter[] = [FilterKey.Period]
    const mockOptionalFilters: OptionalFilter[] = [FilterKey.Agents]

    beforeEach(() => {
        useCleanStatsFiltersMock.mockReturnValue(undefined)

        FiltersPanelWrapperMock.mockImplementation(({ pinnedFilter }) => (
            <div>
                Filters Panel
                {pinnedFilter && (
                    <button onClick={() => pinnedFilter.pin(123, 'filter')}>
                        {PIN_FILTER_BUTTON}
                    </button>
                )}
            </div>
        ))

        DragAndResizeChartMock.mockImplementation(({ schema }) => (
            <div>Chart: {schema.config_id}</div>
        ))

        useFiltersFromDashboardMock.mockReturnValue({
            persistentFilters: mockPersistentFilters,
            optionalFilters: mockOptionalFilters,
        })
    })

    it('should render filters panel wrapper', () => {
        render(<NewDashboard dashboard={dashboard} pinnedFilter={undefined} />)

        expect(FiltersPanelWrapperMock).toHaveBeenCalledWith(
            expect.objectContaining({
                pinnedFilter: undefined,
                persistentFilters: mockPersistentFilters,
                optionalFilters: mockOptionalFilters,
                filterSettingsOverrides: expect.objectContaining({
                    period: {
                        initialSettings: {
                            maxSpan: 365,
                        },
                    },
                }),
            }),
            {},
        )
    })

    it('should render filters panel wrapper with pinned filter', () => {
        const mockPinnedFilter = {
            id: 123,
            pin: jest.fn(),
        }

        render(
            <NewDashboard
                dashboard={dashboard}
                pinnedFilter={mockPinnedFilter}
            />,
        )

        expect(FiltersPanelWrapperMock).toHaveBeenCalledWith(
            expect.objectContaining({
                pinnedFilter: mockPinnedFilter,
                persistentFilters: mockPersistentFilters,
                optionalFilters: mockOptionalFilters,
            }),
            {},
        )
    })

    it('should render dashboard charts', () => {
        render(<NewDashboard dashboard={dashboard} pinnedFilter={undefined} />)

        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            {
                schema: {
                    type: DashboardChildType.Chart,
                    config_id: 'customer_satisfaction_trend_card',
                },
                dashboard,
            },
            {},
        )
    })

    it('should render multiple charts when dashboard has multiple children', () => {
        const dashboardWithMultipleCharts: DashboardSchema = {
            ...dashboard,
            children: [
                {
                    type: DashboardChildType.Row,
                    children: [
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart1',
                        },
                        {
                            type: DashboardChildType.Chart,
                            config_id: 'chart2',
                        },
                    ],
                },
            ],
        }

        render(
            <NewDashboard
                dashboard={dashboardWithMultipleCharts}
                pinnedFilter={undefined}
            />,
        )

        expect(DragAndResizeChartMock).toHaveBeenCalledTimes(2)
        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                schema: expect.objectContaining({
                    config_id: 'chart1',
                }),
            }),
            {},
        )
        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                schema: expect.objectContaining({
                    config_id: 'chart2',
                }),
            }),
            {},
        )
    })

    it('should handle empty dashboard children', () => {
        const emptyDashboard: DashboardSchema = {
            ...dashboard,
            children: [],
        }

        const { container } = render(
            <NewDashboard
                dashboard={emptyDashboard}
                pinnedFilter={undefined}
            />,
        )

        expect(FiltersPanelWrapperMock).toHaveBeenCalled()
        expect(DragAndResizeChartMock).not.toHaveBeenCalled()
        // Should still render the filters panel
        expect(container.textContent).toContain('Filters Panel')
    })

    it('should handle nested dashboard structure with sections', () => {
        const nestedDashboard: DashboardSchema = {
            ...dashboard,
            children: [
                {
                    type: DashboardChildType.Section,
                    children: [
                        {
                            type: DashboardChildType.Row,
                            children: [
                                {
                                    type: DashboardChildType.Chart,
                                    config_id: 'nested_chart',
                                },
                            ],
                        },
                    ],
                },
            ],
        }

        render(
            <NewDashboard
                dashboard={nestedDashboard}
                pinnedFilter={undefined}
            />,
        )

        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                schema: expect.objectContaining({
                    config_id: 'nested_chart',
                }),
            }),
            {},
        )
    })

    it('should call useCleanStatsFilters hook', () => {
        render(<NewDashboard dashboard={dashboard} pinnedFilter={undefined} />)

        expect(useCleanStatsFiltersMock).toHaveBeenCalled()
    })

    it('should call useFiltersFromDashboard with correct dashboard', () => {
        render(<NewDashboard dashboard={dashboard} pinnedFilter={undefined} />)

        expect(useFiltersFromDashboardMock).toHaveBeenCalledWith(dashboard)
    })

    it('should pass dashboard prop to each chart', () => {
        const customDashboard: DashboardSchema = {
            id: 999,
            name: 'Custom Dashboard',
            analytics_filter_id: 456,
            emoji: '📊',
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: 'custom_chart',
                },
            ],
        }

        render(
            <NewDashboard
                dashboard={customDashboard}
                pinnedFilter={undefined}
            />,
        )

        expect(DragAndResizeChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                dashboard: customDashboard,
            }),
            {},
        )
    })

    describe('Pinned Filter functionality', () => {
        it('should pass pinned filter to FiltersPanelWrapper', () => {
            const mockPinnedFilter = {
                id: 789,
                pin: jest.fn(),
            }

            render(
                <NewDashboard
                    dashboard={dashboard}
                    pinnedFilter={mockPinnedFilter}
                />,
            )

            expect(FiltersPanelWrapperMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pinnedFilter: mockPinnedFilter,
                }),
                {},
            )
        })

        it('should handle pinned filter interaction when provided', () => {
            const mockPin = jest.fn()
            const mockPinnedFilter = {
                id: 123,
                pin: mockPin,
            }

            const { getByRole } = render(
                <NewDashboard
                    dashboard={dashboard}
                    pinnedFilter={mockPinnedFilter}
                />,
            )

            const pinButton = getByRole('button', { name: PIN_FILTER_BUTTON })
            pinButton.click()

            expect(mockPin).toHaveBeenCalledWith(123, 'filter')
        })

        it('should not render pin filter button when pinnedFilter is undefined', () => {
            const { queryByRole } = render(
                <NewDashboard dashboard={dashboard} pinnedFilter={undefined} />,
            )

            const pinButton = queryByRole('button', { name: PIN_FILTER_BUTTON })
            expect(pinButton).not.toBeInTheDocument()
        })
    })
})
