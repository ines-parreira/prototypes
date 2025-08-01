import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import * as constants from 'domains/reporting/pages/dashboards/config'
import { CHARTS_MODAL_ICONS } from 'domains/reporting/pages/dashboards/DashboardsModal/ChartIcon'
import {
    ADD_CHARTS_CTA,
    DashboardsModal,
    GRAPH_DESCRIPTION,
    MODAL_TITLE,
    NO_SEARCH_RESULT,
    READ_MORE_ABOUT_CHARTS,
} from 'domains/reporting/pages/dashboards/DashboardsModal/DashboardsModal'
import {
    DashboardChildType,
    DashboardSchema,
    ReportsModalConfig,
} from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import useAppDispatch from 'hooks/useAppDispatch'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@gorgias/helpdesk-queries')
jest.mock('state/notifications/actions')
jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

describe('AddChartsModal', () => {
    const dispatchMock = jest.fn()
    const mutateUpdateReportMock = jest.fn()
    const updateMutateMock = jest.fn()

    const charts: DashboardSchema['children'] = [
        {
            type: DashboardChildType.Row,
            children: [
                {
                    type: DashboardChildType.Chart,
                    config_id: OverviewMetric.MedianFirstResponseTime,
                },
            ],
        },
        {
            type: DashboardChildType.Chart,
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
                }) as unknown as QueryClient,
        )
        useDashboardActionsMock.mockReturnValue({
            updateDashboardHandler: mutateUpdateReportMock,
        } as any)
        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })
    })

    it('should render correctly', () => {
        render(<DashboardsModal {...props} />, {})

        expect(screen.getByText(ADD_CHARTS_CTA)).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText(MODAL_TITLE)).toBeInTheDocument()
        expect(screen.getByText(GRAPH_DESCRIPTION)).toBeInTheDocument()
        expect(screen.getByText(READ_MORE_ABOUT_CHARTS)).toBeInTheDocument()
    })

    it.each(mockConfig)(
        'should render category name and their reports names',
        (category) => {
            render(<DashboardsModal {...props} />, {})

            expect(screen.getByText(category.category)).toBeInTheDocument()
            category.children.map((child) => {
                expect(
                    screen.getByText(child.config.reportName),
                ).toBeInTheDocument()
            })
        },
    )

    it('should select a chart and show its description and icon', async () => {
        render(<DashboardsModal {...props} />, {})

        const firstChartDescription =
            OverviewMetricConfig[OverviewMetric.CustomerSatisfaction].hint.title
        expect(
            screen.queryByText(String(firstChartDescription)),
        ).not.toBeInTheDocument()
        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE),
        )
        expect(
            screen.getByText(String(firstChartDescription)),
        ).toBeInTheDocument()

        userEvent.hover(screen.getAllByRole('img')[0])
        await waitFor(() => {
            expect(
                screen.getByText(CHARTS_MODAL_ICONS.card.tooltip),
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
        render(<DashboardsModal {...props} onSave={mockHandleSave} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE),
        )
        userEvent.click(screen.getByText(String(firstChartDescription)))

        fireEvent.click(screen.getByText(`${ADD_CHARTS_CTA} (3)`))

        expect(mockHandleSave).toHaveBeenCalledWith([
            OverviewChart.CustomerSatisfactionTrendCard,
            OverviewMetric.MedianFirstResponseTime,
            OverviewMetric.MedianResolutionTime,
        ])
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDashboardModalAddChartsClicked,
        )
    })

    it('should select a value and not be able to call the update method', () => {
        render(<DashboardsModal {...props} charts={undefined} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE),
        )
    })

    it('should show a notification error if the number of selected charts is more than MAX_CHECKED_CHARTS', () => {
        jest.spyOn(constants, 'MAX_CHECKED_CHARTS', 'get').mockReturnValue(
            1 as any,
        )

        render(<DashboardsModal {...props} />, {})

        fireEvent.click(
            screen.getByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE),
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
    })

    it('should should not return selectableReports if config is null', () => {
        const charts: DashboardSchema['children'] = [
            {
                type: DashboardChildType.Row,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'randomChartId',
                    },
                ],
            },
        ]
        const localProps = {
            ...props,
            charts,
        }
        render(<DashboardsModal {...localProps} />, {})

        const searchInput = screen.getByLabelText('Search charts')
        act(() => {
            userEvent.paste(searchInput, 'randomChartName')
        })

        expect(screen.getByText(NO_SEARCH_RESULT)).toBeInTheDocument()
        expect(screen.getByText(READ_MORE_ABOUT_CHARTS)).toBeInTheDocument()
        expect(
            screen.queryByText(SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE),
        ).not.toBeInTheDocument()
    })

    it('should have a separator if we have 2 or more elements', () => {
        const { container } = render(<DashboardsModal {...props} />, {})

        expect(container.getElementsByClassName('separator')).toBeTruthy()
    })
})
