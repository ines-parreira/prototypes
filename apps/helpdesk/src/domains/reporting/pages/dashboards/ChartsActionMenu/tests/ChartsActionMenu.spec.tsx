import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, userEvent } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { AddChartToDashboardModal } from 'domains/reporting/pages/dashboards/ChartsActionMenu/AddChartToDashboardModal'
import {
    ADD_TO_DASHBOARD,
    ChartsActionMenu,
    CREATE_NEW_DASHBOARD_LABEL,
    NO_DASHBOARDS_LABEL,
    REMOVE_FROM_DASHBOARD,
} from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { DashboardChartProvider } from 'domains/reporting/pages/dashboards/DashboardChartContext'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { user } from 'fixtures/users'

jest.mock('@repo/reporting', () => ({
    SearchableItemPicker: ({
        sections,
        onSelect,
        header,
        footer,
    }: {
        sections: Array<{
            id: string
            items: Array<{
                id: string
                label: string
                leadingSlot?: React.ReactNode
                trailingSlot?: React.ReactNode
            }>
        }>
        onSelect: (id: string) => void
        header?: React.ReactNode
        footer?: React.ReactNode
    }) => (
        <>
            {header}
            {sections
                .flatMap((s) => s.items)
                .map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                    >
                        {item.leadingSlot}
                        {item.label}
                        {item.trailingSlot}
                    </button>
                ))}
            {footer}
        </>
    ),
    AnalyticsActionMenu: ({
        actions,
    }: {
        actions: {
            label: string
            onClick?: () => void
            isDisabled?: boolean
            dropdownContent?: (
                close: () => void,
                goBack: () => void,
                defaultOpen: boolean,
            ) => React.ReactNode
        }[]
    }) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const [dropdownLabel, setDropdownLabel] = React.useState<string | null>(
            null,
        )
        const closeDropdown = () => setDropdownLabel(null)
        const goBack = () => {
            setDropdownLabel(null)
            setIsOpen(true)
        }
        const activeAction = actions.find((a) => a.label === dropdownLabel)

        if (actions.length === 1) {
            const [action] = actions
            return (
                <>
                    <button
                        aria-label={action.label}
                        onClick={() => {
                            if (action.dropdownContent) {
                                setDropdownLabel(action.label)
                            } else {
                                action.onClick?.()
                            }
                        }}
                        disabled={action.isDisabled}
                    />
                    {activeAction?.dropdownContent?.(
                        closeDropdown,
                        goBack,
                        false,
                    )}
                </>
            )
        }

        return (
            <>
                <button
                    aria-label="Chart actions"
                    onClick={() => setIsOpen(!isOpen)}
                />
                {isOpen &&
                    actions.map((a) => (
                        <button
                            key={a.label}
                            onClick={() => {
                                if (a.dropdownContent) {
                                    setIsOpen(false)
                                    setDropdownLabel(a.label)
                                } else {
                                    a.onClick?.()
                                }
                            }}
                            disabled={a.isDisabled}
                        >
                            {a.label}
                        </button>
                    ))}
                {activeAction?.dropdownContent?.(closeDropdown, goBack, true)}
            </>
        )
    },
}))

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/AddChartToDashboardModal',
)
const AddChartToDashboardModalMock = assumeMock(AddChartToDashboardModal)
jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('<ChartsActionMenu />', () => {
    const updateDashboardMock = jest.fn(({ onSuccess }) => onSuccess?.())
    const removeChartFromDashboardMock = jest.fn()
    const createDashboardMock = jest.fn()
    const chartName = 'chartName'
    const dashboard: DashboardSchema = {
        id: 1,
        name: 'Test Report',
        emoji: '📊',
        children: [],
        analytics_filter_id: 123,
    }

    const defaultState = {
        currentUser: fromJS({ ...user, role: { name: UserRole.Agent } }),
    }

    const chartId = OverviewChart.MedianResolutionTimeTrendCard

    const dashboardWithANestedChart: DashboardSchema = {
        id: 3,
        name: 'Report 3',
        emoji: 'minus',
        children: [
            {
                type: DashboardChildType.Row,
                children: [
                    { type: DashboardChildType.Chart, config_id: chartId },
                ],
            },
        ],
        analytics_filter_id: 2,
    }

    const mockData: DashboardSchema[] = [
        {
            id: 1,
            name: 'Report 1',
            emoji: '📊',
            children: [],
            analytics_filter_id: 1,
        },
        {
            id: 2,
            name: 'Report 2',
            emoji: 'plus',
            children: [],
            analytics_filter_id: 2,
        },
        dashboardWithANestedChart,
    ]

    beforeEach(() => {
        useDashboardActionsMock.mockReturnValue({
            addChartToDashboardHandler: updateDashboardMock,
            getDashboardsHandler: () => mockData,
            removeChartFromDashboardHandler: removeChartFromDashboardMock,
            createDashboardHandler: createDashboardMock,
        } as any)

        AddChartToDashboardModalMock.mockReturnValue(
            <div>AddChartToDashboardModal</div>,
        )
    })

    it('should render the chart action menu with all the options and select one', () => {
        render(<ChartsActionMenu chartId="123" chartName={chartName} />, {
            storeState: defaultState,
        })

        const trigger = screen.getByRole('button', { name: ADD_TO_DASHBOARD })
        expect(trigger).toBeInTheDocument()
        userEvent.click(trigger)

        mockData.forEach((dashboard) => {
            if (dashboard.emoji) {
                expect(screen.getByText(dashboard.emoji)).toBeInTheDocument()
            }
            expect(screen.getByText(dashboard.name)).toBeInTheDocument()
        })
        const firstDashboard = screen.getByText(mockData[0].name)
        expect(firstDashboard).toBeInTheDocument()
        userEvent.click(firstDashboard)

        expect(updateDashboardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                chartId: '123',
                dashboard: mockData[0],
            }),
        )
        expect(screen.queryByText(mockData[0].name)).not.toBeInTheDocument()
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDashboardChartMenuAddToChartClicked,
        )
    })

    it('should filter out Dashboards that already contain the Chart', () => {
        render(<ChartsActionMenu chartId={chartId} chartName={chartName} />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByRole('button', { name: ADD_TO_DASHBOARD }))

        expect(
            screen.queryByText(dashboardWithANestedChart.name),
        ).not.toBeInTheDocument()
    })

    it('should contain filtered dashboards and show the add to dashboard action', () => {
        render(<ChartsActionMenu chartId={chartId} chartName={chartName} />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByRole('button', { name: ADD_TO_DASHBOARD }))

        expect(screen.getByText(mockData[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockData[1].name)).toBeInTheDocument()
        expect(screen.getByText(CREATE_NEW_DASHBOARD_LABEL)).toBeInTheDocument()
    })

    it('should disable the add to dashboards action if there are 10 dashboards', () => {
        const mockData = [
            { id: '1', name: 'Report 1', emoji: '📊', children: [] },
            { id: '2', name: 'Report 2', emoji: 'plus', children: [] },
            { id: '3', name: 'Report 3', emoji: 'plus', children: [] },
            { id: '4', name: 'Report 4', emoji: 'plus', children: [] },
            { id: '5', name: 'Report 5', emoji: 'plus', children: [] },
            { id: '6', name: 'Report 6', emoji: 'plus', children: [] },
            { id: '7', name: 'Report 7', emoji: 'plus', children: [] },
            { id: '8', name: 'Report 8', emoji: 'plus', children: [] },
            { id: '9', name: 'Report 9', emoji: 'plus', children: [] },
            { id: '10', name: 'Report 10', emoji: 'plus', children: [] },
        ]

        useDashboardActionsMock.mockReturnValue({
            getDashboardsHandler: () => mockData,
        } as any)

        render(<ChartsActionMenu chartId={chartId} chartName={chartName} />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByRole('button', { name: ADD_TO_DASHBOARD }))

        const button = screen.getByText(CREATE_NEW_DASHBOARD_LABEL)

        expect(button).toBeDisabled()

        act(() => {
            userEvent.click(button)
        })

        expect(AddChartToDashboardModalMock).not.toHaveBeenCalled()
    })

    it('should show label when no Dashboards', () => {
        useDashboardActionsMock.mockReturnValue({
            getDashboardsHandler: () => [],
        } as any)

        render(<ChartsActionMenu chartId={chartId} chartName={chartName} />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByRole('button', { name: ADD_TO_DASHBOARD }))

        expect(screen.getByText(NO_DASHBOARDS_LABEL)).toBeInTheDocument()
    })

    it('should render the action menu with the delete button if dashboardId is defined', () => {
        render(
            <ChartsActionMenu
                chartId={chartId}
                dashboard={dashboard}
                chartName={chartName}
            />,
            { storeState: defaultState },
        )

        userEvent.click(screen.getByRole('button', { name: 'Chart actions' }))
        const action = screen.getByText(REMOVE_FROM_DASHBOARD)

        act(() => {
            userEvent.click(action)
        })

        expect(removeChartFromDashboardMock).toHaveBeenCalledWith({
            chartId,
            dashboard,
        })
    })

    it('should render AddChartToDashboardModal when clicking on add to dashboard', () => {
        render(<ChartsActionMenu chartId={chartId} chartName={chartName} />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByRole('button', { name: ADD_TO_DASHBOARD }))

        act(() => {
            userEvent.click(screen.getByText(CREATE_NEW_DASHBOARD_LABEL))
        })

        expect(AddChartToDashboardModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                chartId,
                chartName: chartName,
                closeModal: expect.any(Function),
            }),
            {},
        )
    })

    it('should not render the chart action menu if the user is not an agent', () => {
        const { container } = render(
            <ChartsActionMenu chartId="123" chartName={chartName} />,
            {
                storeState: {
                    currentUser: fromJS({
                        ...user,
                        role: { name: UserRole.LiteAgent },
                    }),
                },
            },
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render a CSV export button for non-team-lead users when exportCsvAction is provided', () => {
        const onExportClick = jest.fn()

        render(
            <ChartsActionMenu
                chartId="123"
                chartName={chartName}
                exportCsvAction={{ onClick: onExportClick }}
            />,
            {
                storeState: {
                    currentUser: fromJS({
                        ...user,
                        role: { name: UserRole.LiteAgent },
                    }),
                },
            },
        )

        const button = screen.getByRole('button', { name: 'Export as CSV' })
        expect(button).toBeInTheDocument()

        userEvent.click(button)
        expect(onExportClick).toHaveBeenCalledTimes(1)
    })

    it('should show a back button in the picker when exportCsvAction is provided', () => {
        const onExportClick = jest.fn()

        render(
            <ChartsActionMenu
                chartId={chartId}
                chartName={chartName}
                exportCsvAction={{ onClick: onExportClick }}
            />,
            { storeState: defaultState },
        )

        act(() => {
            userEvent.click(
                screen.getByRole('button', { name: 'Chart actions' }),
            )
        })
        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        expect(
            screen.getByRole('button', { name: /arrow-chevron-left/ }),
        ).toBeInTheDocument()
    })

    it('should not show a back button in the picker when hasMultipleActions is false', () => {
        render(<ChartsActionMenu chartId={chartId} chartName={chartName} />, {
            storeState: defaultState,
        })

        userEvent.click(screen.getByRole('button', { name: ADD_TO_DASHBOARD }))

        expect(
            screen.queryByRole('button', { name: /arrow-chevron-left/ }),
        ).not.toBeInTheDocument()
    })

    it('should reopen the action menu when the back button in the picker is clicked', () => {
        render(
            <ChartsActionMenu
                chartId={chartId}
                chartName={chartName}
                dashboard={dashboard}
                exportCsvAction={{ onClick: jest.fn() }}
            />,
            { storeState: defaultState },
        )

        act(() => {
            userEvent.click(
                screen.getByRole('button', { name: 'Chart actions' }),
            )
        })

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        // Picker is open — back button and dashboard list are visible
        const backButton = screen.getByRole('button', {
            name: /arrow-chevron-left/,
        })
        expect(backButton).toBeInTheDocument()
        expect(screen.getByText(mockData[0].name)).toBeInTheDocument()

        act(() => {
            userEvent.click(backButton)
        })

        // Picker is gone — back button and dashboard list are no longer rendered
        expect(
            screen.queryByRole('button', { name: /arrow-chevron-left/ }),
        ).not.toBeInTheDocument()
        expect(screen.queryByText(mockData[0].name)).not.toBeInTheDocument()
        // Action menu is visible again
        expect(screen.getByText(ADD_TO_DASHBOARD)).toBeInTheDocument()
    })

    describe('when dashboard is provided via context instead of props', () => {
        it('shows the remove action when dashboard comes from context', () => {
            render(
                <DashboardChartProvider value={{ chartId, dashboard }}>
                    <ChartsActionMenu chartId={chartId} chartName={chartName} />
                </DashboardChartProvider>,
                { storeState: defaultState },
            )

            userEvent.click(
                screen.getByRole('button', { name: 'Chart actions' }),
            )
            expect(screen.getByText(REMOVE_FROM_DASHBOARD)).toBeInTheDocument()
        })
    })
})
