// @flow
import classNames from 'classnames'
import React, {type Node} from 'react'
import {DropdownItem} from 'reactstrap'

import css from './MenuItem.less'

type Props = {
    isActive: boolean,
    children?: Node,
    onActivate: () => void,
    onSelect: () => void,
}

export default class MenuItem extends React.Component<Props> {
    _onSelect = (event: SyntheticMouseEvent<*>) => {
        event.stopPropagation()
        event.preventDefault()
        this.props.onSelect()
    }

    render() {
        const {isActive, children, onActivate} = this.props
        return (
            <DropdownItem
                type="button"
                className={classNames(css.option, {
                    [`${css['option--focused']}`]: isActive,
                })}
                onMouseEnter={onActivate}
                onMouseDown={this._onSelect}
            >
                {children}
            </DropdownItem>
        )
    }
}
