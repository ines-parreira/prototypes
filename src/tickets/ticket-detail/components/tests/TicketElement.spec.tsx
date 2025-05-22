import { render, screen } from '@testing-library/react'

import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import type { TicketElement as TicketElementType } from '../../types'
import { TicketElement } from '../TicketElement'

jest.mock('pages/tickets/detail/components/PhoneEvent/PhoneEvent', () => () => (
    <div>PhoneEvent</div>
))

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCall',
    () => () => <div>TicketVoiceCall</div>,
)

jest.mock('../TicketAIEvent', () => ({
    TicketAIEvent: () => <div>TicketAIEvent</div>,
}))

jest.mock('../TicketMessage', () => ({
    TicketMessage: () => <div>TicketMessage</div>,
}))

describe('TicketElement', () => {
    it('should render a TicketMessage for a message element', () => {
        const element = {
            type: 'message',
            data: { id: 1 },
        } as TicketElementType
        render(<TicketElement element={element} />)
        expect(screen.getByText('TicketMessage')).toBeInTheDocument()
    })

    it('should render a PhoneEvent for a phone-event element', () => {
        const element = {
            type: 'phone-event',
            data: { id: 1 },
        } as TicketElementType
        render(<TicketElement element={element} />)
        expect(screen.getByText('PhoneEvent')).toBeInTheDocument()
    })

    it('should render a TicketAIEvent for an ai-event element', () => {
        const element = {
            type: 'ai-event',
            data: { eventType: TicketEventEnum.CLOSE },
        } as TicketElementType
        render(<TicketElement element={element} />)
        expect(screen.getByText('TicketAIEvent')).toBeInTheDocument()
    })

    it('should render a TicketVoiceCall for a voice-call element', () => {
        const element = {
            type: 'voice-call',
            data: { id: 1 },
        } as TicketElementType
        render(<TicketElement element={element} />)
        expect(screen.getByText('TicketVoiceCall')).toBeInTheDocument()
    })

    it('should render nothing if the element type is not matched', () => {
        const element = {
            type: 'unknown',
            data: null,
        } as unknown as TicketElementType
        const { container } = render(<TicketElement element={element} />)
        expect(container.firstChild).toBeNull()
    })
})
