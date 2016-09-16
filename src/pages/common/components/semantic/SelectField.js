import React from 'react'

import classNames from 'classnames'

class SelectField extends React.Component {
    componentDidMount() {
        $(this.refs.select).dropdown()
    }

    render() {
        const { children, input, label, placeholder, required } = this.props
        const fieldClassName = classNames({ required }, 'field')
        return (
            <div className={fieldClassName} ref="select">
                {label && <label htmlFor={input.name}>{label}</label>}
                <select className="ui dropdown" {...input} placeholder={placeholder}>
                    {children}
                </select>
            </div>
        )
    }

}

SelectField.defaultProps = {
    required: false,
}

SelectField.propTypes = {
    children: React.PropTypes.node,
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}

export default SelectField
