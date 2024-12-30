import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {useHistory} from 'react-router-dom'

import {useCreateCustomReport} from 'hooks/reporting/custom-reports/useCreateCustomReport'
import useAppDispatch from 'hooks/useAppDispatch'
import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReportNameForm} from 'pages/stats/custom-reports/CustomReportNameForm'
import {
    CUSTOM_REPORT_CTA,
    CustomReports,
} from 'pages/stats/custom-reports/CustomReports'
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
jest.mock('pages/stats/custom-reports/CustomReportNameForm.tsx')
const CustomReportNameFormMock = assumeMock(CustomReportNameForm)

jest.mock('hooks/reporting/custom-reports/useCreateCustomReport')
const useCreateCustomReportMock = assumeMock(useCreateCustomReport)

jest.mock('pages/stats/custom-reports/CreateCustomReport/CreateCustomReport')
const CreateCustomReportMock = assumeMock(CreateCustomReport)

describe('CustomReports', () => {
    const createCustomReportMock = jest.fn()
    const historyPushMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        CreateCustomReportMock.mockImplementation(() => (
            <div>CreateCustomReport</div>
        ))

        CustomReportNameFormMock.mockImplementation(({onSubmit}) => (
            <button onClick={() => onSubmit({name: 'Test Report'})}>
                submit
            </button>
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

    it('should render the component', () => {
        render(<CustomReports />)

        expect(CreateCustomReportMock).toHaveBeenCalled()
    })

    it('should render <CustomReportNameForm />', () => {
        render(<CustomReports />)

        expect(CustomReportNameForm).toHaveBeenCalled()
    })

    it('should render Add Charts button', () => {
        render(<CustomReports />)

        expect(screen.getByText(CUSTOM_REPORT_CTA)).toBeInTheDocument()
    })

    it('should call createCustomReport when form is submitted', async () => {
        const id = 123

        createCustomReportMock.mockResolvedValueOnce({data: {id}})
        render(<CustomReports />)

        fireEvent.click(screen.getByText('submit'))

        await waitFor(() => {
            expect(createCustomReportMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should redirect to the newly created dashboard on success', async () => {
        const id = 123

        createCustomReportMock.mockResolvedValueOnce({data: {id}})

        render(<CustomReports />)

        fireEvent.click(screen.getByText('submit'))

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

        fireEvent.click(screen.getByText('submit'))

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)
        })
    })
})
