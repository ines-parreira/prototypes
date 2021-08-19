import React, {Component, MouseEvent} from 'react'
import classnames from 'classnames'

import css from './ToggleButton.less'

type Props = {
    disabled?: boolean
    onChange: (isToggled: boolean, event?: MouseEvent) => void
    value: boolean
    loading?: boolean
    className?: string
    label?: string
    name?: string
}

export default class ToggleButton extends Component<Props> {
    _onChange = (event: MouseEvent) => {
        event.preventDefault()
        if (!this.props.disabled) {
            this.props.onChange(!this.props.value, event)
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
