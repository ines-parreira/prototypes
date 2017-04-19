import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {TwitterPicker} from 'react-color'
import onClickOutside from 'react-onclickoutside'

import css from './ColorField.less'

const colors = [
    '#EB144C', // red
    '#FF6900', // orange
    '#FCB900', // yellow
    '#B5CC18', // olive
    '#00D084', // green
    '#7BDCB5', // teal
    '#8ED1FC', // light blue
    '#0693E3', // blue
    '#9900EF', // purple
    '#E03997', // pink
    '#F78DA7', // light pink
    '#A5673F', // brown
    '#ABB8C3', // light grey
    '#767676', // grey
]

@onClickOutside
class ColorField extends Component {
    state = {
        displayColorPicker: false,
    }

    // used by onClickOutside HOC
    handleClickOutside = () => {
        this.setState({displayColorPicker: false})
    }

    _handleClick = () => {
        this.setState({displayColorPicker: !this.state.displayColorPicker})
    }

    _handleChange = (color) => {
        this.props.input.onChange(color.hex)
    }

    render() {
        const {input, required, className, label} = this.props

        const fieldClassName = classnames('field', className, {
            required,
        })

        return (
            <div className={fieldClassName}>
                {label && <label>{label}</label>}
                <div className={css.wrapper}>
                    <div
                        className={css.preview}
                        onClick={this._handleClick}
                    >
                        <div
                            style={{backgroundColor: input.value}}
                        />
                    </div>
                    {
                        this.state.displayColorPicker && (
                            <TwitterPicker
                                className={css.popup}
                                color={input.value}
                                colors={colors}
                                onChange={this._handleChange}
                            />
                        )
                    }
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
