import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {
    CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
    ToneOfVoice,
} from 'pages/automate/aiAgent/constants'

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

    it('renders default tone of voice when there is no tone of voice', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: null,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(screen.getByLabelText('Tone of voice')).toBeInTheDocument()
        expect(screen.getAllByText('Friendly')[0]).toBeInTheDocument()
    })

    it('displays default custom tone of voice guidance when "Custom" is selected, but no guidance', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: null,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(
            screen.getByText(CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE)
        ).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Custom tone of voice')
        ).toBeInTheDocument()
    })

    it('calls updateValue when custom tone of voice is selected', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Friendly,
            customToneOfVoiceGuidance: 'Initial guidance',
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        fireEvent.click(screen.getByText('Custom'))

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'toneOfVoice',
            ToneOfVoice.Custom
        )
    })

    it('calls updateValue when custom tone of voice is selected, and no guidance', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Friendly,
            customToneOfVoiceGuidance: null,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        fireEvent.click(screen.getByText('Custom'))

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'customToneOfVoiceGuidance',
            CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE
        )
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'toneOfVoice',
            ToneOfVoice.Custom
        )
    })

    it('calls updateValue when custom tone of voice is selected', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Friendly,
            customToneOfVoiceGuidance: '',
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        fireEvent.click(screen.getByText('Custom'))

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'customToneOfVoiceGuidance',
            CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE
        )
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'toneOfVoice',
            ToneOfVoice.Custom
        )
    })

    it('calls updateValue and setIsPristine to false when custom tone of voice guidance is changed', () => {
        const mockedSetIsPristine = jest.fn()
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: 'Initial guidance',
            setIsPristine: mockedSetIsPristine,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        const textArea = screen.getByPlaceholderText('Custom tone of voice')
        fireEvent.change(textArea, {target: {value: 'New custom guidance'}})
        fireEvent.blur(textArea)

        expect(mockedSetIsPristine).toHaveBeenCalledWith(false)
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'customToneOfVoiceGuidance',
            'New custom guidance'
        )
    })

    it('calls updateValue and setIsPristine to false when tone of voice is changed', () => {
        const mockedSetIsPristine = jest.fn()
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Friendly,
            setIsPristine: mockedSetIsPristine,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        fireEvent.click(screen.getByText('Professional'))

        expect(mockedSetIsPristine).toHaveBeenCalledWith(false)
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'toneOfVoice',
            'Professional'
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
