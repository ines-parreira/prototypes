// @flow
import React from 'react'
import classnames from 'classnames'

import css from './ToggleButton.less'

type Props = {
    disabled?: boolean,
    onChange: (boolean) => ?Promise<*>,
    value: boolean,
    loading?: boolean,
}

export default class ToggleButton extends React.Component<Props> {
    _onChange = (event: Event) => {
        event.preventDefault()
        if (!this.props.disabled) {
            this.props.onChange(!this.props.value)
        }
    }

    render() {
        const {value, loading, disabled} = this.props

        return (
            <label
                className={classnames(css.switch, {
                    [css.loading]: loading,
                    [css.disabled]: disabled,
                })}
                onClick={this._onChange}
            >
                <input
                    type="checkbox"
                    checked={value}
                    disabled={disabled}
                    readOnly
                />
                <div className={css.slider} />
            </label>
        )
    }
}
