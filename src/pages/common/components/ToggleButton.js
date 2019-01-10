import React, {Component} from 'react'
import PropTypes from 'prop-types'

import css from './ToggleButton.less'

export default class ToggleButton extends Component {
    static propTypes = {
        disabled: PropTypes.bool,
        inline: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.bool.isRequired,
    }

    _onChange = (e) => {
        e.preventDefault()
        const value = !this.props.value
        this.props.onChange(value)
    }

    render() {
        const {value} = this.props

        const style = {}

        if (this.props.inline) {
            style.verticalAlign = 'middle'
            style.overflow = 'visible'
        }

        return (
            <label
                className={css.switch}
                onClick={this._onChange}
            >
                <input
                    type="checkbox"
                    checked={value}
                    disabled={this.props.disabled}
                    readOnly
                />
                <div className={css.slider} />
            </label>
        )
    }
}
