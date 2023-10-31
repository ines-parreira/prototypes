import {render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import * as voiceCallQueries from 'models/voiceCall/queries'
import {
    VoiceCall,
    VoiceCallRecording,
    VoiceCallRecordingType,
} from 'models/voiceCall/types'

import DownloadableDeletableRecording from '../../PhoneEvent/DownloadableDeletableRecording'
import TicketVoiceCallAudio from '../TicketVoiceCallAudio'

jest.mock('../../PhoneEvent/DownloadableDeletableRecording', () =>
    jest.fn(() => null)
)

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div>Loading...</div>
))

const useListRecordingSpy = jest.spyOn(voiceCallQueries, 'useListRecordings')

const renderComponent = (voiceCall: any, type: VoiceCallRecordingType) => {
    return render(
        <TicketVoiceCallAudio type={type} voiceCall={voiceCall as VoiceCall} />
    )
}

describe('TicketVoiceCallAudio', () => {
    const voiceCall = {id: 1, integration_id: 2, external_id: '3'}
    const audio = {
        type: VoiceCallRecordingType.Recording,
        url: 'http://example.com/audio.mp3',
        external_id: '4',
    } as VoiceCallRecording
    const isLoading = false
    const error = undefined

    beforeEach(() => {
        useListRecordingSpy.mockReturnValue({
            data: {data: {data: [audio]}},
            isLoading,
            error,
        } as any)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render audio', async () => {
        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        await waitFor(() =>
            expect(useListRecordingSpy).toHaveBeenCalledWith(
                {
                    call_id: voiceCall.id,
                },
                {
                    staleTime: Infinity,
                }
            )
        )

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('recording-failure')
        ).not.toBeInTheDocument()
        expect(DownloadableDeletableRecording).toHaveBeenCalledWith(
            expect.objectContaining({
                downloadRecordingURL: audio.url,
                deleteRecordingURL: `/api/integrations/${voiceCall.integration_id}/calls/${voiceCall.external_id}/recordings/${audio.external_id}`,
            }),
            {}
        )
    })

    it('should render loading state', () => {
        useListRecordingSpy.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: undefined,
        } as any)

        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(
            screen.queryByTestId('recording-failure')
        ).not.toBeInTheDocument()
        expect(DownloadableDeletableRecording).not.toHaveBeenCalled()
    })

    it('should render no audio state', () => {
        useListRecordingSpy.mockReturnValue({
            data: {data: {data: []}},
            isLoading: false,
            error: undefined,
        } as any)

        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        expect(screen.getByTestId('recording-failure')).toBeInTheDocument()
        expect(DownloadableDeletableRecording).not.toHaveBeenCalled()
    })

    it('should render error state', () => {
        useListRecordingSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Failed to load'),
        } as any)

        renderComponent(voiceCall, VoiceCallRecordingType.Recording)

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        expect(screen.getByTestId('recording-failure')).toBeInTheDocument()
        expect(DownloadableDeletableRecording).not.toHaveBeenCalled()
    })
})
