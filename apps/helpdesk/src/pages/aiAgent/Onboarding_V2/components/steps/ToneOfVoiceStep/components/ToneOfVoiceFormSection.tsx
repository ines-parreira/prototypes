import { useFormContext } from 'react-hook-form'

import { Box, Button, Label, TextAreaField } from '@gorgias/axiom'

import { ToneOfVoiceComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ToneOfVoiceComponent'
import {
    CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    ToneOfVoice,
} from 'pages/aiAgent/constants'
import { StepHeader } from 'pages/aiAgent/Onboarding_V2/components/StepHeader/StepHeader'

import css from './ToneOfVoiceFormSection.less'

type ToneOfVoiceFormData = {
    toneOfVoice: ToneOfVoice
    customToneOfVoiceGuidance?: string
}

type ToneOfVoiceFormSectionProps = {
    onGeneratePreview: () => void
    isGeneratingPreview: boolean
    isPreviewError: boolean
}

export const ToneOfVoiceFormSection = ({
    onGeneratePreview,
    isGeneratingPreview,
    isPreviewError,
}: ToneOfVoiceFormSectionProps) => {
    const {
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<ToneOfVoiceFormData>()

    const toneOfVoice = watch('toneOfVoice')
    const customToneOfVoiceGuidance = watch('customToneOfVoiceGuidance')

    const isValidCustomToneOfVoice =
        !errors.customToneOfVoiceGuidance && !!customToneOfVoiceGuidance

    const handleToneOfVoiceChange = (selectedTone: string) => {
        setValue('toneOfVoice', selectedTone as ToneOfVoice, {
            shouldValidate: true,
            shouldDirty: true,
        })

        if (selectedTone === ToneOfVoice.Custom && !customToneOfVoiceGuidance) {
            setValue(
                'customToneOfVoiceGuidance',
                CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
                {
                    shouldValidate: true,
                    shouldDirty: true,
                },
            )
        }
    }

    const handleCustomToneOfVoiceChange = (newValue: string) => {
        setValue('customToneOfVoiceGuidance', newValue, {
            shouldValidate: true,
            shouldDirty: true,
        })
    }

    return (
        <>
            <StepHeader
                title="Choose a tone that matches your brand"
                subtitle="Set the personality of your AI Agent. Pick how your AI Agent speaks so it feels aligned with your brand's voice and values, building trust with your customers."
            />
            <ToneOfVoiceComponent
                value={toneOfVoice}
                onChange={handleToneOfVoiceChange}
            />
            {toneOfVoice === ToneOfVoice.Custom && (
                <>
                    <Box marginTop="lg" gap="xxs" flexDirection="column">
                        <Label htmlFor="custom-tone-textarea">
                            Custom tone of voice
                        </Label>
                        <TextAreaField
                            id="custom-tone-textarea"
                            autoResize
                            placeholder="Examples: 'Use a friendly and conversational tone', 'Speak casually, use emojis', 'Be professional and concise'"
                            maxLength={CUSTOM_TONE_OF_VOICE_MAX_LENGTH}
                            value={customToneOfVoiceGuidance}
                            onChange={handleCustomToneOfVoiceChange}
                            className={css.customToneTextArea}
                            autoFocus
                            rows={4}
                            error={errors.customToneOfVoiceGuidance?.message}
                            isInvalid={!!errors.customToneOfVoiceGuidance}
                        />
                    </Box>
                    <Box
                        marginTop="sm"
                        flexDirection="column"
                        flexBasis="auto"
                        alignItems="flex-start"
                        gap="xxs"
                    >
                        <Button
                            id="generate-preview-button"
                            variant="secondary"
                            leadingSlot="show"
                            onClick={onGeneratePreview}
                            isDisabled={!isValidCustomToneOfVoice}
                            isLoading={isGeneratingPreview}
                        >
                            Preview
                        </Button>
                        {isPreviewError && (
                            <Label size="sm" isInvalid>
                                Preview could not be generated.
                            </Label>
                        )}
                    </Box>
                </>
            )}
        </>
    )
}
