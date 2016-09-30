import React from 'react'

import classNames from 'classnames'

const Select = ({ value, options, description, handleChange, isCallee }) => {
    const _options = []

    if (Array.isArray(options)) {
        options.map((option) => _options.push([option, option]))
    } else {
        Object.keys(options).map((key) => _options.push([key, options[key].label]))
    }

    const selectClassName = classNames('ui dropdown', { neutral: isCallee })

    return (
        <select
            style={{ backgroundColor: 'white' }}
            className={selectClassName}
            data-content={description}
            value={value}
            onChange={handleChange}
        >
            <option value="" key="-1">-- select --</option>
            {_options.map((opt) => <option value={opt[0]} key={opt[0]}>{opt[1]}</option>)}
        </select>
    )
}

Select.propTypes = {
    description: React.PropTypes.string,
    handleChange: React.PropTypes.func.isRequired,
    isCallee: React.PropTypes.bool.isRequired,
    options: React.PropTypes.any.isRequired,
    value: React.PropTypes.any.isRequired,
}

export default Select
