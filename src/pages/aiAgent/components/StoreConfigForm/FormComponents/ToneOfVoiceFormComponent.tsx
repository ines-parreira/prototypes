import React, { useState } from 'react'

import classNames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Label } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
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
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import TextArea from 'pages/common/forms/TextArea'

import { ToneOfVoiceComponent } from './ToneOfVoiceComponent'

import css from './ToneOfVoiceFormComponent.less'

type ToneOfVoiceFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    toneOfVoice: ToneOfVoice | null
    customToneOfVoiceGuidance: string | null
    hasChat?: boolean
    setIsPristine?: (isPristine: boolean) => void
}

export const ToneOfVoiceFormComponent = (
    props: ToneOfVoiceFormComponentProps,
) => {
    const shouldFocusTextArea = React.useRef(false)
    const {
        updateValue,
        toneOfVoice,
        customToneOfVoiceGuidance,
        hasChat,
        setIsPristine,
    } = props
    const [isBlurred, setIsBlurred] = useState<boolean | null>(null)
    const initialToneOfVoiceValue =
        toneOfVoice ?? INITIAL_FORM_VALUES.toneOfVoice
    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]

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
            {isSettingsRevampEnabled ? (
                <div>
                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>
                                <label htmlFor="salesDiscountStrategyLevel">
                                    Tone of voice
                                </label>
                            </SettingsCardTitle>

                            <p>
                                Tone of Voice allows you to customize how your
                                AI Agent communicates with your customers.
                                Choose the personality that matches your brand.{' '}
                                <a href="">See examples</a>.
                            </p>
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
                                        maxLength={
                                            CUSTOM_TONE_OF_VOICE_MAX_LENGTH
                                        }
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
            ) : (
                <>
                    <Label className={css.label}>
                        Tone of voice
                        <IconTooltip className={css.icon}>
                            Examples of tone of voice:
                            <br />
                            <ul>
                                <li>
                                    <b>Friendly</b>:{' '}
                                    {`"Hi, could you please send a picture of the damaged items? Thank you!"`}
                                </li>
                                <li>
                                    <b>Professional</b>:{' '}
                                    {`"Hello, could you provide a photo of the damaged items? Regards."`}
                                </li>
                                <li>
                                    <b>Sophisticated</b>:{' '}
                                    {`"Hello, kindly provide an image of the damaged articles at your earliest convenience. Many thanks."`}
                                </li>
                                <li>
                                    <b>Custom</b>:{' '}
                                    {`"Add you own instructions."`}
                                </li>
                            </ul>
                        </IconTooltip>
                    </Label>
                    <div data-candu-id="ai-agent-configuration-tone-of-voice">
                        <SelectField
                            aria-label="Tone of voice"
                            fullWidth
                            showSelectedOption
                            value={initialToneOfVoiceValue}
                            onChange={handleToneOfVoiceChange}
                            options={Object.values(ToneOfVoice).map(
                                (toneOfVoice) => ({
                                    label: toneOfVoice,
                                    value: toneOfVoice,
                                }),
                            )}
                            showSelectedOptionIcon={true}
                        />
                    </div>
                    <div className={css.formInputFooterInfo}>
                        {hasChat
                            ? 'Select a tone of voice for AI Agent to use with customers. For Chat, the language used will be more succinct.'
                            : 'Select a tone of voice for AI Agent to use with customers.'}
                    </div>

                    {isCustomToneOfVoiceSelected && (
                        <div className={css.customToneOfVoiceGuidance}>
                            <TextArea
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
                                className={classNames(css.formInputFooterInfo, {
                                    [css.error]: !isCustomToneOfVoiceValid,
                                })}
                            >
                                {isCustomToneOfVoiceValid &&
                                    'Give your AI Agent specific instructions to always follow. For example things to always say, things to never mention.'}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
