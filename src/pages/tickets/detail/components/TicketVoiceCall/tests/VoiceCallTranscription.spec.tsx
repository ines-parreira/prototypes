import {fireEvent, render} from '@testing-library/react'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import _noop from 'lodash/noop'
import React from 'react'

import {
    VoiceCallRecording,
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingTranscriptionStatus,
    VoiceCallRecordingType,
} from 'models/voiceCall/types'
import {useVoiceRecordingsContext} from 'pages/common/hooks/useVoiceRecordingsContext'
import {VoiceRecordingsContextState} from 'pages/integrations/integration/components/voice/VoiceRecordingsContext'
import {assumeMock} from 'utils/testing'

import VoiceCallTranscription from '../VoiceCallTranscription'

jest.mock('../TranscriptionData', () => ({
    __esModule: true,
    default: () => 'completed transcription',
}))
jest.mock('pages/common/hooks/useVoiceRecordingsContext')
const mockedUseVoiceRecordingsContext = assumeMock(useVoiceRecordingsContext)

describe('VoiceCallTranscription', () => {
    const mockToggleTranscription = jest.fn()
    mockedUseVoiceRecordingsContext.mockReturnValue({
        isTranscriptionOpened: () => true,
        isRecordingOpened: () => true,
        toggleTranscriptionOpened: mockToggleTranscription,
        openedRecordings: [],
        closedTranscriptions: [],
        toggleRecordingOpened: _noop,
    } as VoiceRecordingsContextState)

    beforeEach(() => {
        resetLDMocks()
        mockFlags({RecordingTranscriptions: true})
    })

    const renderComponent = (
        transcriptionStatus: VoiceCallRecordingTranscriptionStatus | null,
        recordingType: VoiceCallRecordingType,
        extraAudioData: null | Partial<VoiceCallRecording> = null
    ) => {
        const audio = {
            type: recordingType,
            url: 'http://example.com/audio.mp3',
            external_id: '4',
            id: 1,
            created_datetime: '2021-01-01T00:00:00Z',
            transcription_status: transcriptionStatus,
            ...(extraAudioData || {}),
        } as VoiceCallRecording
        return render(
            <VoiceCallTranscription audio={audio} type={recordingType} />
        )
    }

    it('should not render anything if feature flag is disabled', () => {
        mockFlags({RecordingTranscriptions: false})
        const {container} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Completed,
            VoiceCallRecordingType.Recording
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should not render anything if the transcription was not requested', () => {
        const {container} = renderComponent(
            null,
            VoiceCallRecordingType.Recording
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should not render anything if the recording was deleted', () => {
        const {container} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Completed,
            VoiceCallRecordingType.Recording,
            {deleted_datetime: '2021-01-01T00:00:00Z'}
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should not render anything if the recording is private', () => {
        const {container} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Completed,
            VoiceCallRecordingType.Recording,
            {error_code: VoiceCallRecordingErrorCode.RECORDING_IS_PRIVATE}
        )
        expect(container).toBeEmptyDOMElement()
    })

    const entityMapping = {
        [VoiceCallRecordingType.Recording]: 'call',
        [VoiceCallRecordingType.Voicemail]: 'voicemail',
    }

    it.each([
        VoiceCallRecordingType.Recording,
        VoiceCallRecordingType.Voicemail,
    ])('should render loading status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Requested,
            recordingType
        )
        expect(
            getByText(
                `We're currently processing the audio to create an accurate transcription of the ${entityMapping[recordingType]}. This may take a few moments.`
            )
        ).toBeInTheDocument()
    })

    it.each([
        VoiceCallRecordingType.Recording,
        VoiceCallRecordingType.Voicemail,
    ])('should render failed status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Failed,
            recordingType
        )
        expect(
            getByText(
                `Unable to process ${entityMapping[recordingType]} transcription.`
            )
        ).toBeInTheDocument()
    })

    it.each([
        VoiceCallRecordingType.Recording,
        VoiceCallRecordingType.Voicemail,
    ])('should render recording too long status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.RecordingTooLong,
            recordingType
        )
        expect(
            getByText(
                `We only support ${entityMapping[recordingType]}s up to 45 minutes in length. This ${entityMapping[recordingType]} exceeds that duration, so we are unable to transcribe.`
            )
        ).toBeInTheDocument()
    })

    it.each([
        VoiceCallRecordingType.Recording,
        VoiceCallRecordingType.Voicemail,
    ])('should render recording too short status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.RecordingTooShort,
            recordingType
        )
        expect(
            getByText(
                `We do not support ${entityMapping[recordingType]}s shorter than 20 seconds. This ${entityMapping[recordingType]} falls below our minimum supported duration, so we are unable to transcribe.`
            )
        ).toBeInTheDocument()
    })

    it.each([
        VoiceCallRecordingType.Recording,
        VoiceCallRecordingType.Voicemail,
    ])('should render low quality status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.LowQualityTranscription,
            recordingType
        )
        expect(
            getByText(
                `Audio quality of this ${entityMapping[recordingType]} was too poor to generate an accurate transcription. Please check your microphone and internet quality to ensure clear audio.`
            )
        ).toBeInTheDocument()
    })

    it.each([
        VoiceCallRecordingType.Recording,
        VoiceCallRecordingType.Voicemail,
    ])('should render completed status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Completed,
            recordingType
        )

        expect(getByText('completed transcription')).toBeInTheDocument()

        // toggle the content
        fireEvent.click(getByText('Transcription'))
        expect(mockToggleTranscription).toHaveBeenCalledWith(1)
    })
})
