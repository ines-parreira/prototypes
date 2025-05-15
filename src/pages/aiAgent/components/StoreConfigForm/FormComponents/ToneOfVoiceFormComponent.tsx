import React, { useState } from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentPreviewModeSection } from 'pages/aiAgent/components/AIAgentPreviewModeSection/AiAgentPreviewModeSection'
import {
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    INITIAL_FORM_VALUES,
    ToneOfVoice,
} from 'pages/aiAgent/constants'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import {
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import SettingsCard from 'pages/common/components/SettingsCard/SettingsCard'
import { Value } from 'pages/common/forms/SelectField/types'
import TextArea from 'pages/common/forms/TextArea'

import { ToneOfVoiceComponent } from './ToneOfVoiceComponent'

import css from './ToneOfVoiceFormComponent.less'

type ToneOfVoiceFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    toneOfVoice: ToneOfVoice | null
    customToneOfVoiceGuidance: string | null
    setIsPristine?: (isPristine: boolean) => void
    storeConfiguration?: StoreConfiguration
    aiAgentMode?: string
    aiAgentPreviewTicketViewId?: number | null
}

export const ToneOfVoiceFormComponent = ({
    aiAgentMode,
    aiAgentPreviewTicketViewId,
    ...props
}: ToneOfVoiceFormComponentProps) => {
    const trialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]
    const isFollowUpAiAgentPreviewModeEnabled =
        useFlags()[FeatureFlagKey.FollowUpAiAgentPreviewMode]

    const shouldFocusTextArea = React.useRef(false)
    const {
        updateValue,
        toneOfVoice,
        customToneOfVoiceGuidance,
        setIsPristine,
    } = props
    const [isBlurred, setIsBlurred] = useState<boolean | null>(null)
    const initialToneOfVoiceValue =
        toneOfVoice ?? INITIAL_FORM_VALUES.toneOfVoice

    const handleToneOfVoiceChange = (toneOfVoiceLabel: Value) => {
        if (toneOfVoiceLabel === ToneOfVoice.Custom) {
            if (
                !customToneOfVoiceGuidance ||
                !customToneOfVoiceGuidance?.length
            ) {
                updateValue(
                    'customToneOfVoiceGuidance',
                    INITIAL_FORM_VALUES.customToneOfVoiceGuidance,
                )
            }
            shouldFocusTextArea.current = true
        }

        if (setIsPristine) setIsPristine(false)
        updateValue('toneOfVoice', toneOfVoiceLabel as ToneOfVoice)
    }

    const handleCustomToneOfVoiceChange = (newValue: unknown) => {
        if (typeof newValue !== 'string') return
        if (setIsPristine) setIsPristine(false)
        updateValue('customToneOfVoiceGuidance', newValue)
        setIsBlurred(false)
        shouldFocusTextArea.current = false
    }

    const isCustomToneOfVoiceSelected = toneOfVoice === ToneOfVoice.Custom
    const isCustomToneOfVoiceValid =
        isBlurred === false ||
        (customToneOfVoiceGuidance &&
            customToneOfVoiceGuidance.trim()?.length > 0)

    return (
        <div className={css.formGroup}>
            <div>
                <SettingsCard>
                    <SettingsCardHeader>
                        <SettingsCardTitle>Tone of voice</SettingsCardTitle>

                        <p>
                            Tone of Voice allows you to customize how your AI
                            Agent communicates with your customers. Choose the
                            personality that matches your brand.{' '}
                            <a
                                href="https://docs.gorgias.com/en-US/customize-how-ai-agent-behaves-567324"
                                target="_blank"
                            >
                                See examples
                            </a>
                            .
                        </p>
                        {(trialModeAvailable ||
                            isFollowUpAiAgentPreviewModeEnabled) &&
                            aiAgentMode &&
                            aiAgentPreviewTicketViewId && (
                                <AiAgentPreviewModeSection
                                    storeConfiguration={
                                        props.storeConfiguration
                                    }
                                    updateValue={updateValue}
                                    aiAgentMode={aiAgentMode}
                                    aiAgentPreviewTicketViewId={
                                        aiAgentPreviewTicketViewId
                                    }
                                    isFollowUpAiAgentPreviewModeEnabled={
                                        isFollowUpAiAgentPreviewModeEnabled
                                    }
                                    className={css.previewContainer}
                                />
                            )}
                    </SettingsCardHeader>
                    <SettingsCardContent>
                        <ToneOfVoiceComponent
                            value={initialToneOfVoiceValue}
                            onChange={handleToneOfVoiceChange}
                        />
                        {isCustomToneOfVoiceSelected && (
                            <div className={css.customToneOfVoiceGuidance}>
                                <TextArea
                                    label="Customize Tone of Voice"
                                    autoRowHeight={true}
                                    placeholder="Custom tone of voice"
                                    maxLength={CUSTOM_TONE_OF_VOICE_MAX_LENGTH}
                                    value={
                                        customToneOfVoiceGuidance ??
                                        INITIAL_FORM_VALUES.customToneOfVoiceGuidance
                                    }
                                    onChange={handleCustomToneOfVoiceChange}
                                    style={{ minHeight: '104px' }}
                                    autoFocus={shouldFocusTextArea.current}
                                    error={
                                        !isCustomToneOfVoiceValid
                                            ? 'Tone of voice required.'
                                            : undefined
                                    }
                                    onBlur={() => setIsBlurred(true)}
                                />
                                <div
                                    className={classNames(
                                        css.formInputFooterInfo,
                                        {
                                            [css.error]:
                                                !isCustomToneOfVoiceValid,
                                        },
                                    )}
                                >
                                    {isCustomToneOfVoiceValid &&
                                        'Give your AI Agent specific instructions to always follow to match your brand.'}
                                </div>
                            </div>
                        )}
                    </SettingsCardContent>
                </SettingsCard>
            </div>
        </div>
    )
}
