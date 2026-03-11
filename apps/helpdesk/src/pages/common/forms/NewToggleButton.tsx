import type { ForwardedRef } from 'react'
import { forwardRef, useCallback, useMemo } from 'react'

import cn from 'classnames'

import { useAxiomMigration } from 'hooks/useAxiomMigration'

import css from './NewToggleButton.less'

type Props = {
    checked: boolean
    onChange: (value: boolean) => void
    color?: string
    className?: string
    isDisabled?: boolean
    stopPropagation?: boolean
    name?: string
    size?: 'small' | 'medium'
    ariaLabel?: string
}
// TODO: To rename to a proper name
const InnerNewToggleButton = (
    {
        className,
        checked,
        onChange,
        isDisabled,
        stopPropagation,
        color,
        name,
        size,
        ariaLabel,
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const { isEnabled } = useAxiomMigration()

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (stopPropagation) {
                e.stopPropagation()
                e.preventDefault()
            }
            onChange(!checked)
        },
        [checked, onChange, stopPropagation],
    )

    const style = useMemo(
        () =>
            ({
                '--new-toggle-button-color':
                    color ??
                    (isEnabled
                        ? 'var(--surface-accent-primary)'
                        : 'var(--main-primary)'),
            }) as React.CSSProperties,
        [color, isEnabled],
    )

    const memoClassName = useMemo(
        () =>
            cn(
                css.toggleButton,
                {
                    [css.checked]: checked,
                    [css.disabled]: isDisabled,
                    [css.small]: size === 'small',
                },
                className,
            ),
        [checked, className, isDisabled, size],
    )

    return (
        <div
            role="switch"
            aria-checked={checked}
            className={memoClassName}
            onClick={handleClick}
            style={style}
            ref={ref}
        >
            <input
                className={css.checkboxInput}
                type="checkbox"
                checked={checked}
                disabled={isDisabled}
                readOnly
                name={name}
                aria-label={ariaLabel}
            />
            <div className={css.knob}>
                {size !== 'small' && <i className="material-icons">check</i>}
            </div>
        </div>
    )
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<ToggleField />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const NewToggleButton = forwardRef<HTMLDivElement, Props>(
    InnerNewToggleButton,
)
