import React, {PropTypes} from 'react'
import classNames from 'classnames'


export default class MultiSelectField extends React.Component {
    _onChange(value, slug) {
        const newVal = this.props.input.value || {}
        newVal[slug] = value
        this.props.input.onChange(newVal)
        this.forceUpdate() // force rerender because redux-form doesn't inject the new value
    }

    render() {
        const {input, options, label, required} = this.props
        const fieldClassName = classNames({ required }, 'field')

        return (
            <div className={fieldClassName} ref="parent">
                {label && <label htmlFor={input.name}>{label}</label>}
                {
                    options.map((option, idx) => (
                        <div className="inline field" key={idx}>
                            <div className="ui toggle checkbox">
                                <input
                                    {...{checked: input.value[option.slug] || false}}
                                    type="checkbox"
                                    onChange={(e) => this._onChange(e.target.checked, option.slug)}
                                />
                                <label>{option.label}</label>
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }
}

MultiSelectField.defaultProps = {
    required: false
}

MultiSelectField.propTypes = {
    input: PropTypes.object.isRequired,
    options: PropTypes.array.isRequired,
    label: PropTypes.string,
    required: PropTypes.bool
}
