import React, {Component} from 'react'
import _clone from 'lodash/clone'
import {FormGroup, Row, Col} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import InputField from 'pages/common/forms/input/InputField'
import Label from 'pages/common/forms/Label/Label'

import css from './CustomerChannelFieldArray.less'

export type CustomerChannelContactType = 'email' | 'phone'

export type CustomerChannelContact = {
    address: string
}

type Props = {
    type: string
    fields: CustomerChannelContact[]
    meta: Record<string, unknown>
    label: string
    addLabel: string
    placeholder: string
    onChange: (arg: CustomerChannelContact[]) => void
    errors: {address: string}[]
}

class CustomerChannelFieldArray extends Component<Props> {
    static defaultProps: Pick<Props, 'type' | 'label' | 'addLabel' | 'errors'> =
        {type: 'text', label: '', addLabel: 'Add', errors: []}

    _add = () => {
        return this.props.onChange(
            _clone(this.props.fields).concat([
                {
                    address: '',
                },
            ])
        )
    }

    _update = <K extends keyof CustomerChannelContact>(
        index: number,
        key: K,
        value: CustomerChannelContact[K]
    ) => {
        const fields = _clone(this.props.fields)
        fields[index][key] = value

        return this.props.onChange(fields)
    }

    _remove = (index: number) => {
        const fields = _clone(this.props.fields)
        fields.splice(index, 1)
        return this.props.onChange(fields)
    }

    render() {
        const {fields, placeholder, type, addLabel, label, errors} = this.props

        return (
            <FormGroup>
                {label && <Label className={css.label}>{label}</Label>}
                {label && !fields.length && <p>No {label.toLowerCase()}</p>}
                {fields.map((contact, index) => (
                    <Row key={index} className="mb-3 form-row">
                        <Col md="10" xs="9">
                            <InputField
                                type={type}
                                name={`${contact.address}`}
                                placeholder={placeholder}
                                value={contact.address}
                                onChange={(address) =>
                                    this._update(index, 'address', address)
                                }
                                error={
                                    errors &&
                                    errors[index] &&
                                    errors[index].address
                                }
                            />
                        </Col>
                        <Col md="2" xs="3">
                            <IconButton
                                intent="destructive"
                                type="button"
                                onClick={() => this._remove(index)}
                            >
                                delete
                            </IconButton>
                        </Col>
                    </Row>
                ))}
                <Button type="button" intent="secondary" onClick={this._add}>
                    <ButtonIconLabel icon="add">{addLabel}</ButtonIconLabel>
                </Button>
            </FormGroup>
        )
    }
}

export default CustomerChannelFieldArray
