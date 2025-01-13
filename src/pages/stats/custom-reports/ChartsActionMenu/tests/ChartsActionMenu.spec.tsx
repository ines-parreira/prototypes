import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {
    ADD_TO_DASHBOARD,
    ChartsActionMenu,
} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {assumeMock} from 'utils/testing'

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
]

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)

const updateCustomReportMock = jest.fn()

describe('<ChartsActionMenu />', () => {
    beforeEach(() => {
        return useCustomReportActionsMock.mockReturnValue({
            addChartToDashboardHandler: updateCustomReportMock,
            getDashboardsHandler: () => mockData,
            duplicateReportHandler: jest.fn(),
            deleteReportHandler: jest.fn(),
            updateDashboardHandler: jest.fn(),
        })
    })

    it('should render the chart action menu with all the options and select one', async () => {
        render(<ChartsActionMenu chartId="123" />)

        const menu = screen.getByText('more_vert')
        expect(menu).toBeInTheDocument()
        userEvent.click(menu)
        const action = screen.getByText(ADD_TO_DASHBOARD)

        // show the dashboard list
        expect(action).toBeInTheDocument()
        await waitFor(() => {
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
})
