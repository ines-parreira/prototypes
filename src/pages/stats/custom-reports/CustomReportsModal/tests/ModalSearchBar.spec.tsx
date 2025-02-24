import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {REPORTS_CONFIG} from 'pages/stats/custom-reports/config'
import {ReportsIDs} from 'pages/stats/custom-reports/constants'
import {ModalSearchBar} from 'pages/stats/custom-reports/CustomReportsModal/ModalSearchBar'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

const setConfig = jest.fn()
const setSelectedReport = jest.fn()
const props = {
    config: REPORTS_CONFIG,
    setConfig,
    setSelectedReport,
}

describe('ModalSearchBar', () => {
    it('should call the setters on value change', async () => {
        render(<ModalSearchBar {...props} />, {})

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        const calledCharts = {
            ...SupportPerformanceOverviewReportConfig,
            charts: {
                [OverviewChart.MessagesPerTicketTrendCard]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesPerTicketTrendCard
                    ],
                [OverviewChart.MessagesSentGraph]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesSentGraph
                    ],
                [OverviewChart.MessagesSentTrendCard]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesSentTrendCard
                    ],
            },
        }
        expect(setConfig).toHaveBeenCalledTimes(value.length)
        expect(setConfig).toHaveBeenLastCalledWith([
            {
                category: 'Support Performance',
                children: [
                    {
                        type: OverviewChart,
                        config: calledCharts,
                        id: ReportsIDs.SupportPerformanceOverviewReportConfig,
                    },
                ],
            },
        ])

        expect(setSelectedReport).toHaveBeenCalledTimes(value.length)
        expect(setSelectedReport).toHaveBeenLastCalledWith(calledCharts)
    })

    it('should clear all values on clear', async () => {
        render(<ModalSearchBar {...props} />, {})

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        fireEvent.click(screen.getByText('close'))

        expect(screen.getByRole('textbox')).toHaveValue('')
        expect(setSelectedReport).toHaveBeenCalledWith(null)
        expect(setConfig).toHaveBeenCalledWith(REPORTS_CONFIG)
    })

    it('should manage no result case', async () => {
        render(<ModalSearchBar {...props} />, {})

        const value = 'NONEXISTENT_VALUE'

        const inputElement = screen.getByRole('textbox')
        await userEvent.type(inputElement, value)

        expect(setConfig).toHaveBeenLastCalledWith(null)
        expect(setSelectedReport).toHaveBeenLastCalledWith(null)
    })
})
