import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { cleanup, render, screen } from '@testing-library/react'

import { VoiceCallTerminationStatus } from '@gorgias/helpdesk-queries'

import * as flags from 'core/flags'
import { ProcessedEvent } from 'models/voiceCall/processEvents'
import * as queries from 'models/voiceCall/queries'
import { VoiceCallSubjectType } from 'models/voiceCall/types'

import TicketVoiceCallEvents from '../TicketVoiceCallEvents'

const useListVoiceCallEventsSpy = jest.spyOn(queries, 'useListVoiceCallEvents')
const useFlagSpy = jest.spyOn(flags, 'useFlag')

jest.mock('@gorgias/axiom', () => ({
    Skeleton: () => <div>Loading</div>,
}))

jest.mock('../Timeline', () => ({ children }: any) => (
    <div data-testid="timeline">{children}</div>
))

jest.mock('../TimelineItem', () => ({ children }: any) => (
    <div data-testid="timeline-item">{children}</div>
))

jest.mock(
    'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel',
    () =>
        ({ subject }: any) => <span>{subject.type} subject</span>,
)

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({ dateTime }: { dateTime: string }) => <div>{dateTime}</div>,
)

const hasFlowEndEventMock = jest.fn()
jest.mock('models/voiceCall/processEvents', () => ({
    processEvents: (events: any): any => events,
    hasFlowEndEvent: (...args: any[]) => hasFlowEndEventMock(...args),
}))

describe('TicketVoiceCallEvents', () => {
    afterEach(() => {
        cleanup()
        hasFlowEndEventMock.mockReset()
    })

    beforeEach(() => {
        hasFlowEndEventMock.mockReturnValue(false)
        useFlagSpy.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.ExtendedCallFlows) {
                return false
            }
            return false
        })
    })

    it('should render loading skeleton when data is loading', () => {
        useListVoiceCallEventsSpy.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(screen.getByText('Loading')).toBeInTheDocument()
    })

    it('should render error message when data is not available', () => {
        useListVoiceCallEventsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: 'Failed to fetch data',
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(
            screen.getByText('Call events are not available.'),
        ).toBeInTheDocument()
    })

    it('should render timeline with events when data is available', () => {
        const mockEvents = [
            { action: 'missed', datetime: '2025-01-01T10:00:00Z' },
            { action: 'answered', datetime: '2025-01-01T10:05:00Z' },
        ]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: mockEvents } },
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(screen.getByTestId('timeline')).toBeInTheDocument()
        expect(screen.getAllByTestId('timeline-item')).toHaveLength(
            mockEvents.length,
        )
        expect(screen.getByText('Missed')).toBeInTheDocument()
        expect(screen.getByText('Answered')).toBeInTheDocument()
    })

    it.each([
        VoiceCallTerminationStatus.Abandoned,
        VoiceCallTerminationStatus.Cancelled,
    ])(
        'should render no events message when data is available but there are no displayable events and we have %s termination status',
        (terminationStatus) => {
            useListVoiceCallEventsSpy.mockReturnValue({
                data: { data: { data: [] } },
                isLoading: false,
                error: null,
            } as any)

            render(
                <TicketVoiceCallEvents
                    callId={1}
                    terminationStatus={terminationStatus}
                />,
            )

            expect(
                screen.getByText(
                    'No events. The caller ended the call while waiting, before reaching an available agent.',
                ),
            ).toBeInTheDocument()
        },
    )

    it('should render flow end message when ExtendedCallFlows is enabled and hasFlowEndEvent returns true', () => {
        useFlagSpy.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.ExtendedCallFlows) {
                return true
            }
            return false
        })
        hasFlowEndEventMock.mockReturnValue(true)
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(
            screen.getByText(
                'No events. This call was handled by a flow and no agent interaction took place until reaching the end of the flow.',
            ),
        ).toBeInTheDocument()
        expect(hasFlowEndEventMock).toHaveBeenCalledWith([])
    })

    it('should not check hasFlowEndEvent when ExtendedCallFlows is disabled', () => {
        hasFlowEndEventMock.mockReturnValue(true)
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(
            screen.getByText(
                'No events. This call was either made outside business hours or ended due to no available agents.',
            ),
        ).toBeInTheDocument()
        expect(hasFlowEndEventMock).not.toHaveBeenCalled()
    })

    it('should render generic no events message when data is available but there are no displayable events', () => {
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(
            screen.getByText(
                'No events. This call was either made outside business hours or ended due to no available agents.',
            ),
        ).toBeInTheDocument()
    })

    it('should render event with actor', () => {
        const mockEvents = [
            {
                action: 'answered',
                datetime: '2025-01-01T10:00:00Z',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 123,
                },
            },
        ] as ProcessedEvent[]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: mockEvents } },
            isLoading: false,
            error: null,
        } as any)

        const { container } = render(<TicketVoiceCallEvents callId={1} />)

        expect(container).toHaveTextContent(
            `Answered by ${VoiceCallSubjectType.Agent} subject`,
        )
    })

    it('should render event with target', () => {
        const mockEvents = [
            {
                action: 'forwarded',
                datetime: '2025-01-01T10:00:00Z',
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+1 5551234567',
                },
            },
        ] as ProcessedEvent[]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: mockEvents } },
            isLoading: false,
            error: null,
        } as any)

        const { container } = render(<TicketVoiceCallEvents callId={1} />)

        expect(container).toHaveTextContent(
            `Forwarded to ${VoiceCallSubjectType.External} subject`,
        )
    })

    it('should render transfer event with both actor and target', () => {
        const mockEvents = [
            {
                action: 'initiated',
                datetime: '2025-01-01T10:00:00Z',
                actor: {
                    type: VoiceCallSubjectType.Agent,
                    id: 123,
                },
                target: {
                    type: VoiceCallSubjectType.External,
                    value: '+1 5551234567',
                },
                showTransferPrefix: true,
            },
        ] as ProcessedEvent[]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: mockEvents } },
            isLoading: false,
            error: null,
        } as any)

        const { container } = render(<TicketVoiceCallEvents callId={1} />)

        expect(container).toHaveTextContent(
            `Transfer initiated by ${VoiceCallSubjectType.Agent} subject to ${VoiceCallSubjectType.External} subject`,
        )
    })

    it('should render datetime labels for each event', () => {
        const mockEvents = [
            { action: 'connected', datetime: '2025-01-01T10:00:00Z' },
            { action: 'ended', datetime: '2025-01-01T10:05:00Z' },
        ]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: { data: { data: mockEvents } },
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(screen.getByText('2025-01-01T10:00:00Z')).toBeInTheDocument()
        expect(screen.getByText('2025-01-01T10:05:00Z')).toBeInTheDocument()
    })
})
