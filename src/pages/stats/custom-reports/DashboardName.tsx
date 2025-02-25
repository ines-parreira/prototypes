import React, { useState } from 'react'

import InputField from 'pages/common/forms/input/InputField'
import css from 'pages/stats/custom-reports/DashboardName.less'
import { EmojiInput } from 'pages/stats/custom-reports/EmojiInput'

export type DashboardNameValue = {
    name: string
    emoji: string
}

export type DashboardNameProps = {
    value: DashboardNameValue
    onChange: (value: DashboardNameValue) => void
    onBlur?: () => void
    error?: boolean | string
    autoFocus?: boolean
}

export const DashboardName = ({
    value,
    onChange,
    onBlur,
    error,
    autoFocus,
}: DashboardNameProps) => {
    const [isTouched, setIsTouched] = useState(false)

    return (
        <div className={css.dashboardNameInput}>
            <InputField
                type="text"
                aria-label="Dashboard name"
                name="dashboard-name"
                placeholder="Add dashboard name"
                value={value.name}
                onChange={(nextValue) =>
                    onChange({ emoji: value.emoji, name: nextValue })
                }
                autoFocus={autoFocus}
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
                            onChange({ name: value.name, emoji: nextValue })
                        }
                        className={css.emojiSelect}
                    />
                }
            />
        </div>
    )
}
