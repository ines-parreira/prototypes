import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './OrderLineItemRow.less'

type Props = {
    quantity: number
    handleQuantityChange: (value: string) => void
    removable: boolean
    onDelete: (index: number) => void
    index: number
    hasError: boolean
    readOnly?: boolean
}
export function QuantityComponent({
    quantity,
    handleQuantityChange,
    removable,
    onDelete,
    index,
    hasError,
    readOnly = false,
}: Props) {
    const min = 1
    const tooltipId = `tooltip-${index}`

    const handleOnClick = (event: React.FormEvent<HTMLInputElement>) => {
        event.currentTarget.select()
    }

    return (
        <td className={css.quantityCol}>
            <div className="d-flex">
                <TextInput
                    min={min}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className={css.input}
                    hasError={hasError}
                    onFocus={handleOnClick}
                    onClick={handleOnClick}
                    readOnly={readOnly}
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
