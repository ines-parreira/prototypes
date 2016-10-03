import React from 'react'

import classNames from 'classnames'

class Select extends React.Component {

    componentDidUpdate() {
        const firstOption = this.refs.select.options[0]
        if (!this.props.value && firstOption) {
            this.props.handleChange(firstOption.value)
        }
    }

    _handleChange = (event) => {
        this.props.handleChange(event.target.value)
    }

    render() {
        const { value, options, description, isCallee } = this.props

        const selectClassName = classNames('ui dropdown', { neutral: isCallee })

        const _options = []

        if (Array.isArray(options)) {
            options.map((option) => _options.push([option, option]))
        } else {
            Object.keys(options).map((key) => _options.push([key, options[key].label]))
        }

        return (
            <select
                style={{ backgroundColor: 'white' }}
                className={selectClassName}
                data-content={description}
                value={value}
                onChange={this._handleChange}
                ref="select"
            >
                {_options.map((opt) => <option value={opt[0]} key={opt[0]}>{opt[1]}</option>)}
            </select>
        )
    }

}

Select.propTypes = {
    description: React.PropTypes.string,
    handleChange: React.PropTypes.func.isRequired,
    isCallee: React.PropTypes.bool.isRequired,
    options: React.PropTypes.any.isRequired,
    value: React.PropTypes.any.isRequired,
}

export default Select
