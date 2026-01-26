import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { fireEvent, render, screen } from '@testing-library/react'

import {
    CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
    ToneOfVoice,
} from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { ToneOfVoiceFormComponent } from '../FormComponents/ToneOfVoiceFormComponent'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

// Mock data
const mockUpdateValue = jest.fn()

const defaultProps = {
    updateValue: mockUpdateValue,
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance: '',
    aiAgentMode: 'Chat',
    aiAgentPreviewTicketViewId: 123,
    storeConfiguration: getStoreConfigurationFixture(),
}

describe('ToneOfVoiceFormComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(false)
    })

    it.each([
        { toneOfVoice: 'Friendly', label: /Friendly/i },
        { toneOfVoice: 'Professional', label: /Professional/i },
        { toneOfVoice: 'Sophisticated', label: /Sophisticated/i },
        { toneOfVoice: 'Custom', label: /Custom: Add your own instructions/i },
    ])(
        'renders tone of voice fields and label for $label',
        ({ toneOfVoice, label }) => {
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(screen.getByText(toneOfVoice)).toBeInTheDocument()
            expect(screen.getByLabelText(label)).toBeInTheDocument()
        },
    )

    it('displays custom tone of voice guidance when "Custom" is selected', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: '',
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(
            screen.getByPlaceholderText('Custom tone of voice'),
        ).toBeInTheDocument()
    })

    it('renders default tone of voice when there is no tone of voice', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: null,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(
            screen.getByText('Tone of Voice and Language'),
        ).toBeInTheDocument()
        expect(screen.getByLabelText(/Friendly/i)).toBeInTheDocument()
    })

    it('displays default custom tone of voice guidance when "Custom" is selected, but no guidance', () => {
        const customProps = {
            ...defaultProps,
            toneOfVoice: ToneOfVoice.Custom,
            customToneOfVoiceGuidance: null,
        }

        render(<ToneOfVoiceFormComponent {...customProps} />)

        expect(
            screen.getByText(CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE),
        ).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Custom tone of voice'),
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
            ToneOfVoice.Custom,
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
            CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
        )
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'toneOfVoice',
            ToneOfVoice.Custom,
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
            CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
        )
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'toneOfVoice',
            ToneOfVoice.Custom,
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
        fireEvent.change(textArea, { target: { value: 'New custom guidance' } })
        fireEvent.blur(textArea)

        expect(mockedSetIsPristine).toHaveBeenCalledWith(false)
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'customToneOfVoiceGuidance',
            'New custom guidance',
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
            'Professional',
        )
    })

    describe('AiAgentToneOfVoice feature flag', () => {
        it('should display "Tone of Voice and Language" title when flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(
                screen.getByText('Tone of Voice and Language'),
            ).toBeInTheDocument()
        })

        it('should display "Language" title when flag is enabled', () => {
            mockUseFlag.mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.AiAgentToneOfVoice) {
                    return true
                }
                return false
            })
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(screen.getByText('Language')).toBeInTheDocument()
            expect(
                screen.queryByText('Tone of Voice and Language'),
            ).not.toBeInTheDocument()
        })

        it('should display tone of voice description when flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(
                screen.getByText(/Tone of Voice allows you to customize/i),
            ).toBeInTheDocument()
        })

        it('should display language-focused description when flag is enabled', () => {
            mockUseFlag.mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.AiAgentToneOfVoice) {
                    return true
                }
                return false
            })
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(
                screen.getByText(
                    /Choose which language AI Agent should use when replying/i,
                ),
            ).toBeInTheDocument()
        })

        it('should render tone of voice options when flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(screen.getByText('Friendly')).toBeInTheDocument()
            expect(screen.getByText('Professional')).toBeInTheDocument()
            expect(screen.getByText('Sophisticated')).toBeInTheDocument()
            expect(screen.getByText('Custom')).toBeInTheDocument()
        })

        it('should not render tone of voice options when flag is enabled', () => {
            mockUseFlag.mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.AiAgentToneOfVoice) {
                    return true
                }
                return false
            })
            render(<ToneOfVoiceFormComponent {...defaultProps} />)

            expect(screen.queryByText('Friendly')).not.toBeInTheDocument()
            expect(screen.queryByText('Professional')).not.toBeInTheDocument()
            expect(screen.queryByText('Sophisticated')).not.toBeInTheDocument()
            expect(screen.queryByText('Custom')).not.toBeInTheDocument()
        })
    })
})
