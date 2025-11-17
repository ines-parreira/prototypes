import { userEvent } from '@repo/testing'

import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import type { VoiceCall } from 'models/voiceCall/types'
import { renderWithStore } from 'utils/testing'

import TicketVoiceCallInbound from '../TicketVoiceCallInbound'

jest.mock('hooks/integrations/phone/useMonitoringCall', () => ({
    useMonitoringCall: () => ({
        makeMonitoringCall: jest.fn(),
    }),
}))

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({ customerId }: { customerId: number }) => (
            <div>VoiceCallCustomerLabel {customerId}</div>
        ),
)

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({ dateTime }: { dateTime: string }) => <div>{dateTime}</div>,
)

jest.mock('pages/tickets/detail/components/TicketVoiceCall/hooks', () => ({
    useCustomerDetails: (customerId: number) => ({
        customer: {
            id: customerId,
            firstname: 'John',
            lastname: 'Doe',
        },
    }),
}))

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallInboundStatus',
    () => ({
        TicketVoiceCallInboundStatus: ({
            voiceCall,
        }: {
            voiceCall: VoiceCall
        }) => <div>TicketVoiceCallInboundStatus {voiceCall.status}</div>,
    }),
)

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallDuration',
    () => () => <div>TicketVoiceCallDuration</div>,
)

describe('TicketVoiceCallInbound', () => {
    const voiceCall = {
        id: 1,
        customer_id: 123,
        phone_number_source: '+12133734253',
        phone_number_destination: '+12133734444',
        created_datetime: '2022-01-01T00:00:00.000Z',
        status: VoiceCallStatus.InProgress,
    } as VoiceCall

    const renderComponent = (voiceCall: VoiceCall) => {
        return renderWithStore(
            <TicketVoiceCallInbound voiceCall={voiceCall} />,
            {},
        )
    }

    it('renders the customer label', () => {
        const { getByText } = renderComponent(voiceCall)
        const customerLabel = getByText('VoiceCallCustomerLabel 123')
        expect(customerLabel).toBeInTheDocument()
    })

    it('renders the call status', () => {
        const { getByText } = renderComponent(voiceCall)
        const callStatus = getByText(
            `TicketVoiceCallInboundStatus ${voiceCall.status}`,
        )
        expect(callStatus).toBeInTheDocument()
    })

    it('renders the call icon with correct tooltip content', async () => {
        const { getByText, findByText } = renderComponent(voiceCall)
        const icon = getByText('call_received')
        expect(icon).toBeInTheDocument()

        userEvent.hover(icon)

        await findByText('+1 213 373 4444')
        expect(getByText('John Doe (+1 213 373 4253)')).toBeInTheDocument()
    })

    it('displays correct header when call is still in progress', () => {
        const { getByText } = renderComponent(voiceCall)
        const header = getByText('is calling')
        expect(header).toBeInTheDocument()
    })

    it('displays correct header when call is finished', () => {
        const { getByText } = renderComponent({
            ...voiceCall,
            status: VoiceCallStatus.Completed,
        })
        const header = getByText('called')
        expect(header).toBeInTheDocument()
    })
})
