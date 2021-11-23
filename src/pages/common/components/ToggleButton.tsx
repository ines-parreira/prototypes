import React, {Component, MouseEvent} from 'react'
import classnames from 'classnames'

import css from './ToggleButton.less'

type Props = {
    value: boolean
    onChange: (isToggled: boolean, event?: MouseEvent) => void
    loading?: boolean
    disabled?: boolean
    name?: string
    stopPropagation?: boolean
}

export default class ToggleButton extends Component<Props> {
    _onChange = (event: MouseEvent) => {
        const {value, onChange, stopPropagation, disabled} = this.props

        if (stopPropagation) {
            event.stopPropagation()
        }

        event.preventDefault()

        if (!disabled) {
            onChange(!value, event)
        }
    }

    render() {
        const {value, loading, disabled} = this.props

        return (
            <label
                className={classnames(css.switch, 'toggle-switch', {
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
