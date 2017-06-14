import React from 'react'
import classnames from 'classnames'
import {Input, FormGroup} from 'reactstrap'

import InputField from './InputField'
import Errors from './Errors'

export default class JsonField extends InputField {
    constructor(props) {
        super(props)

        let text = JSON.stringify(props.value, undefined, 4)

        if (text === '""') {
            text = null
        }

        this.default = '{}'

        this.state = {
            isJsonValid: true,
            value: text || this.default,
        }
    }

    _onChange = (e) => {
        const value = e.target.value
        let isJsonValid = true
        let parsedValue = JSON.parse(this.default)

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
            value: value || this.default,
        })
    }

    _getField = () => {
        const {
            children,
            error,
            type, // eslint-disable-line
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            name, // eslint-disable-line
            onChange, // eslint-disable-line
            value, // eslint-disable-line
            ...rest,
        } = this.props

        const isInvalid = !this.state.isJsonValid
        const color = isInvalid ? 'danger' : ''

        return (
            <FormGroup color={color}>
                <div className="controls">
                    <Input
                        type="textarea"
                        rows="6"
                        className={classnames({
                            'form-control-danger': error || isInvalid,
                        })}
                        id={this.id}
                        onChange={this._onChange}
                        value={this.state.value}
                        {...rest}
                    >
                        {children}
                    </Input>
                    {
                        isInvalid && (
                            <Errors>Invalid JSON : changes will not be saved until the JSON is fixed</Errors>
                        )
                    }
                </div>
            </FormGroup>
        )
    }
}
