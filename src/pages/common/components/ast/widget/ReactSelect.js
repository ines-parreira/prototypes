import React, {PropTypes} from 'react'
import ReactSelect from 'react-select'
import 'react-select/dist/react-select.css'
import {List} from 'immutable'
import sortBy from 'lodash/sortBy'

export default class Select extends React.Component {
    _getOptions = () => {
        let {options} = this.props

        if (options) {
            if (Array.isArray(options) || List.isList(options)) {
                options = options.map((o) => ({
                    value: o.toString(),
                    label: o.toString()
                }))
            } else {
                options = Object.keys(options).map((key) => ({
                    value: key.toString(),
                    label: options[key].label
                }))
            }
        }
        // order alphabetically
        return sortBy(options, o => o.label.toLowerCase())
    }

    _onChange = (value) => {
        let val = value.value
        // We can't have boolean values so we're transforming them just before sending
        if (val === 'true') {
            val = true
        } else if (val === 'false') {
            val = false
        }
        this.props.onChange(val)
    }

    render() {
        const {value} = this.props
        const options = this._getOptions()
        return (
            <div
                style={{
                    display: 'inline-block',
                    width: '120px',
                    verticalAlign: 'middle',
                    paddingBottom: '3px',
                }}
            >
                <ReactSelect
                    value={value.toString()}
                    clearable={false}
                    onChange={this._onChange}
                    options={options}
                />
            </div>
        )
    }
}

Select.propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.any.isRequired,
    value: PropTypes.any,
}
