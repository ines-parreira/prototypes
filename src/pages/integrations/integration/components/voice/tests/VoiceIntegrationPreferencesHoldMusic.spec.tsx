import React from 'react'
import {
    render,
    RenderResult,
    cleanup,
    screen,
    waitFor,
} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import VoiceIntegrationPreferencesHoldMusic from '../VoiceIntegrationPreferencesHoldMusic'

jest.mock(
    '../VoiceRecordingInput',
    () =>
        ({
            onVoiceRecordingUpload,
        }: {
            onVoiceRecordingUpload: (
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
            ) => void
        }) =>
            (
                <div data-testid="voice-recording-input">
                    <button
                        onClick={onVoiceRecordingUpload}
                        data-testid="upload-button"
                    >
                        Upload
                    </button>
                </div>
            )
)

jest.mock('../hooks/useVoiceMessageValidation', () => () => ({
    validateVoiceRecordingUpload: jest.fn().mockResolvedValue({
        url: 'https://example.com',
        newVoiceFields: {
            newVoiceField1: 'newVoiceField1',
            newVoiceField2: 'newVoiceField2',
        },
    }),
}))

describe('<VoiceIntegrationPreferencesHoldMusic />', () => {
    const props = {
        preferences: {
            custom_hold_music: null,
        },
        onPreferencesChange: jest.fn(),
    }

    const renderComponent = (props: any = {}): RenderResult => {
        return render(<VoiceIntegrationPreferencesHoldMusic {...props} />)
    }

    afterEach(() => {
        cleanup()
    })

    it('should not display the custom hold music input by default', () => {
        renderComponent(props)

        expect(
            screen.queryByTestId('voice-recording-input')
        ).not.toBeInTheDocument()
    })

    it('should set correct "custom hold music', async () => {
        renderComponent({
            ...props,
            preferences: {
                custom_hold_music: {
                    voice_recording_file_path: 'https://example1.com',
                },
            },
        })

        act(() => {
            userEvent.click(screen.getByLabelText('Insert recording'))
        })
        expect(screen.getByTestId('voice-recording-input')).toBeInTheDocument()

        act(() => {
            userEvent.click(screen.getByTestId('upload-button'))
        })

        await waitFor(() => {
            expect(props.onPreferencesChange).toHaveBeenCalledWith({
                custom_hold_music: {
                    voice_recording_file_path: 'https://example1.com',
                    newVoiceField1: 'newVoiceField1',
                    newVoiceField2: 'newVoiceField2',
                },
            })
        })

        act(() => {
            userEvent.click(screen.getByLabelText('Default'))
        })

        expect(props.onPreferencesChange).toHaveBeenCalledWith({
            custom_hold_music: null,
        })
    })
})
