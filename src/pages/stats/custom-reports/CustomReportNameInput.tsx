import React, {useState} from 'react'

import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import InputField from 'pages/common/forms/input/InputField'
import css from 'pages/stats/custom-reports/CustomReportNameInput.less'

type FieldValues = {name?: string; emoji?: string | null}

export type CustomReportNameInputProps = {
    onChange: (values: FieldValues) => void
    initialValues?: Partial<FieldValues>
}

export const CustomReportNameInput = ({
    onChange,
    initialValues = {},
}: CustomReportNameInputProps) => {
    const [name, setName] = useState(initialValues.name || '')
    const [emoji, setEmoji] = useState(initialValues.emoji)

    const handleNameBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
        // emoji select received focus
        if (evt.relatedTarget instanceof HTMLInputElement) {
            return
        }
        onChange({name, emoji})
    }

    return (
        <div className={css.customReportNameInput}>
            <InputField
                type="text"
                value={name}
                onChange={setName}
                onBlur={handleNameBlur}
                aria-label="Report name"
                placeholder="Add report name"
                className={css.inputField}
                prefix={
                    <EmojiSelect
                        emoji={emoji}
                        onEmojiSelect={setEmoji}
                        onEmojiClear={() => setEmoji(null)}
                        className={css.emojiSelect}
                    />
                }
            />
        </div>
    )
}
