import {render, screen} from '@testing-library/react'
import React from 'react'
import {useParams} from 'react-router-dom'

import {
    CUSTOM_REPORT_ID_CTA,
    CUSTOM_REPORT_TITLE,
    CustomReport,
} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'

import {assumeMock} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock('pages/stats/custom-reports/CustomReportNameInput.tsx')
const CustomReportNameInputMock = assumeMock(CustomReportNameInput)

const mockUseParams = assumeMock(useParams)
const customReportId = '2'

describe('CustomReport', () => {
    beforeEach(() => {
        CustomReportNameInputMock.mockImplementation(() => <div />)
    })

    it('should render the component', () => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })

        render(<CustomReport />)
        expect(screen.getByText(`${CUSTOM_REPORT_TITLE} ${customReportId}`))
    })

    it('should render <CustomReportNameInput />', () => {
        render(<CustomReport />)
        expect(CustomReportNameInput).toHaveBeenCalled()
    })

    it('should render actions button', () => {
        render(<CustomReport />)
        expect(screen.getByText(CUSTOM_REPORT_ID_CTA)).toBeInTheDocument()
    })
})
