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
    test('renders select field and label', () => {
        render(<ToneOfVoiceFormComponent {...defaultProps} />)

        expect(screen.getByText('Tone of voice')).toBeInTheDocument()
        expect(screen.getByLabelText('Tone of voice')).toBeInTheDocument()
    })

    test('displays custom tone of voice guidance when "Custom" is selected', () => {
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

    test('calls updateValue when custom tone of voice guidance is changed', () => {
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
})
