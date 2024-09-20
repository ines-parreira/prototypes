import {Label} from '@gorgias/ui-kit'
import React, {useEffect, useState} from 'react'
import classNames from 'classnames'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TextArea from 'pages/common/forms/TextArea'
import {Value} from 'pages/common/forms/SelectField/types'
import {
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    INITIAL_FORM_VALUES,
    ToneOfVoice,
} from '../../../constants'
import {FormValues, UpdateValue} from '../../../types'
import css from './ToneOfVoiceFormComponent.less'

type ToneOfVoiceFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    toneOfVoice: ToneOfVoice | null
    customToneOfVoiceGuidance: string | null
    hasChat?: boolean
}

export const ToneOfVoiceFormComponent = (
    props: ToneOfVoiceFormComponentProps
) => {
    const shouldFocusTextArea = React.useRef(false)
    const {updateValue, toneOfVoice, customToneOfVoiceGuidance, hasChat} = props
    const [toneOfVoiceValue, setToneOfVoiceValue] =
        useState<ToneOfVoice | null>(
            toneOfVoice || INITIAL_FORM_VALUES.toneOfVoice
        )
    const [value, setValue] = useState<string | null>(
        INITIAL_FORM_VALUES.customToneOfVoiceGuidance
    )

    useEffect(() => {
        if (customToneOfVoiceGuidance) setValue(customToneOfVoiceGuidance)
    }, [customToneOfVoiceGuidance])

    useEffect(() => {
        if (toneOfVoice) setToneOfVoiceValue(toneOfVoice)
    }, [toneOfVoice])

    const handleToneOfVoiceChange = (toneOfVoiceLabel: Value) => {
        if (toneOfVoiceLabel !== ToneOfVoice.Custom) {
            updateValue('toneOfVoice', toneOfVoiceLabel as ToneOfVoice)
        } else {
            shouldFocusTextArea.current = true
        }

        setToneOfVoiceValue(toneOfVoiceLabel as ToneOfVoice)
    }

    const handleCustomToneOfVoiceChange = () => {
        updateValue('toneOfVoice', ToneOfVoice.Custom)
        updateValue('customToneOfVoiceGuidance', value)
        shouldFocusTextArea.current = false
    }

    const isCustomToneOfVoiceSelected = toneOfVoiceValue === ToneOfVoice.Custom
    const isCustomToneOfVoiceValid =
        (customToneOfVoiceGuidance &&
            customToneOfVoiceGuidance.trim()?.length > 0) ||
        (value && value.trim()?.length > 0)

    return (
        <div className={css.formGroup}>
            <Label className={css.label}>
                Tone of voice
                <IconTooltip className={css.icon}>
                    Examples of tone of voice:
                    <br />
                    <ul>
                        <li>
                            <b>Friendly</b>: "Hi, could you please send a
                            picture of the damaged items? Thank you!"
                        </li>
                        <li>
                            <b>Professional</b>: "Hello, could you provide a
                            photo of the damaged items? Regards."
                        </li>
                        <li>
                            <b>Sophisticated</b>: "Hello, kindly provide an
                            image of the damaged articles at your earliest
                            convenience. Many thanks."
                        </li>
                        <li>
                            <b>Custom</b>: "Add you own instructions."
                        </li>
                    </ul>
                </IconTooltip>
            </Label>
            <div
                data-candu-id="ai-agent-configuration-tone-of-voice"
                data-testid="ai-agent-configuration-tone-of-voice"
            >
                <SelectField
                    fullWidth
                    showSelectedOption
                    value={toneOfVoiceValue}
                    onChange={handleToneOfVoiceChange}
                    options={Object.values(ToneOfVoice).map((toneOfVoice) => ({
                        label: toneOfVoice,
                        value: toneOfVoice,
                    }))}
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
                        value={value || ''}
                        onChange={(value: unknown) => {
                            if (typeof value !== 'string') return
                            setValue(value)
                        }}
                        style={{minHeight: '104px'}}
                        autoFocus={shouldFocusTextArea.current}
                        error={
                            !isCustomToneOfVoiceValid
                                ? 'Tone of voice required.'
                                : undefined
                        }
                        onBlur={handleCustomToneOfVoiceChange}
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
        </div>
    )
}
