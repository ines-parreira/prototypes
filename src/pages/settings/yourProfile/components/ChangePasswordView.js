import React, {PropTypes} from 'react'
import classnames from 'classnames'
import _pick from 'lodash/pick'
import _toString from 'lodash/toString'
import _forEach from 'lodash/forEach'
import {Form, Button, Container} from 'reactstrap'

import InputField from '../../../common/forms/InputField'
import PageHeader from '../../../common/components/PageHeader'

class ChangePasswordView extends React.Component {
    state = {
        dirty: true,
        errors: {},
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    }

    _validate = (values) => {
        const errors = {}

        if (values.new_password !== values.confirm_new_password) {
            errors.confirm_new_password = 'Passwords do not match.'
        }

        return errors
    }

    _updateField = (value) => {
        const newState = Object.assign({}, this.state, value)

        this.setState(Object.assign({}, newState, {
            dirty: true,
            errors: this._validate(newState)
        }))
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const values = _pick(this.state, [
            'old_password',
            'new_password',
            'confirm_new_password',
        ])

        return this.props.actions
            .changePassword(values.old_password, values.new_password)
            .then(({error} = {}) => {
                let errors = {}

                if (error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.error
                ) {
                    errors = error.response.data.error.data
                    _forEach(errors, (err, key) => {
                        errors[key] = _toString(err)
                    })
                }

                this.setState({
                    dirty: false,
                    errors,
                })
            })
    }

    render() {
        const {isLoading} = this.props
        const invalid = Object.keys(this.state.errors).length > 0

        return (
            <div className="full-width">
                <PageHeader title="Change password"/>
                <Container
                    fluid
                    className="page-container"
                >
                    <p>
                        Enter your current password to confirm your identity, then the new password you would like to
                        set instead.
                    </p>

                    <Form onSubmit={this._handleSubmit}>
                        <InputField
                            type="password"
                            name="old_password"
                            label="Current password"
                            placeholder="Current password"
                            required
                            value={this.state.old_password}
                            onChange={old_password => this._updateField({old_password})}
                            error={this.state.errors.old_password}
                        />
                        <InputField
                            type="password"
                            name="new_password"
                            label="New password"
                            placeholder="New password"
                            min="6"
                            required
                            value={this.state.new_password}
                            onChange={new_password => this._updateField({new_password})}
                            error={this.state.errors.new_password}
                        />
                        <InputField
                            type="password"
                            name="confirm_new_password"
                            label="Confirm new password"
                            placeholder="Confirm new password"
                            min="6"
                            required
                            value={this.state.confirm_new_password}
                            onChange={confirm_new_password => this._updateField({confirm_new_password})}
                            error={this.state.errors.confirm_new_password}
                        />

                        <div>
                            <Button
                                type="submit"
                                color="success"
                                className={classnames({
                                    'btn-loading': isLoading,
                                })}
                                disabled={isLoading || invalid || !this.state.dirty}
                            >
                                Update your password
                            </Button>
                        </div>
                    </Form>
                </Container>
            </div>
        )
    }
}

ChangePasswordView.propTypes = {
    actions: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,
}

export default ChangePasswordView
