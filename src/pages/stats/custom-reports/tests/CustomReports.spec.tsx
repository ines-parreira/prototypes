import {render, screen} from '@testing-library/react'
import React from 'react'

import {
    CustomReports,
    CUSTOM_REPORTS_TITLE,
} from 'pages/stats/custom-reports/CustomReports'

describe('CustomReports', () => {
    it('should render the component', () => {
        render(<CustomReports />)
        expect(screen.getByText(CUSTOM_REPORTS_TITLE))
    })
})
