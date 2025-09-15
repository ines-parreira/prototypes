import React from 'react'

import { cleanup, render, screen, waitFor } from '@testing-library/react'

import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { VoiceCall } from 'models/voiceCall/types'
import * as utils from 'models/voiceCall/utils'

import TicketVoiceCallDuration from '../TicketVoiceCallDuration'

jest.mock('models/voiceCall/utils', () => ({
    isFinalVoiceCallStatus: jest.fn(),
    getFormattedDurationOngoingCall: jest.fn(() => '30s'),
    getFormattedDurationEndedCall: jest.fn(() => '1m 0s'),
    isCallTransfer: jest.fn(),
}))

jest.useFakeTimers()

const isFinalVoiceCallStatusSpy = jest.spyOn(utils, 'isFinalVoiceCallStatus')
const getFormattedDurationOngoingCallSpy = jest.spyOn(
    utils,
    'getFormattedDurationOngoingCall',
)
const isCallTransferSpy = jest.spyOn(utils, 'isCallTransfer')

const renderComponent = (voiceCall: any) =>
    render(<TicketVoiceCallDuration voiceCall={voiceCall as VoiceCall} />)

describe('TicketVoiceCallDuration', () => {
    beforeEach(() => {
        isCallTransferSpy.mockReturnValue(false)
    })

    afterEach(() => {
        cleanup()
        jest.clearAllMocks()
    })

    it('should render the duration of an ended call', () => {
        isFinalVoiceCallStatusSpy.mockReturnValue(true)

        renderComponent({ status: VoiceCallStatus.Completed, duration: 60 })
        expect(screen.getByText(/duration/i)).toBeInTheDocument()
    })

    it('should render the duration of an ongoing call', async () => {
        isFinalVoiceCallStatusSpy.mockReturnValue(false)

        renderComponent({ status: VoiceCallStatus.Connected })
        expect(screen.getByText(/connected: 30s/i)).toBeInTheDocument()

        getFormattedDurationOngoingCallSpy.mockReturnValueOnce('31s')
        jest.advanceTimersByTime(1000)
        await waitFor(() => {
            expect(screen.getByText(/connected: 31s/i)).toBeInTheDocument()
        })
    })

    it.each([
        VoiceCallStatus.InProgress,
        VoiceCallStatus.Queued,
        VoiceCallStatus.Ringing,
        VoiceCallStatus.Busy,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
    ])(
        'should render the duration of an ongoing call during transfer even with %s status',
        (status) => {
            isCallTransferSpy.mockReturnValue(true)
            isFinalVoiceCallStatusSpy.mockReturnValue(false)

            renderComponent({
                status,
                started_datetime: '2023-01-01 10:00:00',
            })
            expect(screen.getByText(/connected: 30s/i)).toBeInTheDocument()
        },
    )

    it.each([
        VoiceCallStatus.InProgress,
        VoiceCallStatus.Queued,
        VoiceCallStatus.Ringing,
        VoiceCallStatus.Busy,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
    ])('should not render anything for %s voice call status', (status) => {
        renderComponent({ status })
        expect(screen.queryByText('connected:')).not.toBeInTheDocument()
        expect(screen.queryByText('duration:')).not.toBeInTheDocument()
    })

    it.each([
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Ending,
        VoiceCallStatus.Completed,
    ])(
        'should not render anything for an inbound missed call - %s',
        (status) => {
            renderComponent({
                status,
                direction: 'inbound',
                last_answered_by_agent_id: null,
            })
            expect(screen.queryByText('connected:')).not.toBeInTheDocument()
            expect(screen.queryByText('duration:')).not.toBeInTheDocument()
        },
    )
})
