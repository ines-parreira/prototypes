import { render } from '@testing-library/react'

import type { TicketMessageElement } from '../../types'
import { MessageContent } from '../MessageContent'
import { TicketMessage } from '../TicketMessage'

jest.mock('../MessageContent', () => ({
    MessageContent: jest.fn(() => <div>MessageContent</div>),
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
    })
})
