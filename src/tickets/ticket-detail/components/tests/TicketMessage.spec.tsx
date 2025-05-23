import { render, screen } from '@testing-library/react'

import type { TicketMessage as TicketMessageType } from '@gorgias/helpdesk-types'

import { TicketMessage } from '../TicketMessage'

describe('TicketMessage', () => {
    it('should dump data', () => {
        render(<TicketMessage data={{ id: 1 } as TicketMessageType} />)
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })
})
