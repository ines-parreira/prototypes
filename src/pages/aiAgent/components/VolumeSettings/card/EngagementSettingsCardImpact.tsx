import cn from 'classnames'

import { Badge } from '@gorgias/merchant-ui-kit'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardImpactProps = {
    icon: string
    impact: string
}

export const EngagementSettingsCardImpact = ({
    icon,
    impact,
}: EngagementSettingsCardImpactProps) => {
    return (
        <Badge className={css.cardImpact} corner="square" type="magenta">
            <i className={cn('material-icons', css.cardImpactIcon)}>{icon}</i>
            <span className={css.cardImpactText}>{impact}</span>
        </Badge>
    )
}
