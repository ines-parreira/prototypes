import type { ForwardedRef, HTMLProps, ReactNode } from 'react'
import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'

import { useKey } from '@repo/hooks'
import classnames from 'classnames'

import css from './DropdownHeader.less'

type Props = {
    prefix?: ReactNode
    suffix?: ReactNode
} & Omit<HTMLProps<HTMLDivElement>, 'prefix'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Menu />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const DropdownHeader = (
    { children, className, prefix, suffix, ...other }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const elementRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => elementRef.current!)

    const isClickable = useMemo(
        () =>
            other.onClick != null ||
            other.onMouseDown != null ||
            other.onMouseUp != null,
        [other.onClick, other.onMouseDown, other.onMouseUp],
    )

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (isClickable && event.target === elementRef.current) {
                elementRef.current?.click()
            }
        },
        [isClickable],
    )

    useKey('Enter', handleKeyPress, undefined, [handleKeyPress])
    useKey(' ', handleKeyPress, undefined, [handleKeyPress])

    return (
        <div
            className={classnames(css.wrapper, className, {
                [css.isClickable]: isClickable,
            })}
            ref={elementRef}
            tabIndex={isClickable ? 0 : undefined}
            {...other}
        >
            {prefix && <div className={css.prefix}>{prefix}</div>}

            <div className={css.content}>{children}</div>

            {suffix && <div className={css.suffix}>{suffix}</div>}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(DropdownHeader)
