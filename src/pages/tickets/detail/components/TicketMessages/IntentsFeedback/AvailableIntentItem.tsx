import {Tooltip} from '@gorgias/merchant-ui-kit'
import _noop from 'lodash/noop'
import React from 'react'

import type {Option} from '../../../../../common/components/RichDropdown/types'

import {Messages} from './constants'
import {DropdownOptionButton} from './DropdownOptionButton'
import {DropdownOptionItem} from './DropdownOptionItem'

type Props = {
    messageId: number
    option: Option
    tooltipContainer: string
    onConfirm?: (key: string) => void
    isDisabled?: boolean
}

export const AvailableIntentItem = ({
    messageId,
    option,
    onConfirm = _noop,
    isDisabled = false,
    tooltipContainer,
}: Props) => {
    const buttonId = `add-${option.key.replace('/', '-')}-${messageId}`

    return (
        <DropdownOptionItem
            onClick={() => (isDisabled ? _noop() : onConfirm(option.key))}
            option={option}
            disabled={isDisabled}
            hoverable={true}
            renderAction={() => (
                <>
                    <DropdownOptionButton id={buttonId} icon="add" />
                    <Tooltip
                        target={buttonId}
                        disabled={!isDisabled}
                        container={tooltipContainer}
                    >
                        {Messages.TOOLTIP_DISABLED_ADD_INFO}
                    </Tooltip>
                </>
            )}
        />
    )
}
