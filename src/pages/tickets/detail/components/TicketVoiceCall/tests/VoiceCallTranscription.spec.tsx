import React from 'react'
import {render} from '@testing-library/react'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {
    VoiceCallRecording,
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingTranscriptionStatus,
    VoiceCallRecordingType,
} from 'models/voiceCall/types'
import VoiceCallTranscription from '../VoiceCallTranscription'

describe('VoiceCallTranscription', () => {
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
    ])('should render completed status for %s', (recordingType) => {
        const {getByText} = renderComponent(
            VoiceCallRecordingTranscriptionStatus.Completed,
            recordingType
        )
        expect(getByText('completed transcription')).toBeInTheDocument()
    })
})
