import {render, screen} from '@testing-library/react'
import React from 'react'

import {
    CREATE_CUSTOM_REPORT,
    CREATE_REPORT_DESCRIPTION,
    CreateCustomReport,
    CUSTOM_REPORTS,
    DASHBOARDS_DOCUMENTATION_URL,
    LEARN_ABOUT,
} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'

describe('CreateCustomReport', () => {
    it('renders correctly and checks if the charts frame, title, subtitle, and button are rendered', () => {
        const {container} = render(<CreateCustomReport />)

        expect(container.querySelector('svg')).toBeInTheDocument()
        expect(screen.getByText(CREATE_CUSTOM_REPORT)).toBeInTheDocument()
        expect(screen.getByText(CREATE_REPORT_DESCRIPTION)).toBeInTheDocument()
        expect(
            screen.getByText(LEARN_ABOUT, {exact: false})
        ).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            DASHBOARDS_DOCUMENTATION_URL
        )
        expect(screen.getByRole('link')).toHaveTextContent(CUSTOM_REPORTS)
    })
})
