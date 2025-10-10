import cn from 'classnames'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import css from './EngagementSettingsCard.less'

type EngagementSettingsCardLinkButtonProps = {
    href: string
    icon?: string
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
                className={css.cardLinkButton}
                fillStyle="ghost"
                leadingIcon={
                    icon && (
                        <i
                            className={cn(
                                'material-icons',
                                css.cardLinkButtonIcon,
                            )}
                        >
                            {icon}
                        </i>
                    )
                }
            >
                {text}
            </Button>
        </Link>
    )
}
