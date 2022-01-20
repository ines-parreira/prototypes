import React from 'react'
import PropTypes from 'prop-types'
import _clone from 'lodash/clone'
import {FormGroup, Label, Row, Col, Button} from 'reactstrap'

import InputField from '../../../common/forms/InputField'

import {ButtonIntent} from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

class CustomerChannelFieldArray extends React.Component {
    _add = () => {
        return this.props.onChange(
            _clone(this.props.fields).concat([
                {
                    address: '',
                },
            ])
        )
    }

    _update = (index, key, value) => {
        const fields = _clone(this.props.fields)
        fields[index][key] = value

        return this.props.onChange(fields)
    }

    _remove = (index) => {
        const fields = _clone(this.props.fields)
        fields.splice(index, 1)
        return this.props.onChange(fields)
    }

    render() {
        const {fields, placeholder, type, addLabel, label, errors} = this.props

        return (
            <FormGroup>
                {label && <Label>{label}</Label>}
                {!fields.length && <p>No {label.toLowerCase()}</p>}
                {fields.map((contact, index) => (
                    <Row key={index} className="mb-3 form-row">
                        <Col md="10" xs="9">
                            <InputField
                                type={type}
                                name={`${contact}.address`}
                                placeholder={placeholder}
                                value={contact.address}
                                onChange={(address) =>
                                    this._update(index, 'address', address)
                                }
                                error={errors[index] && errors[index].address}
                            />
                        </Col>
                        <Col md="2" xs="3">
                            <IconButton
                                intent={ButtonIntent.Destructive}
                                type="button"
                                onClick={() => this._remove(index)}
                            >
                                delete
                            </IconButton>
                        </Col>
                    </Row>
                ))}

                <Button
                    type="button"
                    size="sm"
                    onClick={this._add}
                    color="secondary"
                >
                    <i className="material-icons mr-2">add</i>
                    {addLabel}
                </Button>
            </FormGroup>
        )
    }
}

CustomerChannelFieldArray.defaultProps = {
    type: 'text',
    label: '',
    addLabel: 'Add',
    errors: {},
}

CustomerChannelFieldArray.propTypes = {
    type: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    addLabel: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    errors: PropTypes.object,
}

export default CustomerChannelFieldArray
