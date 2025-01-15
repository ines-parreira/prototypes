import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {useHistory} from 'react-router-dom'

import {useCreateCustomReport} from 'hooks/reporting/custom-reports/useCreateCustomReport'
import useAppDispatch from 'hooks/useAppDispatch'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {
    CUSTOM_REPORT_CTA,
    CustomReports,
} from 'pages/stats/custom-reports/CustomReports'
import {
    ADD_CHARTS_CTA,
    MODAL_TITLE,
} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {assumeMock} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}))
const useHistoryMock = assumeMock(useHistory)

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('hooks/reporting/custom-reports/useCreateCustomReport')
const useCreateCustomReportMock = assumeMock(useCreateCustomReport)

jest.mock('pages/stats/custom-reports/CreateCustomReport/CreateCustomReport')
const CreateCustomReportMock = assumeMock(CreateCustomReport)

describe('CustomReports', () => {
    const createCustomReportMock = jest.fn()
    const historyPushMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        const mockedDate = new Date(2025, 0, 15, 12, 10)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)

        CreateCustomReportMock.mockImplementation(() => (
            <div>CreateCustomReport</div>
        ))

        useCreateCustomReportMock.mockReturnValue({
            isLoading: false,
            createCustomReport: createCustomReportMock,
        } as any)

        useHistoryMock.mockReturnValue({
            push: historyPushMock,
        } as any)

        useAppDispatchMock.mockReturnValue(dispatchMock)
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

    it('should create a dashboard when modal is saved', async () => {
        render(<CustomReports />)

        const dashboardName = 'Dashboard'

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, {target: {value: dashboardName}})

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'Customer satisfaction'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(createCustomReportMock).toHaveBeenCalledTimes(1)
            expect(createCustomReportMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: dashboardName,
                    emoji: '',
                    children: expect.arrayContaining([
                        expect.objectContaining({
                            children: expect.arrayContaining([
                                expect.any(Object),
                            ]),
                            type: 'row',
                        }),
                    ]),
                })
            )
        })
    })

    it('should create a generic name if no name is provided', async () => {
        render(<CustomReports />)

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'Customer satisfaction'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(createCustomReportMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Untitled-2025-01-15-12-10',
                })
            )
        })
    })

    it('should redirect to the newly created dashboard on success', async () => {
        const id = 123

        createCustomReportMock.mockResolvedValueOnce({data: {id}})

        render(<CustomReports />)

        const dashboardName = 'Dashboard'

        const nameInput = screen.getByRole('textbox')
        fireEvent.change(nameInput, {target: {value: dashboardName}})

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'Customer satisfaction'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(historyPushMock).toHaveBeenCalledTimes(1)
            expect(historyPushMock).toHaveBeenCalledWith(
                expect.stringContaining(String(id))
            )
        })
    })

    it('should notify on error', async () => {
        createCustomReportMock.mockRejectedValueOnce(new Error('Bad Request'))

        render(<CustomReports />)

        const addChartsButton = screen.getByText(CUSTOM_REPORT_CTA)
        fireEvent.click(addChartsButton)

        const saveButton = screen.getAllByRole('button', {
            name: ADD_CHARTS_CTA,
        })[1]
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)
        })
    })
})
