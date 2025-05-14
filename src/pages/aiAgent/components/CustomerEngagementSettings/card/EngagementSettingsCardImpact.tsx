import cn from 'classnames'

import { Badge, Skeleton } from '@gorgias/merchant-ui-kit'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardImpactProps = {
    icon: string
    impact: string | null
    isLoading?: boolean
}

export const EngagementSettingsCardImpact = ({
    icon,
    impact,
    isLoading,
}: EngagementSettingsCardImpactProps) => {
    if (isLoading) {
        return (
            <Skeleton
                className={css.cardImpactSkeleton}
                containerTestId="card-impact-skeleton"
            />
        )
    }

    return impact ? (
        <Badge className={css.cardImpact} corner="square" type="magenta">
            <i className={cn('material-icons', css.cardImpactIcon)}>{icon}</i>
            <span className={css.cardImpactText}>{impact}</span>
        </Badge>
    ) : null
}
