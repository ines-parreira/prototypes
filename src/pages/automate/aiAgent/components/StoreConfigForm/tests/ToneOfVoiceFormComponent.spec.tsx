import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'

import {ToneOfVoice} from 'pages/automate/aiAgent/constants'

import {ToneOfVoiceFormComponent} from '../FormComponents/ToneOfVoiceFormComponent'

// Mock data
const mockUpdateValue = jest.fn()

const defaultProps = {
    updateValue: mockUpdateValue,
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: '',
}

describe('ToneOfVoiceFormComponent', () => {
    it('renders select field and label', () => {
        render(<ToneOfVoiceFormComponent {...defaultProps} />)

        expect(screen.getByText('Tone of voice')).toBeInTheDocument()
        expect(screen.getByLabelText('Tone of voice')).toBeInTheDocument()
    })

    it('displays custom tone of voice guidance when "Custom" is selected', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: '',
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(
            screen.getByPlaceholderText('Custom tone of voice')
        ).toBeInTheDocument()
    })

    it('calls updateValue when custom tone of voice guidance is changed', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: 'Initial guidance',
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        const textArea = screen.getByPlaceholderText('Custom tone of voice')
        fireEvent.change(textArea, {target: {value: 'New custom guidance'}})
        fireEvent.blur(textArea)

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'customToneOfVoiceGuidance',
            'New custom guidance'
        )
    })

    it('display proper label when chat is available', () => {
        const customProps = {
            ...defaultProps,
            hasChat: true,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(
            screen.getByText(
                'Select a tone of voice for AI Agent to use with customers. For Chat, the language used will be more succinct.'
            )
        ).toBeInTheDocument()
    })

    it('display proper label when chat is not available', () => {
        render(<ToneOfVoiceFormComponent {...defaultProps} />)

        expect(
            screen.getByText(
                'Select a tone of voice for AI Agent to use with customers.'
            )
        ).toBeInTheDocument()
    })
})
