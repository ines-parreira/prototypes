import React from 'react'
import {Input, FormGroup} from 'reactstrap'

import InputField from './InputField'
import Errors from './Errors'

export default class JsonField extends InputField {
    defaultValue = '{}'

    state = {
        isJsonValid: true,
        value: this.defaultValue,
    }

    componentDidMount() {
        if (this.props.value) {
            let text = JSON.stringify(this.props.value, undefined, 4)

            if (text === '""') {
                text = null
            }

            this.setState({
                isJsonValid: true,
                value: text || this.defaultValue,
            })
        }
    }

    _onChange = (evt: Event) => {
        const value = evt.target.value
        let isJsonValid = true
        let parsedValue = JSON.parse(this.defaultValue)

        try {
            parsedValue = JSON.parse(value)
        } catch (e) {
            if (value !== '') {
                isJsonValid = false
            }
        }

        if (isJsonValid) {
            this.props.onChange(parsedValue)
        }

        this.setState({
            isJsonValid,
            value: value || this.defaultValue,
        })
    }

    _getField = () => {
        const {
            children,
            error, // eslint-disable-line
            type, // eslint-disable-line
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            onChange, // eslint-disable-line
            value, // eslint-disable-line
            ...rest
        } = this.props

        const isInvalid = !this.state.isJsonValid

        if (isInvalid) {
            rest.invalid = true
        }

        return (
            <FormGroup>
                <div className="controls">
                    <Input
                        type="textarea"
                        rows="6"
                        id={this.id}
                        onChange={this._onChange}
                        value={this.state.value}
                        {...rest}
                    >
                        {children}
                    </Input>
                    {isInvalid && (
                        <Errors>
                            Invalid JSON : changes will not be saved until the
                            JSON is fixed
                        </Errors>
                    )}
                </div>
            </FormGroup>
        )
    }
}
