import React from 'react'
import {render} from '@testing-library/react'
import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import TicketVoiceCallOutboundStatus from '../TicketVoiceCallOutboundStatus'

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({customerId}: {customerId: string}) =>
            <div>TicketVoiceCallCustomerLabel {customerId}</div>
)

const renderComponent = (voiceCall: any) => {
    return render(<TicketVoiceCallOutboundStatus voiceCall={voiceCall} />)
}

describe('TicketVoiceCallOutboundStatus', () => {
    it.each([
        [VoiceCallStatus.Canceled, 'Call missed by'],
        [VoiceCallStatus.NoAnswer, 'Call missed by'],
        [VoiceCallStatus.Answered, 'Answered by'],
        [VoiceCallStatus.Connected, 'Answered by'],
        [VoiceCallStatus.Completed, 'Answered by'],
        [VoiceCallStatus.Failed, 'Failed:'],
        [VoiceCallStatus.Ringing, 'Waiting for'],
        [VoiceCallStatus.InProgress, 'Waiting for'],
    ])(
        'should render the correct status message based on the voice call status',
        (status, expectedText) => {
            const voiceCall = {
                status,
                customer_id: '123',
                phone_number_source: '+1234567890',
            }
            const {getByText} = renderComponent(voiceCall)
            expect(getByText(expectedText)).toBeInTheDocument()
        }
    )

    it('should render null when voice call state is invalid', () => {
        const voiceCall: VoiceCall = {
            status: 'some-status' as VoiceCallStatus,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {container} = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })
})
