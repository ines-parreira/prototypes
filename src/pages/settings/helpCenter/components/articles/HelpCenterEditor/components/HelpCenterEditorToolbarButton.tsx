import React from 'react'
import classNames from 'classnames'

import css from './HelpCenterEditorToolbar.less'

type Props = {
    icon: string
    active?: boolean
    disabled?: boolean
    onClick: () => void
}

export const HelpCenterEditorToolbarButton = ({
    onClick,
    active,
    disabled,
    icon,
}: Props) => {
    return (
        <button
            disabled={disabled}
            type="button"
            className={classNames({
                [css['editor-btn']]: true,
                [css.active]: active,
            })}
            onMouseDown={(event) => {
                event.preventDefault()
                onClick()
            }}
        >
            <i className="material-icons material-icons-outlined">{icon}</i>
        </button>
    )
}
