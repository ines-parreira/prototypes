import { useState } from 'react'

import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { ShopifyMetafieldVariablePicker } from './ShopifyMetafieldVariablePicker'

type Variable = {
    name: string
    value: string
    tooltip?: string
}

type Props = {
    categoryName: string
    variables: Variable[]
    categoryIndex: number
    onInsertText: (text: string) => void
}

export function ShopifyVariablesDropdown({
    categoryName,
    variables,
    categoryIndex,
    onInsertText,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <ButtonDropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
            <DropdownToggle
                color="secondary"
                caret
                type="button"
                className="dropdown-toggle btn-sm mr-2"
            >
                {categoryName}
            </DropdownToggle>
            <DropdownMenu>
                {variables.map((variable, indexVariable) => {
                    const dropdownItemId = `variable-${categoryIndex}-${indexVariable}`
                    return (
                        <div key={indexVariable}>
                            <DropdownItem
                                id={dropdownItemId}
                                type="button"
                                onClick={() => onInsertText(variable.value)}
                            >
                                {variable.name}
                            </DropdownItem>
                            {variable?.tooltip && (
                                <Tooltip
                                    target={dropdownItemId}
                                    placement="right"
                                >
                                    {variable.tooltip}
                                </Tooltip>
                            )}
                        </div>
                    )
                })}
                <ShopifyMetafieldVariablePicker
                    onSelect={onInsertText}
                    onCloseParentMenu={() => setIsOpen(false)}
                />
            </DropdownMenu>
        </ButtonDropdown>
    )
}
