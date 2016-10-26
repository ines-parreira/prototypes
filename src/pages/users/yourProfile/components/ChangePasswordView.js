import React, {PropTypes} from 'react'
import {Field, reduxForm} from 'redux-form'
import {Link} from 'react-router'
import classNames from 'classnames'

import {InputField} from '../../../common/components/formFields'


const validate = (values) => {
    const errors = {}

    if (values.newPassword !== values.confirmNewPassword) {
        errors.confirmNewPassword = 'Passwords do not match.'
    }

    return errors
}


class ChangePasswordView extends React.Component {
    constructor(props) {
        super(props)
        props.initialize({oldPassword: '', newPassword: '', confirmNewPassword: ''})
    }

    _handleSubmit = (values) => {
        this.props.actions.changePassword(values.oldPassword, values.newPassword)
    }

    render() {
        const {handleSubmit, isLoading, invalid, pristine} = this.props

        return (
            <div className="ui grid">
                <div className="ten wide column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/your-profile">Your profile</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">Change password</a>
                    </div>

                    <h1>Change password</h1>
                    <div>
                        Enter your current password to confirm your identity, then the new password you would like to
                        set instead.
                    </div>
                </div>

                <div className="ui grid ten wide column">
                    <div className="eight wide column">
                        <form
                            className="ui form"
                            onSubmit={handleSubmit(this._handleSubmit)}
                        >
                            <Field
                                type="password"
                                name="oldPassword"
                                label="Current password"
                                placeholder="Current password"
                                required
                                component={InputField}
                            />
                            <Field
                                type="password"
                                name="newPassword"
                                label="New password"
                                placeholder="New password"
                                min={6}
                                required
                                component={InputField}
                            />
                            <Field
                                type="password"
                                name="confirmNewPassword"
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
