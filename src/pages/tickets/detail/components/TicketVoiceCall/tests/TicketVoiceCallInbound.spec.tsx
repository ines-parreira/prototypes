import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import * as utils from 'models/voiceCall/utils'
import TicketVoiceCallInbound from '../TicketVoiceCallInbound'

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({customerId}: {customerId: number}) =>
            <div>VoiceCallCustomerLabel {customerId}</div>
)

jest.mock('pages/common/utils/labels', () => ({
    DatetimeLabel: () => <div>DatetimeLabel</div>,
}))

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
        TicketVoiceCallInboundStatus: ({voiceCall}: {voiceCall: VoiceCall}) => (
            <div>TicketVoiceCallInboundStatus {voiceCall.status}</div>
        ),
    })
)

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallDuration',
    () => () => <div>TicketVoiceCallDuration</div>
)

const isFinalVoiceCallSpy = jest.spyOn(utils, 'isFinalVoiceCallStatus')

describe('TicketVoiceCallInbound', () => {
    const voiceCall = {
        id: 1,
        customer_id: 123,
        phone_number_source: '+12133734253',
        phone_number_destination: '+12133734444',
        created_datetime: '2022-01-01T00:00:00.000Z',
        status: VoiceCallStatus.InProgress,
    } as VoiceCall

    const renderComponent = () => {
        return render(<TicketVoiceCallInbound voiceCall={voiceCall} />)
    }

    it('renders the customer label', () => {
        const {getByText} = renderComponent()
        const customerLabel = getByText('VoiceCallCustomerLabel 123')
        expect(customerLabel).toBeInTheDocument()
    })

    it('renders the call status', () => {
        const {getByText} = renderComponent()
        const callStatus = getByText(
            `TicketVoiceCallInboundStatus ${voiceCall.status}`
        )
        expect(callStatus).toBeInTheDocument()
    })

    it('renders the call icon with correct tooltip content', async () => {
        const {getByText, findByText} = renderComponent()
        const icon = getByText('call_received')
        expect(icon).toBeInTheDocument()

        userEvent.hover(icon)

        await findByText('+1 213 373 4444')
        expect(getByText('John Doe (+1 213 373 4253)')).toBeInTheDocument()
    })

    it('displays correct header when call is still in progress', () => {
        isFinalVoiceCallSpy.mockReturnValue(false)
        const {getByText} = renderComponent()
        const header = getByText('is calling')
        expect(header).toBeInTheDocument()
    })

    it('displays correct header when call is finished', () => {
        isFinalVoiceCallSpy.mockReturnValue(true)
        const {getByText} = renderComponent()
        const header = getByText('called')
        expect(header).toBeInTheDocument()
    })
})
