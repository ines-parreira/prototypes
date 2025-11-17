import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VoiceGender, VoiceLanguage } from '@gorgias/helpdesk-types'

import type { VoiceMessageTextToSpeech } from 'models/integration/types'

import TextToSpeechContext from '../TextToSpeechContext'
import VoiceMessageTTSPreviewFields from '../VoiceMessageTTSPreviewFields'

jest.mock('../VoiceMessageTTSPreviewButton', () => ({
    __esModule: true,
    default: ({ fieldName }: any) => (
        <div data-testid="preview-button">Preview Button - {fieldName}</div>
    ),
}))

describe('VoiceMessageTTSPreviewFields', () => {
    const mockFieldName = 'test-field'
    const mockValue: VoiceMessageTextToSpeech = {
        voice_message_type: 'text_to_speech',
        text_to_speech_content: 'Hello, this is a test message',
        text_to_speech_recording_file_path: 'https://example.com/audio.mp3',
        language: VoiceLanguage.EnUs,
        gender: VoiceGender.Female,
    }

    const mockOnChange = jest.fn()
    const mockTTSContext = {
        integrationId: 1,
        lastSelectedLanguage: VoiceLanguage.EnUs,
        lastSelectedGender: VoiceGender.Female,
        setLastSelectedLanguage: jest.fn(),
        setLastSelectedGender: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (value: VoiceMessageTextToSpeech = mockValue) => {
        render(
            <TextToSpeechContext.Provider value={mockTTSContext}>
                <VoiceMessageTTSPreviewFields
                    fieldName={mockFieldName}
                    value={value}
                    onChange={mockOnChange}
                />
            </TextToSpeechContext.Provider>,
        )
    }

    describe('rendering', () => {
        it('should display labels', () => {
            renderComponent()

            expect(screen.getByText('Language')).toBeInTheDocument()
            expect(screen.getByText('Gender')).toBeInTheDocument()
            expect(screen.getByTestId('preview-button')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Select language')).toHaveValue(
                'English - US',
            )
            expect(screen.getByPlaceholderText('Select gender')).toHaveValue(
                'Female',
            )
        })

        it('should default to first language option when value language is not found', () => {
            const valueWithInvalidLanguage = {
                ...mockValue,
                language: 'invalid-language' as VoiceLanguage,
            }

            renderComponent(valueWithInvalidLanguage)

            expect(screen.getByPlaceholderText('Select language')).toHaveValue(
                'English - US',
            )
        })

        it('should default to first gender option when value gender is not found', () => {
            const valueWithInvalidGender = {
                ...mockValue,
                gender: 'invalid-gender' as VoiceGender,
            }

            renderComponent(valueWithInvalidGender)

            expect(screen.getByPlaceholderText('Select gender')).toHaveValue(
                'Female',
            )
        })
    })

    it('should clear text_to_speech_recording_file_path when language is changed', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(screen.getByPlaceholderText('Select language'))
            await user.click(
                screen.getByRole('option', { name: 'French - France' }),
            )
        })

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    language: VoiceLanguage.FrFr,
                    text_to_speech_recording_file_path: null,
                }),
            )
        })
        expect(mockTTSContext.setLastSelectedLanguage).toHaveBeenCalledWith(
            VoiceLanguage.FrFr,
        )
    })

    it('should call onChange with updated gender when gender is changed', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(screen.getByPlaceholderText('Select gender'))
            await user.click(screen.getByRole('option', { name: 'Male' }))
        })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockValue,
            gender: VoiceGender.Male,
            text_to_speech_recording_file_path: null,
        })
        expect(mockTTSContext.setLastSelectedGender).toHaveBeenCalledWith(
            VoiceGender.Male,
        )
    })

    it('should pass fieldName to preview button', () => {
        renderComponent()

        const previewButton = screen.getByTestId('preview-button')
        expect(previewButton).toHaveTextContent(mockFieldName)
    })
})
