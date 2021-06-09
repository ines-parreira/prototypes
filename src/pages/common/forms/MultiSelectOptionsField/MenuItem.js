// @flow
import classNames from 'classnames'
import React, {type Node} from 'react'
import {DropdownItem} from 'reactstrap'

import css from './MenuItem.less'

type Props = {
    isActive: boolean,
    isDeprecated?: boolean,
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
        const {isActive, children, onActivate, isDeprecated} = this.props
        return (
            <DropdownItem
                type="button"
                className={classNames(css.option, {
                    [`${css['option--focused']}`]: isActive,
                    [css.optionDeprecated]: isDeprecated,
                })}
                onMouseEnter={onActivate}
                onMouseDown={this._onSelect}
            >
                {isDeprecated && (
                    <span className="material-icons mr-1">warning</span>
                )}
                <span>{children}</span>
                {isDeprecated && <span className="ml-1">{'(deprecated)'}</span>}
            </DropdownItem>
        )
    }
}
