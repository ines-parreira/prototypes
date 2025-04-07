import {
    CSSProperties,
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    ReactNode,
    useImperativeHandle,
    useRef,
} from 'react'

import classNames from 'classnames'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

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
    trailIcon?: ReactNode
} & HTMLAttributes<HTMLDivElement>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Tag />` from @gorgias/merchant-ui-kit instead.
 * @date 2025-04-07
 * @type ui-kit-migration
 */
export const Tag = forwardRef(function Tag(
    {
        className,
        color = 'black',
        customColor,
        onTrailIconClick,
        text,
        textClassName,
        trailIcon,
        ...props
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const ref = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    const hasNewTag = useFlag(FeatureFlagKey.TagNewDesign)

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
})
