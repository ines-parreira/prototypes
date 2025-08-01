import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { VoiceCallDirection } from '@gorgias/helpdesk-queries'
import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import LiveVoiceCallStatusLabel from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel'
import {
    isLiveCallRinging,
    isLiveInboundVoiceCallAnswered,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')

const isLiveInboundVoiceCallAnsweredMock = assumeMock(
    isLiveInboundVoiceCallAnswered,
)
const isLiveCallRingingMock = assumeMock(isLiveCallRinging)

const renderComponent = (
    direction: VoiceCallDirection,
    status: VoiceCallSummary['status'],
) => {
    render(<LiveVoiceCallStatusLabel direction={direction} status={status} />)
}

describe('LiveVoiceCallStatusLabel', () => {
    describe('outbound calls', () => {
        it('should render "Ringing" status for outbound calls that are ringing', () => {
            isLiveCallRingingMock.mockReturnValue(true)

            renderComponent(
                VoiceCallDirection.Outbound,
                VoiceCallStatus.Ringing,
            )

            expect(screen.getByText('Ringing')).toBeInTheDocument()
        })

        it('should render "In progress" status for outbound calls that are not ringing', () => {
            isLiveCallRingingMock.mockReturnValue(false)

            renderComponent(
                VoiceCallDirection.Outbound,
                VoiceCallStatus.Connected,
            )

            expect(screen.getByText('In progress')).toBeInTheDocument()
        })
    })

    describe('inbound calls', () => {
        it('should render "In progress" status for inbound calls that are answered', () => {
            isLiveInboundVoiceCallAnsweredMock.mockReturnValue(true)

            renderComponent(
                VoiceCallDirection.Inbound,
                VoiceCallStatus.Answered,
            )

            expect(screen.getByText('In progress')).toBeInTheDocument()
        })

        it('should render "In queue" status for inbound calls that are not answered', () => {
            isLiveInboundVoiceCallAnsweredMock.mockReturnValue(false)

            renderComponent(VoiceCallDirection.Inbound, VoiceCallStatus.Ringing)

            expect(screen.getByText('In queue')).toBeInTheDocument()
        })
    })
})
