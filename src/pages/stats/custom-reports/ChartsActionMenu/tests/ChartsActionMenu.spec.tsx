import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {
    ADD_TO_DASHBOARD,
    ChartsActionMenu,
} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import {
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)

const updateCustomReportMock = jest.fn()

describe('<ChartsActionMenu />', () => {
    const chartId = 'someConfigId'
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
        return useCustomReportActionsMock.mockReturnValue({
            addChartToDashboardHandler: updateCustomReportMock,
            getDashboardsHandler: () => mockData,
            duplicateReportHandler: jest.fn(),
            deleteReportHandler: jest.fn(),
            updateDashboardHandler: jest.fn(),
        })
    })

    it('should render the chart action menu with all the options and select one', () => {
        render(<ChartsActionMenu chartId="123" />)

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
        render(<ChartsActionMenu chartId={chartId} />)

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
})
