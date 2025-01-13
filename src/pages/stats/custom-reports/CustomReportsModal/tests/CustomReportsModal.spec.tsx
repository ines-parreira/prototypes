import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import useAppDispatch from 'hooks/useAppDispatch'
import * as constants from 'pages/stats/custom-reports/config'
import {CHARTS_MODAL_ICONS} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import {
    ADD_CHARTS_CTA,
    CustomReportsModal,
    GRAPH_DESCRIPTION,
    READ_MORE_ABOUT_CHARTS,
    MODAL_TITLE,
    NO_SEARCH_RESULT,
} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {
    CustomReportChildType,
    CustomReportSchema,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock} from 'utils/testing'

const customReport: CustomReportSchema = {
    id: 2,
    analytics_filter_id: 1,
    name: 'some report',
    emoji: null,
    children: [
        {
            type: CustomReportChildType.Row,
            children: [
                {
                    type: CustomReportChildType.Chart,
                    config_id: OverviewMetric.MedianFirstResponseTime,
                },
            ],
        },
    ],
}

const props = {
    setIsOpen: jest.fn(),
    customReport,
    isOpen: true,
}
const dispatchMock = jest.fn()
const mutateUpdateReportMock = jest.fn()
const useQueryClientMock = assumeMock(useQueryClient)
const updateMutateMock = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('@gorgias/api-queries')
jest.mock('state/notifications/actions')
jest.mock('@tanstack/react-query')

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)
const useAppDispatchMock = assumeMock(useAppDispatch)

const customerSatisfactionMetric = OverviewChart.CustomerSatisfactionTrendCard
const firstChartDescription =
    SupportPerformanceOverviewReportConfig.charts[customerSatisfactionMetric]
        .label
const mockConfig: ReportsModalConfig = [
    {
        category: 'Support Performance',
        children: [
            {
                type: OverviewChart,
                config: SupportPerformanceOverviewReportConfig,
            },
        ],
    },
]

describe('AddChartsModal', () => {
    beforeEach(() => {
        Object.defineProperty(constants, 'REPORTS_MODAL_CONFIG', {
            value: mockConfig,
        })

        useAppDispatchMock.mockReturnValue(dispatchMock)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: updateMutateMock,
                }) as unknown as QueryClient
        )
        return useCustomReportActionsMock.mockReturnValue({
            updateDashboardHandler: mutateUpdateReportMock,
            getDashboardsHandler: jest.fn(),
            duplicateReportHandler: jest.fn(),
            deleteReportHandler: jest.fn(),
            addChartToDashboardHandler: jest.fn(),
        })
    })

    it('should render correctly', () => {
        render(<CustomReportsModal {...props} />, {})

        expect(screen.getByText(ADD_CHARTS_CTA)).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText(MODAL_TITLE)).toBeInTheDocument()
        expect(screen.getByText(GRAPH_DESCRIPTION)).toBeInTheDocument()
        expect(screen.getByText(READ_MORE_ABOUT_CHARTS)).toBeInTheDocument()
    })

    it.each(mockConfig)(
        'should render category name and their reports names',
        (category) => {
            render(<CustomReportsModal {...props} />, {})

            expect(screen.getByText(category.category)).toBeInTheDocument()
            category.children.map((child) => {
                expect(
                    screen.getByText(child.config.reportName)
                ).toBeInTheDocument()
            })
        }
    )

    it('should select a chart and show its description and icon', async () => {
        render(<CustomReportsModal {...props} />, {})

        const firstChartDescription =
            OverviewMetricConfig[OverviewMetric.CustomerSatisfaction].hint.title
        expect(
            screen.queryByText(String(firstChartDescription))
        ).not.toBeInTheDocument()
        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        )
        expect(
            screen.getByText(String(firstChartDescription))
        ).toBeInTheDocument()

        userEvent.hover(screen.getAllByRole('img')[0])
        await waitFor(() => {
            expect(
                screen.getByText(CHARTS_MODAL_ICONS.card.tooltip)
            ).toBeInTheDocument()
        })

        expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
        userEvent.click(screen.getByText(String(firstChartDescription)))
        expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
        userEvent.click(screen.getAllByRole('img')[0])
        expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
    })

    it('should select a value and call the update method', () => {
        render(<CustomReportsModal {...props} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        )
        userEvent.click(screen.getByText(String(firstChartDescription)))

        fireEvent.click(screen.getByText(`${ADD_CHARTS_CTA} (2)`))

        expect(mutateUpdateReportMock).toHaveBeenCalledWith(
            expect.objectContaining({
                chartIds: [
                    OverviewMetric.MedianFirstResponseTime,
                    customerSatisfactionMetric,
                ],
                dashboard: {
                    analytics_filter_id: 1,
                    children: [
                        {
                            children: [
                                {
                                    config_id:
                                        OverviewMetric.MedianFirstResponseTime,
                                    type: CustomReportChildType.Chart,
                                },
                            ],
                            type: CustomReportChildType.Row,
                        },
                    ],
                    emoji: null,
                    id: 2,
                    name: 'some report',
                },
            })
        )
    })

    it('closing the modal should reset all states', () => {
        const {container} = render(<CustomReportsModal {...props} />, {})

        fireEvent.keyDown(container, {key: 'Escape'})

        expect(props.setIsOpen).toHaveBeenCalled()
        expect(
            screen.queryByText(String(firstChartDescription))
        ).not.toBeInTheDocument()
    })

    it('should show a notification error if the number of selected charts is more than MAX_CHECKED_CHARTS', () => {
        Object.defineProperty(constants, 'MAX_CHECKED_CHARTS', {
            value: 1,
        })

        render(<CustomReportsModal {...props} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        )
        userEvent.click(screen.getByText(String(firstChartDescription)))

        const medianFirstResponseTimeTrendCard =
            OverviewChart.MedianFirstResponseTimeTrendCard

        const secondChartDescription =
            SupportPerformanceOverviewReportConfig.charts[
                medianFirstResponseTimeTrendCard
            ].label

        userEvent.click(screen.getByText(String(secondChartDescription)))

        expect(dispatchMock).toHaveBeenCalled()
        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'You cannot select more than 1 charts',
            status: NotificationStatus.Error,
        })
    })

    it('should should not return selectableReports if config is null', () => {
        Object.defineProperty(constants, 'REPORTS_MODAL_CONFIG', {
            value: null,
        })

        render(<CustomReportsModal {...props} />, {})

        expect(screen.getByText(NO_SEARCH_RESULT)).toBeInTheDocument()
        expect(screen.getByText(READ_MORE_ABOUT_CHARTS)).toBeInTheDocument()
        expect(
            screen.queryByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        ).not.toBeInTheDocument()
    })

    it('should have a separator if we have 2 or more elements', () => {
        Object.defineProperty(
            constants,
            'REPORTS_MODAL_CONFIG',
            constants.REPORTS_MODAL_CONFIG
        )

        const {container} = render(<CustomReportsModal {...props} />, {})

        expect(container.getElementsByClassName('separator')).toBeTruthy()
    })
})
