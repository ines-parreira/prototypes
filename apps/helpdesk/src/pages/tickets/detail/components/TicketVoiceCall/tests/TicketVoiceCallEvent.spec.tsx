import { screen } from '@testing-library/react'

import { ProcessedEvent } from 'models/voiceCall/processEvents'
import { VoiceCallSubjectType } from 'models/voiceCall/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import TicketVoiceCallEvent from '../TicketVoiceCallEvent'

describe('TicketVoiceCallEvent', () => {
    const renderComponent = (event: ProcessedEvent) => {
        return renderWithStoreAndQueryClientProvider(
            <TicketVoiceCallEvent event={event} />,
        )
    }

    it('should render a basic answered action', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'answered',
        }

        renderComponent(event)

        expect(screen.getByText('Answered')).toBeInTheDocument()
        expect(screen.getByText('10:30 AM')).toBeInTheDocument()
    })

    it('should render transfer prefix when showTransferPrefix is true', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'initiated',
            showTransferPrefix: true,
        }

        renderComponent(event)

        expect(screen.getByText('Transfer initiated')).toBeInTheDocument()
    })

    it('should render actor as agent when provided', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'answered',
            actor: {
                type: VoiceCallSubjectType.Agent,
                id: 123,
            },
        }

        renderComponent(event)

        expect(screen.getByText('Answered')).toBeInTheDocument()
        expect(screen.getByText('by')).toBeInTheDocument()
        expect(screen.getByText('account_circle')).toBeInTheDocument()
    })

    it('should render actor as external when provided', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'answered',
            actor: {
                type: VoiceCallSubjectType.External,
                value: '+1234567890',
            },
        }

        renderComponent(event)

        expect(screen.getByText('by')).toBeInTheDocument()
        expect(screen.getByText('+1234567890')).toBeInTheDocument()
    })

    it('should not render actor section when actor is null', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'answered',
            actor: null,
        }

        renderComponent(event)

        expect(screen.queryByText('by')).not.toBeInTheDocument()
    })

    it('should render target with default connector "to"', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'initiated',
            target: {
                type: VoiceCallSubjectType.Agent,
                id: 456,
            },
        }

        renderComponent(event)

        expect(screen.getByText('to')).toBeInTheDocument()
    })

    it('should render target with custom connector', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'added to queue',
            target: {
                type: VoiceCallSubjectType.Queue,
                id: 42,
            },
            connector: ' ',
        }

        renderComponent(event)

        expect(screen.queryByText('to')).not.toBeInTheDocument()
    })

    it('should render extra information when provided', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'removed from queue',
            target: {
                type: VoiceCallSubjectType.Queue,
                id: 42,
            },
            connector: ' ',
            extra: 'call timeout',
        }

        renderComponent(event)

        expect(screen.getByText('(call timeout)')).toBeInTheDocument()
    })

    it('should render a transfer with actor and target', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:30:00Z',
            action: 'initiated',
            actor: {
                type: VoiceCallSubjectType.Agent,
                id: 123,
            },
            target: {
                type: VoiceCallSubjectType.Agent,
                id: 456,
            },
            showTransferPrefix: true,
        }

        renderComponent(event)

        expect(screen.getByText('Transfer initiated')).toBeInTheDocument()
        expect(screen.getByText('by')).toBeInTheDocument()
        expect(screen.getByText('to')).toBeInTheDocument()
        expect(screen.getAllByText('account_circle')).toHaveLength(2)
    })

    it('should render a dequeued event with extra info', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:35:00Z',
            action: 'removed from queue',
            target: {
                type: VoiceCallSubjectType.Queue,
                id: 42,
            },
            connector: ' ',
            extra: 'agent picked up call',
        }

        renderComponent(event)

        expect(screen.getByText('Removed from queue')).toBeInTheDocument()
        expect(screen.getByText('(agent picked up call)')).toBeInTheDocument()
    })

    it('should render an IVR selection event with extra', () => {
        const event: ProcessedEvent = {
            datetime: '2024-01-15T10:32:00Z',
            action: 'selected',
            connector: ' ',
            target: {
                type: VoiceCallSubjectType.IvrMenuOption,
                digit: '1',
            },
            extra: 'Sales Department',
        }

        renderComponent(event)

        expect(screen.getByText('Selected')).toBeInTheDocument()
        expect(screen.getByText('IVR Option 1')).toBeInTheDocument()
        expect(screen.getByText('(Sales Department)')).toBeInTheDocument()
    })
})
