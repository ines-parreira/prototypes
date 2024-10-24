import {cleanup, render, screen} from '@testing-library/react'
import React from 'react'

import * as queries from 'models/voiceCall/queries'

import TicketVoiceCallEvents from '../TicketVoiceCallEvents'

const useListVoiceCallEventsSpy = jest.spyOn(queries, 'useListVoiceCallEvents')

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div>Loading</div>
))

jest.mock('../Timeline', () => ({children}: any) => (
    <div data-testid="timeline">{children}</div>
))

jest.mock('../TimelineItem', () => ({children}: any) => (
    <div data-testid="timeline-item">{children}</div>
))

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () => () => <div>Agent Label</div>
)
jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () => () => <div>Customer Label</div>
)

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({dateTime}: {dateTime: string}) => <div>{dateTime}</div>
)

jest.mock('models/voiceCall/utils', () => ({
    processEvents: (events: any): any => events,
}))

describe('TicketVoiceCallEvents', () => {
    afterEach(cleanup)

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
            screen.getByText('Call events are not available.')
        ).toBeInTheDocument()
    })

    it('should render timeline with events when data is available', () => {
        const mockEvents = [
            {text: 'Event 1', userId: 1, datetime: '00:01 AM'},
            {text: 'Event 2', userId: 2, datetime: '07:11 PM'},
        ]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: {data: {data: mockEvents}},
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(screen.getByTestId('timeline')).toBeInTheDocument()
        expect(screen.getAllByTestId('timeline-item')).toHaveLength(
            mockEvents.length
        )
    })

    it('should render no events message when data is available but there are no displayable events', () => {
        useListVoiceCallEventsSpy.mockReturnValue({
            data: {data: {data: []}},
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(screen.getByText('No events:')).toBeInTheDocument()
    })

    it('should render customer event', () => {
        const mockEvents = [
            {
                text: 'Event 1',
                userId: null,
                datetime: '00:01 AM',
                customerId: 1,
            },
        ]
        useListVoiceCallEventsSpy.mockReturnValue({
            data: {data: {data: mockEvents}},
            isLoading: false,
            error: null,
        } as any)

        render(<TicketVoiceCallEvents callId={1} />)

        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.getByText('Customer Label')).toBeInTheDocument()
    })
})
