import cn from 'classnames'

import { Badge, Skeleton } from '@gorgias/axiom'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardImpactProps = {
    icon: string
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
            <i className={cn('material-icons', css.cardImpactIcon)}>{icon}</i>
            <span className={css.cardImpactText}>{impact}</span>
        </Badge>
    )
}
