import {useGetVoiceCallRecordingTranscription} from '@gorgias/api-queries'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {VoiceCallRecordingType} from 'models/voiceCall/types'

import TranscriptionData from '../TranscriptionData'

jest.mock('@gorgias/api-queries')
const mockUseGetVoiceCallRecordingTranscription =
    useGetVoiceCallRecordingTranscription as jest.Mock

describe('TranscriptionData', () => {
    const voicemailTranscription = {
        transcription_status: 'completed',
        transcription: [
            {
                channel: 0,
                speaker: 0,
                start: 1.1999999,
                end: 30.585938,
                transcript:
                    'Hello. I am recording this call to make sure that we have reference for it in the future in the future. Goodbye. Have a nice day.',
            },
        ],
        speakers: [
            {
                channel: 0,
                speaker: 0,
                index_in_recording: 0,
                agent_id: null,
                customer_id: null,
            },
        ],
    }
    const callRecordingTranscription = {
        transcription_status: 'completed',
        transcription: [
            {
                channel: 0,
                speaker: 0,
                start: 1.1999999,
                end: 5,
                transcript: 'Hello.',
            },
            {
                channel: 0,
                speaker: 1,
                start: 5.23,
                end: 7.12,
                transcript: 'Hi.',
            },
            {
                channel: 0,
                speaker: 0,
                start: 7.33,
                end: 12.585938,
                transcript: 'How can I help you?',
            },
            {
                channel: 0,
                speaker: 1,
                start: 13.1999999,
                end: 20.585938,
                transcript: 'Is this the business for business?',
            },
            {
                channel: 0,
                speaker: 0,
                start: 20.98,
                end: 25.44,
                transcript: 'Yup!',
            },
            {
                channel: 0,
                speaker: 1,
                start: 26.11,
                end: 30.585938,
                transcript: 'Alright, just checking.',
            },
            {
                channel: 0,
                speaker: 0,
                start: 31.22,
                end: 35.1,
                transcript: 'Have a nice day.',
            },
            {
                channel: 0,
                speaker: 1,
                start: 31.22,
                end: 35.1,
                transcript: 'Thanks, you too.',
            },
        ],
        speakers: [
            {
                channel: 0,
                speaker: 0,
                index_in_recording: 0,
                agent_id: null,
                customer_id: null,
            },
            {
                channel: 0,
                speaker: 1,
                index_in_recording: 1,
                agent_id: null,
                customer_id: null,
            },
        ],
    }

    const renderComponent = (recordingType: VoiceCallRecordingType) => {
        return render(
            <TranscriptionData recordingType={recordingType} recordingId={1} />
        )
    }

    it('should render voicemail correctly', () => {
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: voicemailTranscription,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })

        const {getByText, queryByText} = renderComponent(
            VoiceCallRecordingType.Voicemail
        )

        expect(getByText('Speaker 1')).toBeInTheDocument()
        expect(getByText('00:01')).toBeInTheDocument()
        expect(
            getByText(voicemailTranscription.transcription[0].transcript)
        ).toBeInTheDocument()
        expect(queryByText('Show More')).not.toBeInTheDocument()
        expect(queryByText('Show Less')).not.toBeInTheDocument()
    })

    it('should render loading voicemail correctly', () => {
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: voicemailTranscription,
            isLoading: true,
            isError: false,
            refetch: jest.fn(),
        })

        const {getByText} = renderComponent(VoiceCallRecordingType.Voicemail)
        expect(
            getByText(
                "We're currently loading the voicemail transcription. This may take a few moments."
            )
        ).toBeInTheDocument()
    })

    it('should render error voicemail correctly', () => {
        const mockRefetch = jest.fn()
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            refetch: mockRefetch,
        })

        const {getByText} = renderComponent(VoiceCallRecordingType.Voicemail)
        expect(
            getByText('Unable to load voicemail transcription.')
        ).toBeInTheDocument()
        expect(getByText('Try again')).toBeInTheDocument()
        fireEvent.click(getByText('Try again'))
        expect(mockRefetch).toHaveBeenCalled()
    })

    it('should render permanent error voicemail correctly', () => {
        const mockRefetch = jest.fn()
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: {
                ...voicemailTranscription,
                error_message: 'Could not transcribe.',
            },
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
        })

        const {getByText, queryByText} = renderComponent(
            VoiceCallRecordingType.Voicemail
        )
        expect(
            getByText('Unable to load voicemail transcription.')
        ).toBeInTheDocument()
        expect(queryByText('Try again')).not.toBeInTheDocument()
    })

    it('should render call recording correctly', () => {
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: callRecordingTranscription,
            isLoading: false,
            isError: false,
            refetch: jest.fn(),
        })

        const {getByText, getAllByText} = renderComponent(
            VoiceCallRecordingType.Recording
        )

        expect(getAllByText('Speaker 1')).toHaveLength(4)
        expect(getAllByText('Speaker 2')).toHaveLength(3)
        expect(getByText('00:01')).toBeInTheDocument()
        callRecordingTranscription.transcription
            .slice(0, 7)
            .forEach((transcript) => {
                expect(getByText(transcript.transcript)).toBeInTheDocument()
            })
        expect(getByText('Show More')).toBeInTheDocument()

        fireEvent.click(getByText('Show More'))
        expect(getAllByText('Speaker 2')).toHaveLength(4)
        expect(getByText('Show Less')).toBeInTheDocument()
    })

    it('should render loading recording correctly', () => {
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: callRecordingTranscription,
            isLoading: true,
            isError: false,
            refetch: jest.fn(),
        })

        const {getByText} = renderComponent(VoiceCallRecordingType.Recording)
        expect(
            getByText(
                "We're currently loading the call transcription. This may take a few moments."
            )
        ).toBeInTheDocument()
    })

    it('should render error recording correctly', () => {
        const mockRefetch = jest.fn()
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            refetch: mockRefetch,
        })

        const {getByText} = renderComponent(VoiceCallRecordingType.Recording)
        expect(
            getByText('Unable to load call transcription.')
        ).toBeInTheDocument()
        expect(getByText('Try again')).toBeInTheDocument()

        fireEvent.click(getByText('Try again'))
        expect(mockRefetch).toHaveBeenCalled()
    })

    it('should render permanent error recording correctly', () => {
        const mockRefetch = jest.fn()
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: {
                ...callRecordingTranscription,
                error_message: 'Could not transcribe.',
            },
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
        })

        const {getByText, queryByText} = renderComponent(
            VoiceCallRecordingType.Recording
        )
        expect(
            getByText('Unable to load call transcription.')
        ).toBeInTheDocument()
        expect(queryByText('Try again')).not.toBeInTheDocument()
    })

    it('should render poor quality message correctly', () => {
        const mockRefetch = jest.fn()
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: {
                ...callRecordingTranscription,
                transcription: [],
            },
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
        })

        const {getByText} = renderComponent(VoiceCallRecordingType.Recording)
        expect(
            getByText(
                'Audio quality of this call was too poor to generate an accurate transcription. Please check your microphone and internet quality to ensure clear audio.'
            )
        ).toBeInTheDocument()
    })

    it('should handle empty speaker list', () => {
        const mockRefetch = jest.fn()
        mockUseGetVoiceCallRecordingTranscription.mockReturnValue({
            data: {
                ...callRecordingTranscription,
                speakers: [],
            },
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
        })

        const {getAllByText} = renderComponent(VoiceCallRecordingType.Recording)
        expect(getAllByText('Speaker undefined')).toHaveLength(7)
    })
})
