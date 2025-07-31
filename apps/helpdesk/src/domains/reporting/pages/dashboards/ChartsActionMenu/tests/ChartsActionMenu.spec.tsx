import React from 'react'

import { userEvent } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
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
import {
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { user } from 'fixtures/users'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/AddChartToDashboardModal',
)
const AddChartToDashboardModalMock = assumeMock(AddChartToDashboardModal)
jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('<ChartsActionMenu />', () => {
    const updateDashboardMock = jest.fn()
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
        renderWithStore(
            <ChartsActionMenu chartId="123" chartName={chartName} />,
            defaultState,
        )

        const menu = screen.getByText('more_vert')
        expect(menu).toBeInTheDocument()
        userEvent.click(menu)
        const action = screen.getByText(ADD_TO_DASHBOARD)

        // show the dashboard list
        expect(action).toBeInTheDocument()
        act(() => {
            userEvent.click(action)
        })
        mockData.forEach((dashboard) => {
            if (dashboard.emoji) {
                expect(screen.getByText(dashboard.emoji)).toBeInTheDocument()
            }
            expect(screen.getByText(dashboard.name)).toBeInTheDocument()
        })
        const firstDashboard = screen.getByText(mockData[0].name)
        expect(firstDashboard).toBeInTheDocument()
        userEvent.click(firstDashboard)

        // selects the first dashboard
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
        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState,
        )

        const menu = screen.getByText('more_vert')
        userEvent.click(menu)
        const action = screen.getByText(ADD_TO_DASHBOARD)
        act(() => {
            userEvent.click(action)
        })

        expect(
            screen.queryByText(dashboardWithANestedChart.name),
        ).not.toBeInTheDocument()
    })

    it('should contain filtered dashboards and show the add to dashboard action', () => {
        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState,
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

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

        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState,
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        const button = screen.getByText(CREATE_NEW_DASHBOARD_LABEL)

        expect(button).toHaveClass('disabled')

        act(() => {
            userEvent.click(button)
        })

        expect(AddChartToDashboardModalMock).not.toHaveBeenCalled()
    })

    it('should show label when no Dashboards ', () => {
        useDashboardActionsMock.mockReturnValue({
            getDashboardsHandler: () => [],
        } as any)

        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState,
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        expect(screen.getByText(NO_DASHBOARDS_LABEL)).toBeInTheDocument()
    })

    it('should render the action menu with the delete button if dashboardId is defined', () => {
        renderWithStore(
            <ChartsActionMenu
                chartId={chartId}
                dashboard={dashboard}
                chartName={chartName}
            />,
            defaultState,
        )

        userEvent.click(screen.getByText('more_vert'))
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
        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState,
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

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
        const { container } = renderWithStore(
            <ChartsActionMenu chartId="123" chartName={chartName} />,
            {
                currentUser: fromJS({
                    ...user,
                    role: { name: UserRole.LiteAgent },
                }),
            },
        )

        expect(container).toBeEmptyDOMElement()
    })
})
