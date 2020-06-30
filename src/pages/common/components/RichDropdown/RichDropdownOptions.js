//@flow
import React from 'react'
import {DropdownItem} from 'reactstrap'

import type {Option} from './RichDropdown'

import css from './RichDropdownOptions.less'

type Props = {
    options: Option[],
    onClick: (optionKey: string) => void,
}

export default function RichDropdownOptions({options, onClick}: Props) {
    return (
        <>
            {options.map(({description, key, label}) => (
                <DropdownItem
                    key={key}
                    onClick={() => onClick(key)}
                    type="button"
                >
                    {label}
                    <br />
                    {description && (
                        <span className={css.description}>{description}</span>
                    )}
                </DropdownItem>
            ))}
        </>
    )
}
