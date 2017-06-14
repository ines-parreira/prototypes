import React from 'react'
import {Field} from 'redux-form'
import {FormGroup, Label, Row, Col, Button} from 'reactstrap'

import ErrorMessage from '../../../common/components/ErrorMessage'

import ReduxFormInputField from '../../../common/forms/ReduxFormInputField'

class UserContactField extends React.Component {
    render() {
        const {
            fields,
            meta,
            placeholder,
            type,
            addLabel,
            label,
        } = this.props

        return (
            <FormGroup>
                {label && <Label>{label}</Label>}
                {meta.invalid && <ErrorMessage errors={meta.error} />}
                {
                    fields.map((contact, index) =>
                        <Row
                            key={index}
                            className="mb-3 form-row"
                        >
                            <Col xs="10">
                                <Field
                                    type={type}
                                    name={`${contact}.address`}
                                    placeholder={placeholder}
                                    component={ReduxFormInputField}
                                />
                            </Col>
                            <Col xs="2">
                                <Button
                                    color="danger"
                                    type="button"
                                    onClick={() => fields.remove(index)}
                                >
                                    <i className="fa fa-fw fa-trash-o fa-lg" />
                                </Button>
                            </Col>
                        </Row>
                    )
                }

                <Button
                    type="button"
                    size="sm"
                    onClick={() => fields.push({})}
                    color="secondary"
                >
                    <i className="fa fa-fw fa-plus mr-2" />
                    {addLabel}
                </Button>
            </FormGroup>
        )
    }
}

UserContactField.defaultProps = {
    type: 'text',
    addLabel: 'Add',
}

UserContactField.propTypes = {
    type: React.PropTypes.string.isRequired,
    fields: React.PropTypes.object.isRequired,
    meta: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
    addLabel: React.PropTypes.string,
    placeholder: React.PropTypes.string,
}

export default UserContactField
