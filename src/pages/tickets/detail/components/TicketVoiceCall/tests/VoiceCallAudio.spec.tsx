import {render, screen} from '@testing-library/react'
import React from 'react'

import {
    VoiceCall,
    VoiceCallRecording,
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingType,
} from 'models/voiceCall/types'

import DownloadableDeletableRecording from '../../PhoneEvent/DownloadableDeletableRecording'
import VoiceCallAudio from '../VoiceCallAudio'

jest.mock('../../PhoneEvent/DownloadableDeletableRecording', () =>
    jest.fn(() => null)
)
jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({agentId}: {agentId: number}) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        )
)

const renderComponent = (audio: VoiceCallRecording) => {
    const voiceCall = {id: 1, integration_id: 2, external_id: '3'}
    const type = VoiceCallRecordingType.Recording

    return render(
        <VoiceCallAudio
            audio={audio}
            type={type}
            voiceCall={voiceCall as VoiceCall}
        />
    )
}

describe('VoiceCallAudio', () => {
    const voiceCall = {id: 1, integration_id: 2, external_id: '3'}
    const audio = {
        type: VoiceCallRecordingType.Recording,
        url: 'http://example.com/audio.mp3',
        external_id: '4',
        id: 1,
        created_datetime: '2021-01-01T00:00:00Z',
    } as VoiceCallRecording

    it('should render audio', () => {
        renderComponent(audio)

        expect(
            screen.queryByTestId('recording-failure')
        ).not.toBeInTheDocument()
        expect(DownloadableDeletableRecording).toHaveBeenCalledWith(
            expect.objectContaining({
                downloadRecordingURL: audio.url,
                deleteRecordingURL: `/api/integrations/${voiceCall.integration_id}/calls/${voiceCall.external_id}/recordings/${audio.external_id}`,
                callId: voiceCall.id,
            }),
            {}
        )
    })

    it('should render private recording warning', () => {
        const privateRecording = {
            ...audio,
            error_code: VoiceCallRecordingErrorCode.RECORDING_IS_PRIVATE,
        }
        renderComponent(privateRecording)

        expect(
            screen.getByTestId('private-recording-warning')
        ).toBeInTheDocument()
        expect(DownloadableDeletableRecording).not.toHaveBeenCalled()
    })

    it('should render a deleted recording', () => {
        const deletedRecording = {
            ...audio,
            deleted_datetime: '2021-01-01T00:00:00Z',
            deleted_by_user_id: 1,
        }
        renderComponent(deletedRecording)

        expect(screen.getByText(/manually deleted/)).toBeInTheDocument()
        expect(screen.getByText(/VoiceCallAgentLabel/)).toBeInTheDocument()
        expect(DownloadableDeletableRecording).not.toHaveBeenCalled()
    })
})
