import React, {
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    useImperativeHandle,
    useRef,
} from 'react'
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
    className?: string
    color?: TagColor
    leadIcon?: React.ReactNode
    onLeadIconClick?: () => void
    onTrailIconClick?: () => void
    text?: string
    textClassName?: string
    trailIcon?: React.ReactNode
}

const Tag: React.FC<Props & HTMLAttributes<HTMLDivElement>> = (
    {
        className,
        color = 'black',
        leadIcon,
        onLeadIconClick,
        onTrailIconClick,
        text,
        textClassName,
        trailIcon,
        ...props
    },
    forwardedRef: ForwardedRef<HTMLDivElement>
) => {
    const ref = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

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
                    className={classNames(css.icon, {
                        [css.withClick]: !!onLeadIconClick,
                    })}
                    onClick={onLeadIconClick}
                >
                    {leadIcon}
                </span>
            )}
            {text && (
                <span ref={ref} className={classNames(css.text, textClassName)}>
                    {text}
                </span>
            )}
            {trailIcon && (
                <span
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

export default forwardRef(Tag)
