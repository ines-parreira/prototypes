import React from 'react'
import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
import Tooltip from 'pages/common/components/Tooltip'
import css from './OrderLineItemRow.less'

type Props = {
    quantity: number
    handleQuantityChange: (value: string) => void
    removable: boolean
    onDelete: (index: number) => void
    index: number
    hasError: boolean
}
export function QuantityComponent({
    quantity,
    handleQuantityChange,
    removable,
    onDelete,
    index,
    hasError,
}: Props) {
    const min = 1
    const tooltipId = `tooltip-${index}`
    return (
        <td className={css.quantityCol}>
            <div className="d-flex">
                <TextInput
                    min={min}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className={css.input}
                    hasError={hasError}
                />
                {removable && (
                    <span>
                        <IconButton
                            fillStyle="ghost"
                            intent="destructive"
                            tabIndex={0}
                            onClick={() => {
                                onDelete(index)
                            }}
                            id={tooltipId}
                        >
                            close
                        </IconButton>
                        <Tooltip
                            placement="top"
                            target={tooltipId}
                            autohide={true}
                        >
                            Delete
                        </Tooltip>
                    </span>
                )}
            </div>
        </td>
    )
}
