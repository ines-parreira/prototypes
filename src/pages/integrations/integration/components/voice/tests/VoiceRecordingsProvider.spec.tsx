import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {useVoiceRecordingsContext} from 'pages/common/hooks/useVoiceRecordingsContext'
import VoiceRecordingsProvider from '../VoiceRecordingsProvider'

describe('VoiceRecordingsProvider', () => {
    it('should render children', () => {
        const {getByText} = render(
            <VoiceRecordingsProvider>
                <div>Test children</div>
            </VoiceRecordingsProvider>
        )

        expect(getByText('Test children')).toBeInTheDocument
    })

    it('should toggle recording opened', () => {
        const Consumer = () => {
            const {toggleRecordingOpened, isRecordingOpened} =
                useVoiceRecordingsContext()

            return (
                <button
                    onClick={() => {
                        toggleRecordingOpened(1)
                    }}
                    data-testid="recording-1"
                >
                    {isRecordingOpened(1) ? 'Opened' : 'Closed'}
                </button>
            )
        }
        const {getByTestId, getByText} = render(
            <VoiceRecordingsProvider>
                <Consumer />
            </VoiceRecordingsProvider>
        )

        // initial state is closed
        expect(getByText('Closed')).toBeInTheDocument()

        fireEvent.click(getByTestId('recording-1'))
        expect(getByText('Opened')).toBeInTheDocument()

        fireEvent.click(getByTestId('recording-1'))
        expect(getByText('Closed')).toBeInTheDocument()
    })

    it('should toggle transcription', () => {
        const Consumer = () => {
            const {toggleTranscriptionOpened, isTranscriptionOpened} =
                useVoiceRecordingsContext()

            return (
                <button
                    onClick={() => {
                        toggleTranscriptionOpened(1)
                    }}
                    data-testid="recording-1"
                >
                    {isTranscriptionOpened(1) ? 'Opened' : 'Closed'}
                </button>
            )
        }
        const {getByTestId, getByText} = render(
            <VoiceRecordingsProvider>
                <Consumer />
            </VoiceRecordingsProvider>
        )

        // initial state is opened
        expect(getByText('Opened')).toBeInTheDocument()

        fireEvent.click(getByTestId('recording-1'))
        expect(getByText('Closed')).toBeInTheDocument()

        fireEvent.click(getByTestId('recording-1'))
        expect(getByText('Opened')).toBeInTheDocument()
    })
})
