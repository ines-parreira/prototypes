import { render, screen } from '@testing-library/react'

import type { Event } from '@gorgias/api-types'

import { TicketEvent } from '../TicketEvent'

describe('TicketEvent', () => {
    it('should dump data', () => {
        render(<TicketEvent data={{ id: 1 } as Event} />)
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })
})
