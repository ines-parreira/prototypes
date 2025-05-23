import React from 'react'

import { render, screen } from '@testing-library/react'

import { VoiceCallDirection } from '@gorgias/helpdesk-queries'

import { VoiceCallStatus } from 'models/voiceCall/types'
import { assumeMock } from 'utils/testing'

import { VoiceCallSummary } from '../../models/types'
import LiveVoiceCallStatusLabel from './LiveVoiceCallStatusLabel'
import { isLiveCallRinging, isLiveInboundVoiceCallAnswered } from './utils'

jest.mock('./utils')

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
