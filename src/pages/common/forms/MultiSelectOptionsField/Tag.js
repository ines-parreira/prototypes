// @flow
import React from 'react'
import {Badge} from 'reactstrap'

import css from './Tag.less'
import type {Option} from './types'

type Props = {
    option: Option,
    color: string,
    onRemove: (Option) => void,
}

export default class Tag extends React.Component<Props> {
    _onCloseClick = (event: SyntheticMouseEvent<*>) => {
        event.stopPropagation()
        event.preventDefault()
        this.props.onRemove(this.props.option)
    }

    render() {
        const {option, color} = this.props
        return (
            <Badge
                className={css.tag}
                style={{
                    color,
                }}
            >
                <span>
                    {option.displayLabel || option.label}
                    <i
                        className="material-icons ml-1"
                        onClick={this._onCloseClick}
                    >
                        close
                    </i>
                </span>
            </Badge>
        )
    }
}
