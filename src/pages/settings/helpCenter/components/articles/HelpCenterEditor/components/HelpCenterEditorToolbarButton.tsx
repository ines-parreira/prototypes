import React, {useRef} from 'react'
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
}: Props): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null)

    return (
        <>
            <button
                ref={ref}
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
            {!disabled && tooltip && (
                <Tooltip target={ref} placement="top-start">
                    {tooltip}
                </Tooltip>
            )}
        </>
    )
}
