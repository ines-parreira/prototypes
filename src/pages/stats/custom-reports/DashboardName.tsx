import React, {useState} from 'react'

import InputField from 'pages/common/forms/input/InputField'
import css from 'pages/stats/custom-reports/DashboardName.less'
import {EmojiInput} from 'pages/stats/custom-reports/EmojiInput'

export type DashboardNameValue = {
    name: string
    emoji: string
}

export const isValidName = (name: string) => name.trim().length > 2

export type DashboardNameProps = {
    value: DashboardNameValue
    onChange: (value: DashboardNameValue) => void
    onBlur?: () => void
    error?: boolean | string
}

export const DashboardName = ({
    value,
    onChange,
    onBlur,
    error,
}: DashboardNameProps) => {
    const [isTouched, setIsTouched] = useState(false)

    return (
        <div className={css.dashboardNameInput}>
            <InputField
                type="text"
                aria-label="Dashboard name"
                name="name"
                placeholder="Add dashboard name"
                value={value.name}
                onChange={(nextValue) =>
                    onChange({emoji: value.emoji, name: nextValue})
                }
                onBlur={() => {
                    setIsTouched(true)
                    onBlur && onBlur()
                }}
                error={isTouched && error}
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
