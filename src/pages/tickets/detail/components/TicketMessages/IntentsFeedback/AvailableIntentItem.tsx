import _noop from 'lodash/noop'
import React from 'react'

import type {Option} from '../../../../../common/components/RichDropdown/types'

import {TooltipWrapper} from './TooltipWrapper'
import {Messages} from './constants'
import {DropdownOptionItem} from './DropdownOptionItem'

import {DropdownOptionButton} from './DropdownOptionButton'

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
            renderAction={() => {
                return (
                    <TooltipWrapper
                        id={buttonId}
                        tooltipContainer={tooltipContainer}
                        message={Messages.TOOLTIP_DISABLED_ADD_INFO}
                        show={isDisabled}
                    >
                        <DropdownOptionButton icon="add" />
                    </TooltipWrapper>
                )
            }}
        />
    )
}
