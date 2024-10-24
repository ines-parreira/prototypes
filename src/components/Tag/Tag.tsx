import classNames from 'classnames'
import React, {
    CSSProperties,
    FC,
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    useImperativeHandle,
    useRef,
} from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

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
    customColor?: string | null
    onTrailIconClick?: () => void
    text?: string
    textClassName?: string
    trailIcon?: React.ReactNode
}

const Tag: FC<Props & HTMLAttributes<HTMLDivElement>> = (
    {
        className,
        color = 'black',
        customColor,
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
    const hasNewTag = useFlag(FeatureFlagKey.TagNewDesign, false)

    return (
        <div
            className={classNames(css.tag, className, {
                [css.withTrailIcon]: !!trailIcon,
                [css.withIconOnly]: !text,
                [css[color]]: !hasNewTag,
                [css.newTag]: hasNewTag,
            })}
            {...props}
        >
            {text && (
                <span
                    ref={ref}
                    className={classNames(css.text, textClassName, {
                        [css[color]]: hasNewTag,
                        [css.newText]: hasNewTag,
                    })}
                    {...(!!customColor && {
                        style: {
                            '--tag-dot-color': customColor,
                        } as CSSProperties,
                    })}
                >
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
