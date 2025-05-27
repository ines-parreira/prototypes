import { render, screen } from '@testing-library/react'

import type { TicketMessageElement } from '../../types'
import { MessageBody } from '../MessageBody'
import { MessageContent } from '../MessageContent'
import { TicketMessage } from '../TicketMessage'

jest.mock('../MessageContent', () => ({
    MessageContent: jest.fn(() => <div>MessageContent</div>),
}))

jest.mock('../MessageBody', () => ({
    MessageBody: jest.fn(({ children }) => <div>body {children}</div>),
}))

describe('TicketMessage', () => {
    const mockedElement = {
        data: {
            id: 123,
        },
        flags: ['failed'],
        datetime: '2024-01-13T14:08:53Z',
        type: 'message',
    } as TicketMessageElement

    describe('MessageContent', () => {
        it('should call MessageContent with the correct props', () => {
            render(<TicketMessage element={mockedElement} />)

            expect(MessageContent).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isFailed: true,
                },
                expect.anything(),
            )
        })

        it('should set isFailed to false when flags do not include failed', () => {
            render(<TicketMessage element={{ ...mockedElement, flags: [] }} />)

            expect(MessageContent).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isFailed: false,
                },
                expect.anything(),
            )
        })

        it('should handle undefined flags', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: undefined }}
                />,
            )

            expect(MessageContent).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isFailed: false,
                },
                expect.anything(),
            )
        })
    })

    describe('MessageBody', () => {
        it('should render MessageBody with correct props', () => {
            render(<TicketMessage element={mockedElement} />)

            expect(MessageBody).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isAI: false,
                    children: expect.anything(),
                },
                expect.anything(),
            )
        })

        it('should set isAI to true when flags include ai', () => {
            render(
                <TicketMessage element={{ ...mockedElement, flags: ['ai'] }} />,
            )

            expect(MessageBody).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isAI: true,
                    children: expect.anything(),
                },
                expect.anything(),
            )
        })

        it('should handle undefined flags', () => {
            render(
                <TicketMessage
                    element={{ ...mockedElement, flags: undefined }}
                />,
            )

            expect(MessageBody).toHaveBeenCalledWith(
                {
                    message: mockedElement.data,
                    isAI: false,
                    children: expect.anything(),
                },
                expect.anything(),
            )
        })

        it('should render MessageContent inside MessageBody', () => {
            render(<TicketMessage element={mockedElement} />)

            const messageBody = screen.getByText(/body/i)
            expect(messageBody).toBeInTheDocument()
            expect(messageBody).toHaveTextContent('MessageContent')
        })
    })
})
