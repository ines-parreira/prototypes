import { render } from '@testing-library/react'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { MessageMetadata } from '../MessageMetadata'
import { MessageStatusIndicator } from '../MessageStatusIndicator'
import { SourceDetailsInfo } from '../SourceDetailsInfo'

jest.mock('tickets/ticket-detail/components/SourceDetailsInfo', () => ({
    SourceDetailsInfo: jest.fn(() => <div>SourceDetailsInfo</div>),
}))

jest.mock('tickets/ticket-detail/components/MessageStatusIndicator', () => ({
    MessageStatusIndicator: jest.fn(() => <div>MessageStatusIndicator</div>),
}))

describe('MessageMetadata', () => {
    const baseMessage = {
        created_datetime: '2024-01-13T14:08:53Z',
        meta: {},
    } as TicketMessage

    it('should call message status indicator with the correct props', () => {
        render(<MessageMetadata message={baseMessage} />)

        expect(MessageStatusIndicator).toHaveBeenCalledWith(
            {
                message: baseMessage,
            },
            expect.anything(),
        )
    })

    it('should call SourceDetailsInfo with the correct props', () => {
        render(<MessageMetadata message={baseMessage} />)

        expect(SourceDetailsInfo).toHaveBeenCalledWith(
            {
                datetime: baseMessage.created_datetime,
                meta: baseMessage.meta,
            },
            expect.anything(),
        )
    })
})
