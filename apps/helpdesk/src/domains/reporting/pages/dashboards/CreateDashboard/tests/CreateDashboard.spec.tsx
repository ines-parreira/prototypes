import React from 'react'

import { render, screen } from '@testing-library/react'

import { DASHBOARDS_DOCUMENTATION_URL } from 'domains/reporting/pages/dashboards/constants'
import {
    CREATE_DASHBOARD,
    CREATE_REPORT_DESCRIPTION,
    CreateDashboard,
    DASHBOARDS,
    LEARN_ABOUT,
} from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard'

describe('CreateDashboard', () => {
    it('renders correctly and checks if the charts frame, title, subtitle, and button are rendered', () => {
        const { container } = render(<CreateDashboard />)

        expect(container.querySelector('svg')).toBeInTheDocument()
        expect(screen.getByText(CREATE_DASHBOARD)).toBeInTheDocument()
        expect(screen.getByText(CREATE_REPORT_DESCRIPTION)).toBeInTheDocument()
        expect(
            screen.getByText(LEARN_ABOUT, { exact: false }),
        ).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            DASHBOARDS_DOCUMENTATION_URL,
        )
        expect(screen.getByRole('link')).toHaveTextContent(DASHBOARDS)
    })
})
