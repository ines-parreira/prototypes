import React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import * as voiceCallQueries from 'models/voiceCall/queries'
import type { VoiceCall, VoiceCallRecording } from 'models/voiceCall/types'
import { VoiceCallRecordingType } from 'models/voiceCall/types'

import { TicketVoiceCallAudios } from '../TicketVoiceCallAudios'
import { VoiceCallAudio } from '../VoiceCallAudio'

jest.mock('../VoiceCallAudio', () => ({ VoiceCallAudio: jest.fn(() => null) }))

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () => ({
        VoiceCallAgentLabel: ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
    }),
)

const useListRecordingSpy = jest.spyOn(voiceCallQueries, 'useListRecordings')

const renderComponent = (voiceCall: any, type: VoiceCallRecordingType) => {
    return render(
        <TicketVoiceCallAudios
            type={type}
            voiceCall={voiceCall as VoiceCall}
        />,
    )
}

describe('TicketVoiceCallAudios', () => {
    const voiceCall = { id: 1, integration_id: 2, external_id: '3' }
    const audio = {
        type: VoiceCallRecordingType.Recording,
        url: 'http://example.com/audio.mp3',
        external_id: '4',
        id: 1,
        created_datetime: '2021-01-01T00:00:00Z',
    } as VoiceCallRecording
    const anotherAudio = {
        type: VoiceCallRecordingType.Recording,
        url: 'http://example.com/audio2.mp3',
        external_id: '5',
        id: 2,
        created_datetime: '2021-01-01T00:01:00Z',
    } as VoiceCallRecording

    const isLoading = false
    const error = undefined

    beforeEach(() => {
        useListRecordingSpy.mockReturnValue({
            data: { data: { data: [audio, anotherAudio] } },
            isLoading,
            error,
        } as any)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render audios', async () => {
        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        await waitFor(() =>
            expect(useListRecordingSpy).toHaveBeenCalledWith(
                {
                    call_id: voiceCall.id,
                },
                {
                    staleTime: Infinity,
                },
            ),
        )

        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/Recording is not available/),
        ).not.toBeInTheDocument()
        expect(VoiceCallAudio).toHaveBeenCalledWith(
            expect.objectContaining({
                audio: audio,
                type: VoiceCallRecordingType.Recording,
            }),
            {},
        )
        expect(VoiceCallAudio).toHaveBeenCalledWith(
            expect.objectContaining({
                audio: anotherAudio,
                type: VoiceCallRecordingType.Recording,
            }),
            {},
        )
    })

    it('should render loading state', () => {
        useListRecordingSpy.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: undefined,
        } as any)

        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(
            screen.queryByText(/Recording is not available/),
        ).not.toBeInTheDocument()
        expect(VoiceCallAudio).not.toHaveBeenCalled()
    })

    it('should render no audio state', () => {
        useListRecordingSpy.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            error: undefined,
        } as any)

        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        expect(
            screen.getByText(/Recording is not available/),
        ).toBeInTheDocument()
        expect(VoiceCallAudio).not.toHaveBeenCalled()
    })

    it('should render error state', () => {
        useListRecordingSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Failed to load'),
        } as any)

        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        expect(
            screen.getByText(/Recording is not available/),
        ).toBeInTheDocument()
        expect(VoiceCallAudio).not.toHaveBeenCalled()
    })
})
