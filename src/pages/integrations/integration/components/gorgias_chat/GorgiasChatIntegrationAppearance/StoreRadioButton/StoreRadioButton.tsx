import React, {MouseEvent, CSSProperties} from 'react'

import useId from 'hooks/useId'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import {RadioFieldOption} from 'pages/common/forms/RadioFieldSet'
import Tooltip from 'pages/common/components/Tooltip'

import css from './StoreRadioButton.less'

type Props = RadioFieldOption & {
    isSelected?: boolean
    tooltipText: string
    style?: CSSProperties
    onClick: (ev: MouseEvent<HTMLDivElement>) => void
}

export const StoreRadioButton = ({
    isSelected = false,
    label,
    tooltipText,
    value,
    onClick,
}: Props) => {
    const id = useId()
    const tooltipTargetId = 'store-radio-button-' + id

    return (
        <>
            <PreviewRadioButton
                className={css.radioButton}
                id={tooltipTargetId}
                isSelected={isSelected}
                label={label}
                value={value}
                onClick={onClick}
            />
            <Tooltip
                autohide
                delay={{show: 200, hide: 0}}
                placement="bottom"
                target={tooltipTargetId}
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
