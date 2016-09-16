import React from 'react'

import classNames from 'classnames'

export default class TextAreaField extends React.Component {
    constructor(props) {
        super(props)

        if (props.type === 'json') {
            let text = JSON.stringify(props.input.value, undefined, 4)

            if (text === '""') {
                text = null
            }

            this.default = 'null'
            this.state = {correctJson: true, text: text || this.default}
        }
    }

    _onChange(v) {
        if (this.props.type === 'json') {
            let correct = true

            try {
                this.props.input.onChange(JSON.parse(v || this.default))
            } catch (e) {
                correct = false
            }

            this.setState({correctJson: correct, text: v || this.default})
        }
    }

    render() {
        const {input, label, placeholder, required, type} = this.props

        const fieldClassName = classNames({ required }, 'field')
        let warning = null

        if (type === 'json' && !this.state.correctJson) {
            warning = (
                <span className="textarea-invalid-json">
                    <i className="red icon warning sign"/> Invalid JSON
                    <span className="sub">(changes won't be saved until the JSON is fixed)</span>
                </span>
            )
        }

        return (
            <div className={fieldClassName}>
                {label && <label htmlFor={input.name}>{label}{warning}</label>}
                <textarea
                    name={input.name}
                    value={this.state.text || input.value}
                    placeholder={placeholder}
                    onChange={(e) => this._onChange(e.target.value)}
                />
            </div>
        )
    }
}

TextAreaField.defaultProps = {
    required: false,
    type: 'text'
}

TextAreaField.propTypes = {
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
    type: React.PropTypes.string
}
