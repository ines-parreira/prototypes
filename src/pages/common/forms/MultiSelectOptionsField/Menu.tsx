import React from 'react'

import _noop from 'lodash/noop'
import { DropdownItem } from 'reactstrap'

import MenuItem from 'pages/common/forms/MultiSelectOptionsField/MenuItem'
import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'

type Props = {
    isLoading?: boolean
    options: Option[]
    activeIndex: number
    onActivate: (index: number) => void
    onSelect: (option: Option) => void
}

export default function Menu({
    isLoading,
    options,
    activeIndex,
    onActivate,
    onSelect,
}: Props) {
    if (isLoading) {
        return (
            <DropdownItem disabled>
                <i className="material-icons md-spin mr-2">refresh</i>
                Loading...
            </DropdownItem>
        )
    }

    if (!options.length) {
        return <DropdownItem header>No result</DropdownItem>
    }

    return (
        <>
            {options.map((option: Option, index: number) => (
                <MenuItem
                    key={index}
                    isActive={activeIndex === index}
                    onActivate={() => onActivate(index)}
                    onSelect={() =>
                        option.isDeprecated ? _noop() : onSelect(option)
                    }
                    isDeprecated={option.isDeprecated}
                >
                    {option.displayLabel || option.label}
                </MenuItem>
            ))}
        </>
    )
}
