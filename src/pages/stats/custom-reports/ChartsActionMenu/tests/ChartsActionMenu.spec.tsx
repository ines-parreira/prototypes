import {act, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'

import {UserRole} from 'config/types/user'
import {user} from 'fixtures/users'
import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {AddChartToDashboardModal} from 'pages/stats/custom-reports/ChartsActionMenu/AddChartToDashboardModal'
import {
    ADD_TO_DASHBOARD,
    ADD_TO_DASHBOARD_CTA,
    ChartsActionMenu,
    NO_DASHBOARDS_LABEL,
    REMOVE_FROM_DASHBOARD,
} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import {
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {OverviewChart} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)
jest.mock(
    'pages/stats/custom-reports/ChartsActionMenu/AddChartToDashboardModal'
)
const AddChartToDashboardModalMock = assumeMock(AddChartToDashboardModal)

const updateCustomReportMock = jest.fn()
const removeChartFromDashboardMock = jest.fn()
const createDashboardMock = jest.fn()
const chartName = 'chartName'

const dashboard: CustomReportSchema = {
    id: 1,
    name: 'Test Report',
    emoji: '📊',
    children: [],
    analytics_filter_id: 123,
}

const defaultState = {
    currentUser: fromJS({...user, role: {name: UserRole.Agent}}),
}

describe('<ChartsActionMenu />', () => {
    const chartId = OverviewChart.MedianResolutionTimeTrendCard

    const dashboardWithANestedChart: CustomReportSchema = {
        id: 3,
        name: 'Report 3',
        emoji: 'minus',
        children: [
            {
                type: CustomReportChildType.Row,
                children: [
                    {type: CustomReportChildType.Chart, config_id: chartId},
                ],
            },
        ],
        analytics_filter_id: 2,
    }

    const mockData: CustomReportSchema[] = [
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
        useCustomReportActionsMock.mockReturnValue({
            addChartToDashboardHandler: updateCustomReportMock,
            getDashboardsHandler: () => mockData,
            removeChartFromDashboardHandler: removeChartFromDashboardMock,
            createDashboardHandler: createDashboardMock,
        } as any)

        AddChartToDashboardModalMock.mockReturnValue(
            <div>AddChartToDashboardModal</div>
        )
    })

    it('should render the chart action menu with all the options and select one', () => {
        renderWithStore(
            <ChartsActionMenu chartId="123" chartName={chartName} />,
            defaultState
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
        expect(updateCustomReportMock).toHaveBeenCalledWith(
            expect.objectContaining({
                chartId: '123',
                dashboard: mockData[0],
            })
        )
        expect(screen.queryByText(mockData[0].name)).not.toBeInTheDocument()
    })

    it('should filter out Dashboards that already contain the Chart', () => {
        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState
        )

        const menu = screen.getByText('more_vert')
        userEvent.click(menu)
        const action = screen.getByText(ADD_TO_DASHBOARD)
        act(() => {
            userEvent.click(action)
        })

        expect(
            screen.queryByText(dashboardWithANestedChart.name)
        ).not.toBeInTheDocument()
    })

    it('should contain filtered dashboards and show the add to dashboard action', () => {
        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        expect(screen.getByText(mockData[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockData[1].name)).toBeInTheDocument()
        expect(screen.getByText(ADD_TO_DASHBOARD_CTA)).toBeInTheDocument()
    })

    it('should disable the add to dashboards action if there are 10 dashboards', () => {
        const mockData = [
            {id: '1', name: 'Report 1', emoji: '📊', children: []},
            {id: '2', name: 'Report 2', emoji: 'plus', children: []},
            {id: '3', name: 'Report 3', emoji: 'plus', children: []},
            {id: '4', name: 'Report 4', emoji: 'plus', children: []},
            {id: '5', name: 'Report 5', emoji: 'plus', children: []},
            {id: '6', name: 'Report 6', emoji: 'plus', children: []},
            {id: '7', name: 'Report 7', emoji: 'plus', children: []},
            {id: '8', name: 'Report 8', emoji: 'plus', children: []},
            {id: '9', name: 'Report 9', emoji: 'plus', children: []},
            {id: '10', name: 'Report 10', emoji: 'plus', children: []},
        ]

        useCustomReportActionsMock.mockReturnValue({
            getDashboardsHandler: () => mockData,
        } as any)

        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        const button = screen.getByText(ADD_TO_DASHBOARD_CTA)

        expect(button).toHaveClass('disabled')

        act(() => {
            userEvent.click(button)
        })

        expect(AddChartToDashboardModalMock).not.toHaveBeenCalled()
    })

    it('should show label when no Dashboards ', () => {
        useCustomReportActionsMock.mockReturnValue({
            getDashboardsHandler: () => [],
        } as any)

        renderWithStore(
            <ChartsActionMenu chartId={chartId} chartName={chartName} />,
            defaultState
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
            defaultState
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
            defaultState
        )

        userEvent.click(screen.getByText('more_vert'))

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD))
        })

        act(() => {
            userEvent.click(screen.getByText(ADD_TO_DASHBOARD_CTA))
        })

        expect(AddChartToDashboardModalMock).toHaveBeenCalledWith(
            expect.objectContaining({
                chartId,
                chartName: chartName,
                closeModal: expect.any(Function),
            }),
            {}
        )
    })

    it('should not render the chart action menu if the user is not an agent', () => {
        const {container} = renderWithStore(
            <ChartsActionMenu chartId="123" chartName={chartName} />,
            {
                currentUser: fromJS({
                    ...user,
                    role: {name: UserRole.LiteAgent},
                }),
            }
        )

        expect(container).toBeEmptyDOMElement()
    })
})
