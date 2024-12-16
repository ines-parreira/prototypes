import React from 'react'

import useGetBadgeTiers from 'pages/automate/aiAgent/insights/IntentTableWidget/BadgeWithTiers/hooks/useGetBadgeTiers'

import css from './BadgeWithTiers.less'

export const BadgeWithTiers = ({
    values,
    value,
    formattedValue,
}: {
    values: number[]
    value: number
    formattedValue: string
}) => {
    const tiers = useGetBadgeTiers(values)
    const getTier = (val: number) => {
        return tiers.find(
            (tier) => val >= tier.range[0] && val <= tier.range[1]
        )
    }

    const tier = getTier(value)
    return (
        <div
            className={css.container}
            style={{
                color: tier?.color,
                backgroundColor: tier?.background,
            }}
        >
            <span>+{formattedValue}</span>
        </div>
    )
}
