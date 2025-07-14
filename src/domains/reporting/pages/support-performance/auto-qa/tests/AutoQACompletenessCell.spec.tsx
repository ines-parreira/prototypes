import React from 'react'

import { render, screen } from '@testing-library/react'

import { AutoQACompletenessCell } from 'domains/reporting/pages/support-performance/auto-qa/AutoQACompletenessCell'
import {
    COMPLETENESS_STATUS_COMPLETE,
    COMPLETENESS_STATUS_INCOMPLETE,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'

describe('AutoQACompletenessCell', () => {
    it('should render complete badge', () => {
        render(<AutoQACompletenessCell data={'1'} />)
        const badge = screen.getByText(COMPLETENESS_STATUS_COMPLETE)

        expect(badge).toBeInTheDocument()
        expect(badge).toHaveStyle({ color: new RegExp('light-success') })
    })

    it('should render incomplete badge', () => {
        render(<AutoQACompletenessCell data={'0'} />)
        const badge = screen.getByText(COMPLETENESS_STATUS_INCOMPLETE)

        expect(
            screen.getByText(COMPLETENESS_STATUS_INCOMPLETE),
        ).toBeInTheDocument()
        expect(badge).toHaveStyle({ color: new RegExp('light-warning') })
    })
})
