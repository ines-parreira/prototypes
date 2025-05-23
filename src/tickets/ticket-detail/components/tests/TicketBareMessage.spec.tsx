import { render, screen } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { TicketBareMessage } from '../TicketBareMessage'

describe('TicketBareMessage', () => {
    it('should dump data', () => {
        render(
            <TicketBareMessage
                data={{ isBare: true, message: { id: 1 } as TicketMessage }}
            />,
        )
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })
})
