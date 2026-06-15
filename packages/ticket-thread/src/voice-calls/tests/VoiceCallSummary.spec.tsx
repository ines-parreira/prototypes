import { screen } from '@testing-library/react'

import type { VoiceCallSummariesItem } from '@gorgias/helpdesk-types'

import { render } from '../../tests/render.utils'
import { VoiceCallSummary } from '../components/TicketThreadCallItem/components/VoiceCallSummary'

const summary1: VoiceCallSummariesItem = {
    id: 1,
    recording_id: 10,
    created_datetime: '2024-01-01T10:00:00Z',
    summary: 'Customer called about billing issue.',
}

const summary2: VoiceCallSummariesItem = {
    id: 2,
    recording_id: 10,
    created_datetime: '2024-01-01T11:00:00Z',
    summary: 'Issue was resolved successfully.',
}

describe('VoiceCallSummary', () => {
    it('renders nothing when summaries array is empty', () => {
        const { container } = render(<VoiceCallSummary summaries={[]} />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the "Call summary" heading', () => {
        render(<VoiceCallSummary summaries={[summary1]} />)
        expect(screen.getByText('Call summary')).toBeInTheDocument()
    })

    it('renders summary text when one summary is provided', () => {
        render(<VoiceCallSummary summaries={[summary1]} />)
        expect(
            screen.getByText('Customer called about billing issue.'),
        ).toBeInTheDocument()
    })

    it('renders multiple summaries sorted by created_datetime', () => {
        render(<VoiceCallSummary summaries={[summary2, summary1]} />)

        const summaryTexts = screen.getAllByText(
            /Customer called|Issue was resolved/,
        )
        expect(summaryTexts[0]).toHaveTextContent(
            'Customer called about billing issue.',
        )
        expect(summaryTexts[1]).toHaveTextContent(
            'Issue was resolved successfully.',
        )
    })

    it('collapses the content when the disclosure header is clicked', async () => {
        const { user } = render(<VoiceCallSummary summaries={[summary1]} />)

        const summaryText = screen.getByText(
            'Customer called about billing issue.',
        )
        expect(summaryText).toBeVisible()

        await user.click(screen.getByText('Call summary'))

        expect(summaryText).not.toBeVisible()
    })
})
