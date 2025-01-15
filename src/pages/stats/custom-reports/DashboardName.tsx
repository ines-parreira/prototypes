import React from 'react'

import InputField from 'pages/common/forms/input/InputField'
import css from 'pages/stats/custom-reports/CustomReportNameInput.less'
import {EmojiInput} from 'pages/stats/custom-reports/EmojiInput'

export type DashboardNameValue = {
    name: string
    emoji: string
}

export type DashboardNameProps = {
    value: DashboardNameValue
    onChange: (value: DashboardNameValue) => void
    onBlur?: () => void
    isInvalid?: boolean
}

export const DashboardName = ({
    value,
    onChange,
    onBlur,
    isInvalid,
}: DashboardNameProps) => {
    return (
        <div className={css.customReportNameInput}>
            <InputField
                type="text"
                aria-label="Dashboard name"
                name="name"
                placeholder="Add dashboard name"
                className={css.inputField}
                value={value.name}
                onChange={(nextValue) =>
                    onChange({emoji: value.emoji, name: nextValue})
                }
                onBlur={onBlur}
                error={isInvalid}
                prefix={
                    <EmojiInput
                        name="emoji"
                        value={value.emoji}
                        onChange={(nextValue) =>
                            onChange({name: value.name, emoji: nextValue})
                        }
                        className={css.emojiSelect}
                    />
                }
            />
        </div>
    )
}
