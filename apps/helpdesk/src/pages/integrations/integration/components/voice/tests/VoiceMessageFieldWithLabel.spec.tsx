import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { VoiceMessageType } from 'models/integration/types'

import VoiceMessageField from '../VoiceMessageField'
import VoiceMessageFieldWithLabel from '../VoiceMessageFieldWithLabel'

jest.mock('../VoiceMessageField', () =>
    jest.fn(() => (
        <div data-testid="voice-message-field">VoiceMessageField</div>
    )),
)
const VoiceMessageFieldMock = assumeMock(VoiceMessageField)

describe('VoiceMessageFieldWithLabel', () => {
    const defaultProps = {
        label: 'Test Label',
        value: {
            voice_message_type: VoiceMessageType.TextToSpeech,
            text_to_speech_content: 'Test text',
        },
        onChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(
            <VoiceMessageFieldWithLabel {...defaultProps} {...props} />,
        )
    }

    it('renders with label and tooltip correctly', () => {
        renderComponent({ tooltip: 'Test tooltip' })

        expect(screen.getByText('Test Label')).toBeInTheDocument()
        expect(screen.getByTestId('voice-message-field')).toBeInTheDocument()
        expect(screen.getByText('info')).toBeInTheDocument()
    })

    it('renders with label only when tooltip is not provided', () => {
        renderComponent({ tooltip: undefined })

        expect(screen.getByText('Test Label')).toBeInTheDocument()
        expect(screen.queryByText('info')).not.toBeInTheDocument()
    })

    it('passes all other props to VoiceMessageField', () => {
        const extraProps = {
            allowNone: true,
            horizontal: true,
            shouldUpload: true,
        }

        renderComponent(extraProps)

        expect(VoiceMessageFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                ...extraProps,
                value: defaultProps.value,
                onChange: defaultProps.onChange,
            }),
            {},
        )
    })
})
