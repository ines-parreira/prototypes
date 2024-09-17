import {Label} from '@gorgias/ui-kit'
import React from 'react'
import IconTooltip from '../../../../../common/forms/IconTooltip/IconTooltip'
import SelectField from '../../../../../common/forms/SelectField/SelectField'
import TextArea from '../../../../../common/forms/TextArea'
import {
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    INITIAL_FORM_VALUES,
    ToneOfVoice,
} from '../../../constants'
import {Value} from '../../../../../common/forms/SelectField/types'
import {FormValues, UpdateValue} from '../../../types'
import css from './ToneOfVoiceFormComponent.less'

type ToneOfVoiceFormComponentProps = {
    updateValue: UpdateValue<FormValues>
    toneOfVoice: ToneOfVoice | null
    customToneOfVoiceGuidance: string | null
}

export const ToneOfVoiceFormComponent = (
    props: ToneOfVoiceFormComponentProps
) => {
    const {updateValue, toneOfVoice, customToneOfVoiceGuidance} = props

    const handleToneOfVoiceChange = (toneOfVoiceLabel: Value) => {
        if (
            toneOfVoiceLabel === ToneOfVoice.Custom &&
            (!customToneOfVoiceGuidance ||
                customToneOfVoiceGuidance?.length === 0)
        ) {
            updateValue(
                'customToneOfVoiceGuidance',
                INITIAL_FORM_VALUES.customToneOfVoiceGuidance
            )
        }

        updateValue('toneOfVoice', toneOfVoiceLabel as ToneOfVoice)
    }

    const isCustomToneOfVoiceSelected = toneOfVoice === ToneOfVoice.Custom

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
                    value={
                        toneOfVoice !== null
                            ? toneOfVoice
                            : INITIAL_FORM_VALUES.toneOfVoice
                    }
                    onChange={handleToneOfVoiceChange}
                    options={Object.values(ToneOfVoice).map((toneOfVoice) => ({
                        label: toneOfVoice,
                        value: toneOfVoice,
                    }))}
                    // showSelectedOptionIcon={true} TODO this is not part of refactor fix me in next PR
                />
            </div>
            <div className={css.formInputFooterInfo}>
                Select a tone of voice for AI Agent to use with customers.
            </div>

            {isCustomToneOfVoiceSelected && (
                <div className={css.customToneOfVoiceGuidance}>
                    <TextArea
                        autoRowHeight={true}
                        placeholder="Custom tone of voice"
                        maxLength={CUSTOM_TONE_OF_VOICE_MAX_LENGTH}
                        value={customToneOfVoiceGuidance ?? undefined}
                        onChange={(value: unknown) => {
                            if (typeof value !== 'string') return
                            updateValue('customToneOfVoiceGuidance', value)
                        }}
                        style={{minHeight: '104px'}}
                    />
                    <div className={css.formInputFooterInfo}>
                        Give your AI Agent specific instructions to always
                        follow. For example things to always say, things to
                        never mention.
                    </div>
                </div>
            )}
        </div>
    )
}
