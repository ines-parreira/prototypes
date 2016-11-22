import React from 'react'
import {Field} from 'redux-form'
import {InputField} from '../../../common/components/formFields'
import ErrorMessage from '../../../common/components/ErrorMessage'

const UserContactField = ({
    fields,
    meta,
    placeholder,
    type,
    addLabel,
    label,
}) => {
    return (
        <div className="field fields-array">
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
                            className: 'basic icon',
                            label: <i className="trash outline large icon" />,
                            onClick() {
                                fields.remove(index)
                            }
                        }]}
                        component={InputField}
                    />
                )
            }
            <p>
                <a onClick={() => fields.push({})}>
                    {addLabel}
                </a>
            </p>
        </div>
    )
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
