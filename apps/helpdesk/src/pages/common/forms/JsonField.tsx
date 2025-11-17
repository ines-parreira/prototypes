import type { ChangeEvent } from 'react'
import React from 'react'

import _omit from 'lodash/omit'
import { FormGroup, Input } from 'reactstrap'

import type { HTTPForm } from 'models/integration/types/http'
import type { JSONValue } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import type { InputFieldProps } from './DEPRECATED_InputField'
import DEPRECATED_InputField from './DEPRECATED_InputField'
import Errors from './Errors'

type Props = InputFieldProps<HTTPForm | JSONValue>

type State = {
    isJsonValid: boolean
    value: string | null
}

export default class JsonField extends DEPRECATED_InputField<Props, State> {
    defaultValue = null

    state: State = {
        isJsonValid: true,
        value: this.defaultValue,
    }

    componentDidMount() {
        if (this.props.value) {
            let text: string | null = JSON.stringify(
                this.props.value,
                undefined,
                4,
            )

            if (text === '""') {
                text = this.defaultValue
            }

            this.setState({
                isJsonValid: true,
                value: text,
            })
        }
    }

    _onChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const value = evt.target.value || this.defaultValue
        let isJsonValid = true
        let parsedValue = this.defaultValue

        try {
            if (value !== this.defaultValue) {
                parsedValue = JSON.parse(value)
            }
        } catch {
            isJsonValid = false
        }

        if (isJsonValid && this.props.onChange) {
            this.props.onChange(parsedValue)
        }

        this.setState({
            isJsonValid,
            value: value,
        })
    }

    _getField = () => {
        const { children, ...rest } = _omit(this.props, [
            'error',
            'type',
            'help',
            'inline',
            'label',
            'name',
            'onChange',
            'value',
        ])

        const isInvalid = !this.state.isJsonValid

        return (
            <FormGroup>
                <div className="controls">
                    <Input
                        type="textarea"
                        rows="6"
                        id={this.id}
                        onChange={this._onChange}
                        value={this.state.value || ''}
                        {...rest}
                        invalid={isInvalid || this.props.invalid}
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
