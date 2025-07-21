import {
    CSSProperties,
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    ReactNode,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'

import classNames from 'classnames'

import colors from '@gorgias/design-tokens/tokens/colors'

import { useTheme } from 'core/theme'

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
        color,
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
    const theme = useTheme()

    const defaultColor = useMemo(() => {
        if (theme.name === 'system') {
            return colors.classic.neutral.grey_5.value
        }
        return colors[theme.name as keyof typeof colors].neutral.grey_5.value
    }, [theme])

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
                    style={
                        {
                            '--tag-dot-color': color ?? defaultColor,
                        } as CSSProperties
                    }
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
