// @flow
import React, {Component} from 'react'
import _isArray from 'lodash/isArray'

import css from './Legend.less'

type Props = {
    labels: Array<Object>,
}

export default class Legend extends Component<Props> {
    render() {
        const {labels} = this.props

        if (!_isArray(labels) || !labels.length) {
            return null
        }

        return (
            <div className={css.legends}>
                {labels.map((label) => (
                    <span className={`${css.label} mr-4 mb-2`} key={label.name}>
                        <span
                            className={`${css.circle} mr-2`}
                            style={{backgroundColor: label.backgroundColor}}
                        />
                        {label.name}
                    </span>
                ))}
            </div>
        )
    }
}
