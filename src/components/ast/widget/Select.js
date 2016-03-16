import React, {PropTypes} from 'react'

export default class Select extends React.Component {
    render() {
        const {value, options, description, handleChange} = this.props

        const neutralBtn = (
        value === 'eq' ||
        value === 'neq' ||
        value === 'gt' ||
        value === 'lt') ? ' neutral' : ''

        let Options = []
        if (Array.isArray(options)) {
            options.map((val) => {
                Options.push([val, val])
            })
        } else {
            Object.keys(options).map((k) => {
                Options.push([k, options[k].label])
            })
        }

        return (
            <select
                className={`ui dropdown${neutralBtn}`}
                data-content={description}
                value={value}
                onChange={handleChange.bind(this)}>

                <option value="" key="-1">-- select --</option>
                {Options.map((opt) => {
                    return (
                        <option value={opt[0]} key={opt[0]}>{opt[1]}</option>
                    )
                })}
            </select>
        )
    }
}

Select.propTypes = {
    value: PropTypes.any,
    description: PropTypes.any,
    options: PropTypes.any,
    handleChange: PropTypes.func
}
