import { render, screen } from '@testing-library/react'

import type { TicketElement as TicketElementType } from '../../types'
import { TicketBody } from '../TicketBody'

jest.mock('../TicketElement', () => ({
    TicketElement: () => <div>TicketElement</div>,
}))

describe('TicketBody', () => {
    it('should render a TicketElement for each element in the body', () => {
        const elements = [
            { type: 'message', data: { id: 1 } },
            { type: 'message', data: { id: 2 } },
            { type: 'message', data: { id: 3 } },
            { type: 'message', data: { id: 4 } },
        ] as TicketElementType[]

        render(<TicketBody elements={elements} />)
        expect(screen.getAllByText('TicketElement').length).toBe(4)
    })
})
