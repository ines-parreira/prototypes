import React, {PropTypes} from 'react'
import classNames from 'classnames'

/**
 * Allow to select multiple values, display as a list of togglable properties
 * ex: used in HTTP integrations on triggers
 */
export default class MultiSelectField extends React.Component {
    _onChange(value, slug) {
        const newVal = this.props.input.value || {}
        newVal[slug] = value
        this.props.input.onChange(newVal)
        this.forceUpdate() // force rerender because redux-form doesn't inject the new value
    }

    render() {
        const {input, options, label, required, description} = this.props
        const fieldClassName = classNames({required}, 'field')

        return (
            <div className={fieldClassName} ref="parent">
                {label && <label htmlFor={input.name}>{label}</label>}
                <div className="fields">
                    {
                        options.map((option, idx) => (
                            <div className="field" key={idx}>
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
                {
                    description && (
                        <div className="text-muted">{description}</div>
                    )
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
    description: PropTypes.node,
    required: PropTypes.bool
}
