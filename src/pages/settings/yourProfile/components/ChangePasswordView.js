import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import classnames from 'classnames'
import {Form, Button} from 'reactstrap'

import formSender from '../../../common/utils/formSender'

import ReduxFormInputField from '../../../common/forms/ReduxFormInputField'

const validate = (values) => {
    const errors = {}

    if (values.new_password !== values.confirm_new_password) {
        errors.confirm_new_password = 'Passwords do not match.'
    }

    return errors
}

class ChangePasswordView extends React.Component {
    constructor(props) {
        super(props)
        props.initialize({old_password: '', new_password: '', confirm_new_password: ''})
    }

    _handleSubmit = (values) => {
        return formSender(this.props.actions.changePassword(values.old_password, values.new_password))
    }

    render() {
        const {handleSubmit, isLoading, invalid, pristine} = this.props

        return (
            <div>
                <h1>
                    <i className="lock alternative blue icon ml5ni mr10i" />
                    Change password
                </h1>
                <p>
                    Enter your current password to confirm your identity, then the new password you would like to
                    set instead.
                </p>

                <Form onSubmit={handleSubmit(this._handleSubmit)}>
                    <Field
                        type="password"
                        name="old_password"
                        label="Current password"
                        placeholder="Current password"
                        required
                        component={ReduxFormInputField}
                    />
                    <Field
                        type="password"
                        name="new_password"
                        label="New password"
                        placeholder="New password"
                        min="6"
                        required
                        component={ReduxFormInputField}
                    />
                    <Field
                        type="password"
                        name="confirm_new_password"
                        label="Confirm new password"
                        placeholder="Confirm new password"
                        min="6"
                        required
                        component={ReduxFormInputField}
                    />

                    <div>
                        <Button
                            type="submit"
                            color="primary"
                            className={classnames({
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading || invalid || pristine}
                        >
                            Save
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}

ChangePasswordView.propTypes = {
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,
    invalid: PropTypes.bool,
    pristine: PropTypes.bool,
}

export default reduxForm({
    form: 'changePassword',
    validate,
})(ChangePasswordView)
