import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'

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
            <div
                className={classnames('ui toggle checkbox', {
                    'd-flex': !this.props.inline
                })}
                onClick={this._onChange}
                style={style}
            >
                <input
                    type="checkbox"
                    checked={value}
                    readOnly
                    disabled={this.props.disabled}
                />
                <label
                    style={{
                        margin: 0,
                        paddingLeft: '52px' // perfect width (no extra space on the right of the toggle)
                    }}
                />
            </div>
        )
    }
}
