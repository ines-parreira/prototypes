/* ColorField
 */

import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'

import css from './ColorField.less'

const colors = [
    '#0993f4', // blue
    '#f2484a', // red
    '#F2711C', // orange
    '#FBBD08', // yellow
    '#B5CC18', // olive
    '#2DCF57', // green
    '#00B5AD', // teal
    '#6435C9', // violet
    '#A333C8', // purple
    '#E03997', // pink
    '#A5673F', // brown
    '#767676' // grey
]

class ColorField extends Component {
    componentDidMount() {
        $(this.refs.selectColor).popup({
            offset: -8,
            popup: $(this.refs.selectColorPopup),
            on: 'click',
            position: 'bottom left'
        })
    }

    _renderColorBtn = (color, key) => {
        const style = {
            backgroundColor: color
        }

        const _onClick = () => {
            if (this.props.input && this.props.input.onChange) {
                this.props.input.onChange(color)
            }

            $(this.refs.selectColor).popup('hide')
        }

        return (
            <button
                type="button"
                style={style}
                onClick={_onClick}
                key={key}
            />
        )
    }

    render() {
        const {input, required, placeholder, className, label} = this.props

        const fieldClassName = classnames({
            required,
        }, className, 'ui field')

        const btnStyle = {
            background: input.value
        }

        return (
            <div className={fieldClassName}>
                {label && <label htmlFor={input.name}>{label}</label>}
                <div className={classnames(css.field, 'ui input')}>
                    <button
                        type="button"
                        style={btnStyle}
                        className={css.button}
                        ref="selectColor"
                    />
                    <input
                        type="text"
                        {...input}
                        placeholder={placeholder}
                        required={required}
                    />

                    <div
                        className={classnames(css.popup, 'ui popup')}
                        ref="selectColorPopup"
                    >
                        {colors.map(this._renderColorBtn)}
                    </div>
                </div>
            </div>
        )
    }
}

ColorField.propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    placeholder: PropTypes.string,
    required: PropTypes.bool
}

export default ColorField
