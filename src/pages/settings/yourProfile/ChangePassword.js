//@flow
// $FlowFixMe
import React, {useMemo, useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Form, Button, Container} from 'reactstrap'
import type {Map} from 'immutable'

import {changePassword} from '../../../state/currentUser/actions.ts'
import InputField from '../../common/forms/InputField'
import PageHeader from '../../common/components/PageHeader'

type Props = {
    currentUser: Map<any, any>,
    changePassword: (oldPassword: string, newPassword: string) => Promise<any>,
}

type Errors = {
    old_password?: string,
    new_password?: string,
    confirm_new_password?: string,
}

const VALIDATE_PASSWORD_ERROR_MESSAGE = 'Passwords do not match.'
const USER_PASSWORD_MIN_LENGTH = 8
const USER_PASSWORD_MAX_LENGTH = 128
const USER_PASSWORD_VALIDATION_PATTERN = `.{${USER_PASSWORD_MIN_LENGTH},${USER_PASSWORD_MAX_LENGTH}}`

export const ChangePasswordContainer = ({
    currentUser,
    changePassword,
}: Props) => {
    const isLoading = currentUser.getIn(['_internal', 'loading', 'currentUser'])
    const [dirty, setDirty] = useState(true)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [errors, setErrors] = useState<Errors>({})

    const [, handleSubmit] = useAsyncFn(async () => {
        const result = await changePassword(oldPassword, newPassword)

        // This is always populated if there's an error
        // if there's an http error we don't get back result.error.response.data.error.data
        const isError = !!result?.reason?.length > 0

        setErrors({
            ...(result?.error?.response?.data?.error?.data || {}),
        })

        if (!isError) {
            setOldPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
        } else if (result.error.message !== 'Network Error') {
            setDirty(false)
        }
    }, [oldPassword, newPassword])

    const invalid = useMemo(() => Object.keys(errors).length > 0, [errors])

    useEffect(() => {
        const errors = {}
        if (
            newPassword &&
            confirmNewPassword &&
            newPassword !== confirmNewPassword
        ) {
            errors.confirm_new_password = VALIDATE_PASSWORD_ERROR_MESSAGE
        }
        setErrors(errors)
    }, [newPassword, confirmNewPassword])

    return (
        <div className="full-width">
            <PageHeader title="Change password" />
            <Container fluid className="page-container">
                <p>
                    Enter your current password to confirm your identity, then
                    the new password you would like to set instead.
                </p>

                <Form
                    onSubmit={(event) => {
                        event.preventDefault()
                        handleSubmit()
                    }}
                >
                    <InputField
                        type="password"
                        name="old_password"
                        label="Current password"
                        placeholder="Current password"
                        required
                        value={oldPassword}
                        onChange={(value) => {
                            const updatedErrors = {
                                ...errors,
                            }
                            delete updatedErrors['old_password']
                            setDirty(true)
                            setErrors(updatedErrors)
                            setOldPassword(value)
                        }}
                        error={errors.old_password}
                    />
                    <InputField
                        type="password"
                        name="new_password"
                        label="New password"
                        placeholder="New password"
                        pattern={USER_PASSWORD_VALIDATION_PATTERN}
                        title={`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long.`}
                        required
                        value={newPassword}
                        onChange={(value) => {
                            setDirty(true)
                            setNewPassword(value)
                        }}
                        error={errors.new_password}
                    />
                    <InputField
                        type="password"
                        name="confirm_new_password"
                        label="Confirm new password"
                        placeholder="Confirm new password"
                        pattern={USER_PASSWORD_VALIDATION_PATTERN}
                        title={`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long.`}
                        required
                        value={confirmNewPassword}
                        onChange={(value) => {
                            setDirty(true)
                            setConfirmNewPassword(value)
                        }}
                        error={errors.confirm_new_password}
                    />

                    <div>
                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading || invalid || !dirty}
                        >
                            Update your password
                        </Button>
                    </div>
                </Form>
            </Container>
        </div>
    )
}

export default connect(
    ({currentUser}) => ({
        currentUser,
    }),
    {
        changePassword,
    }
)(ChangePasswordContainer)
