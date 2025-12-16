import { useCallback } from 'react'

import { FieldPresentation, Selector } from 'AIJourney/components'

import css from './WinbackReengagementRules.less'

type WinbackReengagementRulesFieldProps = {
    type: 'inactive_days' | 'cooldown_days'
    description?: string
    onChange?: (value: number) => void
    value?: number | null
}

export const WinbackReengagementRulesField = ({
    type,
    value,
    onChange,
}: WinbackReengagementRulesFieldProps) => {
    const handleChange = useCallback(
        (option: number) => {
            onChange?.(option)
        },
        [onChange],
    )

    return (
        <div className={css.wrapper}>
            {type === 'inactive_days' ? (
                <FieldPresentation
                    name="Inactive Days"
                    tooltip="Number of days a user must be inactive before entering the win-back journey. When a shopper hasn’t engaged for this duration, they'll become eligible for the journey."
                />
            ) : (
                <FieldPresentation
                    name="Cooldown Period"
                    tooltip="Minimum number of days to wait before the same user can re-enter the win-back journey again. This prevents over-messaging and ensures users aren’t targeted too frequently."
                />
            )}

            <Selector
                options={[30, 60, 90]}
                value={value ?? 30}
                onChange={handleChange}
            />
        </div>
    )
}
