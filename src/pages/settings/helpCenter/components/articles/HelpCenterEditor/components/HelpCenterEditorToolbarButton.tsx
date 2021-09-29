import React from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../../common/components/Tooltip'

import css from './HelpCenterEditorToolbar.less'

type Props = {
    icon: string
    active?: boolean
    disabled?: boolean
    onClick: () => void
    tooltip?: string
}

export const HelpCenterEditorToolbarButton = ({
    onClick,
    active,
    disabled,
    icon,
    tooltip,
}: Props) => {
    return (
        <>
            <button
                id={`help-center-editor-${icon}`}
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
            <Tooltip
                target={`help-center-editor-${icon}`}
                placement="top-start"
            >
                {tooltip}
            </Tooltip>
        </>
    )
}
