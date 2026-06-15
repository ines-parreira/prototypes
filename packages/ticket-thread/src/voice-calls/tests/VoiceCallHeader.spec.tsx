import { screen } from '@testing-library/react'

import { render } from '../../tests/render.utils'
import { VoiceCallHeader } from '../components/TicketThreadCallItem/components/VoiceCallHeader'

describe('VoiceCallHeader', () => {
    it('renders children', () => {
        render(<VoiceCallHeader>Header content</VoiceCallHeader>)

        expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
        render(
            <VoiceCallHeader>
                <span>First child</span>
                <span>Second child</span>
            </VoiceCallHeader>,
        )

        expect(screen.getByText('First child')).toBeInTheDocument()
        expect(screen.getByText('Second child')).toBeInTheDocument()
    })
})
