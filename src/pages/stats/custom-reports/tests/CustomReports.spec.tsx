import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useHistory } from 'react-router-dom'

import { useCustomReportActions } from 'hooks/reporting/custom-reports/useCustomReportActions'
import { useDashboardNameValidation } from 'hooks/reporting/custom-reports/useDashboardNameValidation'
import { useReportRestrictions } from 'hooks/reporting/custom-reports/useReportRestrictions'
import { useNotify } from 'hooks/useNotify'
import { CreateCustomReport } from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {
    createDashboardName,
    CUSTOM_REPORT_CTA,
    CustomReports,
} from 'pages/stats/custom-reports/CustomReports'
import { MODAL_TITLE } from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'

import { DashboardInput } from '../types'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}))
const useHistoryMock = assumeMock(useHistory)

jest.mock('hooks/useAppDispatch')

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('hooks/reporting/custom-reports/useDashboardNameValidation')
const useDashboardNameValidationMock = assumeMock(useDashboardNameValidation)

jest.mock('pages/stats/custom-reports/CreateCustomReport/CreateCustomReport')
const CreateCustomReportMock = assumeMock(CreateCustomReport)

jest.mock('hooks/reporting/custom-reports/useCustomReportActions')
const useCustomReportActionsMock = assumeMock(useCustomReportActions)

jest.mock('hooks/reporting/custom-reports/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

describe('CustomReports', () => {
    const createDashboardHandlerMock = jest.fn()
    const historyPushMock = jest.fn()
    const notifyMock = jest.fn()

    beforeEach(() => {
        const mockedDate = new Date(2025, 0, 15, 12, 10)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)

        CreateCustomReportMock.mockImplementation(() => (
            <div>CreateCustomReport</div>
        ))

        useCustomReportActionsMock.mockReturnValue({
            isLoading: false,
            createDashboardHandler: createDashboardHandlerMock,
        } as any)

        useDashboardNameValidationMock.mockReturnValue({
            error: undefined,
            isValid: true,
            isInvalid: false,
        } as any)

        useHistoryMock.mockReturnValue({
            push: historyPushMock,
        } as any)

        useNotifyMock.mockReturnValue({ error: notifyMock } as any)
        useReportRestrictionsMock.mockReturnValue({ restrictionsMap: {} })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render the component', () => {
        render(<CustomReports />)

        expect(CreateCustomReportMock).toHaveBeenCalled()
    })

    it('should render Add Charts button', () => {
        render(<CustomReports />)

        const button = screen.getByText(CUSTOM_REPORT_CTA)
        expect(button).toBeInTheDocument()
    })

    it('should open modal when Add Charts button is clicked', async () => {
        render(<CustomReports />)

        const button = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText(MODAL_TITLE)).toBeInTheDocument()
        })
    })

    it('should have a default name', () => {
        render(<CustomReports />)

        const dashboardName = createDashboardName()

        expect(screen.getByRole('textbox')).toHaveValue(dashboardName)
    })

    it('should create a dashboard when modal is saved', async () => {
        render(<CustomReports />)

        const dashboardName = 'Dashboard'

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, { target: { value: dashboardName } })

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const searchInput = screen.getByRole('textbox', {
            name: 'Search charts',
        })
        fireEvent.change(searchInput, {
            target: { value: 'Average CSAT' },
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(createDashboardHandlerMock).toHaveBeenCalledTimes(1)
            expect(createDashboardHandlerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dashboard: {
                        name: dashboardName,
                        emoji: '',
                    },
                    chartIds: [OverviewChart.CustomerSatisfactionTrendCard],
                }),
            )
        })
    })

    it('should create a generic name if no name is provided', async () => {
        render(<CustomReports />)

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const searchInput = screen.getByRole('textbox', {
            name: 'Search charts',
        })
        fireEvent.change(searchInput, {
            target: { value: 'Average CSAT' },
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(createDashboardHandlerMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    dashboard: expect.objectContaining({
                        name: 'Untitled-2025-01-15-12-10',
                    }),
                }),
            )
        })
    })

    it('should redirect to the newly created dashboard on success', async () => {
        const id = 123

        useCustomReportActionsMock.mockReturnValue({
            isLoading: false,
            createDashboardHandler: ({
                onSuccess,
                dashboard,
            }: {
                onSuccess?: (data: any) => void
                dashboard: DashboardInput
            }) => {
                onSuccess && onSuccess({ ...dashboard, id })
                createDashboardHandlerMock({ dashboard, onSuccess })
            },
        } as any)

        render(<CustomReports />)

        const dashboardName = 'Dashboard'

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, { target: { value: dashboardName } })

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const searchInput = screen.getByRole('textbox', {
            name: 'Search charts',
        })
        fireEvent.change(searchInput, {
            target: { value: 'Average CSAT' },
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(historyPushMock).toHaveBeenCalledTimes(1)
            expect(historyPushMock).toHaveBeenCalledWith(
                expect.stringContaining(String(id)),
            )
        })
    })

    it('should not display error on input blur when validation passes', () => {
        useDashboardNameValidationMock.mockReturnValue({
            error: undefined,
            isValid: true,
            isInvalid: false,
        } as any)

        render(<CustomReports />)

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, { target: { value: 'valid name' } })
        fireEvent.blur(nameInput)

        expect(notifyMock).not.toHaveBeenCalled()
    })
})
