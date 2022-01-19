import React, {MouseEvent, CSSProperties, useMemo} from 'react'
import _uniqueId from 'lodash/uniqueId'

import {PreviewRadioButton} from '../../../../../../common/components/PreviewRadioButton'
import Tooltip from '../../../../../../common/components/Tooltip'

import css from './StoreRadioButton.less'

type Props = {
    isSelected?: boolean
    label: string
    tooltipText: string
    style?: CSSProperties
    onClick: (ev: MouseEvent<HTMLDivElement>) => void
}

export const StoreRadioButton = ({
    isSelected = false,
    label,
    tooltipText,
    onClick,
}: Props) => {
    const tooltipTargetId = useMemo(() => _uniqueId('store-radio-button-'), [])

    return (
        <>
            <PreviewRadioButton
                className={css.radioButton}
                id={tooltipTargetId}
                isSelected={isSelected}
                label={label}
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
