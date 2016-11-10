import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Link} from 'react-router'
import classNames from 'classnames'

import {InputField} from '../../../common/components/formFields'
import formSender from '../../../common/utils/formSender'

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
            <div className="ui grid">
                <div className="twelve wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/your-profile">Your profile</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">Change password</a>
                    </div>

                    <h1>Change password</h1>
                    <p>
                        Enter your current password to confirm your identity, then the new password you would like to
                        set instead.
                    </p>

                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            type="password"
                            name="old_password"
                            label="Current password"
                            placeholder="Current password"
                            required
                            component={InputField}
                        />
                        <Field
                            type="password"
                            name="new_password"
                            label="New password"
                            placeholder="New password"
                            min={6}
                            required
                            component={InputField}
                        />
                        <Field
                            type="password"
                            name="confirm_new_password"
                            label="Confirm new password"
                            placeholder="New password"
                            min={6}
                            required
                            component={InputField}
                        />

                        <div className="field">

                            <button
                                className={classNames('ui', 'green', 'button', {loading: isLoading})}
                                disabled={isLoading || invalid || pristine}
                            >
                                Save changes
                            </button>

                        </div>
                    </form>
                </div>
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
