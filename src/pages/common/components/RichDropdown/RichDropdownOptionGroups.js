//@flow
import React, {Fragment} from 'react'
import {DropdownItem} from 'reactstrap'

import type {OptionGroup} from './RichDropdown'
import RichDropdownOptions from './RichDropdownOptions'

type Props = {
    onClick: (optionKey: string) => void,
    options: OptionGroup[],
}

export default function RichDropdownOptionGroups({onClick, options}: Props) {
    return (
        <>
            {options.map(({key, label, options}) => (
                <Fragment key={key}>
                    <DropdownItem divider />
                    <DropdownItem header>{label}</DropdownItem>
                    <RichDropdownOptions onClick={onClick} options={options} />
                </Fragment>
            ))}
        </>
    )
}
