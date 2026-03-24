import { render, screen } from '@testing-library/react'

import { OutcomeTag } from 'domains/reporting/pages/common/drill-down/OutcomeTag'

describe('OutcomeTag', () => {
    it('renders Automated label', () => {
        render(<OutcomeTag outcome="Automated" />)
        expect(screen.getByText('Automated')).toBeInTheDocument()
    })

    it('renders Handover label', () => {
        render(<OutcomeTag outcome="Handover" />)
        expect(screen.getByText('Handover')).toBeInTheDocument()
    })

    it('renders unknown outcome label', () => {
        render(<OutcomeTag outcome="Resolved" />)
        expect(screen.getByText('Resolved')).toBeInTheDocument()
    })

    it('uses only the first segment when outcome contains a nesting delimiter', () => {
        render(<OutcomeTag outcome="Automated::sub-value" />)
        expect(screen.getByText('Automated')).toBeInTheDocument()
    })
})
