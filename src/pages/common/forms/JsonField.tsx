import React, {ChangeEvent} from 'react'
import {Input, FormGroup} from 'reactstrap'
import _omit from 'lodash/omit'

import {HTTPForm} from 'pages/integrations/detail/components/http/HTTPIntegrationOverview/HTTPIntegrationOverview'
import {JSONValue} from '../components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import Errors from './Errors'
import InputField, {InputFieldProps} from './InputField'

type Props = InputFieldProps<HTTPForm | JSONValue>

type State = {
    isJsonValid: boolean
    value: string
}

export default class JsonField extends InputField<Props, State> {
    defaultValue = '{}'

    state: State = {
        isJsonValid: true,
        value: this.defaultValue,
    }

    componentDidMount() {
        if (this.props.value) {
            let text: string | null = JSON.stringify(
                this.props.value,
                undefined,
                4
            )

            if (text === '""') {
                text = null
            }

            this.setState({
                isJsonValid: true,
                value: text || this.defaultValue,
            })
        }
    }

    _onChange = (evt: ChangeEvent<HTMLInputElement>) => {
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

        if (isJsonValid && this.props.onChange) {
            this.props.onChange(parsedValue)
        }

        this.setState({
            isJsonValid,
            value: value || this.defaultValue,
        })
    }

    _getField = () => {
        const {children, ...rest} = _omit(this.props, [
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
