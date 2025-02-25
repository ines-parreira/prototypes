import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { useCustomReportActions } from 'hooks/reporting/custom-reports/useCustomReportActions'
import { useDashboardNameValidation } from 'hooks/reporting/custom-reports/useDashboardNameValidation'
import {
    AddChartToDashboardModal,
    CREATE_DASHBOARD,
    DASHBOARD_NAME,
    getModalTitle,
} from 'pages/stats/custom-reports/ChartsActionMenu/AddChartToDashboardModal'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'

const chartId = OverviewChart.MedianResolutionTimeTrendCard
const chartName = 'Median Resolution Time Trend Card'

const closeModalMock = jest.fn()
const createDashboardMock = jest.fn()

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)

jest.mock('hooks/reporting/custom-reports/useDashboardNameValidation')
const useDashboardNameValidationMock = assumeMock(useDashboardNameValidation)

describe('AddChartToDashboardModal', () => {
    beforeEach(() => {
        useCustomReportActionsMock.mockReturnValue({
            createDashboardHandler: createDashboardMock,
        } as any)

        useDashboardNameValidationMock.mockReturnValue({
            error: undefined,
            isValid: true,
            isInvalid: false,
        } as any)
    })

    it('should render the modal', () => {
        render(
            <AddChartToDashboardModal
                chartId={chartId}
                closeModal={closeModalMock}
                chartName={chartName}
            />,
        )

        expect(screen.getByText(getModalTitle(chartName))).toBeInTheDocument()
        expect(screen.getByText(DASHBOARD_NAME)).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText(CREATE_DASHBOARD)).toBeInTheDocument()
    })

    it('should write a dashboard name and call create action', () => {
        render(
            <AddChartToDashboardModal
                chartId={chartId}
                closeModal={closeModalMock}
                chartName={chartName}
            />,
        )

        const name = 'My Custom Dashboard'
        const nameInput = screen.getByRole('textbox')
        expect(nameInput).toBeInTheDocument()
        fireEvent.change(nameInput, { target: { value: name } })

        act(() => {
            fireEvent.click(screen.getByText(CREATE_DASHBOARD))
        })

        expect(createDashboardMock).toHaveBeenCalledWith({
            chartIds: [chartId],
            dashboard: { name, emoji: '' },
            onSuccess: closeModalMock,
        })
    })

    it('should call closeModal when cancel is clicked', () => {
        render(
            <AddChartToDashboardModal
                chartId={chartId}
                closeModal={closeModalMock}
                chartName={chartName}
            />,
        )

        fireEvent.click(screen.getByText('Cancel'))
        expect(closeModalMock).toHaveBeenCalled()
    })

    it('should not call action if theres an error', () => {
        useDashboardNameValidationMock.mockReturnValue({
            error: 'Invalid dashboard name',
            isValid: false,
            isInvalid: true,
        })

        render(
            <AddChartToDashboardModal
                chartId={chartId}
                closeModal={closeModalMock}
                chartName={chartName}
            />,
        )

        const name = '1'
        const nameInput = screen.getByRole('textbox')
        expect(nameInput).toBeInTheDocument()
        fireEvent.change(nameInput, { target: { value: name } })

        act(() => {
            fireEvent.click(screen.getByText(CREATE_DASHBOARD))
        })

        expect(createDashboardMock).not.toHaveBeenCalled()
    })
})
