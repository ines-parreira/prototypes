import React from 'react'
import {render, screen} from '@testing-library/react'
import {VoiceCallDirection} from '@gorgias/api-queries'
import {assumeMock} from 'utils/testing'
import {VoiceCallStatus} from 'models/voiceCall/types'
import {VoiceCallSummary} from '../../models/types'
import LiveVoiceCallStatusLabel from './LiveVoiceCallStatusLabel'
import {isLiveInboundVoiceCallAnswered} from './utils'

jest.mock('./utils')

const isLiveInboundVoiceCallAnsweredMock = assumeMock(
    isLiveInboundVoiceCallAnswered
)

const renderComponent = (
    direction: VoiceCallDirection,
    status: VoiceCallSummary['status']
) => {
    render(<LiveVoiceCallStatusLabel direction={direction} status={status} />)
}

describe('LiveVoiceCallStatusLabel', () => {
    it('renders correctly when direction is inbound and status is answered', () => {
        isLiveInboundVoiceCallAnsweredMock.mockReturnValue(true)
        renderComponent('inbound', VoiceCallStatus.Answered)
        expect(screen.getByText('In progress')).toBeInTheDocument()
    })

    it('renders correctly when direction is inbound and status is not answered', () => {
        isLiveInboundVoiceCallAnsweredMock.mockReturnValue(false)
        renderComponent('inbound', VoiceCallStatus.Queued)
        expect(screen.getByText('In queue')).toBeInTheDocument()
    })

    it('renders correctly when direction is outbound', () => {
        renderComponent('outbound', VoiceCallStatus.Answered)
        expect(screen.getByText('In progress')).toBeInTheDocument()
    })
})
