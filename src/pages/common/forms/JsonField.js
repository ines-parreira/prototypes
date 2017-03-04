import React from 'react'
import classNames from 'classnames'
import ErrorMessage from '../components/ErrorMessage'

export default class JsonField extends React.Component {
    constructor(props) {
        super(props)

        let text = JSON.stringify(props.input.value, undefined, 4)

        if (text === '""') {
            text = null
        }

        this.default = ''

        this.state = {
            isCorrectJson: true,
            text: text || this.default
        }
    }

    _onChange(v) {
        let correct = true

        try {
            this.props.input.onChange(JSON.parse(v || ''))
        } catch (e) {
            if (v !== '') {
                correct = false
            } else {
                this.props.input.onChange('')
            }
        }

        this.setState({
            isCorrectJson: correct,
            text: v || ''
        })
    }

    _onBlur = (e) => {
        if (e.target.value === '') {
            this._onChange(this.default)
        }
    }

    _renderWarning = (isCorrectJson) => {
        if (isCorrectJson) {
            return
        }

        const error = (
            <span>
                <i className="icon warning sign" /> Invalid JSON : changes will not be saved until the JSON is fixed
            </span>
        )

        return <ErrorMessage errors={error} />
    }

    render() {
        const {input, label, placeholder, required} = this.props

        // we want our own control of this input, so we do not inherit onChange and value
        const props = {
            onBlur: this._onBlur
        }

        if (required) {
            props.required = true
        }

        props.onChange = (e) => this._onChange(e.target.value)

        props.value = this.state.text

        const fieldClassName = classNames('field', {
            required,
            error: !this.state.isCorrectJson
        })

        return (
            <div className={fieldClassName}>
                {
                    label && (
                        <label htmlFor={input.name}>{label}</label>
                    )
                }
                <textarea
                    {...props}
                    placeholder={placeholder}
                />
                {this._renderWarning(this.state.isCorrectJson)}
            </div>
        )
    }
}

JsonField.defaultProps = {
    required: false
}

JsonField.propTypes = {
    input: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    required: React.PropTypes.bool,
}
