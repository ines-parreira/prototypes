import {render, screen} from '@testing-library/react'
import React from 'react'
import {useParams} from 'react-router-dom'

import {
    CustomReport,
    CUSTOM_REPORT_TITLE,
} from 'pages/stats/custom-reports/CustomReport'
import {assumeMock} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

const mockUseParams = assumeMock(useParams)
const customReportId = '2'

describe('CustomReport', () => {
    it('should render the component', () => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })

        render(<CustomReport />)
        expect(screen.getByText(`${CUSTOM_REPORT_TITLE} ${customReportId}`))
    })
})
