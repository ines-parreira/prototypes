import { ListItem, SelectField } from '@gorgias/axiom'

import { VoiceMessageTextToSpeech } from 'models/integration/types'

import { GENDER_OPTIONS, LANGUAGE_OPTIONS } from './constants'
import VoiceMessageTTSPreviewButton from './VoiceMessageTTSPreviewButton'

import css from './VoiceMessageTTSPreviewFields.less'

type Props = {
    fieldName: string
    value: VoiceMessageTextToSpeech
    onChange: (value: VoiceMessageTextToSpeech) => void
}

const VoiceMessageTTSPreviewFields = ({
    fieldName,
    value,
    onChange,
}: Props): JSX.Element => {
    const languageOption =
        LANGUAGE_OPTIONS.find((option) => option.id === value.language) ||
        LANGUAGE_OPTIONS[0]
    const genderOption =
        GENDER_OPTIONS.find((option) => option.id === value.gender) ||
        GENDER_OPTIONS[0]

    return (
        <div className={css.preview}>
            <div className={css.selectField}>
                <SelectField
                    label="Language"
                    value={languageOption}
                    items={LANGUAGE_OPTIONS}
                    onChange={(option) => {
                        onChange({
                            ...value,
                            language: option.id,
                            text_to_speech_recording_file_path: null,
                        })
                    }}
                    placeholder={'Select language'}
                >
                    {(option: { id: string; name: string }) => (
                        <ListItem label={option.name} />
                    )}
                </SelectField>
            </div>
            <div className={css.selectField}>
                <SelectField
                    label="Gender"
                    value={genderOption}
                    items={GENDER_OPTIONS}
                    onChange={(option) => {
                        onChange({
                            ...value,
                            gender: option.id,
                            text_to_speech_recording_file_path: null,
                        })
                    }}
                    placeholder={'Select gender'}
                >
                    {(option: { id: string; name: string }) => (
                        <ListItem label={option.name} />
                    )}
                </SelectField>
            </div>
            <VoiceMessageTTSPreviewButton value={value} fieldName={fieldName} />
        </div>
    )
}

export default VoiceMessageTTSPreviewFields
