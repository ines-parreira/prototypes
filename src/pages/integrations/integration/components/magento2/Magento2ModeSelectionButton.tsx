import React from 'react'
import classNames from 'classnames'

import css from './Magento2ManualSelectionButton.less'

type Props = {
    text: string
    icon: string
    selected: boolean
    onClick: () => void
}

const Magento2ModeSelectionButton = ({
    text,
    icon,
    selected,
    onClick,
}: Props) => (
    <span
        className={classNames(
            css['selection-button'],
            selected ? css['selected-button'] : null
        )}
        onClick={onClick}
    >
        <i
            className={classNames(
                css['selection-button-icon'],
                'material-icons blue'
            )}
        >
            {icon}
        </i>
        {text}
    </span>
)

export default Magento2ModeSelectionButton
