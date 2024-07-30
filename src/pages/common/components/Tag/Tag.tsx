import React, {HTMLAttributes, useEffect, useRef, useState} from 'react'
import classNames from 'classnames'

import useElementSize from 'hooks/useElementSize'
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
    className?: string
    textClassName?: string
    onEllipsisChange?: (isVisible: boolean) => void
}

const Tag: React.FC<Props & HTMLAttributes<HTMLDivElement>> = ({
    color = 'black',
    leadIcon,
    onLeadIconClick,
    text,
    trailIcon,
    onTrailIconClick,
    className,
    textClassName,
    onEllipsisChange,
    ...props
}) => {
    const [ellipsisVisible, setEllipsisVisible] = useState<boolean>()
    const ref = useRef<HTMLSpanElement | null>(null)
    const elWidth = useElementSize(ref.current)[0]

    useEffect(() => {
        if (!ref.current) return
        setEllipsisVisible(ref.current.offsetWidth < ref.current.scrollWidth)
    }, [elWidth])

    useEffect(() => {
        if (!onEllipsisChange || ellipsisVisible === undefined) return
        onEllipsisChange(ellipsisVisible)
    }, [ellipsisVisible, onEllipsisChange])

    return (
        <div
            className={classNames(css.tag, css[color], className, {
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
                <span
                    data-testid="tag-text"
                    className={classNames(css.text, textClassName)}
                    // Setting the ref here will trigger the ObjectObserver of the useElementSize hook, this is only necessary if onEllipsisChange is set
                    ref={onEllipsisChange ? ref : undefined}
                >
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
