import React, {HTMLAttributes} from 'react'
import classNames from 'classnames'

import css from './Tag.less'

export type TagColor =
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'gray'
    | 'pink'
    | 'purple'
    | 'orange'
    | 'teal'

type Props = {
    color?: TagColor
    trailIcon?: React.ReactNode
    onTrailIconClick?: () => void
    text?: string
    leadIcon?: React.ReactNode
    onLeadIconClick?: () => void
}

const Tag: React.FC<Props & HTMLAttributes<HTMLDivElement>> = ({
    color = 'black',
    leadIcon,
    onLeadIconClick,
    text,
    trailIcon,
    onTrailIconClick,
    ...props
}) => {
    return (
        <div
            className={classNames(css.tag, css[color], {
                [css.withLeadIcon]: !!leadIcon,
                [css.withTrailIcon]: !!trailIcon,
                [css.withIconOnly]: !text,
            })}
            {...props}
        >
            {leadIcon && (
                <span
                    data-testid="tag-lead-icon"
                    className={classNames(css.icon, {
                        [css.withClick]: !!onLeadIconClick,
                    })}
                    onClick={onLeadIconClick}
                >
                    {leadIcon}
                </span>
            )}
            {text && (
                <span data-testid="tag-text" className={css.text}>
                    {text}
                </span>
            )}
            {trailIcon && (
                <span
                    data-testid="tag-trail-icon"
                    className={classNames(css.icon, {
                        [css.withClick]: !!onTrailIconClick,
                    })}
                    onClick={onTrailIconClick}
                >
                    {trailIcon}
                </span>
            )}
        </div>
    )
}

export default Tag
