// @flow
import React from 'react'
import {DropdownItem} from 'reactstrap'

import MenuItem from './MenuItem'
import type {Option} from './types'

type Props = {
    isLoading?: boolean,
    options: Option[],
    activeIndex: number,
    onActivate: number => void,
    onSelect: Option => void
}

export default class Menu extends React.Component<Props> {
    render() {
        const {isLoading, options, activeIndex, onActivate, onSelect} = this.props

        if (isLoading) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">
                        refresh
                    </i>
                    Loading...
                </DropdownItem>
            )
        }

        if (!options.length) {
            return (
                <DropdownItem header>
                    No result
                </DropdownItem>
            )
        }

        return options.map((option: Option, index: number) => (
            <MenuItem
                key={index}
                isActive={activeIndex === index}
                onActivate={() => onActivate(index)}
                onSelect={() => onSelect(option)}
            >
                {option.displayLabel || option.label}
            </MenuItem>
        ))
    }
}
