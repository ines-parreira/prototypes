import { render, screen } from '@testing-library/react'

import type { VoiceCall } from '@gorgias/api-types'

import { TicketVoiceCall } from '../TicketVoiceCall'

describe('TicketVoiceCall', () => {
    it('should dump data', () => {
        render(<TicketVoiceCall data={{ id: 1 } as VoiceCall} />)
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })
})
