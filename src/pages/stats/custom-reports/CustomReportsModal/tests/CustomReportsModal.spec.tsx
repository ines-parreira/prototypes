import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'

import {useCustomReportActions} from 'hooks/reporting/custom-reports/useCustomReportActions'
import {useReportRestrictions} from 'hooks/reporting/custom-reports/useReportRestrictions'
import useAppDispatch from 'hooks/useAppDispatch'
import * as constants from 'pages/stats/custom-reports/config'
import {ReportsIDs} from 'pages/stats/custom-reports/config'
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

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@gorgias/api-queries')
jest.mock('state/notifications/actions')
jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)

jest.mock('hooks/reporting/custom-reports/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('AddChartsModal', () => {
    const dispatchMock = jest.fn()
    const mutateUpdateReportMock = jest.fn()
    const updateMutateMock = jest.fn()

    const charts: CustomReportSchema['children'] = [
        {
            type: CustomReportChildType.Row,
            children: [
                {
                    type: CustomReportChildType.Chart,
                    config_id: OverviewMetric.MedianFirstResponseTime,
                },
            ],
        },
        {
            type: CustomReportChildType.Chart,
            config_id: OverviewMetric.MedianResolutionTime,
        },
    ]

    const props = {
        onCancel: jest.fn(),
        onSave: jest.fn(),
        charts,
        isOpen: true,
    }

    const customerSatisfactionMetric =
        OverviewChart.CustomerSatisfactionTrendCard
    const firstChartDescription =
        SupportPerformanceOverviewReportConfig.charts[
            customerSatisfactionMetric
        ].label
    const mockConfig: ReportsModalConfig = [
        {
            category: 'Support Performance',
            children: [
                {
                    type: OverviewChart,
                    config: SupportPerformanceOverviewReportConfig,
                    id: ReportsIDs.SupportPerformanceOverviewReportConfig,
                },
            ],
        },
    ]

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: updateMutateMock,
                }) as unknown as QueryClient
        )
        useCustomReportActionsMock.mockReturnValue({
            updateDashboardHandler: mutateUpdateReportMock,
        } as any)
        useReportRestrictionsMock.mockReturnValue({restrictionsMap: {}})
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
        const mockHandleSave = jest.fn()
        render(<CustomReportsModal {...props} onSave={mockHandleSave} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        )
        userEvent.click(screen.getByText(String(firstChartDescription)))

        fireEvent.click(screen.getByText(`${ADD_CHARTS_CTA} (3)`))

        expect(mockHandleSave).toHaveBeenCalledWith(
            [
                {
                    children: [
                        {
                            config_id: customerSatisfactionMetric,
                            type: CustomReportChildType.Chart,
                        },
                        {
                            config_id: OverviewMetric.MedianFirstResponseTime,
                            type: CustomReportChildType.Chart,
                        },
                        {
                            type: CustomReportChildType.Chart,
                            config_id: OverviewMetric.MedianResolutionTime,
                        },
                    ],
                    type: CustomReportChildType.Row,
                },
            ],
            3
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDashboardModalAddChartsClicked
        )
    })

    it('should select a value and not be able to call the update method', () => {
        render(<CustomReportsModal {...props} charts={undefined} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        )
    })

    it('should show a notification error if the number of selected charts is more than MAX_CHECKED_CHARTS', () => {
        jest.replaceProperty(constants, 'MAX_CHECKED_CHARTS', 1 as any)

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

        expect(useAppDispatchMock).toHaveBeenCalled()
        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'You cannot select more than 1 charts',
            status: NotificationStatus.Error,
        })
    })

    it('should should not return selectableReports if config is null', () => {
        const charts: CustomReportSchema['children'] = [
            {
                type: CustomReportChildType.Row,
                children: [
                    {
                        type: CustomReportChildType.Chart,
                        config_id: 'randomChartId',
                    },
                ],
            },
        ]
        const localProps = {
            ...props,
            charts,
        }
        render(<CustomReportsModal {...localProps} />, {})

        const searchInput = screen.getByLabelText('Search charts')
        act(() => {
            userEvent.paste(searchInput, 'randomChartName')
        })

        expect(screen.getByText(NO_SEARCH_RESULT)).toBeInTheDocument()
        expect(screen.getByText(READ_MORE_ABOUT_CHARTS)).toBeInTheDocument()
        expect(
            screen.queryByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE)
        ).not.toBeInTheDocument()
    })

    it('should have a separator if we have 2 or more elements', () => {
        const {container} = render(<CustomReportsModal {...props} />, {})

        expect(container.getElementsByClassName('separator')).toBeTruthy()
    })
})
