import { render } from '@testing-library/react'
import { Virtuoso } from 'react-virtuoso'

import type { TicketElement as TicketElementType } from '../../types'
import { TicketBody } from '../TicketBody'
import { TicketElement } from '../TicketElement'

jest.mock('react-virtuoso', () => ({
    Virtuoso: jest.fn(
        ({
            itemContent,
            data,
        }: {
            itemContent: (
                index: number,
                element: TicketElementType,
            ) => JSX.Element
            data: TicketElementType[]
        }) => itemContent(0, data[0]),
    ),
}))

jest.mock('../TicketElement', () => ({
    TicketElement: jest.fn(() => <div>TicketElement</div>),
}))

describe('TicketBody', () => {
    it('should render a Virtuoso component', () => {
        const elements = [
            { type: 'message', data: { id: 1 } },
            { type: 'message', data: { id: 2 } },
        ] as TicketElementType[]
        render(<TicketBody elements={elements} />)

        expect(Virtuoso).toHaveBeenCalledWith(
            expect.objectContaining({
                data: elements,
                itemContent: expect.any(Function),
            }),
            expect.anything(),
        )
    })

    it('should render a TicketElement', () => {
        const elements = [
            { type: 'message', data: { id: 1 } },
        ] as TicketElementType[]

        render(<TicketBody elements={elements} />)

        expect(TicketElement).toHaveBeenCalledWith(
            expect.objectContaining({
                element: elements[0],
            }),
            expect.anything(),
        )
    })
})
