import { getLastMockCall } from '@repo/testing'
import { render } from '@testing-library/react'
import { Virtuoso } from 'react-virtuoso'

import type { TicketSummary as TicketSummaryType } from '@gorgias/helpdesk-types'

import type { TicketElement as TicketElementType } from '../../types'
import { AI_SUMMARY_KEY, TicketBody } from '../TicketBody'
import { TicketElement } from '../TicketElement'
import { TicketSummary } from '../TicketSummary'

jest.mock('react-virtuoso', () => ({
    Virtuoso: jest.fn(() => <div>Virtuoso</div>),
}))

jest.mock('../TicketElement', () => ({
    TicketElement: jest.fn(() => <div>TicketElement</div>),
}))

jest.mock('../TicketSummary', () => ({
    TicketSummary: jest.fn(() => <div>TicketSummary</div>),
}))

const VirtuosoMock = jest.mocked(Virtuoso)

describe('TicketBody', () => {
    const props = {
        elements: [{ type: 'message', data: { id: 1 } }],
        ticketId: 1,
        summary: {} as TicketSummaryType,
    } as Parameters<typeof TicketBody>[0]

    it('should render a Virtuoso component', () => {
        const elements = [
            { type: 'message', data: { id: 1 } },
            { type: 'message', data: { id: 2 } },
        ] as TicketElementType[]
        render(<TicketBody {...props} elements={elements} />)

        expect(Virtuoso).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [expect.any(String), ...elements],
                itemContent: expect.any(Function),
                components: expect.objectContaining({
                    Footer: expect.any(Function),
                }),
            }),
            expect.anything(),
        )
    })

    it('should render the AI Summary component', () => {
        render(<TicketBody {...props} />)

        const itemContent = getLastMockCall(VirtuosoMock)[0]?.itemContent
        const summaryElement = itemContent?.(0, AI_SUMMARY_KEY, {})

        // Actually render the JSX returned by itemContent
        render(summaryElement as React.ReactElement)

        expect(TicketSummary).toHaveBeenCalledWith(
            expect.objectContaining({
                summary: props.summary,
                ticketId: props.ticketId,
            }),
            expect.anything(),
        )
    })

    it('should render a TicketElement', () => {
        render(<TicketBody {...props} />)

        const itemContent = getLastMockCall(VirtuosoMock)[0]?.itemContent
        const ticketElement = itemContent?.(1, props.elements[0], {})

        // Actually render the JSX returned by itemContent
        render(ticketElement as React.ReactElement)

        expect(TicketElement).toHaveBeenCalledWith(
            expect.objectContaining({
                element: props.elements[0],
            }),
            expect.anything(),
        )
    })
})
