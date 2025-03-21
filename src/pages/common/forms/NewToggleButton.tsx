import { ForwardedRef, forwardRef } from 'react'

import cn from 'classnames'

import css from './NewToggleButton.less'

type Props = {
    checked: boolean
    onChange: (value: boolean) => void
    color?: string
    className?: string
    isDisabled?: boolean
    stopPropagation?: boolean
}
// TODO: To rename to a proper name
const InnerNewToggleButton = (
    { className, checked, onChange, isDisabled, stopPropagation, color }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => (
    <div
        role="switch"
        aria-checked={checked}
        className={cn(
            css.toggleButton,
            { [css.checked]: checked, [css.disabled]: isDisabled },
            className,
        )}
        onClick={(e) => {
            if (stopPropagation) {
                e.stopPropagation()
            }
            onChange(!checked)
        }}
        style={
            {
                '--new-toggle-button-color': color ?? 'var(--main-primary)',
            } as React.CSSProperties
        }
        ref={ref}
    >
        <input
            className={css.checkboxInput}
            type="checkbox"
            checked={checked}
            disabled={isDisabled}
            readOnly
        />
        <div className={css.knob}>
            <i className="material-icons">check</i>
        </div>
    </div>
)

export const NewToggleButton = forwardRef<HTMLDivElement, Props>(
    InnerNewToggleButton,
)
