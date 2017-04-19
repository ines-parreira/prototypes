import React from 'react'
import {Field} from 'redux-form'
import {Button} from 'reactstrap'

import {InputField} from '../../../common/forms'
import ErrorMessage from '../../../common/components/ErrorMessage'

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
            <div
                className="field fields-array"
                style={{marginBottom: '18px'}}
            >
                {label && <label>{label}</label>}
                {meta.invalid && <ErrorMessage errors={meta.error} />}
                {
                    fields.map((contact, index) =>
                        <Field
                            key={index}
                            name={`${contact}.address`}
                            type={type}
                            placeholder={placeholder}
                            buttons={[{
                                className: 'btn-danger',
                                label: <i className="fa fa-fw fa-trash-o fa-lg" />,
                                onClick() {
                                    fields.remove(index)
                                }
                            }]}
                            component={InputField}
                        />
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
            </div>
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
