import {render, screen} from '@testing-library/react'
import React from 'react'

import {
    CustomReports,
    CUSTOM_REPORTS_TITLE,
} from 'pages/stats/custom-reports/CustomReports'

jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

describe('CustomReports', () => {
    it('should render the component', () => {
        render(<CustomReports />)
        expect(screen.getByText(CUSTOM_REPORTS_TITLE))
    })
})
