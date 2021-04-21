import _noop from 'lodash/noop'
import React from 'react'
import classnames from 'classnames'

import type {Option} from '../../../../../common/components/RichDropdown/types'

import {TooltipWrapper} from './TooltipWrapper'
import {Messages} from './constants'
import {DropdownOptionItem} from './DropdownOptionItem'

import css from './ActiveIntentItem.less'
import {DropdownOptionButton} from './DropdownOptionButton'

type Props = {
    messageId: number
    option: Option
    tooltipContainer: string
    isConfirmed?: boolean
    isConfirmable?: boolean
    onConfirm?: (key: string) => void
    onReject?: (key: string) => void
}

export const ActiveIntentItem = ({
    messageId,
    option,
    tooltipContainer,
    isConfirmed = false,
    isConfirmable = false,
    onConfirm = _noop,
    onReject = _noop,
}: Props) => {
    const infoId = `${option.key.replace('/', '-')}-${messageId}-info`

    return (
        <DropdownOptionItem
            renderInfo={() => {
                return (
                    isConfirmed && (
                        <TooltipWrapper
                            id={infoId}
                            tooltipContainer={tooltipContainer}
                            message={Messages.TOOLTIP_CONFIRMED_INFO}
                        >
                            <i
                                className={classnames(
                                    'material-icons',
                                    'mr-2',
                                    css.confirmedInfo
                                )}
                            >
                                check_circle_outline
                            </i>
                        </TooltipWrapper>
                    )
                )
            }}
            renderAction={() => {
                return (
                    <>
                        {isConfirmable && (
                            <DropdownOptionButton
                                className={css.confirm}
                                icon="done"
                                onClick={() => onConfirm(option.key)}
                            />
                        )}
                        <DropdownOptionButton
                            className={css.reject}
                            icon="close"
                            onClick={() => onReject(option.key)}
                        />
                    </>
                )
            }}
            option={option}
        />
    )
}
