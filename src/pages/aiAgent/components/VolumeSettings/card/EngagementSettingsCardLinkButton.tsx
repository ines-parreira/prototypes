import cn from 'classnames'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardLinkButtonProps = {
    href: string
    icon: string
    text: string
}

export const EngagementSettingsCardLinkButton = ({
    href,
    icon,
    text,
}: EngagementSettingsCardLinkButtonProps) => {
    return (
        <Link to={href}>
            <Button
                fillStyle="ghost"
                leadingIcon={
                    <i className={cn('material-icons', css.cardLinkButtonIcon)}>
                        {icon}
                    </i>
                }
            >
                {text}
            </Button>
        </Link>
    )
}
