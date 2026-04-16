import type { ReactNode } from 'react'

import { LegacyBadge as Badge, Skeleton } from '@gorgias/axiom'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardImpactProps = {
    icon: ReactNode
    impact: string | null
    isLoading?: boolean
    isChecked?: boolean
}

export const EngagementSettingsCardImpact = ({
    icon,
    impact,
    isLoading,
    isChecked = false,
}: EngagementSettingsCardImpactProps) => {
    if (isLoading) {
        return (
            <Skeleton
                className={css.cardImpactSkeleton}
                containerTestId="card-impact-skeleton"
            />
        )
    }

    if (impact === null) {
        return null
    }

    return (
        <Badge
            className={css.cardImpact}
            corner="square"
            type={isChecked ? 'magenta' : 'light'}
        >
            <span className={css.cardImpactIcon}>{icon}</span>
            <span className={css.cardImpactText}>{impact}</span>
        </Badge>
    )
}
