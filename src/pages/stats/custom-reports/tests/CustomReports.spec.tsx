import {render, screen} from '@testing-library/react'
import React from 'react'

import {CreateCustomReport} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {
    CUSTOM_REPORT_CTA,
    CustomReports,
} from 'pages/stats/custom-reports/CustomReports'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/custom-reports/CustomReportNameInput.tsx')
const CustomReportNameInputMock = assumeMock(CustomReportNameInput)

jest.mock(
    'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport',
    () => ({
        CreateCustomReport: jest.fn(() => <div>CreateCustomReport</div>),
    })
)
const mockedCreateCustomReport = assumeMock(CreateCustomReport)

describe('CustomReports', () => {
    beforeEach(() => {
        CustomReportNameInputMock.mockImplementation(() => <div />)
    })

    it('should render the component', () => {
        render(<CustomReports />)

        expect(mockedCreateCustomReport).toHaveBeenCalled()
    })

    it('should render <CustomReportNameForm />', () => {
        render(<CustomReports />)

        expect(CustomReportNameInput).toHaveBeenCalled()
    })

    it('should render Add Charts button', () => {
        render(<CustomReports />)

        expect(screen.getByText(CUSTOM_REPORT_CTA)).toBeInTheDocument()
    })
})
