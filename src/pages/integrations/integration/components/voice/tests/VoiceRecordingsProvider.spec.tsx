import React, { useState } from 'react'

import { fireEvent, render } from '@testing-library/react'

import { useVoiceRecordingsContext } from 'pages/common/hooks/useVoiceRecordingsContext'

import VoiceRecordingsProvider from '../VoiceRecordingsProvider'

describe('VoiceRecordingsProvider', () => {
    it('should render children', () => {
        const { getByText } = render(
            <VoiceRecordingsProvider>
                <div>Test children</div>
            </VoiceRecordingsProvider>,
        )

        expect(getByText('Test children')).toBeInTheDocument()
    })

    it('should toggle recording opened', () => {
        const Consumer = () => {
            const { toggleRecordingOpened, isRecordingOpened } =
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
        const { getByTestId, getByText } = render(
            <VoiceRecordingsProvider>
                <Consumer />
            </VoiceRecordingsProvider>,
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
            const { toggleTranscriptionOpened, isTranscriptionOpened } =
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
        const { getByTestId, getByText } = render(
            <VoiceRecordingsProvider>
                <Consumer />
            </VoiceRecordingsProvider>,
        )

        // initial state is opened
        expect(getByText('Opened')).toBeInTheDocument()

        fireEvent.click(getByTestId('recording-1'))
        expect(getByText('Closed')).toBeInTheDocument()

        fireEvent.click(getByTestId('recording-1'))
        expect(getByText('Opened')).toBeInTheDocument()
    })

    it('should toggle recording opened with voiceCallId', () => {
        const Consumer = ({ voiceCallId }: { voiceCallId: number }) => {
            const { toggleRecordingOpened, isRecordingOpened } =
                useVoiceRecordingsContext()

            return (
                <button
                    onClick={() => {
                        toggleRecordingOpened(voiceCallId)
                    }}
                    data-testid={`recording-${voiceCallId}`}
                >
                    {isRecordingOpened(voiceCallId) ? 'Opened' : 'Closed'}
                </button>
            )
        }
        const ParentOfProvider = () => {
            const [voiceCallId, setVoiceCallId] = useState<number | null>(1)
            return (
                <>
                    <button
                        onClick={() => {
                            setVoiceCallId(2)
                        }}
                        data-testid="open-recording-2"
                    >
                        open recording 2
                    </button>
                    <VoiceRecordingsProvider voiceCallId={voiceCallId}>
                        <Consumer voiceCallId={1} />
                        <Consumer voiceCallId={2} />
                    </VoiceRecordingsProvider>
                </>
            )
        }
        const { getByTestId } = render(<ParentOfProvider />)

        // initial state
        expect(getByTestId('recording-1')).toHaveTextContent('Opened')
        expect(getByTestId('recording-2')).toHaveTextContent('Closed')

        // open recording 2
        fireEvent.click(getByTestId('open-recording-2'))
        expect(getByTestId('recording-1')).toHaveTextContent('Opened')
        expect(getByTestId('recording-2')).toHaveTextContent('Opened')

        // can close selected recording
        fireEvent.click(getByTestId('recording-2'))
        expect(getByTestId('recording-2')).toHaveTextContent('Closed')
    })
})
