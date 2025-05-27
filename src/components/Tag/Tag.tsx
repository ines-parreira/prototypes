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

import css from './Tag.less'

type Props = {
    className?: string
    color?: string | null
    onTrailIconClick?: () => void
    text?: string
    textClassName?: string
    trailIcon?: ReactNode
} & Omit<HTMLAttributes<HTMLDivElement>, 'color'>

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

    return (
        <div
            className={classNames(css.tag, className, {
                [css.withTrailIcon]: !!trailIcon,
                [css.withIconOnly]: !text,
            })}
            {...props}
        >
            {text && (
                <span
                    ref={ref}
                    className={classNames(css.text, textClassName)}
                    {...(!!color && {
                        style: {
                            '--tag-dot-color': color,
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
