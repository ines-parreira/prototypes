import React from 'react'

import useGetBadgeTiers from 'pages/automate/aiAgent/insights/IntentTableWidget/BadgeWithTiers/hooks/useGetBadgeTiers'

import css from './BadgeWithTiers.less'

export const BadgeWithTiers = ({
    values,
    value,
    formattedValue,
    hasValue,
}: {
    values: number[]
    value: number
    formattedValue: string
    hasValue: boolean
}) => {
    const tiers = useGetBadgeTiers(values)
    const getTier = (val: number) => {
        return tiers.find(
            (tier) => val >= tier.range[0] && val <= tier.range[1]
        )
    }

    const tier = getTier(value)
    const displayValue = hasValue ? `+${formattedValue}` : formattedValue
    return (
        <div
            className={css.container}
            style={{
                color: tier?.color,
                backgroundColor: tier?.background,
            }}
        >
            <span>{displayValue}</span>
        </div>
    )
}
