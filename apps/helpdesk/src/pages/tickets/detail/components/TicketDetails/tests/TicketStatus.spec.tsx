import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'

import TicketStatus from '../TicketStatus'

describe('TicketStatus component', () => {
    const minProps: ComponentProps<typeof TicketStatus> = {
        setQuickStatus: jest.fn(),
        currentStatus: 'closed',
    }
    it('closed ticket', () => {
        const { container } = render(<TicketStatus {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('open ticket', () => {
        const { container } = render(
            <TicketStatus {...minProps} currentStatus="open" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
