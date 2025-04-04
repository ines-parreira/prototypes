import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useHistory } from 'react-router-dom'

import { useDashboardActions } from 'hooks/reporting/dashboards/useDashboardActions'
import { useDashboardNameValidation } from 'hooks/reporting/dashboards/useDashboardNameValidation'
import { useReportRestrictions } from 'hooks/reporting/dashboards/useReportRestrictions'
import { useNotify } from 'hooks/useNotify'
import { CreateDashboard } from 'pages/stats/dashboards/CreateDashboard/CreateDashboard'
import {
    createDashboardName,
    DASHBOARD_CTA,
    Dashboards,
} from 'pages/stats/dashboards/Dashboards'
import { MODAL_TITLE } from 'pages/stats/dashboards/DashboardsModal/DashboardsModal'
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

jest.mock('pages/stats/common/drill-down/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('hooks/reporting/dashboards/useDashboardNameValidation')
const useDashboardNameValidationMock = assumeMock(useDashboardNameValidation)

jest.mock('pages/stats/dashboards/CreateDashboard/CreateDashboard')
const CreateDashboardMock = assumeMock(CreateDashboard)

jest.mock('hooks/reporting/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)

jest.mock('hooks/reporting/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

describe('Dashboards', () => {
    const createDashboardHandlerMock = jest.fn()
    const historyPushMock = jest.fn()
    const notifyMock = jest.fn()

    beforeEach(() => {
        const mockedDate = new Date(2025, 0, 15, 12, 10)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)

        CreateDashboardMock.mockImplementation(() => <div>CreateDashboard</div>)

        useDashboardActionsMock.mockReturnValue({
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
        useReportRestrictionsMock.mockReturnValue({
            reportRestrictionsMap: {},
            chartRestrictionsMap: {},
            moduleRestrictionsMap: {},
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render the component', () => {
        render(<Dashboards />)

        expect(CreateDashboardMock).toHaveBeenCalled()
    })

    it('should render Add Charts button', () => {
        render(<Dashboards />)

        const button = screen.getByText(DASHBOARD_CTA)
        expect(button).toBeInTheDocument()
    })

    it('should open modal when Add Charts button is clicked', async () => {
        render(<Dashboards />)

        const button = screen.getByText(DASHBOARD_CTA)
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText(MODAL_TITLE)).toBeInTheDocument()
        })
    })

    it('should have a default name', () => {
        render(<Dashboards />)

        const dashboardName = createDashboardName()

        expect(screen.getByRole('textbox')).toHaveValue(dashboardName)
    })

    it('should create a dashboard when modal is saved', async () => {
        render(<Dashboards />)

        const dashboardName = 'Dashboard'

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, { target: { value: dashboardName } })

        const addChartsButton = screen.getByText(DASHBOARD_CTA)
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
        render(<Dashboards />)

        const addChartsButton = screen.getByText(DASHBOARD_CTA)
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
                        name: createDashboardName(),
                    }),
                }),
            )
        })
    })

    it('should redirect to the newly created dashboard on success', async () => {
        const id = 123

        useDashboardActionsMock.mockReturnValue({
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

        render(<Dashboards />)

        const dashboardName = 'Dashboard'

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, { target: { value: dashboardName } })

        const addChartsButton = screen.getByText(DASHBOARD_CTA)
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

        render(<Dashboards />)

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, { target: { value: 'valid name' } })
        fireEvent.blur(nameInput)

        expect(notifyMock).not.toHaveBeenCalled()
    })
})
