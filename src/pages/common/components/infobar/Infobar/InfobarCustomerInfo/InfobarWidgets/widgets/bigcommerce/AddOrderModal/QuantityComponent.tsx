import React from 'react'
import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
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
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        tabIndex={0}
                        onClick={() => {
                            onDelete(index)
                        }}
                    >
                        close
                    </IconButton>
                )}
            </div>
        </td>
    )
}
