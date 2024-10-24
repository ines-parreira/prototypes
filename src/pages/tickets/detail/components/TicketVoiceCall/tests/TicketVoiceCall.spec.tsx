import {render} from '@testing-library/react'
import React from 'react'

import {VoiceCall} from 'models/voiceCall/types'
import * as voiceCall from 'models/voiceCall/types'

import TicketVoiceCall from '../TicketVoiceCall'

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallInbound',
    () =>
        ({voiceCall}: {voiceCall: VoiceCall}) => (
            <div>TicketVoiceCallInbound {voiceCall.id}</div>
        )
)

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallOutbound',
    () =>
        ({voiceCall}: {voiceCall: VoiceCall}) => (
            <div>TicketVoiceCallOutbound {voiceCall.id}</div>
        )
)

const isOutboundVoiceCall = jest.spyOn(voiceCall, 'isOutboundVoiceCall')

describe('TicketVoiceCall', () => {
    const voiceCall = {
        id: 1,
        direction: 'inbound',
    } as VoiceCall

    it('renders inbound voice call', () => {
        isOutboundVoiceCall.mockReturnValue(false)
        const {getByText} = render(<TicketVoiceCall voiceCall={voiceCall} />)
        const call = getByText(`TicketVoiceCallInbound ${voiceCall.id}`)
        expect(call).toBeInTheDocument()
    })

    it('renders outbound voice call', () => {
        isOutboundVoiceCall.mockReturnValue(true)
        const {getByText} = render(<TicketVoiceCall voiceCall={voiceCall} />)
        const call = getByText(`TicketVoiceCallOutbound ${voiceCall.id}`)
        expect(call).toBeInTheDocument()
    })
})
