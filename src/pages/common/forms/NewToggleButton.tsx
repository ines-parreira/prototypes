import React from 'react'

import cn from 'classnames'

import css from './NewToggleButton.less'

type Props = {
    checked: boolean
    onChange: (value: boolean) => void
    className?: string
    isDisabled?: boolean
}
// TODO: To rename to a proper name
export const NewToggleButton = ({
    className,
    checked,
    onChange,
    isDisabled,
}: Props) => (
    <div
        role="switch"
        aria-checked={checked}
        className={cn(
            css.toggleButton,
            { [css.checked]: checked, [css.disabled]: isDisabled },
            className,
        )}
        onClick={() => onChange(!checked)}
    >
        <input
            className={css.checkboxInput}
            type="checkbox"
            checked={checked}
            disabled={isDisabled}
            onChange={() => onChange(!checked)}
        />
        <div className={css.knob}>
            <i className="material-icons">check</i>
        </div>
    </div>
)
