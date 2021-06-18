import React from 'react'
import classNames from 'classnames'

import Tooltip from '../../../../../common/components/Tooltip'

import css from './GorgiasChatIntegrationStoreTypeRadioButton.less'

type Props = {
    id: string
    onClick: () => void
    icon: React.ReactChild
    label: string
    tooltipText: string
    selected: boolean
}

export const GorgiasChatIntegrationStoreTypeRadioButton = ({
    id,
    onClick,
    icon,
    label,
    tooltipText,
    selected,
}: Props) => {
    return (
        <>
            <button
                id={id}
                className={classNames(
                    css.container,
                    selected ? css.selected : ''
                )}
                onClick={onClick}
            >
                <div className={css.iconContainer}>{icon}</div>
                <span className={css.label}>{label}</span>
            </button>
            <Tooltip
                autohide={true}
                delay={{show: 200, hide: 0}}
                placement="bottom"
                target={id}
                style={{
                    textAlign: 'center',
                    width: 180,
                }}
            >
                {tooltipText}
            </Tooltip>
        </>
    )
}
