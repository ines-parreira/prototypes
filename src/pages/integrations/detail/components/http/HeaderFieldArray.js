import React from 'react'
import {Field} from 'redux-form'
import _trim from 'lodash/trim'
import {Row, Col, Button} from 'reactstrap'

import ReduxFormInputField from '../../../../common/forms/ReduxFormInputField'

export default class HeaderFieldArray extends React.Component {
    static propTypes = {
        fields: React.PropTypes.object,
    }

    render() {
        const {fields} = this.props

        return (
            <div>
                <label>Headers</label>
                {
                    !fields.length && <p>No header</p>
                }
                {
                    fields.map((header, index) =>
                        <Row
                            key={index}
                            className="mb-3 form-row"
                        >
                            <Col xs="5">
                                <Field
                                    type="text"
                                    name={`${header}.key`}
                                    placeholder="Key"
                                    component={ReduxFormInputField}
                                    format={value => _trim(value)}
                                />
                            </Col>
                            <Col xs="5">
                                <Field
                                    type="text"
                                    name={`${header}.value`}
                                    placeholder="Value"
                                    component={ReduxFormInputField}
                                />
                            </Col>
                            <Col xs="2">
                                <Button
                                    className="pull-right"
                                    color="danger"
                                    type="button"
                                    onClick={() => fields.remove(index)}
                                >
                                    Remove
                                </Button>
                            </Col>
                        </Row>
                    )
                }
                <Button
                    size="sm"
                    color="secondary"
                    type="button"
                    onClick={() => fields.push({})}
                >
                    Add header
                </Button>
            </div>
        )
    }
}
